#!/bin/bash

# Скрипт для безопасной настройки MinIO
# ⚠️  ВАЖНО: Запускайте только один раз!

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 Настройка безопасного MinIO...${NC}"

# Генерируем безопасный пароль
MINIO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
MINIO_USER="vetguide_admin_$(date +%s | tail -c 4)"

echo -e "${YELLOW}Сгенерированные учетные данные:${NC}"
echo -e "Пользователь: ${GREEN}$MINIO_USER${NC}"
echo -e "Пароль: ${GREEN}$MINIO_PASSWORD${NC}"
echo ""

# Останавливаем текущий MinIO
echo -e "${YELLOW}Останавливаем текущий MinIO...${NC}"
cd /root/vetguide-api
docker-compose -f docker-compose.s3.yml down

# Обновляем файл minio.env
echo -e "${YELLOW}Обновляем конфигурацию...${NC}"
cat > minio.env << EOF
# MinIO S3 Configuration
# ⚠️  ВАЖНО: Сохраните эти учетные данные в безопасном месте!
MINIO_ROOT_USER=$MINIO_USER
MINIO_ROOT_PASSWORD=$MINIO_PASSWORD
MINIO_BUCKET=vetguide-images
MINIO_REGION=us-east-1
EOF

# Обновляем PM2 ecosystem
echo -e "${YELLOW}Обновляем PM2 конфигурацию...${NC}"
sed -i "s/MINIO_ACCESS_KEY: \".*\"/MINIO_ACCESS_KEY: \"$MINIO_USER\"/" /root/ecosystem.config.js
sed -i "s/MINIO_SECRET_KEY: \".*\"/MINIO_SECRET_KEY: \"$MINIO_PASSWORD\"/" /root/ecosystem.config.js

# Запускаем MinIO с новыми учетными данными
echo -e "${YELLOW}Запускаем MinIO с новыми учетными данными...${NC}"
docker-compose -f docker-compose.s3.yml up -d

# Ждем запуска
echo -e "${YELLOW}Ожидаем запуска MinIO...${NC}"
sleep 10

# Настраиваем MinIO клиент
echo -e "${YELLOW}Настраиваем MinIO клиент...${NC}"
mc alias set local http://localhost:9000 "$MINIO_USER" "$MINIO_PASSWORD"

# Создаем бакет и структуру
echo -e "${YELLOW}Создаем бакет и структуру папок...${NC}"
mc mb local/vetguide-images

# Создаем структуру папок
echo "" | mc pipe local/vetguide-images/avatars/doctors/.keep
echo "" | mc pipe local/vetguide-images/avatars/users/.keep
echo "" | mc pipe local/vetguide-images/avatars/clinics/.keep
echo "" | mc pipe local/vetguide-images/clinics/logos/.keep
echo "" | mc pipe local/vetguide-images/clinics/banners/.keep
echo "" | mc pipe local/vetguide-images/clinics/gallery/.keep
echo "" | mc pipe local/vetguide-images/general/.keep
echo "" | mc pipe local/vetguide-images/temp/.keep

# Настраиваем публичный доступ
echo -e "${YELLOW}Настраиваем публичный доступ...${NC}"
mc anonymous set download local/vetguide-images

# Перезапускаем backend
echo -e "${YELLOW}Перезапускаем backend...${NC}"
pm2 restart nest-app

echo ""
echo -e "${GREEN}✅ MinIO успешно настроен с безопасными учетными данными!${NC}"
echo ""
echo -e "${YELLOW}📋 Сохраните эти данные в безопасном месте:${NC}"
echo -e "Пользователь: ${GREEN}$MINIO_USER${NC}"
echo -e "Пароль: ${GREEN}$MINIO_PASSWORD${NC}"
echo ""
echo -e "${BLUE}🔗 Доступ к MinIO:${NC}"
echo -e "API: http://localhost:9000"
echo -e "Консоль: http://localhost:9001"
echo ""
echo -e "${YELLOW}⚠️  ВАЖНО: Удалите этот скрипт после использования!${NC}"
