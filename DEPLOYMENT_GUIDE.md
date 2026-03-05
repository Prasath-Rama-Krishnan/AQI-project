# AQI Project - Production Deployment Guide

This guide provides step-by-step instructions to deploy the AQI project to a production environment.

---

## 📋 Pre-Deployment Checklist

✅ Code is production-ready  
✅ Environment variables configured  
✅ Environment-aware API URLs configured  
✅ CORS properly configured  
✅ Error handling in place  

---

## 🚀 Deployment Options

### Option 1: Deploy to Heroku (Recommended for Beginners)

#### Prerequisites
- Heroku Account (free tier available)
- Git installed
- Heroku CLI installed

#### Steps

**1. Prepare the project for Heroku:**

```bash
cd D:\project\final project\AQI-project
```

**2. Create `Procfile` in project root:**

```
web: cd backend && npm start
```

**3. Create root-level `package.json` for Heroku:**

```json
{
  "name": "aqi-project",
  "version": "1.0.0",
  "description": "AQI Prediction Project",
  "scripts": {
    "build": "cd frontend && npm run build",
    "start": "cd backend && npm start",
    "install-deps": "npm install && cd frontend && npm install && cd ../backend && npm install"
  },
  "engines": {
    "node": "18.x"
  }
}
```

**4. Login to Heroku and create app:**

```bash
heroku login
heroku create your-app-name
```

**5. Set environment variables on Heroku:**

```bash
heroku config:set BACKEND_PORT=5000
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com
```

**6. Deploy:**

```bash
git push heroku main
```

**7. Check logs:**

```bash
heroku logs --tail
```

Visit: `https://your-app-name.herokuapp.com`

---

### Option 2: Deploy to AWS EC2 + S3 + CloudFront

#### Prerequisites
- AWS Account
- EC2 instance (Ubuntu 20.04 or newer)
- Node.js 18+ installed on EC2

#### Backend Deployment

**1. SSH into EC2 instance:**

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

**2. Clone repository:**

```bash
git clone https://github.com/your-username/AQI-project.git
cd AQI-project
```

**3. Install dependencies:**

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

**4. Build frontend:**

```bash
cd frontend
npm run build
cd ..
```

**5. Setup PM2 for process management:**

```bash
npm install -g pm2
cd backend
pm2 start server.js --name "aqi-backend"
pm2 startup
pm2 save
```

**6. Configure environment variables:**

```bash
cd backend
cat > .env << EOF
BACKEND_PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
EOF
```

**7. Setup Nginx as reverse proxy:**

```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
```

Replace content with:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart Nginx:

```bash
sudo systemctl restart nginx
```

**8. Setup SSL with Let's Encrypt:**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Frontend Deployment

**1. Upload built frontend to S3:**

```bash
aws s3 sync frontend/dist s3://your-bucket-name --delete --acl public-read
```

**2. Create CloudFront distribution pointing to S3**

**3. Update backend CORS settings:**

In `backend/server.js`, update:

```javascript
const corsOptions = {
  origin: "https://your-cloudfront-domain.cloudfront.net",
  credentials: true,
  optionsSuccessStatus: 200
};
```

---

### Option 3: Deploy to DigitalOcean App Platform

#### Prerequisites
- DigitalOcean Account
- Project on GitHub

#### Steps

**1. Push code to GitHub:**

```bash
git add .
git commit -m "Final production build"
git push origin main
```

**2. In DigitalOcean Console:**
- Click "Create" → "App"
- Connect GitHub repository
- Set root as build source

**3. Add environment variables:**
- `BACKEND_PORT`: 5000
- `NODE_ENV`: production
- `FRONTEND_URL`: https://your-app.ondigitalocean.app

**4. Deploy**

---

### Option 4: Deploy Locally / On-Premises (Using Systemd)

#### Prerequisites
- Linux server with Node.js 18+

#### Steps

**1. Clone and setup:**

```bash
git clone your-repo
cd AQI-project
npm run install-deps
```

**2. Build frontend:**

```bash
cd frontend && npm run build && cd ..
```

**3. Create systemd service file:**

```bash
sudo nano /etc/systemd/system/aqi-backend.service
```

Add:

```ini
[Unit]
Description=AQI Project Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/AQI-project/backend
ExecStart=/usr/bin/node /home/ubuntu/AQI-project/backend/server.js
Restart=always
Environment="NODE_ENV=production"
Environment="BACKEND_PORT=5000"
Environment="FRONTEND_URL=http://your-domain.com"

[Install]
WantedBy=multi-user.target
```

**4. Enable and start service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable aqi-backend
sudo systemctl start aqi-backend
sudo systemctl status aqi-backend
```

---

## 📝 Configuration for Production

### Backend `.env` (Production)

```
BACKEND_PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

### Frontend `.env` (Production)

```
VITE_BACKEND_URL=https://your-domain.com/api
```

---

## 🔧 Key Points for Production

1. **Environment Variables**
   - Never hardcode sensitive data
   - Use `.env` files (not committed to Git)
   - Backend detects `NODE_ENV=production` to disable dev CORS

2. **CORS Configuration**
   - Update `FRONTEND_URL` in backend
   - Backend will only accept requests from trusted origins

3. **Database** (if needed in future)
   - Configure database connection in `.env`
   - Use environment-specific connection strings

4. **API Rate Limiting** (optional)
   - Install `express-rate-limit` for production
   - Prevent abuse of `/api/predict/upload`

5. **Monitoring**
   - Use PM2 Plus or similar for process monitoring
   - Setup logging aggregation (e.g., Winston, Morgan)

6. **Scaling**
   - Use load balancer if deploying multiple backend instances
   - Configure Redis for session management if needed

---

## 🧪 Pre-Production Testing

**1. Test with production environment variables:**

```bash
cd frontend
npm run build
npm run preview  # Test production build locally
```

**2. Test backend with NODE_ENV=production:**

```bash
cd backend
NODE_ENV=production npm start
```

**3. Test CORS:**

```bash
curl -H "Origin: https://your-domain.com" http://localhost:5000/health
```

---

## 📊 Monitoring & Maintenance

### View Backend Logs

**Heroku:**
```bash
heroku logs --tail
```

**EC2/DigitalOcean:**
```bash
tail -f backend.log  # If using logging
pm2 logs aqi-backend  # If using PM2
```

### Update Code

```bash
git pull origin main
npm install
npm run build
# Restart services as per your deployment method
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS Error | Check `FRONTEND_URL` in backend `.env` |
| 503 Service Unavailable | Backend crashed; check logs with `pm2 logs` |
| API returns 404 | Ensure backend is running on correct port |
| Slow uploads | Increase `NODE_ENV` max request size in server.js |

---

## 📞 Support

For questions or issues:
1. Check backend logs
2. Verify environment variables are set correctly
3. Ensure both frontend and backend are running
4. Test with Postman for API endpoints

---

**Version**: 1.0  
**Last Updated**: March 4, 2026
