output "lambda_name" {
  description = "Nom de la lambda fonction"
  value       = aws_lambda_function.recovery_match.function_name
}
