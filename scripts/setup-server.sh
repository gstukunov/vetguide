#!/bin/bash

# Скрипт автоматической настройки сервера для VetGuide
# Использование: ./scripts/setup-server.sh

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

# Проверка прав root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Этот скрипт должен запускаться с правами root"
        exit 1
    fi
}

# Определение дистрибутива
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        print_error "Не удалось определить операционную систему"
        exit 1
    fi
    
    print_status "Обнаружена ОС: $OS $VER"
}

# Обновление системы
update_system() {
    print_status "Обновление системы..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt update && apt upgrade -y
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        yum update -y
    else
        print_warning "Неподдерживаемая ОС. Пропускаем обновление."
    fi
    
    print_success "Система обновлена"
}

# Установка необходимых пакетов
install_packages() {
    print_status "Установка необходимых пакетов..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        yum install -y curl wget git unzip yum-utils
    fi
    
    print_success "Пакеты установлены"
}

# Установка Docker
install_docker() {
    print_status "Установка Docker..."
    
    if command -v docker &> /dev/null; then
        print_warning "Docker уже установлен"
        return
    fi
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        # Удаление старых версий
        apt remove -y docker docker-engine docker.io containerd runc
        
        # Установка зависимостей
        apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
        
        # Добавление GPG ключа Docker
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        # Добавление репозитория
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Установка Docker
        apt update
        apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        # Установка зависимостей
        yum install -y yum-utils
        
        # Добавление репозитория
        yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        
        # Установка Docker
        yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    fi
    
    # Запуск и включение Docker
    systemctl start docker
    systemctl enable docker
    
    print_success "Docker установлен"
}

# Установка Docker Compose
install_docker_compose() {
    print_status "Установка Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose уже установлен"
        return
    fi
    
    # Скачивание последней версии
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Установка прав
    chmod +x /usr/local/bin/docker-compose
    
    # Создание символической ссылки
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    print_success "Docker Compose установлен"
}

# Создание пользователя vetguide
create_user() {
    print_status "Создание пользователя vetguide..."
    
    if id "vetguide" &>/dev/null; then
        print_warning "Пользователь vetguide уже существует"
    else
        useradd -m -s /bin/bash vetguide
        usermod -aG docker vetguide
        print_success "Пользователь vetguide создан"
    fi
}

# Создание директорий
create_directories() {
    print_status "Создание директорий..."
    
    mkdir -p /opt/vetguide
    mkdir -p /opt/backups/vetguide
    mkdir -p /var/log/vetguide
    mkdir -p /etc/vetguide
    
    chown -R vetguide:vetguide /opt/vetguide
    chown -R vetguide:vetguide /opt/backups
    chown -R vetguide:vetguide /var/log/vetguide
    chown -R vetguide:vetguide /etc/vetguide
    
    print_success "Директории созданы"
}

# Настройка файрвола
setup_firewall() {
    print_status "Настройка файрвола..."
    
    if command -v ufw &> /dev/null; then
        # Ubuntu/Debian с UFW
        ufw --force enable
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        print_success "UFW настроен"
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS/RHEL с firewalld
        systemctl start firewalld
        systemctl enable firewalld
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        print_success "Firewalld настроен"
    else
        print_warning "Файрвол не найден. Настройте вручную."
    fi
}

# Настройка логирования
setup_logging() {
    print_status "Настройка логирования..."
    
    # Создание конфигурации logrotate
    cat > /etc/logrotate.d/vetguide << EOF
/var/log/vetguide/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 vetguide vetguide
    postrotate
        /bin/kill -USR1 \$(cat /var/run/nginx.pid 2>/dev/null) 2>/dev/null || true
    endscript
}
EOF
    
    print_success "Логирование настроено"
}

# Настройка мониторинга
setup_monitoring() {
    print_status "Настройка базового мониторинга..."
    
    # Создание скрипта мониторинга
    cat > /usr/local/bin/vetguide-monitor.sh << 'EOF'
#!/bin/bash

# Простой мониторинг VetGuide
LOG_FILE="/var/log/vetguide/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Проверка Docker
if ! systemctl is-active --quiet docker; then
    echo "$DATE - ERROR: Docker не запущен" >> $LOG_FILE
    systemctl start docker
fi

# Проверка контейнеров
cd /opt/vetguide
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "$DATE - WARNING: Некоторые контейнеры не запущены" >> $LOG_FILE
fi

# Проверка места на диске
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$DATE - WARNING: Мало места на диске ($DISK_USAGE%)" >> $LOG_FILE
fi

# Проверка памяти
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 90 ]; then
    echo "$DATE - WARNING: Высокое использование памяти ($MEM_USAGE%)" >> $LOG_FILE
fi
EOF
    
    chmod +x /usr/local/bin/vetguide-monitor.sh
    
    # Добавление в crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/vetguide-monitor.sh") | crontab -
    
    print_success "Мониторинг настроен"
}

# Создание systemd сервиса
create_systemd_service() {
    print_status "Создание systemd сервиса..."
    
    cat > /etc/systemd/system/vetguide.service << EOF
[Unit]
Description=VetGuide Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/vetguide
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=vetguide
Group=vetguide

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable vetguide.service
    
    print_success "Systemd сервис создан"
}

# Показать информацию о завершении
show_completion_info() {
    echo ""
    echo "=========================================="
    echo "  Настройка сервера завершена!  "
    echo "=========================================="
    echo ""
    print_success "Сервер готов для деплоймента VetGuide!"
    echo ""
    echo "Следующие шаги:"
    echo "1. Клонируйте репозиторий:"
    echo "   sudo -u vetguide git clone https://github.com/your-username/vetguide.git /opt/vetguide"
    echo ""
    echo "2. Настройте переменные окружения:"
    echo "   sudo -u vetguide cp /opt/vetguide/env.production.example /opt/vetguide/.env"
    echo "   sudo -u vetguide nano /opt/vetguide/.env"
    echo ""
    echo "3. Выполните первый деплоймент:"
    echo "   sudo -u vetguide /opt/vetguide/scripts/deploy.sh"
    echo ""
    echo "4. Настройте GitHub Secrets для автоматического деплоймента"
    echo ""
    echo "Полезные команды:"
    echo "  📊 Статус сервиса: systemctl status vetguide"
    echo "  🚀 Запуск: systemctl start vetguide"
    echo "  🛑 Остановка: systemctl stop vetguide"
    echo "  📋 Логи: journalctl -u vetguide -f"
    echo ""
}

# Основная функция
main() {
    echo "=========================================="
    echo "  VetGuide Server Setup Script  "
    echo "=========================================="
    echo ""
    
    check_root
    detect_os
    update_system
    install_packages
    install_docker
    install_docker_compose
    create_user
    create_directories
    setup_firewall
    setup_logging
    setup_monitoring
    create_systemd_service
    show_completion_info
}

# Обработка аргументов командной строки
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "Использование: $0 [команда]"
        echo ""
        echo "Команды:"
        echo "  (без аргументов)  Полная настройка сервера"
        echo "  help              Показать эту справку"
        echo ""
        echo "Этот скрипт автоматически настроит сервер для VetGuide:"
        echo "  - Установит Docker и Docker Compose"
        echo "  - Создаст пользователя vetguide"
        echo "  - Настроит директории и права"
        echo "  - Настроит файрвол"
        echo "  - Настроит логирование и мониторинг"
        echo "  - Создаст systemd сервис"
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

