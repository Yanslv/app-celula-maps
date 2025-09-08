# Usa imagem oficial do Node.js (LTS)
FROM node:18

# Define diretório de trabalho
WORKDIR /usr/src/app

# Instala o eas-cli globalmente
RUN npm install -g eas-cli

# Mantém o container ativo (pode ser sobrescrito pelo docker-compose)
CMD ["bash"]
