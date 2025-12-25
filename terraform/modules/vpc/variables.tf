variable "project_name" {
  description = "Nom du projet"
  type        = string
}

variable "company_name" {
  description = "Nom de entreprise"
  type        = string
}

variable "env_name" {
  description = "Nom de environnement"
  type        = string
}

variable "module_name" {
  description = "Nom de la tâche"
  type        = string
}

variable "vpc_cidr" {
    type    = string
    default = "10.0.0.0/16"
}

variable "region" {
  description = "Région AWS (utilisée pour construire les AZ)"
  type        = string
}

