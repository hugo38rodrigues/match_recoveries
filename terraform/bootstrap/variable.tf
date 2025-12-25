variable "project_name" {
  description = "Nom du projet"
  type        = string
  default     = "corp"
}

variable "company_name" {
  description = "Nom de entreprise"
  type        = string
  default     = "hall-e"
}

variable "engine_version" {
  description = "Numero de version de la base"
  type        = string
  default = "17.4"
}

variable "env_name" {
  description = "Nom de environnement"
  type        = string
  default = "prod"
}

variable "module_name" {
  description = "Nom de la tâche"
  type        = string
  default     = "match-recovery"
}

variable "cidr_block" {
  description = "Plage IP principale du VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "region" {
  description = "Région AWS (utilisée pour construire les AZ)"
  type        = string
  default = "eu-west-1"
}

