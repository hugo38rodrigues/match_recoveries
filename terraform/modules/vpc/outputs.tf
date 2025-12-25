output "vpc_id" {
  description = "ID du VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs des subnets publics"
  value       = module.vpc.public_subnets
}

output "private_subnet_ids" {
  description = "IDs des subnets privés"
  value       = module.vpc.private_subnets
}

output "vpc_cidr" {
  description = "CIDR du VPC"
  value       = module.vpc.vpc_cidr_block
}
