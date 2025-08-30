#!/bin/bash

# Скрипт деплоймента VetGuide на продакшн сервер
# Использование: ./scripts/deploy.sh [environment]

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

# Конфигурация
ENVIRONMENT=${1:-production}
PROJECT_DIR="/opt/vetguide"
BACKUP_DIR="/opt/backups/vetguide"
LOG_FILE="/var/log/vetguide-deploy.log"

# Функция логирования
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Проверка прав root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Этот скрипт должен запускаться с правами root"
        exit 1
    fi
}

# Создание резервной копии
create_backup() {
    print_status "Создание резервной копии..."
    
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="$BACKUP_DIR/$backup_timestamp"
    
    mkdir -p "$backup_path"
    
    # Проверка существования контейнера PostgreSQL
    if docker ps -a --format "table {{.Names}}" | grep -q "vetguide-postgres-prod"; then
        # Резервная копия базы данных
        print_status "Создание резервной копии базы данных..."
        docker exec vetguide-postgres-prod pg_dump -U ${DB_USERNAME} ${DB_DATABASE} > "$backup_path/database.sql"
    else
        print_warning "Контейнер PostgreSQL не найден, пропускаем резервную копию БД"
    fi
    
    # Резервная копия файлов
    print_status "Создание резервной копии файлов..."
    cp -r "$PROJECT_DIR/uploads" "$backup_path/" 2>/dev/null || true
    
    # Резервная копия конфигурации
    print_status "Создание резервной копии конфигурации..."
    cp "$PROJECT_DIR/.env" "$backup_path/" 2>/dev/null || true
    
    print_success "Резервная копия создана: $backup_path"
    log "Backup created: $backup_path"
}

# Остановка сервисов
stop_services() {
    print_status "Остановка сервисов..."
    
    cd "$PROJECT_DIR"
    docker-compose -f docker-compose.prod.yml down
    
    print_success "Сервисы остановлены"
    log "Services stopped"
}

# Обновление кода
update_code() {
    print_status "Обновление кода..."
    
    cd "$PROJECT_DIR"
    
    # Временно отключаем git операции для первого деплоймента
    print_warning "Пропускаем git операции для первого деплоймента"
    
    print_success "Код обновлен"
    log "Code updated"
}

# Обновление Docker образов
update_images() {
    print_status "Обновление Docker образов..."
    
    cd "$PROJECT_DIR"
    
    # Загрузка переменных окружения
    if [ -f ".env" ]; then
        source .env
        print_status "Environment variables loaded"
    else
        print_error ".env file not found"
        exit 1
    fi
    
    # Проверяем, существуют ли образы в registry
    print_status "Проверка образов в GitHub Container Registry..."
    if docker pull ghcr.io/${GITHUB_REPOSITORY}/vetguide-api:latest >/dev/null 2>&1; then
        print_status "Образы найдены в registry, обновляем..."
        docker pull ghcr.io/${GITHUB_REPOSITORY}/vetguide-api:latest
        docker pull ghcr.io/${GITHUB_REPOSITORY}/vetguide-ui:latest
    else
        print_warning "Образы не найдены в registry, собираем локально..."
        
        # Вход в GitHub Container Registry для последующей публикации
        echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin
        
        # Сборка образов локально
        print_status "Сборка vetguide-api..."
        docker build -t ghcr.io/${GITHUB_REPOSITORY}/vetguide-api:latest ./api/
        
        print_status "Сборка vetguide-ui..."
        docker build -t ghcr.io/${GITHUB_REPOSITORY}/vetguide-ui:latest ./ui/
        
        # Публикация образов в registry
        print_status "Публикация образов в GitHub Container Registry..."
        docker push ghcr.io/${GITHUB_REPOSITORY}/vetguide-api:latest
        docker push ghcr.io/${GITHUB_REPOSITORY}/vetguide-ui:latest
        
        print_success "Образы собраны и опубликованы"
    fi
    
    print_success "Docker образы обновлены"
    log "Docker images updated"
}

# Запуск сервисов
start_services() {
    print_status "Запуск сервисов..."
    
    cd "$PROJECT_DIR"
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Сервисы запущены"
    log "Services started"
}

