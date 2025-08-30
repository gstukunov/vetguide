#!/bin/bash

# Скрипт для остановки VetGuide в режиме разработки
# Использование: ./colima/scripts/stop-dev.sh

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

# Остановка API сервисов
stop_api() {
    print_status "Остановка VetGuide API..."
    
    if [ -d "vetguide-api" ]; then
        cd vetguide-api
        docker-compose down
        print_success "VetGuide API остановлен"
        cd ..
    else
        print_warning "Директория vetguide-api не найдена"
    fi
}

# Остановка UI сервисов
stop_ui() {
    print_status "Остановка VetGuide UI..."
    
    if [ -d "vetguide-ui" ]; then
        cd vetguide-ui
        docker-compose down
        print_success "VetGuide UI остановлен"
        cd ..
    else
        print_warning "Директория vetguide-ui не найдена"
    fi
}

# Остановка Colima
stop_colima() {
    print_status "Остановка Colima..."
    
    if colima status --profile dev &> /dev/null; then
        colima stop --profile dev
        print_success "Colima остановлен"
    else
        print_warning "Colima профиль 'dev' не запущен"
    fi
}

# Очистка Docker ресурсов
cleanup_docker() {
    print_status "Очистка Docker ресурсов..."
    
    # Удаление неиспользуемых контейнеров
    docker container prune -f
    
    # Удаление неиспользуемых образов
    docker image prune -f
    
    # Удаление неиспользуемых томов
    docker volume prune -f
    
    print_success "Docker ресурсы очищены"
}

# Показать статистику
show_stats() {
    echo ""
    echo "=========================================="
    echo "  VetGuide Development Environment Stopped  "
    echo "=========================================="
    echo ""
    print_success "Все сервисы остановлены!"
    echo ""
    echo "Статистика Docker:"
    echo "  📦 Контейнеры: $(docker ps -q | wc -l | tr -d ' ') запущено"
    echo "  🖼️  Образы: $(docker images -q | wc -l | tr -d ' ') всего"
    echo "  💾 Тома: $(docker volume ls -q | wc -l | tr -d ' ') всего"
    echo ""
    echo "Полезные команды:"
    echo "  🚀 Запуск:            ./colima/scripts/start-dev.sh"
    echo "  📊 Статус Colima:     colima status"
    echo "  🧹 Полная очистка:    ./colima/scripts/cleanup.sh"
    echo ""
}

# Основная функция
main() {
    echo "=========================================="
    echo "  VetGuide Development Environment Shutdown  "
    echo "=========================================="
    echo ""
    
    stop_api
    stop_ui
    stop_colima
    cleanup_docker
    show_stats
}

# Обработка аргументов командной строки
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Использование: $0 [команда]"
        echo ""
        echo "Команды:"
        echo "  (без аргументов)  Остановка среды разработки"
        echo "  help              Показать эту справку"
        echo ""
        echo "Этот скрипт:"
        echo "  1. Останавливает все сервисы VetGuide"
        echo "  2. Останавливает Colima"
        echo "  3. Очищает Docker ресурсы"
        echo "  4. Показывает статистику"
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

