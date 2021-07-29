FROM node:latest

RUN mkdir /src

WORKDIR /

COPY api/ ./

RUN npm install

EXPOSE 3000

CMD npm start