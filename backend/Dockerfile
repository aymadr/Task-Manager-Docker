# On part d'une version légère de Node.js (Linux Alpine)
FROM node:18-alpine

# On crée le dossier de travail dans le conteneur
WORKDIR /app

# On copie d'abord les fichiers de dépendances (pour optimiser le cache Docker)
COPY package*.json ./

# On installe les librairies
RUN npm install

# On copie tout le reste du code
COPY . .

# On indique que le conteneur écoute sur le port 5000
EXPOSE 5000

# La commande de démarrage
CMD ["node", "server.js"]