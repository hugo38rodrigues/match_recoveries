FROM node:23

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app
COPY . .
RUN npm install
EXPOSE 80

CMD "npm load-data"

