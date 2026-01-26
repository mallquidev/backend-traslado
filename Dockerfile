# Usa Node 18 Alpine
FROM node:18-alpine

# Carpeta de trabajo
WORKDIR /app

# Copia dependencias primero para aprovechar cache
COPY package*.json ./

# Instala solo producción (ya estaba bien)
RUN npm install --production

# Copia el resto del código
COPY . .

# No necesitamos exponer 4000 al público, solo internamente en Docker
# EXPOSE 4000  # opcional, puedes dejarlo comentado

# Comando de arranque
CMD ["npm", "start"]
