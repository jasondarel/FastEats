Di api-gateway expressnya :
npm install express http-proxy-middleware cors dotenv

1. Ganti .env
2. npm install jsonwebtoken dotenv -> folder auth-service
---Opsional---
3. npm install -g concurrently -> di folder project
4. npx concurrently "cd api-gateway && npm run dev" "cd auth-service && npm run dev" "cd user-service && npm run dev" "cd restaurant-service && npm run dev" "cd order-service && npm run dev"
// run semua sekaligus

    
