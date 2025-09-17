# FastEats Docker Setup

## Menjalankan Semua Services (PostgreSQL, MongoDB, Redis, RabbitMQ)
```bash
# Dari root folder FastEats
docker-compose up -d
```

## Stop Services
```bash
docker-compose down
```

## View Logs
```bash
# Semua services
docker-compose logs -f

# Service spesifik
docker-compose logs -f fasteats_rabbitmq
docker-compose logs -f fasteats_db_postgres
```

## Access URLs
- **PostgreSQL**: localhost:5433
- **MongoDB**: localhost:27017
- **Redis**: localhost:6381
- **RabbitMQ Management**: http://localhost:15673
- **RabbitMQ AMQP**: localhost:5673

## Environment Variables
File `.env` berisi konfigurasi default:
```
DB_NAME=FastEats
DB_USER=FastEats
DB_PASSWORD=FastEats_PW
DB_PORT=5433

MONGO_USER=FastEats
MONGO_PASSWORD=FastEats_PW

RABBITMQ_USER=service
RABBITMQ_PASSWORD=service_PW
```
