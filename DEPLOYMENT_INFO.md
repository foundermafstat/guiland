# Информация о деплое GUILAND

## ✅ Деплой завершен успешно!

### Адрес контракта
```
0xfd543cfe86eba6cd15d89deccaae5c791db4ca17979bb62703ca6891f87008e4
```

### Транзакция деплоя
- **Hash**: `0xcb4e64cb81b4e330be6b28514d7edde5a823ae2c601bc63df65b9c61729712cb`
- **Explorer**: https://explorer.aptoslabs.com/txn/0xcb4e64cb81b4e330be6b28514d7edde5a823ae2c601bc63df65b9c61729712cb?network=testnet
- **Gas Used**: 5620 Octas
- **Status**: ✅ Успешно

### Следующие шаги

1. **Инициализация игры** (выполнить один раз):
   ```bash
   aptos move run --profile testnet --function-id 0xfd543cfe86eba6cd15d89deccaae5c791db4ca17979bb62703ca6891f87008e4::game_core::initialize
   ```

2. **Обновление фронтенда**:
   - Адрес контракта уже обновлен в `src/hooks/useGameContract.ts`
   - Создайте файл `.env.local` с переменными окружения

3. **Запуск приложения**:
   ```bash
   npm run dev
   ```

### Переменные окружения (.env.local)
```env
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
CONTRACT_ADDRESS=0xfd543cfe86eba6cd15d89deccaae5c791db4ca17979bb62703ca6891f87008e4
MODULE_NAME=guiland::game_core
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
```

### Доступные функции контракта

#### Entry функции (запись)
- `create_player()` - создание игрока
- `create_guild(name: string)` - создание гильдии
- `join_guild(guild_id: u64)` - присоединение к гильдии
- `attack_territory(territory_id: u64)` - атака территории
- `collect_resources()` - сбор ресурсов
- `level_up()` - повышение уровня

#### View функции (чтение)
- `get_player_info(address)` - информация об игроке
- `get_territory_info(territory_id)` - информация о территории
- `get_guild_info(guild_id)` - информация о гильдии
- `get_game_stats()` - статистика игры

### Проверка деплоя
- **Explorer**: https://explorer.aptoslabs.com/account/0xfd543cfe86eba6cd15d89deccaae5c791db4ca17979bb62703ca6891f87008e4?network=testnet
- **Модуль**: `game_core`

### Примечания
- Контракт использует упрощенную боевую систему для деплоя
- Функция `enhance_equipment` временно закомментирована
- NFT функциональность интегрирована в основной контракт 