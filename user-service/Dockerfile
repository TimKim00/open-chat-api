# Postgres image
FROM postgres:15-alpine AS db

ENV POSTGRES_DB=$DB_NAME
ENV POSTGRES_USER=$DB_USER
ENV POSTGRES_PASSWORD=$DB_PASS

# App image 
FROM node:16-alpine AS app
WORKDIR /app
COPY . .
RUN npm install --production
CMD ["npm", "test"]