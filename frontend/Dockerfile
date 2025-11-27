# Image de base
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Vite utilise le port 5173 par défaut
EXPOSE 5173

# Important : "--host" permet d'accéder au site depuis l'extérieur du conteneur
CMD ["npm", "run", "dev", "--", "--host"]