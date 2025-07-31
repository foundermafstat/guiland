# 🏰 GUILAND - Fullstack Aptos NFT Platform

Полноценное приложение для создания и управления NFT на блокчейне Aptos.

## 🚀 Возможности

- ✅ Создание NFT с кастомными метаданными
- ✅ Поддержка множества Aptos кошельков
- ✅ Галерея NFT с возможностью перевода и сжигания
- ✅ Современный UI с Ant Design
- ✅ TypeScript поддержка
- ✅ Move смарт-контракты

## 🛠️ Технологии

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Ant Design, Tailwind CSS
- **Blockchain**: Aptos Move
- **Wallets**: Petra, Martian, Pontem и другие

## 📦 Установка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd guiland
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте переменные окружения**
Создайте файл `.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
```

4. **Запустите приложение**
```bash
npm run dev
```

## 🔧 Разработка

### Компиляция Move контрактов
```bash
npm run compile
```

### Тестирование Move контрактов
```bash
npm run test:move
```

### Деплой контрактов
```bash
npm run deploy
```

## 📁 Структура проекта

```
guiland/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React компоненты
│   ├── hooks/              # Кастомные хуки
│   └── types/              # TypeScript типы
├── sources/                # Move контракты
│   └── guiland_nft.move    # Основной NFT контракт
├── Move.toml              # Move конфигурация
└── package.json           # Зависимости и скрипты
```

## 🎨 Использование

1. **Подключите кошелек** - выберите один из поддерживаемых Aptos кошельков
2. **Создайте NFT** - заполните форму с названием, описанием и URI метаданных
3. **Просматривайте галерею** - все ваши NFT отображаются в галерее
4. **Управляйте NFT** - переводите или сжигайте токены

## 🔗 Поддерживаемые кошельки

- Petra Wallet
- Martian Wallet
- Pontem Wallet
- Nightly Wallet
- OpenBlock Wallet
- TokenPocket Wallet
- Trust Wallet
- Welldone Wallet
- MSafe Wallet
- Fewcha Wallet
- Rise Wallet
- Fletch Wallet
- AptosSnap
- Bitkeep Wallet
- Fox Wallet
- Hippo Wallet
- Spika Wallet
- OKX Wallet

## 📝 Лицензия

MIT License

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы, создайте issue в репозитории. 