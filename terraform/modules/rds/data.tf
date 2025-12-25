data "aws_secretsmanager_random_password" "admin_password" {
  password_length = 50
  exclude_numbers = true
}

data "aws_secretsmanager_random_password" "app_password" {
  password_length = 50
  exclude_numbers = true
}