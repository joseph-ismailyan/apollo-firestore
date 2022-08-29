FROM node:16-alpine

WORKDIR /server

COPY ./index.ts .
COPY ./tsconfig.json .
COPY ./package.json .
COPY ./package-lock.json .

RUN npm ci --only=prod

RUN npm run build

EXPOSE 8080
CMD npm run start

