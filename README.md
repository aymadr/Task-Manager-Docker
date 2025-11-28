# Task Manager

Application de gestion de tâches avec authentification JWT, tableau Kanban et persistance MongoDB.

Docker Hub : https://hub.docker.com/u/aymadr

## Prérequis

- Docker Desktop / Docker Engine
- Docker Compose

## Démarrage

1. Clonez le projet :

```bash
git clone https://github.com/aymadr/Task-Manager-Docker
cd Task-Manager-Docker-main
```

2. Démarrez les services :

```bash
docker-compose up -d --build
```

3. Accédez à l'application :

- Frontend : http://localhost:5173
- API Backend : http://localhost:5000

## Commandes

Démarrer les services :

```bash
docker-compose up -d --build
```

Arrêter les services :

```bash
docker-compose down
```

Voir les logs :

```bash
docker-compose logs -f
```

## Architecture

- Frontend : React + Vite (port 5173)
- Backend : Node.js + Express (port 5000)
- Base de données : MongoDB (port 27017)

Les services communiquent via le réseau Docker `app-network`. Les données MongoDB sont persistées dans le volume `mongo-data`.
