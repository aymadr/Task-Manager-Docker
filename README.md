# 🐳 Projet Docker Fullstack — Task Manager (clone style Linear)

Ce dépôt contient une application de gestion de tâches moderne (style Linear) avec :
- authentification (JWT),
- un tableau Kanban interactif, et
- persistance dans MongoDB.

L'architecture est conteneurisée et orchestrée via `docker-compose`.

**Livrables**

- **Docker Hub (Images)** : https://hub.docker.com/u/aymadr
- **Dépôt Git** : *(ajoutez votre lien Git ici)*

---

## 🚀 Prérequis

- Docker Desktop / Docker Engine
- Docker Compose
- Git (pour cloner le dépôt)

## ⚡ Démarrage rapide

1. Clonez le projet et placez-vous dans le dossier :

```bash
git clone <votre-lien-git>
cd Partiel
```

2. Construisez les images et démarrez les services en arrière-plan :

```bash
docker-compose up -d --build
```

3. Accédez aux services :

- Frontend (UI) : http://localhost:5173
- API Backend : http://localhost:5000

4. Pour arrêter et supprimer les conteneurs :

```bash
docker-compose down
```

---

## 🏗️ Architecture (services)

L'application est divisée en 3 services décrits ci-dessous :

| Service  | Image (exemple)                     | Technologie                  | Description |
|---------:|:-------------------------------------|:-----------------------------|:------------|
| Frontend | `aymadr/projet-frontend:v1`          | React (Vite) + TailwindCSS   | Interface SPA, communique avec l'API | 
| Backend  | `aymadr/projet-backend:v1`           | Node.js + Express            | API REST (auth, routes, logique métier) |
| MongoDB  | `mongo:latest`                       | MongoDB                      | Base de données NoSQL (stockage utilisateurs & tâches) |

### Réseau

Les services communiquent via un réseau Docker bridge personnalisé (ex. `app-network`). La base de données n'est pas exposée publiquement ; le backend y accède par le nom d'hôte `mongo`.

### Persistance

Un volume Docker nommé `mongo-data` monte `/data/db` dans le conteneur MongoDB pour assurer la persistance des données entre redémarrages.

---

## 🧪 Tests et validation

Suivez ces scénarios pour vérifier que tout fonctionne correctement.

### Test A — Communication inter-conteneurs

1. Ouvrez le frontend : `http://localhost:5173`.
2. Créez un compte via le formulaire "Sign Up" et connectez-vous.
   - Si l'inscription et la connexion fonctionnent, le frontend communique correctement avec le backend.
3. Créez une tâche dans la colonne "To Do".
   - Si la tâche apparaît, le backend écrit correctement dans MongoDB.
4. Déplacez la tâche en "Done".
   - Si la mise à jour est persistée, les opérations de mise à jour fonctionnent.

### Test B — Persistance des données (crash test)

1. Créez une tâche nommée `DONNÉE CRITIQUE`.
2. Supprimez les conteneurs (simuler un crash) :

```bash
docker-compose down
```

3. Redémarrez l'application :

```bash
docker-compose up -d
```

4. Rendez-vous sur `http://localhost:5173` et connectez-vous.
   - La tâche `DONNÉE CRITIQUE` doit toujours être présente si le volume MongoDB est correctement configuré.

---

## 🛠️ Commandes utiles

- Construire & démarrer :

```bash
docker-compose up -d --build
```

- Arrêter :

```bash
docker-compose down
```

- Logs en temps réel :

```bash
docker-compose logs -f
```

- Rebuild après modification du code :

```bash
docker-compose up -d --build
```

- Pousser les images sur Docker Hub (exemple) :

```bash
# Se connecter à Docker Hub
docker login

# Taguer puis pousser
docker tag local-image:tag aymadr/projet-frontend:v1
docker push aymadr/projet-frontend:v1
```

---

## 🔧 Débogage rapide

- Si le frontend ne démarre pas : vérifiez les logs du service frontend.

```bash
docker-compose logs frontend
```

- Si le backend ne atteint pas MongoDB : vérifiez que le service `mongo` est UP et que le backend utilise l'hôte `mongo`.

```bash
docker-compose ps
docker-compose logs backend
```

---

## ✍️ Contribution

- Ajoutez votre lien GitHub dans la section "Dépôt Git" ci-dessus.
- Ouvrez une issue ou une pull request pour toute amélioration.

---

Si vous souhaitez, je peux :

- vérifier que le `docker-compose.yml` correspond à cette documentation,
- ajouter des exemples d'environnement (`.env.example`), ou
- générer des scripts d'initialisation pour la base.
