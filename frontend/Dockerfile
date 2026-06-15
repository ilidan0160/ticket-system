# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Set environment variables for build
ARG REACT_APP_API_URL=http://localhost:5000/api
ARG REACT_APP_SOCKET_URL=http://localhost:5000
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SOCKET_URL=$REACT_APP_SOCKET_URL

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Replace default Nginx config to allow client-side routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $$uri $$uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
