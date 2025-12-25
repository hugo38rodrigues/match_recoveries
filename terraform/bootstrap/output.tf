output "vpc_id" {
  value       = module.vpc.vpc_id
  description = "ID du VPC"
}

output "vpc_cidr" {
  value       = module.vpc.vpc_cidr
  description = "CIDR du VPC"
}

output "aws_security_group_ec2" {
    value = aws_security_group.ec2.id
}
output "aws_security_group_lambda" {
    value = aws_security_group.lambda.id
}
output "aws_security_group_rds" {
    value = aws_security_group.rds.id
}
output "public_subnet_ids" {
  description = "Subnet public ids"
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Subnet private ids"
  value = module.vpc.private_subnet_ids
}

