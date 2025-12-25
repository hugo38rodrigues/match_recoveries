variable "project_name" {
  type = string
}

variable "region" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "db_cluster_arn" {
  description = "ARN du cluster Aurora PostgreSQL (pour Data API)"
  type        = string
}

variable "db_secret_arn" {
  description = "ARN du secret Secrets Manager contenant user/password de la DB"
  type        = string
}

variable "vpc_id" {
  type = string
}

variable "lambda_zip_path" {
  description = "Chemin vers le zip de la Lambda"
  type        = string
}

variable "aws_security_group_lambda" {
  description = "ID du security group à attacher à la Lambda"
  type        = string
}

variable "LOG_LEVEL" {
    description = "Niveau des logs"
    type        = string
}

variable "TOKEN_API" {
    description = "Token API de récupération des données"
    type        = string
}
variable "DB_ADAPTER" {
    description = "Nom du service de base de donnée"
    type        = string
}

variable "DATABASE_NAME" {
    description = "Nom de la base de donnée"
    type        = string
}

variable "DB_HOST" {
    description = "Url de la base de donnée"
    type        = string
}

variable "DB_PORT" {
    description = "Port de la base de donnée"
    type        = string
}

variable "DB_SSL" {
    description = "Activation de la connection ssl"
    type        = bool
}

variable "NODE_ENV" {
    description = "Environnement de deployment"
    type        = string
}
