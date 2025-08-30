# VetGuide Colima Configuration

Этот каталог содержит конфигурацию Colima для локальной разработки и тестирования проекта VetGuide.

## 📁 Структура каталога

```
colima/
├── config/                          # Конфигурационные файлы Colima
│   ├── colima-dev.yaml             # Конфигурация для разработки
│   ├── colima-k8s.yaml             # Конфигурация для Kubernetes
│   └── colima-prod.yaml            # Конфигурация для продакшн-тестирования
├── scripts/                         # Скрипты управления
│   ├── start-dev.sh                # Запуск среды разработки
│   ├── stop-dev.sh                 # Остановка среды разработки
│   ├── start-k8s.sh                # Запуск Kubernetes среды
│   ├── stop-k8s.sh                 # Остановка Kubernetes среды
│   └── cleanup.sh                  # Полная очистка ресурсов
├── docker-compose/                  # Docker Compose файлы для Colima
│   ├── colima-dev.yml              # Разработка
│   └── colima-prod.yml             # Продакшн-тестирование
├── k8s/                            # Kubernetes манифесты для Colima
│   ├── colima-k8s-config.yaml      # Конфигурация
│   └── colima-k8s-deployment.yaml  # Развертывание
└── README.md                       # Этот файл
```

## 🚀 Быстрый старт

### 1. Установка Colima

```bash
# Установка через Homebrew
brew install colima

# Или через curl
curl -LO https://github.com/abiosoft/colima/releases/latest/download/colima-$(uname -s)-$(uname -m)
sudo mv colima-$(uname -s)-$(uname -m) /usr/local/bin/colima
sudo chmod +x /usr/local/bin/colima
```

### 2. Запуск среды разработки

```bash
# Запуск с автоматической настройкой
./colima/scripts/start-dev.sh

# Или вручную
colima start --profile dev --cpu 4 --memory 8 --disk 100 --mount /Users/grigorystukunov/vsProj/vetguide:w
```

### 3. Запуск Kubernetes среды

```bash
# Запуск с автоматической настройкой
./colima/scripts/start-k8s.sh

# Или вручную
colima start --profile k8s --cpu 6 --memory 12 --disk 150 --kubernetes --mount /Users/grigorystukunov/vsProj/vetguide:w
```

## 🔧 Конфигурации

### Профиль разработки (`colima-dev.yaml`)

- **CPU**: 4 ядра
- **Memory**: 8 GB
- **Disk**: 100 GB
- **Runtime**: Docker
- **Kubernetes**: Отключен
- **Mount**: Проект VetGuide

### Профиль Kubernetes (`colima-k8s.yaml`)

- **CPU**: 6 ядер
- **Memory**: 12 GB
- **Disk**: 150 GB
- **Runtime**: Docker
- **Kubernetes**: v1.28.0
- **Mount**: Проект VetGuide

### Профиль продакшн (`colima-prod.yaml`)

- **CPU**: 8 ядер
- **Memory**: 16 GB
- **Disk**: 200 GB
- **Runtime**: Docker
- **Kubernetes**: v1.28.0
- **Mount**: Проект VetGuide

## 📜 Скрипты управления

### Разработка

```bash
# Запуск среды разработки
./colima/scripts/start-dev.sh

# Остановка среды разработки
./colima/scripts/stop-dev.sh
```

### Kubernetes

```bash
# Запуск Kubernetes среды
./colima/scripts/start-k8s.sh

# Остановка Kubernetes среды
./colima/scripts/stop-k8s.sh
```

### Очистка

```bash
# Полная очистка всех ресурсов
./colima/scripts/cleanup.sh
```

## 🐳 Docker Compose

### Разработка

```bash
# Запуск всех сервисов для разработки
docker-compose -f colima/docker-compose/colima-dev.yml up -d

# Просмотр логов
docker-compose -f colima/docker-compose/colima-dev.yml logs -f

# Остановка
docker-compose -f colima/docker-compose/colima-dev.yml down
```

