FROM node:18

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y netcat-openbsd

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

RUN chmod +x wait-for-it.sh

CMD ["./wait-for-it.sh", "db", "3306", "node", "index.js"]