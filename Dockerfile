FROM node:17
WORKDIR /usr/src/app
COPY package*.json index.js ./
RUN npm install
EXPOSE 4000
CMD ["node", "index.js"]