########################################
# EventBridge -> Lambda (cron 10 min)  #
########################################

resource "aws_cloudwatch_event_rule" "every_10_minutes" {
  name                = "${var.project_name}-cron"
  description         = "Exécute la Lambda toutes les jours"
  schedule_expression = "rate(1 day)"
}

resource "aws_cloudwatch_event_target" "trigger_lambda" {
  rule      = aws_cloudwatch_event_rule.every_10_minutes.name
  target_id = "trigger"
  arn       = aws_lambda_function.recovery_match.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.recovery_match.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_10_minutes.arn
}

##################################
# Assume role (trust policy)     #
##################################

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

##################################
# Rôle principal Lambda          #
##################################

resource "aws_iam_role" "lambda_role" {
  name               = "${var.project_name}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

##################################
# Attach policy de base (logs)   #
##################################

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

########################################
# Policy custom pour Data API + Secret #
########################################

data "aws_iam_policy_document" "lambda_db_access" {
  # Accès Data API Aurora
  statement {
    sid = "RDSDataAPIAccess"
    actions = [
      "rds-data:ExecuteStatement",
      "rds-data:BatchExecuteStatement",
      "rds-data:BeginTransaction",
      "rds-data:CommitTransaction",
      "rds-data:RollbackTransaction"
    ]
    resources = [
      var.db_cluster_arn
    ]
  }

  # Lecture du secret (mot de passe stocké dans Secrets Manager)
  statement {
    sid = "SecretsManagerAccess"
    actions = [
      "secretsmanager:GetSecretValue"
    ]
    resources = [
      var.db_secret_arn
    ]
  }
}

resource "aws_iam_policy" "lambda_db_access" {
  name   = "${var.project_name}-lambda-data-api"
  policy = data.aws_iam_policy_document.lambda_db_access.json
}

resource "aws_iam_role_policy_attachment" "lambda_db_access_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_db_access.arn
}

########################################
# Policy pour accès au VPC             #
########################################

resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

#########################
# Lambda cron           #
#########################

resource "aws_lambda_function" "recovery_match" {
  function_name    = "${var.project_name}-cron"
  filename         = var.lambda_zip_path
  source_code_hash = filebase64sha256(var.lambda_zip_path)
  handler          = "src/aws/ingestHandler.run"
  runtime          = "nodejs20.x"
  role             = aws_iam_role.lambda_role.arn
  timeout          = 60
  memory_size      = 2048
  # Lambda dans le VPC (même VPC / subnets que RDS)
  vpc_config {
    subnet_ids         = var.public_subnet_ids
    security_group_ids = [var.aws_security_group_lambda]
  }

  environment {
    variables = {
      TOKEN_API      = var.TOKEN_API
      DB_ADAPTER     = var.DB_ADAPTER

      PGDATABASE     = var.DATABASE_NAME
      DB_SECRET_ARN  = var.db_secret_arn

      PGHOST         = var.DB_HOST
      PGPORT         = var.DB_PORT
      PGSSL          = var.DB_SSL

      NODE_ENV       = var.NODE_ENV
      LOG_LEVEL      = var.LOG_LEVEL
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_db_access_attach,
    aws_iam_role_policy_attachment.lambda_vpc_access,
  ]
}