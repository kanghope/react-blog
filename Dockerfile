# 1. 빌드 단계 (Node.js 환경)
FROM node:18-alpine AS build
WORKDIR /app

# 의존성 설치 (캐시 활용을 위해 분리)
COPY package*.json ./
RUN npm install

# 전체 소스 복사 및 빌드
COPY . .
RUN npm run build

# 2. 실행 단계 (Nginx)
FROM nginx:stable-alpine

# [수정] 기존 Nginx 기본 파일들을 확실히 지워줍니다.
RUN rm -rf /usr/share/nginx/html/*

# [수정] dist 폴더 "안의 내용물"을 복사합니다.
COPY --from=build /app/dist/ /usr/share/nginx/html/
# 80번 포트 개방
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]