#!/bin/bash

# Скрипт для запуска VetGuide в режиме разработки с Colima
# Использование: ./colima/scripts/start-dev.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для цветного вывода
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка установки Colima
check_colima() {
    if ! command -v colima &> /dev/null; then
        print_error "Colima не установлен. Установите его с помощью: brew install colima"
        exit 1
    fi
    print_success "Colima найден"
}

# Проверка установки Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker не установлен"
        exit 1
    fi
    print_success "Docker найден"
}

# Запуск Colima с конфигурацией разработки
start_colima() {
    print_status "Запуск Colima с конфигурацией разработки..."
    
    if colima status --profile dev &> /dev/null; then
        print_warning "Colima профиль 'dev' уже запущен"
    else
        colima start --profile dev --cpu 4 --memory 8 --disk 100 --mount /Users/grigorystukunov/vsProj/vetguide:w
        print_success "Colima запущен с профилем 'dev'"
    fi
}

# Ожидание готовности Docker
wait_for_docker() {
    print_status "Ожидание готовности Docker..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker info &> /dev/null; then
            print_success "Docker готов к работе"
            return 0
        fi
        
        print_status "Попытка $attempt/$max_attempts - ожидание Docker..."
        sleep 2
        ((attempt++))
    done
    
    print_error "Docker не готов после $max_attempts попыток"
    exit 1
}

# Запуск API сервиса
start_api() {
    print_status "Запуск VetGuide API..."
    
    cd vetguide-api
    
    # Проверка наличия .env файла
    if [ ! -f .env ]; then
        print_warning ".env файл не найден, копируем из env.example"
        cp env.example .env
    fi
    
    # Запуск сервисов
    docker-compose up -d
    
    print_success "VetGuide API запущен"
    cd ..
}

# Запуск UI сервиса
start_ui() {
    print_status "Запуск VetGuide UI..."
    
    cd vetguide-ui
    
    # Запуск в режиме разработки
    docker-compose up -d
    
    print_success "VetGuide UI запущен"
    cd ..
}

# Проверка статуса сервисов
check_services() {
    print_status "Проверка статуса сервисов..."
    
    # Проверка API
    if docker-compose -f vetguide-api/docker-compose.yml ps | grep -q "Up"; then
        print_success "API сервисы работают"
    else
        print_warning "API сервисы могут быть не готовы"
    fi
    
    # Проверка UI
    if docker-compose -f vetguide-ui/docker-compose.yml ps | grep -q "Up"; then
        print_success "UI сервисы работают"
    else
        print_warning "UI сервисы могут быть не готовы"
    fi
}

# Показать информацию о доступе
show_access_info() {
    echo ""
    echo "=========================================="
    echo "  VetGuide Development Environment Ready  "
    echo "=========================================="
    echo ""
    print_success "Все сервисы запущены!"
    echo ""
    echo "Доступные сервисы:"
    echo "  🌐 Frontend (UI):     http://localhost:3000"
    echo "  🔧 Backend (API):     http://localhost:3001"
    echo "  🗄️  PostgreSQL:       localhost:5432"
    echo "  📦 MinIO Console:     http://localhost:9001"
    echo "  📦 MinIO API:         http://localhost:9000"
    echo ""
    echo "Полезные команды:"
    echo "  📊 Статус сервисов:   docker-compose -f vetguide-api/docker-compose.yml ps"
    echo "  📋 Логи API:          docker-compose -f vetguide-api/docker-compose.yml logs -f"
    echo "  📋 Логи UI:           docker-compose -f vetguide-ui/docker-compose.yml logs -f"
    echo "  🛑 Остановка:         ./colima/scripts/stop-dev.sh"
    echo ""
}

# Основная функция
main() {
    echo "=========================================="
    echo "  VetGuide Development Environment Setup  "
    echo "=========================================="
    echo ""
    
    check_colima
    check_docker
    start_colima
    wait_for_docker
    start_api
    start_ui
    check_services
    show_access_info
}

# Обработка аргументов командной строки
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Использование: $0 [команда]"
        echo ""
        echo "Команды:"
        echo "  (без аргументов)  Запуск среды разработки"
        echo "  help              Показать эту справку"
        echo ""
        echo "Этот скрипт:"
        echo "  1. Запускает Colima с профилем 'dev'"
        echo "  2. Запускает все сервисы VetGuide"
        echo "  3. Показывает информацию о доступе"
        ;;
    "")
        main
        ;;
    *)
        print_error "Неизвестная команда: $1"
        echo "Используйте '$0 help' для справки"
        exit 1
        ;;
esac