# Ожидание готовности сервисов
wait_for_services() {
    print_status "Ожидание готовности сервисов..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker-compose.prod.yml ps | grep -q "Up (healthy)"; then
            print_success "Сервисы готовы"
            log "Services are ready"
            return 0
        fi
        
        print_status "Попытка $attempt/$max_attempts - ожидание сервисов..."
        sleep 10
        ((attempt++))
    done
    
    print_error "Сервисы не готовы после $max_attempts попыток"
    log "Services not ready after $max_attempts attempts"
    exit 1
}

# Проверка здоровья
health_check() {
    print_status "Проверка здоровья сервисов..."
    
    # Проверка API
    if curl -f http://localhost/api/health >/dev/null 2>&1; then
        print_success "API здоров"
    else
        print_error "API не отвечает"
        log "API health check failed"
        exit 1
    fi
    
    # Проверка UI
    if curl -f http://localhost/ >/dev/null 2>&1; then
        print_success "UI здоров"
    else
        print_error "UI не отвечает"
        log "UI health check failed"
        exit 1
    fi
    
    log "Health checks passed"
}

# Очистка старых образов
cleanup_images() {
    print_status "Очистка старых Docker образов..."
    
    docker image prune -f
    docker system prune -f
    
    print_success "Очистка завершена"
    log "Cleanup completed"
}

# Откат к предыдущей версии
rollback() {
    print_warning "Выполнение отката..."
    
    # Поиск последней резервной копии
    local latest_backup=$(ls -t "$BACKUP_DIR" | head -n1)
    
    if [ -z "$latest_backup" ]; then
        print_error "Резервные копии не найдены"
        exit 1
    fi
    
    print_status "Откат к резервной копии: $latest_backup"
    
    # Остановка сервисов
    stop_services
    
    # Восстановление базы данных
    if [ -f "$BACKUP_DIR/$latest_backup/database.sql" ]; then
        print_status "Восстановление базы данных..."
        docker exec -i vetguide-postgres-prod psql -U ${DB_USERNAME} ${DB_DATABASE} < "$BACKUP_DIR/$latest_backup/database.sql"
    fi
    
    # Восстановление файлов
    if [ -d "$BACKUP_DIR/$latest_backup/uploads" ]; then
        print_status "Восстановление файлов..."
        cp -r "$BACKUP_DIR/$latest_backup/uploads" "$PROJECT_DIR/"
    fi
    
    # Запуск сервисов
    start_services
    wait_for_services
    
    print_success "Откат завершен"
    log "Rollback completed to: $latest_backup"
}

# Показать статус
show_status() {
    echo ""
    echo "=========================================="
    echo "  VetGuide Deployment Status  "
    echo "=========================================="
    echo ""
    
    cd "$PROJECT_DIR"
    docker-compose -f docker-compose.prod.yml ps
    
    echo ""
    echo "Логи деплоймента: $LOG_FILE"
    echo "Резервные копии: $BACKUP_DIR"
    echo ""
}

# Основная функция деплоймента
deploy() {
    echo "=========================================="
    echo "  VetGuide Production Deployment  "
    echo "=========================================="
    echo ""
    
    log "Deployment started"
    
    create_backup
    stop_services
    update_code
    update_images
    start_services
    wait_for_services
    health_check
    cleanup_images
    
    print_success "Деплоймент завершен успешно!"
    log "Deployment completed successfully"
    
    show_status
}

# Обработка аргументов командной строки
case "${1:-}" in
    "deploy")
        check_root
        deploy
        ;;
    "rollback")
        check_root
        rollback
        ;;
    "status")
        show_status
        ;;
    "backup")
        check_root
        create_backup
        ;;
    "help"|"-h"|"--help")
        echo "Использование: $0 [команда]"
        echo ""
        echo "Команды:"
        echo "  deploy     Выполнить деплоймент (по умолчанию)"
        echo "  rollback   Откат к предыдущей версии"
        echo "  status     Показать статус сервисов"
        echo "  backup     Создать резервную копию"
        echo "  help       Показать эту справку"
        echo ""
        echo "Переменные окружения:"
        echo "  GITHUB_TOKEN      GitHub токен для доступа к registry"
        echo "  GITHUB_USERNAME   GitHub имя пользователя"
        echo "  GITHUB_REPOSITORY GitHub репозиторий (owner/repo)"
        echo "  DB_USERNAME       Имя пользователя базы данных"
        echo "  DB_DATABASE       Имя базы данных"
        ;;
    "")
        check_root
        deploy
        ;;
    *)
        print_error "Неизвестная команда: $1"
        echo "Используйте '$0 help' для справки"
        exit 1
        ;;
esac

