# GUILAND - Aptos Blockchain Game

Полнофункциональная игра на блокчейне Aptos с системой гильдий, территорий и NFT экипировки.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- Aptos CLI
- Кошелек Aptos (Petra, Martian, Pontem)

### Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd guiland

# Установка зависимостей
npm install

# Установка Aptos CLI (Windows)
winget install Aptos.AptosCLI

# Или через npm
npm install -g @aptos-labs/aptos-cli
```

### Деплой в Testnet

#### Автоматический деплой (рекомендуется)

```bash
# Запуск скрипта деплоя
.\scripts\deploy.ps1
```

#### Ручной деплой

```bash
# 1. Инициализация Aptos CLI
npm run aptos:init

# 2. Получение тестовых токенов
npm run account:fund

# 3. Компиляция контракта
npm run compile

# 4. Деплой контракта
npm run deploy

# 5. Инициализация игры (после получения адреса контракта)
npm run init
```

### Запуск фронтенда

```bash
# Разработка
npm run dev

# Продакшн сборка
npm run build
npm start
```

## 🎮 Функции игры

### Основные возможности
- **Создание персонажа** - начните свое приключение в GUILAND
- **Система ресурсов** - собирайте GUI токены, угощения, кристаллы
- **Гильдии** - создавайте и присоединяйтесь к гильдиям
- **Территории** - захватывайте и управляйте территориями
- **Боевая система** - сражайтесь за территории и ресурсы
- **NFT экипировка** - улучшайте и используйте уникальное снаряжение

### Игровые механики
- **Уровни и опыт** - развивайте персонажа
- **Экономика** - торгуйте ресурсами между игроками
- **Тактика** - используйте стратегию в боях
- **Социальность** - взаимодействуйте с другими игроками

## 🏗️ Архитектура

### Смарт-контракт (`sources/game_core.move`)
- **Player** - данные игрока
- **Guild** - система гильдий
- **Territory** - управление территориями
- **Equipment** - NFT экипировка
- **Battle System** - боевая механика

### Фронтенд
- **Next.js 14** - React фреймворк
- **Ant Design** - UI компоненты
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация

### Интеграция
- **Aptos SDK** - взаимодействие с блокчейном
- **Wallet Adapters** - поддержка кошельков
- **API Routes** - прокси для view функций

## 📁 Структура проекта

```
gui3/
├── sources/                 # Move смарт-контракты
│   ├── game_core.move      # Основная игровая логика
│   └── guiland_nft.move    # NFT функциональность
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/         # React компоненты
│   ├── hooks/              # React хуки
│   └── types/              # TypeScript типы
├── scripts/                # Скрипты деплоя
├── Move.toml              # Конфигурация Move
└── package.json           # Зависимости Node.js
```

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env.local` на основе `env.example`:

```env
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
CONTRACT_ADDRESS=ваш_адрес_контракта
MODULE_NAME=guiland::game_core
NEXT_PUBLIC_APTOS_NETWORK=testnet
```

### Поддерживаемые кошельки

- Petra Wallet
- Martian Wallet
- Pontem Wallet
- Nightly Wallet
- Demo Mode (для тестирования)

## 🧪 Тестирование

```bash
# Тесты Move контракта
npm run test:move

# Тесты JavaScript
npm test

# Линтинг
npm run lint
```

## 📚 API

### View функции (чтение)

```typescript
// Получить информацию об игроке
get_player_info(address: string)

// Получить информацию о территории
get_territory_info(territoryId: number)

// Получить информацию о гильдии
get_guild_info(guildId: number)

// Получить статистику игры
get_game_stats()
```

### Entry функции (запись)

```typescript
// Создать игрока
create_player()

// Создать гильдию
create_guild(name: string)

// Атаковать территорию
attack_territory(territoryId: number)

// Собирать ресурсы
collect_resources()
```

## 🚀 Деплой в продакшн

1. Обновите `Move.toml` для mainnet
2. Измените переменные окружения на mainnet
3. Выполните деплой с mainnet профилем
4. Обновите адрес контракта в коде

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License

## 🆘 Поддержка

- Документация: [deploy.md](./deploy.md)
- Issues: GitHub Issues
- Discord: [GUILAND Community](https://discord.gg/guiland) 