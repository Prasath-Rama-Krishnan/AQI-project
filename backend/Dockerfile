FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN apt-get update && apt-get install -y python3 python3-pip \
    && ln -sf /usr/bin/python3 /usr/bin/python
RUN python3 -m pip install --no-cache-dir pandas scikit-learn

COPY . .

EXPOSE 10000
CMD ["node", "server.js"]
