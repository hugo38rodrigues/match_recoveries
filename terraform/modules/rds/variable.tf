variable "project_name" {
  type = string
}

variable "vpc_id" {
  description = "ID du VPC où déployer RDS"
  type        = string
}

variable "private_subnet_ids" {
  description = "Liste des subnets privés pour le DB subnet group"
  type        = list(string)
}

variable "db_name" {
  description = "Nom de la base Postgres"
  type        = string
}

variable "db_username" {
  description = "Utilisateur Postgres"
  type        = string
  default = "postgres"
}

variable "allocated_storage" {
  description = "Espace de stockage"
  type        = number
}

variable "rds_security_group_id" {
  description = "ID du security group à utiliser pour le RDS"
  type        = string
}

variable "engine_version" {
  description = "Numero de version de la base"
  type        = string
}
