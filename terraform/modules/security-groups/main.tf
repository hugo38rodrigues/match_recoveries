# Security Group pour le RDS
resource "aws_security_group" "security_group" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group pour RDS Postgres"
  vpc_id      = var.vpc_id

  # On fera plus précis plus tard (SG Lambda / SG EC2)
  ingress {
    from_port   = var.from_port
    to_port     = var.to_port
    protocol    = "tcp"
    cidr_blocks = var.cidr_blocks
  }

  # Sortie vers tout (classique pour une DB)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}
