#!/bin/bash

# Скрипт для остановки VetGuide Kubernetes среды
# Использование: ./colima/scripts/stop-k8s.sh

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

# Остановка port-forwarding процессов
stop_port_forwarding() {
    print_status "Остановка port-forwarding процессов..."
    
    # Найти и остановить процессы port-forward
    local pids=$(pgrep -f "kubectl port-forward" || true)
    
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill -9
        print_success "Port-forwarding процессы остановлены"
    else
        print_warning "Port-forwarding процессы не найдены"
    fi
}

# Удаление развертывания из Kubernetes
undeploy_from_k8s() {
    print_status "Удаление VetGuide из Kubernetes..."
    
    if [ -d "k8s" ]; then
        # Удаление ресурсов
        kubectl delete -f k8s/ --ignore-not-found=true
        print_success "VetGuide удален из Kubernetes"
    else
        print_warning "Директория k8s не найдена"
    fi
}

# Остановка Colima
stop_colima() {
    print_status "Остановка Colima..."
    
    if colima status --profile k8s &> /dev/null; then
        colima stop --profile k8s
        print_success "Colima остановлен"
    else
        print_warning "Colima профиль 'k8s' не запущен"
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
    echo "  VetGuide Kubernetes Environment Stopped  "
    echo "=========================================="
    echo ""
    print_success "Kubernetes среда остановлена!"
    echo ""
    echo "Статистика Docker:"
    echo "  📦 Контейнеры: $(docker ps -q | wc -l | tr -d ' ') запущено"
    echo "  🖼️  Образы: $(docker images -q | wc -l | tr -d ' ') всего"
    echo "  💾 Тома: $(docker volume ls -q | wc -l | tr -d ' ') всего"
    echo ""
    echo "Полезные команды:"
    echo "  🚀 Запуск K8s:        ./colima/scripts/start-k8s.sh"
    echo "  🚀 Запуск Dev:        ./colima/scripts/start-dev.sh"
    echo "  📊 Статус Colima:     colima status"
    echo "  🧹 Полная очистка:    ./colima/scripts/cleanup.sh"
    echo ""
}

# Основная функция
main() {
    echo "=========================================="
    echo "  VetGuide Kubernetes Environment Shutdown  "
    echo "=========================================="
    echo ""
    
    stop_port_forwarding
    undeploy_from_k8s
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
        echo "  (без аргументов)  Остановка Kubernetes среды"
        echo "  help              Показать эту справку"
        echo ""
        echo "Этот скрипт:"
        echo "  1. Останавливает port-forwarding"
        echo "  2. Удаляет VetGuide из Kubernetes"
        echo "  3. Останавливает Colima"
        echo "  4. Очищает Docker ресурсы"
        echo "  5. Показывает статистику"
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

