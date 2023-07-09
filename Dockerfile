FROM ghcr.io/puppeteer/puppeteer:20.5.0

USER root

RUN npm install -g npm
WORKDIR /app

COPY package.json package-lock.json /app/
RUN chown -R pptruser:pptruser /app

USER pptruser

RUN npm install
COPY . /app

# Specify the command to start your application
CMD ["npm", "run", "start"]