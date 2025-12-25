locals {
  prefix_project_name = "${var.company_name}-${var.project_name}-${var.env_name}-${var.module_name}"
  ssm_services = [
    "com.amazonaws.${var.region}.ssm",
    "com.amazonaws.${var.region}.ec2messages",
    "com.amazonaws.${var.region}.ssmmessages"
  ]
  azs = [
        "${var.region}a",
        "${var.region}b",
        "${var.region}c", 
    ]
    
}
