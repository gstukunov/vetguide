#!/bin/bash

# Скрипт для полной очистки Colima и Docker ресурсов
# Использование: ./colima/scripts/cleanup.sh

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

# Остановка всех профилей Colima
stop_all_colima() {
    print_status "Остановка всех профилей Colima..."
    
    # Остановка профиля dev
    if colima status --profile dev &> /dev/null; then
        colima stop --profile dev
        print_success "Профиль 'dev' остановлен"
    fi
    
    # Остановка профиля k8s
    if colima status --profile k8s &> /dev/null; then
        colima stop --profile k8s
        print_success "Профиль 'k8s' остановлен"
    fi
    
    # Остановка профиля prod
    if colima status --profile prod &> /dev/null; then
        colima stop --profile prod
        print_success "Профиль 'prod' остановлен"
    fi
    
    # Остановка default профиля
    if colima status &> /dev/null; then
        colima stop
        print_success "Default профиль остановлен"
    fi
}

# Удаление всех профилей Colima
delete_all_colima() {
    print_status "Удаление всех профилей Colima..."
    
    # Удаление профиля dev
    if colima list | grep -q "dev"; then
        colima delete --profile dev
        print_success "Профиль 'dev' удален"
    fi
    
    # Удаление профиля k8s
    if colima list | grep -q "k8s"; then
        colima delete --profile k8s
        print_success "Профиль 'k8s' удален"
    fi
    
    # Удаление профиля prod
    if colima list | grep -q "prod"; then
        colima delete --profile prod
        print_success "Профиль 'prod' удален"
    fi
    
    # Удаление default профиля
    if colima list | grep -q "default"; then
        colima delete
        print_success "Default профиль удален"
    fi
}

# Остановка всех Docker контейнеров
stop_all_containers() {
    print_status "Остановка всех Docker контейнеров..."
    
    local containers=$(docker ps -q)
    if [ -n "$containers" ]; then
        docker stop $containers
        print_success "Все контейнеры остановлены"
    else
        print_warning "Нет запущенных контейнеров"
    fi
}

# Удаление всех Docker контейнеров
remove_all_containers() {
    print_status "Удаление всех Docker контейнеров..."
    
    local containers=$(docker ps -aq)
    if [ -n "$containers" ]; then
        docker rm $containers
        print_success "Все контейнеры удалены"
    else
        print_warning "Нет контейнеров для удаления"
    fi
}

# Удаление всех Docker образов
remove_all_images() {
    print_status "Удаление всех Docker образов..."
    
    local images=$(docker images -q)
    if [ -n "$images" ]; then
        docker rmi $images
        print_success "Все образы удалены"
    else
        print_warning "Нет образов для удаления"
    fi
}

# Удаление всех Docker томов
remove_all_volumes() {
    print_status "Удаление всех Docker томов..."
    
    local volumes=$(docker volume ls -q)
    if [ -n "$volumes" ]; then
        docker volume rm $volumes
        print_success "Все тома удалены"
    else
        print_warning "Нет томов для удаления"
    fi
}

# Удаление всех Docker сетей
remove_all_networks() {
    print_status "Удаление всех Docker сетей..."
    
    local networks=$(docker network ls -q --filter "type=custom")
    if [ -n "$networks" ]; then
        docker network rm $networks
        print_success "Все сети удалены"
    else
        print_warning "Нет сетей для удаления"
    fi
}

# Очистка системы Docker
docker_system_prune() {
    print_status "Очистка системы Docker..."
    
    docker system prune -af --volumes
    print_success "Система Docker очищена"
}

# Показать статистику до очистки
show_before_stats() {
    echo ""
    echo "=========================================="
    echo "  Статистика ДО очистки  "
    echo "=========================================="
    echo ""
    echo "Colima профили:"
    colima list
    echo ""
    echo "Docker статистика:"
    echo "  📦 Контейнеры: $(docker ps -aq | wc -l | tr -d ' ') всего"
    echo "  🖼️  Образы: $(docker images -q | wc -l | tr -d ' ') всего"
    echo "  💾 Тома: $(docker volume ls -q | wc -l | tr -d ' ') всего"
    echo "  🌐 Сети: $(docker network ls -q | wc -l | tr -d ' ') всего"
    echo ""
}

# Показать статистику после очистки
show_after_stats() {
    echo ""
    echo "=========================================="
    echo "  Статистика ПОСЛЕ очистки  "
    echo "=========================================="
    echo ""
    echo "Colima профили:"
    colima list
    echo ""
    echo "Docker статистика:"
    echo "  📦 Контейнеры: $(docker ps -aq | wc -l | tr -d ' ') всего"
    echo "  🖼️  Образы: $(docker images -q | wc -l | tr -d ' ') всего"
    echo "  💾 Тома: $(docker volume ls -q | wc -l | tr -d ' ') всего"
    echo "  🌐 Сети: $(docker network ls -q | wc -l | tr -d ' ') всего"
    echo ""
    print_success "Полная очистка завершена!"
    echo ""
    echo "Полезные команды:"
    echo "  🚀 Запуск Dev:        ./colima/scripts/start-dev.sh"
    echo "  🚀 Запуск K8s:        ./colima/scripts/start-k8s.sh"
    echo "  📊 Статус Colima:     colima status"
    echo ""
}

# Основная функция
main() {
    echo "=========================================="
    echo "  VetGuide Complete Cleanup Script  "
    echo "=========================================="
    echo ""
    
    print_warning "Этот скрипт выполнит полную очистку всех Colima и Docker ресурсов!"
    print_warning "Все данные будут потеряны!"
    echo ""
    
    read -p "Вы уверены, что хотите продолжить? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Очистка отменена"
        exit 0
    fi
    
    show_before_stats
    
    stop_all_colima
    stop_all_containers
    remove_all_containers
    remove_all_images
    remove_all_volumes
    remove_all_networks
    docker_system_prune
    delete_all_colima
    
    show_after_stats
}

# Обработка аргументов командной строки
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Использование: $0 [команда]"
        echo ""
        echo "Команды:"
        echo "  (без аргументов)  Полная очистка всех ресурсов"
        echo "  help              Показать эту справку"
        echo ""
        echo "Этот скрипт:"
        echo "  1. Останавливает все профили Colima"
        echo "  2. Удаляет все Docker контейнеры, образы, тома и сети"
        echo "  3. Очищает систему Docker"
        echo "  4. Удаляет все профили Colima"
        echo ""
        echo "⚠️  ВНИМАНИЕ: Этот скрипт удалит ВСЕ данные!"
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

