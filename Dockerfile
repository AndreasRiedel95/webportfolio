FROM node:12.16.1-alpine3.10 as prod
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
CMD [ "npm", "run", "serve-prod"]


FROM prod as dev
CMD [ "npm", "run", "serve-dev"]