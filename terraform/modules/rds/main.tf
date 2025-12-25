# Subnet group RDS (obligatoire pour lui dire dans quels subnets privés il peut créer la DB)
resource "aws_db_subnet_group" "rds_subnets" {
  name       = "${var.project_name}-rds-subnets"
  subnet_ids = var.private_subnet_ids
}

# secret.tf

resource "aws_secretsmanager_secret" "db_credentials" {
  name = "${var.project_name}-db-credentials1"
}

resource "aws_secretsmanager_secret_version" "db_credentials_version" {
  secret_id = aws_secretsmanager_secret.db_credentials.id

  secret_string = jsonencode({
    username = var.db_username
    password = local.db_password_admin
  })
}

module "cluster" {
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "~> 9.0" # à ajuster selon ta version, mais mets-en une
  name           = "${var.project_name}-rds-aurora"
  engine         = "aurora-postgresql"
  engine_version = "17.5"
  skip_final_snapshot = true

  # Instances Aurora
  instances = {
    one = {
      instance_class = "db.serverless"
    }
  }

   serverlessv2_scaling_configuration = {
     min_capacity = 0.5
     max_capacity = 4
    }
  
  master_username             = var.db_username
  manage_master_user_password = true

  # Réseau
  vpc_id               = var.vpc_id
  db_subnet_group_name = aws_db_subnet_group.rds_subnets.name

  # Tu peux passer directement les SG à utiliser pour le cluster
  vpc_security_group_ids = [var.rds_security_group_id]


  storage_encrypted = true
  apply_immediately = true
}
