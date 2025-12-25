output "lambda_name" {
  value       = module.recovery_match.lambda_name
  description = "Nom de la Lambda API"
}

output "ec2_id" {
  value       = aws_instance.db_helper.id
  description = "ID instance EC2 de debug DB"
}

