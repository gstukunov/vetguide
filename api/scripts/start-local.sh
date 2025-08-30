#!/bin/bash

# Скрипт запуска VetGuide API локально с S3 хранилищем

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Без цвета

echo -e "${BLUE}Запуск VetGuide API локально...${NC}"

# Проверяем существование .env файла
if [ ! -f .env ]; then
    echo -e "${YELLOW}Создание .env файла из шаблона...${NC}"
    cp env.example .env
    echo -e "${GREEN}Пожалуйста, отредактируйте .env файл с вашими значениями конфигурации${NC}"
fi

# Проверяем существование папки uploads
if [ ! -d "uploads" ]; then
    echo -e "${YELLOW}Создание папки uploads...${NC}"
    mkdir -p uploads/avatars/doctors
    mkdir -p uploads/avatars/users
    mkdir -p uploads/clinics/logos
    mkdir -p uploads/clinics/banners
    mkdir -p uploads/clinics/gallery
    mkdir -p uploads/general
    echo -e "${GREEN}Структура папки uploads создана${NC}"
fi

# Проверяем, запущен ли Docker
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        echo -e "${YELLOW}Docker запущен. Запуск MinIO (S3-совместимое хранилище)...${NC}"
        
        # Запускаем MinIO если не запущен
        if ! docker ps | grep -q "vetguide-minio"; then
            echo -e "${YELLOW}Запуск MinIO контейнера...${NC}"
            docker-compose -f docker-compose.s3.yml up -d minio
            
            # Ждем готовности MinIO
            echo -e "${YELLOW}Ожидание готовности MinIO...${NC}"
            sleep 10
            
            echo -e "${GREEN}MinIO запущен на:${NC}"
            echo -e "  - API: http://localhost:9000"
            echo -e "  - Консоль: http://localhost:9001"
            echo -e "  - Access Key: minioadmin"
            echo -e "  - Secret Key: minioadmin123"
        else
            echo -e "${GREEN}MinIO уже запущен${NC}"
        fi
    else
        echo -e "${YELLOW}Docker не запущен. Используется локальное файловое хранилище.${NC}"
    fi
else
    echo -e "${YELLOW}Docker не найден. Используется локальное файловое хранилище.${NC}"
fi

# Устанавливаем зависимости если node_modules не существует
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Установка зависимостей...${NC}"
    npm install
fi

# Проверяем, запущена ли база данных (предполагая PostgreSQL)
if command -v pg_isready &> /dev/null; then
    if pg_isready -h localhost -p 5432 &> /dev/null; then
        echo -e "${GREEN}PostgreSQL запущен${NC}"
    else
        echo -e "${YELLOW}PostgreSQL не запущен. Пожалуйста, запустите вашу базу данных.${NC}"
    fi
else
    echo -e "${YELLOW}PostgreSQL клиент не найден. Пожалуйста, убедитесь, что ваша база данных запущена.${NC}"
fi

# Запускаем приложение
echo -e "${GREEN}Запуск VetGuide API в режиме разработки...${NC}"
echo -e "${BLUE}Доступные эндпоинты:${NC}"
echo -e "  - API: http://localhost:3000"
echo -e "  - S3 Загрузка: http://localhost:3000/s3/upload"
echo -e "  - Проверка здоровья: http://localhost:3000/s3/health"
echo -e "  - Локальные файлы: http://localhost:3000/uploads/"

# Запускаем приложение
npm run start:dev
