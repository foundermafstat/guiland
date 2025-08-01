'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface WalletContextType {
  connected: boolean;
  account: { address: string } | null;
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
  signAndSubmitTransaction: (payload: any) => Promise<any>;
  walletName: string | null;
  network: 'mainnet' | 'testnet';
  setNetwork: (network: 'mainnet' | 'testnet') => void;
  checkWalletAvailability: () => { petra: boolean; martian: boolean; pontem: boolean; nightly: boolean };
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<{ address: string } | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('aptos-network') as 'mainnet' | 'testnet') || 'testnet';
    }
    return 'testnet';
  });

  // Функция для проверки доступности кошельков
  const checkWalletAvailability = () => {
    if (typeof window === 'undefined') {
      return {
        petra: false,
        martian: false,
        pontem: false,
        nightly: false,
      };
    }
    
    return {
      petra: !!window.petra,
      martian: !!window.martian,
      pontem: !!window.pontem,
      nightly: !!window.nightly,
    };
  };

  // Проверяем подключение при загрузке
  useEffect(() => {
    const checkConnection = async () => {
      console.log('=== WalletProvider: проверка подключения ===');
      if (typeof window !== 'undefined') {
        // Восстанавливаем состояние из localStorage
        const savedWalletName = localStorage.getItem('aptos-wallet-name');
        const savedAccountAddress = localStorage.getItem('aptos-account-address');
        
        console.log('Сохраненные данные:', { savedWalletName, savedAccountAddress });
        
                 if (savedWalletName && savedAccountAddress) {
           console.log('Пытаемся восстановить подключение:', { savedWalletName, savedAccountAddress });
           
           // Проверяем, что адрес не равен адресу контракта
           if (savedAccountAddress === '0xfd543cfe86eba6cd15d89deccaae5c791db4ca17979bb62703ca6891f87008e4') {
             console.error('Сохраненный адрес равен адресу контракта! Очищаем localStorage');
             localStorage.removeItem('aptos-wallet-name');
             localStorage.removeItem('aptos-account-address');
             return;
           }
           
           // Проверяем, что кошелек все еще подключен
           const wallet = window[savedWalletName as keyof Window] as any;
           console.log('Найден кошелек:', wallet);
           
           if (wallet?.isConnected?.()) {
             try {
               const account = await wallet.account();
               console.log('Аккаунт кошелька:', account);
               
               if (account.address === savedAccountAddress) {
                 console.log('Восстанавливаем подключение');
                 setAccount({ address: account.address });
                 setConnected(true);
                 setWalletName(savedWalletName);
                 return;
               } else {
                 console.log('Адрес изменился, очищаем localStorage');
                 localStorage.removeItem('aptos-wallet-name');
                 localStorage.removeItem('aptos-account-address');
               }
             } catch (error) {
               console.error('Ошибка восстановления подключения:', error);
             }
           }
         }
        
        // Если восстановление не удалось, очищаем localStorage
        console.log('Очищаем localStorage');
        localStorage.removeItem('aptos-wallet-name');
        localStorage.removeItem('aptos-account-address');
      }
    };

    checkConnection();
  }, []);

  const connect = async (walletType?: string) => {
    console.log('=== WalletProvider: connect вызван ===');
    console.log('walletType:', walletType);
    
    try {
      if (typeof window === 'undefined') {
        throw new Error('Браузер не поддерживается');
      }

      let wallet: any = null;
      let selectedWalletName = walletType;

      if (walletType === 'demo') {
        // Демо режим
        console.log('Подключаемся в демо режиме');
        setConnected(true);
        setAccount({ address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' });
        setWalletName('demo');
        
        // Сохраняем состояние в localStorage
        localStorage.setItem('aptos-wallet-name', 'demo');
        localStorage.setItem('aptos-account-address', '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
        return;
      }

      // Проверяем доступные кошельки
      if (!selectedWalletName) {
        if (window.petra) {
          selectedWalletName = 'petra';
        } else if (window.martian) {
          selectedWalletName = 'martian';
        } else if (window.pontem) {
          selectedWalletName = 'pontem';
        } else if (window.nightly) {
          selectedWalletName = 'nightly';
        } else {
          throw new Error('Кошелек не найден. Установите Petra, Martian, Pontem или Nightly кошелек.');
        }
      }

      // Проверяем конкретный кошелек
      wallet = window[selectedWalletName as keyof Window] as any;

      if (!wallet) {
        throw new Error(`Кошелек ${selectedWalletName} не найден. Убедитесь, что расширение установлено и активно.`);
      }

      // Дополнительные проверки для конкретных кошельков
      if (selectedWalletName === 'petra' && !window.petra) {
        throw new Error('Petra кошелек не найден. Убедитесь, что расширение установлено и активно.');
      }
      
      if (selectedWalletName === 'martian' && !window.martian) {
        throw new Error('Martian кошелек не найден. Убедитесь, что расширение установлено и активно.');
      }

      // Подключаемся к кошельку
      console.log(`Пытаемся подключиться к ${selectedWalletName}...`);
      
      let account;
      try {
        account = await wallet.connect();
        console.log('Ответ от кошелька:', account);
      } catch (connectError: any) {
        console.error('Ошибка подключения:', connectError);
        
        if (connectError.message?.includes('rejected') || connectError.message?.includes('отклонено')) {
          throw new Error('Подключение отклонено пользователем');
        }
        
        if (connectError.message?.includes('not installed') || connectError.message?.includes('не установлен')) {
          throw new Error(`Кошелек ${selectedWalletName} не установлен`);
        }
        
        throw new Error(`Ошибка подключения к ${selectedWalletName}: ${connectError.message || 'Неизвестная ошибка'}`);
      }
      
             if (!account || !account.address) {
         throw new Error('Не удалось получить адрес кошелька');
       }

       // Проверяем, что адрес не равен адресу контракта
       if (account.address === '0xfd543cfe86eba6cd15d89deccaae5c791db4ca17979bb62703ca6891f87008e4') {
         throw new Error('Получен адрес контракта вместо адреса кошелька. Проверьте настройки кошелька.');
       }

       console.log(`Подключен к кошельку ${selectedWalletName}:`, account.address);
       console.log('Адрес кошелька не равен адресу контракта ✓');

       setAccount({ address: account.address });
       setConnected(true);
       setWalletName(selectedWalletName);

       // Сохраняем состояние в localStorage
       localStorage.setItem('aptos-wallet-name', selectedWalletName);
       localStorage.setItem('aptos-account-address', account.address);

    } catch (error) {
      console.error('Ошибка подключения кошелька:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      if (walletName && walletName !== 'demo' && typeof window !== 'undefined') {
        const wallet = window[walletName as keyof Window] as any;
        if (wallet && wallet.disconnect) {
          await wallet.disconnect();
        }
      }
    } catch (error) {
      console.error('Ошибка отключения кошелька:', error);
    } finally {
      setConnected(false);
      setAccount(null);
      setWalletName(null);
      
      // Очищаем localStorage при отключении
      localStorage.removeItem('aptos-wallet-name');
      localStorage.removeItem('aptos-account-address');
    }
  };

  const handleSetNetwork = (newNetwork: 'mainnet' | 'testnet') => {
    setNetwork(newNetwork);
    // Сохраняем выбранную сеть в localStorage
    localStorage.setItem('aptos-network', newNetwork);
    // НЕ отключаем кошелек при смене сети - сохраняем аутентификацию
  };

  const signAndSubmitTransaction = async (payload: any) => {
    if (!connected || !account) {
      throw new Error('Кошелек не подключен');
    }

    try {
      if (walletName && walletName !== 'demo' && typeof window !== 'undefined') {
        const wallet = window[walletName as keyof Window] as any;
        if (wallet && wallet.signAndSubmitTransaction) {
          return await wallet.signAndSubmitTransaction(payload);
        }
      }

      // Симуляция транзакции для демо
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { 
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        success: true 
      };
    } catch (error) {
      console.error('Ошибка транзакции:', error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider value={{ 
      connected, 
      account, 
      connect, 
      disconnect, 
      signAndSubmitTransaction,
      walletName,
      network,
      setNetwork: handleSetNetwork,
      checkWalletAvailability
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 