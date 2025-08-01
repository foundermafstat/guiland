// Скрипт для отладки кошельков
// Запустите в консоли браузера: 
// 1. Откройте DevTools (F12)
// 2. Перейдите на вкладку Console
// 3. Вставьте этот код и нажмите Enter

console.log('🔍 Проверка доступности кошельков...');

const wallets = {
  petra: window.petra,
  martian: window.martian,
  pontem: window.pontem,
  nightly: window.nightly
};

console.log('📊 Статус кошельков:');
Object.entries(wallets).forEach(([name, wallet]) => {
  console.log(`${name}: ${wallet ? '✅ Доступен' : '❌ Не найден'}`);
  if (wallet) {
    console.log(`  - Тип: ${typeof wallet}`);
    console.log(`  - Методы:`, Object.getOwnPropertyNames(wallet));
  }
});

// Функция для тестирования подключения
window.testWallet = async (walletName) => {
  const wallet = wallets[walletName];
  if (!wallet) {
    console.error(`❌ Кошелек ${walletName} не найден`);
    return;
  }

  try {
    console.log(`🔗 Подключаемся к ${walletName}...`);
    const account = await wallet.connect();
    console.log(`✅ Подключен к ${walletName}:`, account);
    return account;
  } catch (error) {
    console.error(`❌ Ошибка подключения к ${walletName}:`, error);
    throw error;
  }
};

// Функция для проверки всех кошельков
window.testAllWallets = async () => {
  console.log('🧪 Тестируем все доступные кошельки...');
  
  for (const [name, wallet] of Object.entries(wallets)) {
    if (wallet) {
      try {
        await window.testWallet(name);
      } catch (error) {
        console.log(`❌ ${name} не удалось подключить`);
      }
    }
  }
};

console.log('🚀 Готово! Используйте:');
console.log('- testWallet("petra") - для тестирования Petra');
console.log('- testWallet("martian") - для тестирования Martian');
console.log('- testAllWallets() - для тестирования всех кошельков'); 