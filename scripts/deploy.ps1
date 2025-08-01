# Скрипт деплоя GUILAND в Aptos Testnet
# Запуск: .\scripts\deploy.ps1

Write-Host "🚀 Начинаем деплой GUILAND в Aptos Testnet..." -ForegroundColor Green

# Проверяем наличие Aptos CLI
try {
    $aptosVersion = aptos --version
    Write-Host "✅ Aptos CLI найден: $aptosVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Aptos CLI не найден. Установите его:" -ForegroundColor Red
    Write-Host "winget install Aptos.AptosCLI" -ForegroundColor Yellow
    exit 1
}

# Инициализация профиля testnet (если не существует)
Write-Host "📋 Инициализация профиля testnet..." -ForegroundColor Blue
aptos init --profile testnet --network testnet --assume-yes

# Получение тестовых токенов
Write-Host "💰 Получение тестовых токенов..." -ForegroundColor Blue
aptos account fund-with-faucet --profile testnet

# Компиляция контракта
Write-Host "🔨 Компиляция контракта..." -ForegroundColor Blue
aptos move compile --profile testnet

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка компиляции!" -ForegroundColor Red
    exit 1
}

# Деплой контракта
Write-Host "📤 Деплой контракта..." -ForegroundColor Blue
aptos move publish --profile testnet

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка деплоя!" -ForegroundColor Red
    exit 1
}

# Получение адреса аккаунта
Write-Host "📋 Получение адреса аккаунта..." -ForegroundColor Blue
$accountInfo = aptos account list --profile testnet --query account
$accountAddress = ($accountInfo | ConvertFrom-Json).account

Write-Host "✅ Деплой завершен успешно!" -ForegroundColor Green
Write-Host "📍 Адрес контракта: $accountAddress" -ForegroundColor Cyan
Write-Host "🔗 Explorer: https://explorer.aptoslabs.com/account/$accountAddress" -ForegroundColor Cyan

# Создание .env.local с адресом контракта
$envContent = @"
# Aptos Network Configuration
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
APTOS_FAUCET_URL=https://faucet.testnet.aptoslabs.com

# Contract Configuration
CONTRACT_ADDRESS=$accountAddress
MODULE_NAME=guiland::game_core

# Admin Configuration
ADMIN_PRIVATE_KEY=your_admin_private_key_here

# Next.js Configuration
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "📝 Создан файл .env.local с адресом контракта" -ForegroundColor Green

Write-Host "🎯 Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Обновите CONTRACT_ADDRESS в src/hooks/useGameContract.ts" -ForegroundColor White
Write-Host "2. Инициализируйте игру: aptos move run --profile testnet --function-id $accountAddress::game_core::initialize" -ForegroundColor White
Write-Host "3. Запустите фронтенд: npm run dev" -ForegroundColor White 