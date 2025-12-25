module "vpc" {
    source = "terraform-aws-modules/vpc/aws"
    version = "~> 5.0"
    name = local.prefix_project_name
    cidr = var.vpc_cidr

    azs             = local.azs
    private_subnets = local.private_subnets
    public_subnets  = local.public_subnets

    enable_nat_gateway = false
    enable_vpn_gateway = false
    single_nat_gateway = false
    one_nat_gateway_per_az = false
}

