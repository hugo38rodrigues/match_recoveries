locals {
    db_password_admin = data.aws_secretsmanager_random_password.admin_password
    db_password_app = data.aws_secretsmanager_random_password.app_password
}
