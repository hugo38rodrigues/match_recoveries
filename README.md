# run docker
## Mysql
docker run --name hall-e-mysql -e MYSQL_USER=<USER> -e MYSQL_PASSWORD=<USER_PASSWORD> -e MYSQL_DATABASE=hall-e -e MYSQL_ROOT_PASSWORD=<ROOT_PASSWORD> -p 3306:3306 -d mysql
## Mongo
docker run --name hall-e-mongodb -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=pass mongodb/mongodb-community-server

./run_recovery_match.bash --bdd=<NAME_OF_DATABASE>
./run_recovery_match.bash --bdd=<NAME_OF_DATABASE> --dev=true