# Инструкция по деплою GUILAND в Aptos Testnet

## Предварительные требования

1. Установлен Aptos CLI
2. Создан аккаунт в Aptos testnet
3. Получены тестовые токены

## Шаги деплоя

### 1. Установка Aptos CLI (если не установлен)

```bash
# Windows (PowerShell)
winget install Aptos.AptosCLI

# Или через npm
npm install -g @aptos-labs/aptos-cli
```

### 2. Инициализация Aptos CLI

```bash
aptos init --profile testnet --network testnet
```

### 3. Получение тестовых токенов

```bash
aptos account fund-with-faucet --profile testnet
```

### 4. Компиляция контракта

```bash
aptos move compile --profile testnet
```

### 5. Деплой контракта

```bash
aptos move publish --profile testnet
```

### 6. Инициализация игры

После успешного деплоя, получите адрес контракта и обновите переменные окружения:

```bash
# Получить адрес аккаунта
aptos account list --profile testnet

# Обновить .env.local с полученным адресом
CONTRACT_ADDRESS=полученный_адрес_аккаунта
```

### 7. Инициализация игры (выполнить один раз)

```bash
# Создать скрипт инициализации
aptos move run --profile testnet --function-id $CONTRACT_ADDRESS::game_core::initialize
```

## Обновление фронтенда

После деплоя обновите `src/hooks/useGameContract.ts`:

```typescript
const CONTRACT_ADDRESS = 'полученный_адрес_аккаунта';
```

## Проверка деплоя

1. Проверьте транзакцию в Aptos Explorer: https://explorer.aptoslabs.com/account/ваш_адрес
2. Убедитесь, что модуль `game_core` опубликован
3. Проверьте инициализацию игры

## Полезные команды

```bash
# Проверить баланс
aptos account list --profile testnet

# Посмотреть ресурсы аккаунта
aptos account list --query resources --profile testnet

# Запустить тесты
aptos move test --profile testnet
``` 