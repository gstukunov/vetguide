#!/bin/bash

# Скрипт для автоматической ротации учетных данных MinIO
# Рекомендуется запускать каждые 90 дней

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Ротация учетных данных MinIO...${NC}"

# Проверяем, запущен ли MinIO
if ! docker ps | grep -q vetguide-minio; then
    echo -e "${RED}❌ MinIO не запущен!${NC}"
    exit 1
fi

# Генерируем новые учетные данные
echo -e "${YELLOW}Генерируем новые учетные данные...${NC}"
NEW_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
NEW_USER="vetguide_admin_$(date +%s | tail -c 4)"

echo -e "${YELLOW}Новые учетные данные:${NC}"
echo -e "Пользователь: ${GREEN}$NEW_USER${NC}"
echo -e "Пароль: ${GREEN}$NEW_PASSWORD${NC}"

# Создаем резервную копию текущих данных
echo -e "${YELLOW}Создаем резервную копию...${NC}"
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Останавливаем MinIO
echo -e "${YELLOW}Останавливаем MinIO...${NC}"
cd /root/vetguide-api
docker-compose -f docker-compose.s3.yml down

# Обновляем файл .env
echo -e "${YELLOW}Обновляем конфигурацию...${NC}"
cat > .env << EOF
# MinIO S3 Configuration - СЕКРЕТНЫЙ ФАЙЛ
# ⚠️  ВАЖНО: НЕ КОММИТЬ В GIT! Только для локального использования!
# Обновлено: $(date)

# Текущие учетные данные
MINIO_ROOT_USER=$NEW_USER
MINIO_ROOT_PASSWORD=$NEW_PASSWORD

# Переменные для backend
MINIO_ACCESS_KEY=$NEW_USER
MINIO_SECRET_KEY=$NEW_PASSWORD
MINIO_BUCKET=vetguide-images
MINIO_REGION=us-east-1
MINIO_USE_SSL=false
EOF

# Запускаем MinIO с новыми учетными данными
echo -e "${YELLOW}Запускаем MinIO с новыми учетными данными...${NC}"
docker-compose -f docker-compose.s3.yml up -d

# Ждем запуска
echo -e "${YELLOW}Ожидаем запуска MinIO...${NC}"
sleep 15

# Настраиваем MinIO клиент
echo -e "${YELLOW}Настраиваем MinIO клиент...${NC}"
mc alias set local http://localhost:9000 "$NEW_USER" "$NEW_PASSWORD"

# Проверяем доступ
echo -e "${YELLOW}Проверяем доступ...${NC}"
if mc ls local/vetguide-images > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Доступ к MinIO восстановлен${NC}"
else
    echo -e "${RED}❌ Ошибка доступа к MinIO${NC}"
    echo -e "${YELLOW}Восстанавливаем из резервной копии...${NC}"
    cp .env.backup.* .env
    docker-compose -f docker-compose.s3.yml up -d
    exit 1
fi

# Обновляем PM2 ecosystem
echo -e "${YELLOW}Обновляем PM2 конфигурацию...${NC}"
sed -i "s/MINIO_ACCESS_KEY: \".*\"/MINIO_ACCESS_KEY: \"$NEW_USER\"/" /root/ecosystem.config.js
sed -i "s/MINIO_SECRET_KEY: \".*\"/MINIO_SECRET_KEY: \"$NEW_PASSWORD\"/" /root/ecosystem.config.js

# Перезапускаем backend
echo -e "${YELLOW}Перезапускаем backend...${NC}"
pm2 restart nest-app

# Сохраняем PM2 конфигурацию
pm2 save

echo ""
echo -e "${GREEN}✅ Ротация учетных данных MinIO завершена успешно!${NC}"
echo ""
echo -e "${YELLOW}📋 Новые учетные данные:${NC}"
echo -e "Пользователь: ${GREEN}$NEW_USER${NC}"
echo -e "Пароль: ${GREEN}$NEW_PASSWORD${NC}"
echo ""
echo -e "${BLUE}📁 Резервная копия: .env.backup.*${NC}"
echo -e "${YELLOW}⚠️  Сохраните новые данные в безопасном месте!${NC}"
echo ""
echo -e "${GREEN}🔄 Следующая ротация рекомендуется через 90 дней${NC}"
