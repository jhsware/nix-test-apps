FROM --platform=linux/amd64 node:20-alpine

ENV TZ Europe/Stockholm
WORKDIR /usr/src/app

COPY ["package.json", "package.json"]
COPY ["package-lock.json", "package-lock.json"]
COPY ["src", "src"]

RUN chown -R node:node /usr/src/app
USER node
RUN npm ci --production

EXPOSE 3010
CMD ["npm", "start"]
