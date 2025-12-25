output "db_address" {
  description = "Endpoint writer du cluster Aurora"
  value       = module.cluster.cluster_endpoint
}

output "db_port" {
  description = "Port du cluster Aurora"
  value       = module.cluster.cluster_port
}

output "db_cluster_arn" {
  description = "ARN du cluster Aurora"
  value       = module.cluster.cluster_arn
}

output "db_master_secret_arn" {
  description = "ARN du secret du master user Aurora"
  value       = module.cluster.cluster_master_user_secret[0].secret_arn
}
