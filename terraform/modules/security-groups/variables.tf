variable "project_name" {
  description = "Nom du projet pour les tags"
  type        = string
}

variable "vpc_id" {
  description = "ID du VPC où déployer RDS"
  type        = string
}

variable "from_port" {
  description = "Port d'entrée de la base"
  type        = number
}

variable "to_port" {
  description = "Port de sortie de la base"
  type        = number
}

variable "cidr_blocks" {
    description = "value"
    type        = [string]
}