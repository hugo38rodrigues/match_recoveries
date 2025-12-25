terraform {
  required_providers {
    aws = {
        source = "hashicorp/aws"
        version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-1"
}

######################
# 1) VPC
######################

module "vpc" {
    source = "../modules/vpc"
    module_name     = var.company_name
    env_name        = var.env_name
    project_name    = local.prefix_project_name
    company_name    = var.company_name
    region          = var.region
}

##########################
# 2) Security Groups     #
##########################

# SG pour le RDS Postgres
resource "aws_security_group" "rds" {
  name        = "${local.prefix_project_name}-rds-sg"
  description = "Security group pour RDS Postgres"
  vpc_id      = module.vpc.vpc_id

  # Egress: le RDS peut répondre vers partout (classique)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.prefix_project_name}-rds-sg"
  }
}

# SG pour la Lambda
resource "aws_security_group" "lambda" {
  name        = "${local.prefix_project_name}-lambda-sg"
  description = "Security group pour la Lambda API"
  vpc_id      = module.vpc.vpc_id

  # La Lambda peut sortir vers tout (pour parler au RDS, logs, etc.)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.prefix_project_name}-lambda-sg"
  }
}

# SG pour l'EC2 (machine de debug / psql)
resource "aws_security_group" "ec2" {
  name        = "${local.prefix_project_name}-ec2-sg"
  description = "Security group pour instance EC2 de debug DB"
  vpc_id      = module.vpc.vpc_id

  # Pas d'inbound ici pour l'instant (on utilisera SSM plus tard)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.prefix_project_name}-ec2-sg"
  }
}

##########################
# 3) EndPoint VCP     #
##########################


# Autoriser le trafic Postgres (5432) vers RDS depuis la Lambda
resource "aws_security_group_rule" "rds_from_lambda" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = aws_security_group.lambda.id
}

# Autoriser le trafic Postgres (5432) vers RDS depuis l'EC2
resource "aws_security_group_rule" "rds_from_ec2" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = aws_security_group.ec2.id
}

resource "aws_security_group" "vpc_endpoints" {
  name        = "${local.prefix_project_name}-vpce-sg"
  description = "SG for VPC endpoints"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [
      aws_security_group.ec2.id,
      aws_security_group.lambda.id
    ]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


resource "aws_vpc_endpoint" "ssm_endpoints" {
  for_each = toset(local.ssm_services)

  vpc_id            = module.vpc.vpc_id
  service_name      = each.value
  vpc_endpoint_type = "Interface"

  subnet_ids         = module.vpc.private_subnet_ids
  security_group_ids = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = {
    Name = "${local.prefix_project_name}-vpce-${replace(each.value, "com.amazonaws.${var.region}.", "")}"
  }
}

resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id            = module.vpc.vpc_id
  vpc_endpoint_type = "Interface"
  service_name      = "com.amazonaws.${var.region}.secretsmanager"

  subnet_ids          = module.vpc.private_subnet_ids
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = {
    Name = "${local.prefix_project_name}-vpce-secretsmanager"
  }
}