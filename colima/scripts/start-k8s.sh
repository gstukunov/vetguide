#!/bin/bash

# Скрипт для запуска VetGuide в Kubernetes с Colima
# Использование: ./colima/scripts/start-k8s.sh

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

# Проверка установки kubectl
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl не установлен. Установите его с помощью: brew install kubectl"
        exit 1
    fi
    print_success "kubectl найден"
}

# Запуск Colima с Kubernetes
start_colima_k8s() {
    print_status "Запуск Colima с Kubernetes..."
    
    if colima status --profile k8s &> /dev/null; then
        print_warning "Colima профиль 'k8s' уже запущен"
    else
        colima start --profile k8s --cpu 6 --memory 12 --disk 150 --kubernetes --mount /Users/grigorystukunov/vsProj/vetguide:w
        print_success "Colima запущен с профилем 'k8s' и Kubernetes"
    fi
}

# Ожидание готовности Kubernetes
wait_for_k8s() {
    print_status "Ожидание готовности Kubernetes..."
    
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if kubectl cluster-info &> /dev/null; then
            print_success "Kubernetes готов к работе"
            return 0
        fi
        
        print_status "Попытка $attempt/$max_attempts - ожидание Kubernetes..."
        sleep 5
        ((attempt++))
    done
    
    print_error "Kubernetes не готов после $max_attempts попыток"
    exit 1
}

# Сборка Docker образов
build_images() {
    print_status "Сборка Docker образов..."
    
    # Сборка API образа
    print_status "Сборка VetGuide API образа..."
    cd vetguide-api
    docker build -t vetguide-api:latest .
    print_success "VetGuide API образ собран"
    cd ..
    
    # Сборка UI образа
    print_status "Сборка VetGuide UI образа..."
    cd vetguide-ui
    docker build -t vetguide-ui:latest .
    print_success "VetGuide UI образ собран"
    cd ..
}

# Загрузка образов в Kubernetes
load_images() {
    print_status "Загрузка образов в Kubernetes..."
    
    # Загрузка API образа
    print_status "Загрузка VetGuide API образа..."
    colima kubectl --profile k8s load docker-image vetguide-api:latest
    
    # Загрузка UI образа
    print_status "Загрузка VetGuide UI образа..."
    colima kubectl --profile k8s load docker-image vetguide-ui:latest
    
    print_success "Образы загружены в Kubernetes"
}

# Развертывание в Kubernetes
deploy_to_k8s() {
    print_status "Развертывание VetGuide в Kubernetes..."
    
    if [ -d "k8s" ]; then
        # Применение манифестов
        kubectl apply -f k8s/
        print_success "VetGuide развернут в Kubernetes"
    else
        print_error "Директория k8s не найдена. Создайте Kubernetes манифесты сначала."
        exit 1
    fi
}

# Ожидание готовности подов
wait_for_pods() {
    print_status "Ожидание готовности подов..."
    
    local deployments=("postgres" "minio" "vetguide-api" "vetguide-ui")
    
    for deployment in "${deployments[@]}"; do
        print_status "Ожидание готовности $deployment..."
        if kubectl wait --for=condition=available --timeout=300s deployment/$deployment -n vetguide; then
            print_success "$deployment готов"
        else
            print_warning "$deployment может быть не готов"
        fi
    done
}

# Настройка портов для доступа
setup_port_forwarding() {
    print_status "Настройка портов для доступа..."
    
    # Запуск port-forward в фоне
    kubectl port-forward svc/vetguide-ui-service 3000:3000 -n vetguide &
    kubectl port-forward svc/vetguide-api-service 3001:3001 -n vetguide &
    kubectl port-forward svc/postgres-service 5432:5432 -n vetguide &
    kubectl port-forward svc/minio-service 9000:9000 -n vetguide &
    kubectl port-forward svc/minio-service 9001:9001 -n vetguide &
    
    print_success "Port forwarding настроен"
}

# Показать информацию о доступе
show_access_info() {
    echo ""
    echo "=========================================="
    echo "  VetGuide Kubernetes Environment Ready  "
    echo "=========================================="
    echo ""
    print_success "VetGuide развернут в Kubernetes!"
    echo ""
    echo "Доступные сервисы:"
    echo "  🌐 Frontend (UI):     http://localhost:3000"
    echo "  🔧 Backend (API):     http://localhost:3001"
    echo "  🗄️  PostgreSQL:       localhost:5432"
    echo "  📦 MinIO Console:     http://localhost:9001"
    echo "  📦 MinIO API:         http://localhost:9000"
    echo ""
    echo "Kubernetes команды:"
    echo "  📊 Статус подов:      kubectl get pods -n vetguide"
    echo "  📋 Логи API:          kubectl logs -f deployment/vetguide-api -n vetguide"
    echo "  📋 Логи UI:           kubectl logs -f deployment/vetguide-ui -n vetguide"
    echo "  🛑 Остановка:         ./colima/scripts/stop-k8s.sh"
    echo ""
    echo "Полезные команды:"
    echo "  🔍 Описание пода:     kubectl describe pod <pod-name> -n vetguide"
    echo "  📊 Статус сервисов:   kubectl get svc -n vetguide"
    echo "  📊 Статус ingress:    kubectl get ingress -n vetguide"
    echo ""
}

# Основная функция
main() {
    echo "=========================================="
    echo "  VetGuide Kubernetes Environment Setup  "
    echo "=========================================="
    echo ""
    
    check_colima
    check_kubectl
    start_colima_k8s
    wait_for_k8s
    build_images
    load_images
    deploy_to_k8s
    wait_for_pods
    setup_port_forwarding
    show_access_info
}

# Обработка аргументов командной строки
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Использование: $0 [команда]"
        echo ""
        echo "Команды:"
        echo "  (без аргументов)  Запуск Kubernetes среды"
        echo "  help              Показать эту справку"
        echo ""
        echo "Этот скрипт:"
        echo "  1. Запускает Colima с Kubernetes"
        echo "  2. Собирает Docker образы"
        echo "  3. Развертывает VetGuide в Kubernetes"
        echo "  4. Настраивает доступ к сервисам"
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
