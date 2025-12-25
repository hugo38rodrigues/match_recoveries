locals {
    azs = data.aws_availability_zones.available.names
    
  public_subnets = [
    for idx, az in local.azs : cidrsubnet(var.vpc_cidr, 4, idx)
  ]

  private_subnets = [
    for idx, az in local.azs : cidrsubnet(var.vpc_cidr, 4, idx + length(local.azs))
  ]

  prefix_project_name = "${var.company_name}-${var.project_name}-${var.env_name}-${var.module_name}"
}
