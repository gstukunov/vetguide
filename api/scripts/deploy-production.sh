#!/bin/bash

# Скрипт продакшн деплоя для VetGuide API
# Этот скрипт должен быть запущен на вашем Ubuntu VPS сервере

set -e

# Конфигурация
APP_NAME="vetguide-api"
APP_DIR="/var/www/vetguide-api"
PM2_CONFIG="ecosystem.config.js"
NGINX_CONFIG="/etc/nginx/sites-available/vetguide-api"
NGINX_ENABLED="/etc/nginx/sites-enabled/vetguide-api"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # Без цвета

echo -e "${GREEN}Начало продакшн деплоя...${NC}"

# Проверяем, не запущен ли скрипт от root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}Этот скрипт не должен быть запущен от root${NC}"
   exit 1
fi

# Обновляем системные пакеты
echo -e "${YELLOW}Обновление системных пакетов...${NC}"
sudo apt update && sudo apt upgrade -y

# Устанавливаем Node.js и npm если не установлены
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Установка Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Устанавливаем PM2 глобально если не установлен
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Установка PM2...${NC}"
    sudo npm install -g pm2
fi

# Устанавливаем Nginx если не установлен
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Установка Nginx...${NC}"
    sudo apt install -y nginx
fi

# Создаем директорию приложения если не существует
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Создание директории приложения...${NC}"
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
fi

# Останавливаем существующий PM2 процесс если запущен
if pm2 list | grep -q "$APP_NAME"; then
    echo -e "${YELLOW}Остановка существующего PM2 процесса...${NC}"
    pm2 stop $APP_NAME
    pm2 delete $APP_NAME
fi

# Копируем файлы приложения
echo -e "${YELLOW}Копирование файлов приложения...${NC}"
cp -r . $APP_DIR/
cd $APP_DIR

# Устанавливаем зависимости
echo -e "${YELLOW}Установка зависимостей...${NC}"
npm ci --only=production

# Собираем приложение
echo -e "${YELLOW}Сборка приложения...${NC}"
npm run build

# Создаем PM2 ecosystem файл
echo -e "${YELLOW}Создание PM2 ecosystem файла...${NC}"
cat > $PM2_CONFIG << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Создаем директорию логов
mkdir -p logs

# Запускаем приложение с PM2
echo -e "${YELLOW}Запуск приложения с PM2...${NC}"
pm2 start $PM2_CONFIG --env production

# Сохраняем PM2 конфигурацию
pm2 save

# Настраиваем PM2 для автозапуска
pm2 startup

# Создаем Nginx конфигурацию
echo -e "${YELLOW}Создание Nginx конфигурации...${NC}"
sudo tee $NGINX_CONFIG > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com; # Замените на ваш реальный домен

    # Заголовки безопасности
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Прокси API
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Статическая раздача файлов для загрузок (если используется локальное хранилище)
    location /uploads/ {
        alias $APP_DIR/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }

    # Эндпоинт проверки здоровья
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Включаем Nginx сайт
if [ ! -L $NGINX_ENABLED ]; then
    sudo ln -s $NGINX_CONFIG $NGINX_ENABLED
fi

# Тестируем Nginx конфигурацию
echo -e "${YELLOW}Тестирование Nginx конфигурации...${NC}"
sudo nginx -t

# Перезагружаем Nginx
echo -e "${YELLOW}Перезагрузка Nginx...${NC}"
sudo systemctl reload nginx

# Включаем Nginx для автозапуска
sudo systemctl enable nginx

# Настраиваем файрвол (если UFW включен)
if command -v ufw &> /dev/null; then
    echo -e "${YELLOW}Настройка файрвола...${NC}"
    sudo ufw allow 'Nginx Full'
    sudo ufw allow OpenSSH
fi

# Создаем systemd сервис для PM2 (альтернатива pm2 startup)
echo -e "${YELLOW}Создание systemd сервиса для PM2...${NC}"
sudo tee /etc/systemd/system/pm2-$USER.service > /dev/null << EOF
[Unit]
Description=PM2 process manager
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=$USER
WorkingDirectory=/home/$USER
Environment=PATH=/home/$USER/.nvm/versions/node/$(node -v)/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=PM2_HOME=/home/$USER/.pm2
PIDFile=/home/$USER/.pm2/pm2.pid
Restart=on-failure

ExecStart=/usr/bin/pm2 resurrect
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill

[Install]
WantedBy=multi-user.target
EOF

# Включаем и запускаем PM2 сервис
sudo systemctl enable pm2-$USER
sudo systemctl start pm2-$USER

# Настраиваем ротацию логов
echo -e "${YELLOW}Настройка ротации логов...${NC}"
sudo tee /etc/logrotate.d/pm2-$USER > /dev/null << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        /usr/bin/pm2 reloadLogs
    endscript
}
EOF

# Создаем шаблон файла окружения
echo -e "${YELLOW}Создание шаблона файла окружения...${NC}"
cat > $APP_DIR/.env.production << EOF
# Конфигурация продакшн окружения
NODE_ENV=production
PORT=3000

# Конфигурация базы данных
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=vetguide

# Конфигурация JWT
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-jwt-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Конфигурация S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name

# Другие конфигурации...
EOF

echo -e "${GREEN}Продакшн деплой завершен успешно!${NC}"
echo -e "${YELLOW}Следующие шаги:${NC}"
echo -e "1. Отредактируйте $APP_DIR/.env.production с вашими реальными значениями"
echo -e "2. Обновите server_name в Nginx конфигурации $NGINX_CONFIG"
echo -e "3. Перезапустите приложение: pm2 restart $APP_NAME"
echo -e "4. Проверьте логи: pm2 logs $APP_NAME"
echo -e "5. Мониторинг: pm2 monit"
