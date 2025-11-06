FROM node:18

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN chmod +x wait-for-it.sh

EXPOSE 8080

CMD ["./wait-for-it.sh", "db", "3306", "--", "node", "index.js"]