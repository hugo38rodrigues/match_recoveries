FROM node:22-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app
COPY . .
RUN npm install
CMD [ "node", "main.js" ]

EXPOSE 80