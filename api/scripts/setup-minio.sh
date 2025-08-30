#!/bin/bash

# Скрипт настройки MinIO для VetGuide API
# Этот скрипт настраивает бакеты и политики для локальной разработки

set -e

# Конфигурация
MINIO_ENDPOINT="http://localhost:9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin123"
BUCKET_NAME="vetguide-images"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Без цвета

echo -e "${BLUE}Настройка MinIO для VetGuide API...${NC}"

# Проверяем, запущен ли MinIO
if ! curl -s "$MINIO_ENDPOINT/minio/health/live" > /dev/null; then
    echo -e "${RED}MinIO не запущен. Запустите его сначала командой:${NC}"
    echo -e "${YELLOW}docker-compose -f docker-compose.s3.yml up -d minio${NC}"
    exit 1
fi

echo -e "${GREEN}MinIO запущен${NC}"

# Устанавливаем MinIO клиент если не установлен
if ! command -v mc &> /dev/null; then
    echo -e "${YELLOW}Установка MinIO клиента...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install minio/stable/mc
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        wget https://dl.min.io/client/mc/release/linux-amd64/mc
        chmod +x mc
        sudo mv mc /usr/local/bin/
    else
        echo -e "${RED}Неподдерживаемая ОС. Установите MinIO клиент вручную.${NC}"
        exit 1
    fi
fi

# Настраиваем MinIO клиент
echo -e "${YELLOW}Настройка MinIO клиента...${NC}"
mc alias set local $MINIO_ENDPOINT $MINIO_ACCESS_KEY $MINIO_SECRET_KEY

# Создаем основной бакет
echo -e "${YELLOW}Создание основного бакета: $BUCKET_NAME${NC}"
mc mb local/$BUCKET_NAME

# Создаем структуру папок
echo -e "${YELLOW}Создание структуры папок...${NC}"
mc cp --recursive --dir local/$BUCKET_NAME/avatars/doctors
mc cp --recursive --dir local/$BUCKET_NAME/avatars/users
mc cp --recursive --dir local/$BUCKET_NAME/avatars/clinics
mc cp --recursive --dir local/$BUCKET_NAME/clinics/logos
mc cp --recursive --dir local/$BUCKET_NAME/clinics/banners
mc cp --recursive --dir local/$BUCKET_NAME/clinics/gallery
mc cp --recursive --dir local/$BUCKET_NAME/general
mc cp --recursive --dir local/$BUCKET_NAME/temp

# Устанавливаем политику бакета для публичного чтения
echo -e "${YELLOW}Установка политики бакета для публичного чтения...${NC}"
cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::$BUCKET_NAME/*"
            ]
        }
    ]
}
EOF

mc policy set local/$BUCKET_NAME /tmp/bucket-policy.json

# Устанавливаем CORS политику
echo -e "${YELLOW}Установка CORS политики...${NC}"
cat > /tmp/cors-policy.json << EOF
{
    "CORSRules": [
        {
            "AllowedOrigins": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedHeaders": ["*"],
            "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

mc anonymous set-json local/$BUCKET_NAME /tmp/cors-policy.json

# Удаляем временные файлы
rm -f /tmp/bucket-policy.json /tmp/cors-policy.json

# Тестируем загрузку и скачивание
echo -e "${YELLOW}Тестирование функциональности бакета...${NC}"
echo "Привет MinIO!" > /tmp/test.txt
mc cp /tmp/test.txt local/$BUCKET_NAME/test/
mc cp local/$BUCKET_NAME/test/test.txt /tmp/test-download.txt

if diff /tmp/test.txt /tmp/test-download.txt > /dev/null; then
    echo -e "${GREEN}Тест бакета успешен${NC}"
else
    echo -e "${RED}Тест бакета не прошел${NC}"
fi

# Удаляем тестовые файлы
rm -f /tmp/test.txt /tmp/test-download.txt
mc rm local/$BUCKET_NAME/test/test.txt

echo -e "${GREEN}Настройка MinIO завершена успешно!${NC}"
echo -e "${BLUE}Информация о бакете:${NC}"
echo -e "  - Имя: $BUCKET_NAME"
echo -e "  - Endpoint: $MINIO_ENDPOINT"
echo -e "  - Access Key: $MINIO_ACCESS_KEY"
echo -e "  - Secret Key: $MINIO_SECRET_KEY"
echo -e ""
echo -e "${BLUE}Доступные папки:${NC}"
echo -e "  - avatars/doctors"
echo -e "  - avatars/users"
echo -e "  - avatars/clinics"
echo -e "  - clinics/logos"
echo -e "  - clinics/banners"
echo -e "  - clinics/gallery"
echo -e "  - general"
echo -e "  - temp"
echo -e ""
echo -e "${YELLOW}Теперь вы можете использовать этот экземпляр MinIO как S3 хранилище для локальной разработки.${NC}"
echo -e "${YELLOW}Обновите ваш .env файл:${NC}"
echo -e "  MINIO_ENDPOINT=$MINIO_ENDPOINT"
echo -e "  MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY"
echo -e "  MINIO_SECRET_KEY=$MINIO_SECRET_KEY"
echo -e "  MINIO_BUCKET=$BUCKET_NAME"
