#!/bin/bash

# Безопасный запуск MinIO - версия 2.0
# Улучшенная безопасность и логирование

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Функция для безопасного логирования (без секретов)
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | logger -t "minio-startup"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | logger -t "minio-startup"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | logger -t "minio-startup"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | logger -t "minio-startup"
}

# Проверка прав доступа
if [ "$(id -u)" != "0" ]; then
    log_error "Этот скрипт должен запускаться от root пользователя"
    exit 1
fi

log_info "Запуск безопасного MinIO..."

# Проверяем наличие файла .env
if [ ! -f ".env" ]; then
    log_error "Файл .env не найден!"
    log_warning "Создайте файл .env с учетными данными MinIO"
    exit 1
fi

# Проверяем права доступа к .env файлу
if [ "$(stat -c %a .env)" != "600" ]; then
    log_warning "Файл .env должен иметь права 600 для безопасности"
    chmod 600 .env
fi

# Загружаем переменные безопасно (без вывода в логи)
log_info "Загружаем переменные окружения..."
source .env

# Проверяем, что все необходимые переменные загружены
if [ -z "$MINIO_ROOT_USER" ] || [ -z "$MINIO_ROOT_PASSWORD" ]; then
    log_error "Не все переменные загружены из .env"
    exit 1
fi

log_success "Переменные загружены успешно"
log_info "Пользователь: $MINIO_ROOT_USER"

# Останавливаем существующий MinIO если запущен
if docker ps | grep -q vetguide-minio; then
    log_info "Останавливаем существующий MinIO..."
    docker-compose -f docker-compose.s3.yml down
fi

# Запускаем MinIO
log_info "Запускаем MinIO..."
docker-compose -f docker-compose.s3.yml up -d

# Ждем запуска
log_info "Ожидаем запуска MinIO..."
sleep 15

# Проверяем статус
if docker ps | grep -q vetguide-minio; then
    log_success "MinIO запущен успешно"
else
    log_error "Ошибка запуска MinIO"
    exit 1
fi

# Настраиваем MinIO клиент
log_info "Настраиваем MinIO клиент..."
mc alias set local http://localhost:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" > /dev/null 2>&1

# Проверяем доступ
log_info "Проверяем доступ к MinIO..."
if mc ls local/vetguide-images > /dev/null 2>&1; then
    log_success "Доступ к MinIO подтвержден"
else
    log_info "Создаем бакет и структуру папок..."
    
    # Создаем бакет
    mc mb local/vetguide-images > /dev/null 2>&1
    
    # Создаем структуру папок (без вывода)
    for folder in avatars/{doctors,users,clinics} clinics/{logos,banners,gallery} general temp; do
        echo "" | mc pipe "local/vetguide-images/$folder/.keep" > /dev/null 2>&1
    done
    
    # Настраиваем публичный доступ
    mc anonymous set download local/vetguide-images > /dev/null 2>&1
    
    log_success "Структура папок создана"
fi

# Запускаем backend с переменными окружения
log_info "Запускаем backend..."
cd /root
pm2 start ecosystem.config.js --only nest-app > /dev/null 2>&1

log_success "MinIO и backend запущены безопасно!"
log_info "API: http://localhost:9000"
log_info "Консоль: http://localhost:9001"

# Очищаем переменные окружения из памяти
unset MINIO_ROOT_USER MINIO_ROOT_PASSWORD MINIO_ACCESS_KEY MINIO_SECRET_KEY

log_info "Запуск завершен успешно"
