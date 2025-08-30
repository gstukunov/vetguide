#!/bin/bash

# Скрипт для безопасного запуска MinIO
# Загружает переменные из minio.secrets и запускает сервисы

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 Безопасный запуск MinIO...${NC}"

# Проверяем наличие файла с секретами
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Файл .env не найден!${NC}"
    echo -e "${YELLOW}Создайте файл .env с учетными данными${NC}"
    exit 1
fi

# Загружаем переменные из файла секретов
echo -e "${YELLOW}Загружаем переменные окружения...${NC}"
export $(cat .env | grep -v '^#' | xargs)

# Проверяем, что все необходимые переменные загружены
if [ -z "$MINIO_ROOT_USER" ] || [ -z "$MINIO_ROOT_PASSWORD" ]; then
    echo -e "${RED}❌ Не все переменные загружены из .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Переменные загружены:${NC}"
echo -e "Пользователь: ${GREEN}$MINIO_ROOT_USER${NC}"
echo -e "Пароль: ${GREEN}***${NC}"

# Запускаем MinIO
echo -e "${YELLOW}Запускаем MinIO...${NC}"
docker-compose -f docker-compose.s3.yml up -d

# Ждем запуска
echo -e "${YELLOW}Ожидаем запуска MinIO...${NC}"
sleep 10

# Проверяем статус
if docker ps | grep -q vetguide-minio; then
    echo -e "${GREEN}✅ MinIO запущен успешно${NC}"
else
    echo -e "${RED}❌ Ошибка запуска MinIO${NC}"
    exit 1
fi

# Настраиваем MinIO клиент
echo -e "${YELLOW}Настраиваем MinIO клиент...${NC}"
mc alias set local http://localhost:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

# Проверяем доступ
echo -e "${YELLOW}Проверяем доступ...${NC}"
if mc ls local/vetguide-images > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Доступ к MinIO подтвержден${NC}"
else
    echo -e "${YELLOW}Создаем бакет...${NC}"
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
    mc anonymous set download local/vetguide-images
fi

# Запускаем backend с переменными окружения
echo -e "${YELLOW}Запускаем backend с переменными окружения...${NC}"
cd /root
pm2 start ecosystem.config.js --only nest-app

echo ""
echo -e "${GREEN}✅ MinIO и backend запущены безопасно!${NC}"
echo ""
echo -e "${BLUE}🔗 Доступ к MinIO:${NC}"
echo -e "API: http://localhost:9000"
echo -e "Консоль: http://localhost:9001"
echo -e "Логин: $MINIO_ROOT_USER"
echo ""
echo -e "${YELLOW}⚠️  Учетные данные загружены из .env${NC}"
