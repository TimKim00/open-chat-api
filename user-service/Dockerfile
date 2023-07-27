# App image 
FROM node:16-alpine AS app
WORKDIR /app
COPY . .
RUN npm install --production
CMD ["npm", "start"]