FROM --platform=linux/amd64 node:alpine

WORKDIR /app

COPY . ./

RUN npm install

RUN npm run build

CMD ["npm", "run", "test"]
