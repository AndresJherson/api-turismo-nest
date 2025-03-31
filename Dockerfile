# 1. Imagen base con Node.js
FROM node:23-alpine

# 2. Establecer directorio de trabajo
WORKDIR /app

# 3. Copiar archivos de dependencias
COPY package.json package-lock.json turismo-modelos-1.0.1.tgz ./

# 4. Instalar las dependencias
RUN npm install

# 5. Copiar el código compilado
COPY dist/ ./dist/

# 6. Exponer el puerto
EXPOSE 3000

# 7. Ejecutar la aplicación
CMD ["node", "dist/main.js"]
