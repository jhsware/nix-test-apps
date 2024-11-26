ARG PLATFORM=linux/amd64
FROM --platform=$PLATFORM node:20-alpine

ENV TZ=Europe/Stockholm
WORKDIR /usr/src/app

COPY ["package.json", "package.json"]
COPY ["package-lock.json", "package-lock.json"]
COPY ["src", "src"]

RUN chown -R node:node /usr/src/app
USER node
RUN npm ci --production

EXPOSE 3011
CMD ["npm", "start"]
