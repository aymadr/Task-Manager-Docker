# Task Manager - Application Full Stack Conteneurisée

Application de gestion de tâches avec authentification JWT, tableau Kanban et persistance MongoDB.

## Liens

- **Repository Git** : https://github.com/aymadr/Task-Manager-Docker
- **Docker Hub** : https://hub.docker.com/u/aymadr
  - Frontend : `aymadr/projet-frontend:v1`
  - Backend : `aymadr/projet-backend:v1`

## Prérequis

- Docker Desktop / Docker Engine
- Docker Compose
- Git (pour cloner le dépôt)

## Démarrage

1. Clonez le projet :

```bash
git clone https://github.com/aymadr/Task-Manager-Docker
cd Task-Manager-Docker-main
```

### 2. Construire et démarrer les services

```bash
docker-compose up -d --build
```

Cette commande va :

- Construire les images Docker pour le frontend et le backend
- Télécharger l'image MongoDB
- Créer les volumes et réseaux nécessaires
- Démarrer tous les services en arrière-plan

### 3. Accéder à l'application

Une fois les services démarrés, accédez à :

- **Frontend** : http://localhost:5173
- **API Backend** : http://localhost:5000

### 4. Arrêter les services

```bash
docker-compose down
```

Pour supprimer les volumes :

```bash
docker-compose down -v
```

## Commandes utiles

### Voir les logs

```bash

docker-compose logs -f

docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo
```

### Reconstruire après modification

```bash
docker-compose up -d --build
```

### Vérifier l'état des services

```bash
docker-compose ps
```

### Accéder au shell d'un conteneur

```bash
# backend
docker exec -it my-backend sh

# frontend
docker exec -it my-frontend sh

# MongoDB
docker exec -it my-mongodb mongosh
```

## Architecture Docker

### Services

L'application est composée de 3 services Docker :

#### 1. MongoDB (Base de données)

- **Image** : `mongo:latest`
- **Container** : `my-mongodb`
- **Port** : `27017:27017`
- **Volume** : `mongo-data` `/data/db` (persistance des données)
- **Réseau** : `app-network`

#### 2. Backend (API Node.js/Express)

- **Image** : `aymadr/projet-backend:v1`
- **Container** : `my-backend`
- **Port** : `5000:5000`
- **Dépendances** : MongoDB
- **Réseau** : `app-network`
- **Build** : `./backend/Dockerfile`

#### 3. Frontend (React + Vite)

- **Image** : `aymadr/projet-frontend:v1`
- **Container** : `my-frontend`
- **Port** : `5173:5173`
- **Dépendances** : Backend
- **Réseau** : `app-network`
- **Build** : `./frontend/Dockerfile`

### Volumes

- **mongo-data** : Volume nommé pour la persistance des données MongoDB
  - Monté sur `/data/db` dans le conteneur MongoDB
  - Les données persistent même après l'arrêt des conteneurs

### Réseaux

- **app-network** : Réseau bridge personnalisé
  - Permet la communication sécurisée entre les conteneurs
  - MongoDB n'est pas exposé publiquement, uniquement accessible via le réseau interne
  - Le backend accède à MongoDB via le nom d'hôte `mongo` (résolution DNS Docker)

### Communication entre services

```
Frontend (localhost:5173)
    ↓ HTTP
Backend (localhost:5000)
    ↓ MongoDB Protocol
MongoDB (mongo:27017) [via app-network]
```

## Tests de communication et persistance

### Test 1 : Communication Frontend ↔ Backend

1. Démarrer les services :

   ```bash
   docker-compose up -d
   ```

2. Ouvrir le frontend : http://localhost:5173

3. Créer un compte utilisateur via le formulaire "Sign Up"

4. Se connecter avec les identifiants créés

5. **Résultat attendu** : Si l'inscription et la connexion fonctionnent, la communication frontend ↔ backend est opérationnelle.

### Test 2 : Communication Backend ↔ MongoDB

1. Créer une tâche dans l'interface (colonne "To Do")

2. Vérifier que la tâche apparaît immédiatement

3. **Résultat attendu** : Si la tâche est sauvegardée et affichée, la communication backend ↔ MongoDB fonctionne.

### Test 3 : Persistance des données

1. Créer une tâche nommée "TEST PERSISTANCE"

2. Arrêter tous les conteneurs :

   ```bash
   docker-compose down
   ```

3. Redémarrer les services :

   ```bash
   docker-compose up -d
   ```

4. Se reconnecter à l'application

5. **Résultat attendu** : La tâche "TEST PERSISTANCE" doit toujours être présente, prouvant que les données sont bien persistées dans le volume Docker.

### Test 4 : Communication réseau interne

1. Vérifier que le backend peut accéder à MongoDB via le réseau interne :

   ```bash
   docker exec -it my-backend ping mongo
   ```

2. Vérifier les logs du backend pour confirmer la connexion :

   ```bash
   docker-compose logs backend | grep "MongoDB Connected"
   ```

3. **Résultat attendu** : les logs doivent afficher "MongoDB Connected".

## Technologies utilisées

- **Frontend** : React 18, Vite, TailwindCSS
- **Backend** : Node.js 18, Express, Mongoose
- **Base de données** : MongoDB
- **Conteneurisation** : Docker, Docker Compose
