FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["/bin/sh", "-c", "sleep 5s && npm run prisma:migrate-prod && npm run prisma:generate && npm start"]
