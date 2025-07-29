FROM node:20 as build

WORKDIR /app

# Copy toàn bộ mã nguồn
COPY . .

RUN npm install
RUN npm run build

# Stage 2: serve bằng nginx
FROM nginx:stable-alpine
# Thay đổi từ /app/build thành /app/dist
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]