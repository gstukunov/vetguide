#!/bin/bash

# Скрипт для запуска VetGuide в режиме разработки с редактированием конфигурации
# Использование: ./colima/scripts/start-dev-edit.sh

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

# Запуск Colima с редактированием конфигурации
start_colima_edit() {
    print_status "Запуск Colima с редактированием конфигурации..."
    
    if colima status --profile dev &> /dev/null; then
        print_warning "Colima профиль 'dev' уже запущен"
    else
        # Создаем временный конфиг файл
        local temp_config="/tmp/colima-dev-config.yaml"
        cat > "$temp_config" << EOF
profile: dev
arch: host
runtime: docker
kubernetes:
  enabled: false
  version: ""
  k3sVersion: ""
  disable: false
network:
  address: true
  dns: []
  host_resolver: true
layer: false
mountType: 9p
mounts:
  - location: /Users/grigorystukunov/vsProj/vetguide
    writable: true
    ignore: false
    propagation: rshared
    selinux: false
    options: []
cpu: 4
memory: 8
disk: 100
vmType: qemu
rosetta: false
hostResolver: true
autoActivate: true
dns: []
env: {}
sshConfig: true
sshAgent: true
forwardAgent: false
copyKubeconfig: true
EOF
        
        # Запускаем с редактированием
        colima start --profile dev --edit --editor "$temp_config"
        print_success "Colima запущен с профилем 'dev'"
    fi
}

# Основная функция
main() {
    echo "=========================================="
    echo "  VetGuide Development Environment Setup (Edit Mode)  "
    echo "=========================================="
    echo ""
    
    check_colima
    start_colima_edit
    
    echo ""
    print_success "Colima запущен! Теперь вы можете запустить сервисы:"
    echo "  cd vetguide-api && docker-compose up -d"
    echo "  cd vetguide-ui && docker-compose up -d"
    echo ""
}

# Обработка аргументов командной строки
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Использование: $0 [команда]"
        echo ""
        echo "Команды:"
        echo "  (без аргументов)  Запуск с редактированием конфигурации"
        echo "  help              Показать эту справку"
        echo ""
        echo "Этот скрипт запускает Colima с возможностью редактирования конфигурации."
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

