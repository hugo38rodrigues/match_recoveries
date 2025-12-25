terraform {
  required_providers {
    aws = {
        source = "hashicorp/aws"
        version = "~> 6.25.0"
    }
  }
}

provider "aws" {
  region = "eu-west-1"
}

##########################
# 3) RDS Postgres        #
##########################
 module "postgres" {
    source = "../../modules/rds"
    project_name = local.prefix_project_name
    engine_version = var.engine_version
    db_name = var.DATABASE_NAME
    allocated_storage = var.allocated_storage
    vpc_id = var.vpc_id
    private_subnet_ids = var.private_subnet_ids
    rds_security_group_id = var.aws_security_group_rds
}

###################################
# 4) EC2 pour manipuler la DB     #
###################################

# AMI Amazon Linux 2023 - avec SSM agent intégré
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*"]
  }
}

# Rôle IAM pour autoriser EC2 à utiliser SSM
resource "aws_iam_role" "ec2_ssm_role" {
  name = "${local.prefix_project_name}-ec2-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

# Attache la policy gérée AmazonSSMManagedInstanceCore (SSM)
resource "aws_iam_role_policy_attachment" "ec2_ssm_core" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${local.prefix_project_name}-ec2-instance-profile"
  role = aws_iam_role.ec2_ssm_role.name
}



resource "aws_instance" "db_helper" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"
  subnet_id              = var.private_subnet_ids[0]  # dans le 1er subnet privé
  vpc_security_group_ids = [var.aws_security_group_ec2]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  tags = {
    Name = "${local.prefix_project_name}-db-helper"
  }
}


###################################
# 5) Lambda dans le VPC           #
###################################

module "recovery_match" {
    source = "../../modules/lambda"
    project_name = local.prefix_project_name
    lambda_zip_path = var.lambda_zip_path
    public_subnet_ids = var.public_subnet_ids
    db_secret_arn = module.postgres.db_master_secret_arn
    db_cluster_arn = module.postgres.db_cluster_arn
    vpc_id = var.vpc_id
    aws_security_group_lambda  = var.aws_security_group_lambda
    region          = var.region
    TOKEN_API       = var.TOKEN_API
    DB_ADAPTER      = var.DB_ADAPTER
    DATABASE_NAME   = var.DATABASE_NAME
    DB_HOST         = module.postgres.db_address   
    DB_PORT         = module.postgres.db_port 
    DB_SSL          = var.DB_SSL
    NODE_ENV        = var.NODE_ENV
    LOG_LEVEL       = var.LOG_LEVEL
}

