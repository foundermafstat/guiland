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

  // Проверяем подключение при загрузке
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined') {
        // Восстанавливаем состояние из localStorage
        const savedWalletName = localStorage.getItem('aptos-wallet-name');
        const savedAccountAddress = localStorage.getItem('aptos-account-address');
        
        if (savedWalletName && savedAccountAddress) {
          // Проверяем, что кошелек все еще подключен
          const wallet = window[savedWalletName as keyof Window] as any;
          if (wallet?.isConnected?.()) {
            try {
              const account = await wallet.account();
              if (account.address === savedAccountAddress) {
                setAccount({ address: account.address });
                setConnected(true);
                setWalletName(savedWalletName);
                return;
              }
            } catch (error) {
              console.error('Ошибка восстановления подключения:', error);
            }
          }
        }
        
        // Если восстановление не удалось, очищаем localStorage
        localStorage.removeItem('aptos-wallet-name');
        localStorage.removeItem('aptos-account-address');
      }
    };

    checkConnection();
  }, []);

  const connect = async (walletType?: string) => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Браузер не поддерживается');
      }

      let wallet: any = null;
      let selectedWalletName = walletType;

      if (walletType === 'demo') {
        // Демо режим
        setConnected(true);
        setAccount({ address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' });
        setWalletName('demo');
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

      wallet = window[selectedWalletName as keyof Window] as any;

      if (!wallet) {
        throw new Error(`Кошелек ${selectedWalletName} не найден`);
      }

      // Подключаемся к кошельку
      const account = await wallet.connect();
      
      if (!account || !account.address) {
        throw new Error('Не удалось получить адрес кошелька');
      }

      setAccount({ address: account.address });
      setConnected(true);
      setWalletName(selectedWalletName);

      // Сохраняем состояние в localStorage
      localStorage.setItem('aptos-wallet-name', selectedWalletName);
      localStorage.setItem('aptos-account-address', account.address);

      console.log(`Подключен к кошельку ${selectedWalletName}:`, account.address);

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
      setNetwork: handleSetNetwork
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