### Продакшн-тестирование

```bash
# Запуск всех сервисов для продакшн-тестирования
docker-compose -f colima/docker-compose/colima-prod.yml up -d

# Просмотр логов
docker-compose -f colima/docker-compose/colima-prod.yml logs -f

# Остановка
docker-compose -f colima/docker-compose/colima-prod.yml down
```

## ☸️ Kubernetes

### Развертывание в Colima Kubernetes

```bash
# Применение конфигурации
kubectl apply -f colima/k8s/colima-k8s-config.yaml

# Развертывание приложения
kubectl apply -f colima/k8s/colima-k8s-deployment.yaml

# Проверка статуса
kubectl get pods -n vetguide
```

### Port Forwarding

```bash
# API
kubectl port-forward svc/vetguide-api-colima-service 3001:3001 -n vetguide

# UI
kubectl port-forward svc/vetguide-ui-colima-service 3000:3000 -n vetguide
```

## 🔍 Мониторинг и отладка

### Статус Colima

```bash
# Статус всех профилей
colima list

# Статус конкретного профиля
colima status --profile dev
colima status --profile k8s
```

### Логи

```bash
# Логи Colima
colima logs --profile dev

# Логи Docker
docker logs <container-name>

# Логи Kubernetes
kubectl logs -f deployment/vetguide-api-colima -n vetguide
```

### Ресурсы

```bash
# Использование ресурсов Docker
docker stats

# Использование ресурсов Kubernetes
kubectl top pods -n vetguide
kubectl top nodes
```

## 🛠️ Полезные команды

### Управление профилями

```bash
# Список профилей
colima list

# Запуск профиля
colima start --profile dev

# Остановка профиля
colima stop --profile dev

# Удаление профиля
colima delete --profile dev
```

### Управление Docker

```bash
# Информация о Docker
docker info

# Список контейнеров
docker ps -a

# Список образов
docker images

# Очистка ресурсов
docker system prune -af
```

### Управление Kubernetes

```bash
# Информация о кластере
kubectl cluster-info

# Список узлов
kubectl get nodes

# Список подов
kubectl get pods --all-namespaces

# Список сервисов
kubectl get svc --all-namespaces
```

## 🚨 Устранение неполадок

### Проблемы с запуском

1. **Colima не запускается**

   ```bash
   # Проверка системных требований
   colima start --help

   # Очистка и перезапуск
   colima delete
   colima start
   ```

2. **Недостаточно ресурсов**

   ```bash
   # Уменьшение ресурсов в конфигурации
   # Или остановка других приложений
   ```

3. **Проблемы с Docker**

   ```bash
   # Перезапуск Docker
   colima restart

   # Проверка статуса
   docker info
   ```

### Проблемы с Kubernetes

1. **Kubernetes не готов**

   ```bash
   # Ожидание готовности
   kubectl wait --for=condition=ready node --all

   # Проверка статуса
   kubectl get nodes
   ```

2. **Поды не запускаются**

   ```bash
   # Описание пода
   kubectl describe pod <pod-name> -n vetguide

   # Логи пода
   kubectl logs <pod-name> -n vetguide
   ```

## 📚 Дополнительные ресурсы

- [Colima Documentation](https://github.com/abiosoft/colima)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [VetGuide Project Documentation](../README.md)

## 🤝 Поддержка

При возникновении проблем:

1. Проверьте логи: `colima logs`
2. Проверьте статус: `colima status`
3. Очистите ресурсы: `./colima/scripts/cleanup.sh`
4. Перезапустите: `colima restart`

## 📝 Примечания

- Colima использует QEMU для виртуализации
- Рекомендуется минимум 8GB RAM для комфортной работы
- Kubernetes требует дополнительных ресурсов
- Все данные сохраняются в виртуальных дисках Colima
