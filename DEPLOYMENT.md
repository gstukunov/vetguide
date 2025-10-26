# VetGuide Deployment Guide

Полное руководство по настройке автоматического деплоймента VetGuide на продакшн сервер.

## 📋 Содержание

1. [Настройка GitHub](#настройка-github)
2. [Подготовка сервера](#подготовка-сервера)
3. [Настройка GitHub Secrets](#настройка-github-secrets)
4. [Первый деплоймент](#первый-деплоймент)
5. [Мониторинг и поддержка](#мониторинг-и-поддержка)

## 🔧 Настройка GitHub

### 1. Создание Personal Access Token

1. Перейдите в GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Нажмите "Generate new token (classic)"
3. Выберите следующие права:
   - `repo` (полный доступ к репозиторию)
   - `write:packages` (запись в GitHub Container Registry)
   - `read:packages` (чтение из GitHub Container Registry)
   - `delete:packages` (удаление пакетов)

### 2. Настройка GitHub Container Registry

GitHub Container Registry автоматически доступен для всех репозиториев. Образы будут публиковаться в `ghcr.io/your-username/vetguide-api` и `ghcr.io/your-username/vetguide-ui`.

## 🖥️ Подготовка сервера

### Системные требования

- **OS**: Ubuntu 20.04+ или CentOS 8+
- **RAM**: Минимум 4GB (рекомендуется 8GB+)
- **CPU**: Минимум 2 ядра (рекомендуется 4+)
- **Disk**: Минимум 20GB свободного места
- **Network**: Открытые порты 80, 443, 22

### 1. Установка Docker

```bash

# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Установка Git

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install git

# CentOS/RHEL
sudo yum install git
```

### 3. Создание пользователя для деплоймента

```bash
# Создание пользователя
sudo useradd -m -s /bin/bash vetguide
sudo usermod -aG docker vetguide

# Создание SSH ключа
sudo -u vetguide ssh-keygen -t rsa -b 4096 -C "vetguide-deploy"
```

### 4. Настройка директорий

```bash
# Создание директорий
sudo mkdir -p /opt/vetguide
sudo mkdir -p /opt/backups/vetguide
sudo mkdir -p /var/log/vetguide
sudo chown -R vetguide:vetguide /opt/vetguide
sudo chown -R vetguide:vetguide /opt/backups
sudo chown -R vetguide:vetguide /var/log/vetguide
```

### 5. Клонирование репозитория

```bash
sudo -u vetguide git clone https://github.com/your-username/vetguide.git /opt/vetguide
```

## 🔐 Настройка GitHub Secrets

Перейдите в ваш репозиторий: Settings → Secrets and variables → Actions

### Добавьте следующие секреты:

| Secret Name      | Описание                                    | Пример                               |
| ---------------- | ------------------------------------------- | ------------------------------------ |
| `SERVER_HOST`    | IP адрес или домен сервера                  | `192.168.1.100` или `yourdomain.com` |
| `SERVER_USER`    | Пользователь для SSH                        | `vetguide`                           |
| `SERVER_SSH_KEY` | Приватный SSH ключ                          | Содержимое `~/.ssh/id_rsa`           |
| `SERVER_PORT`    | SSH порт                                    | `22`                                 |
| `SLACK_WEBHOOK`  | Slack webhook для уведомлений (опционально) | `https://hooks.slack.com/...`        |

### Создание SSH ключа для деплоймента:

```bash
# На вашем локальном компьютере
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy"

# Скопируйте публичный ключ на сервер
ssh-copy-id -i ~/.ssh/id_rsa.pub vetguide@your-server-ip

# Добавьте приватный ключ в GitHub Secrets
cat ~/.ssh/id_rsa
```

## 🚀 Первый деплоймент

### 1. Настройка переменных окружения на сервере

```bash
# Переход в директорию проекта
cd /opt/vetguide

# Копирование примера конфигурации
sudo -u vetguide cp env.production.example .env

# Редактирование конфигурации
sudo -u vetguide nano .env
```

Заполните все переменные в файле `.env` реальными значениями.

### 2. Настройка GitHub Container Registry

```bash
# Вход в GitHub Container Registry
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 3. Ручной деплоймент для тестирования

```bash
# Запуск деплоймента
sudo -u vetguide ./scripts/deploy.sh

# Проверка статуса
sudo -u vetguide ./scripts/deploy.sh status
```

### 4. Настройка автоматического деплоймента

После успешного ручного деплоймента, автоматический деплоймент будет работать при каждом push в ветку `main`.

## 📊 Мониторинг и поддержка

### Полезные команды

```bash
# Статус сервисов
cd /opt/vetguide
docker-compose -f docker-compose.prod.yml ps

# Логи сервисов
docker-compose -f docker-compose.prod.yml logs -f

# Логи конкретного сервиса
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f ui

# Перезапуск сервисов
docker-compose -f docker-compose.prod.yml restart

# Обновление образов
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Мониторинг ресурсов

```bash
# Использование ресурсов
docker stats

# Использование диска
df -h
docker system df

# Очистка неиспользуемых ресурсов
docker system prune -f
```

### Резервное копирование

```bash
# Создание резервной копии
sudo -u vetguide ./scripts/deploy.sh backup

# Список резервных копий
ls -la /opt/backups/vetguide/

# Восстановление из резервной копии
sudo -u vetguide ./scripts/deploy.sh rollback
```

### Логи деплоймента

```bash
# Просмотр логов деплоймента
tail -f /var/log/vetguide-deploy.log

# Поиск ошибок
grep -i error /var/log/vetguide-deploy.log
```

## 🔧 Устранение неполадок

### Проблемы с деплойментом

1. **Ошибка аутентификации GitHub Container Registry**

   ```bash
   # Проверьте токен
   echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
   ```

2. **Сервисы не запускаются**

   ```bash
   # Проверьте логи
   docker-compose -f docker-compose.prod.yml logs

   # Проверьте конфигурацию
   docker-compose -f docker-compose.prod.yml config
   ```

3. **Проблемы с базой данных**
   ```bash
   # Проверьте подключение к БД
   docker exec -it vetguide-postgres-prod psql -U $DB_USERNAME -d $DB_DATABASE
   ```

### Проблемы с производительностью

1. **Высокое использование памяти**

   ```bash
   # Ограничьте ресурсы в docker-compose.prod.yml
   deploy:
     resources:
       limits:
         memory: 512M
   ```

2. **Медленная загрузка**
   ```bash
   # Включите gzip в nginx.conf
   gzip on;
   gzip_comp_level 6;
   ```

## 🔒 Безопасность

### Рекомендации по безопасности

1. **Используйте сильные пароли** для всех сервисов
2. **Настройте SSL/TLS** для HTTPS
3. **Ограничьте доступ** к базе данных только локально
4. **Регулярно обновляйте** Docker образы
5. **Настройте файрвол** для ограничения доступа
6. **Используйте fail2ban** для защиты от брутфорса

### Настройка SSL/TLS

```bash
# Установка certbot
sudo apt install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d yourdomain.com

# Автоматическое обновление
sudo crontab -e
# Добавьте: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `/var/log/vetguide-deploy.log`
2. Проверьте статус сервисов: `docker-compose ps`
3. Проверьте GitHub Actions: вкладка Actions в репозитории
4. Создайте issue в репозитории с подробным описанием проблемы

## 🎯 Следующие шаги

После успешного деплоймента рассмотрите:

1. **Настройку мониторинга** (Prometheus + Grafana)
2. **Настройку логирования** (ELK Stack)
3. **Настройку алертов** (Slack/Email уведомления)
4. **Настройку бэкапов** (автоматические резервные копии)
5. **Настройку CDN** для статических файлов
6. **Настройку Load Balancer** для высокой доступности
