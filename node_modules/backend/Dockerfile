FROM node:22-alpine

WORKDIR /app

RUN npm install -g prisma

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "run", "dev"]
