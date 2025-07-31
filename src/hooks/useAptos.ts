import { Aptos } from '@aptos-labs/ts-sdk';
import { useWallet } from '@/components/WalletProvider';
import { useState, useEffect } from 'react';

export const useAptos = () => {
  const { network, account } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  
  const getAptosClient = () => {
    const nodeUrl = network === 'mainnet' 
      ? 'https://fullnode.mainnet.aptoslabs.com'
      : 'https://fullnode.testnet.aptoslabs.com';
    
    return new Aptos(nodeUrl);
  };

  const aptosClient = getAptosClient();

  const fetchBalance = async () => {
    if (!account?.address) return;
    
    setLoading(true);
    try {
      // Получаем баланс APT токена
      const balance = await aptosClient.getAccountBalance({
        accountAddress: account.address,
        coinType: "0x1::aptos_coin::AptosCoin"
      });
      
      // Конвертируем из octas (8 знаков после запятой) в APT
      const aptBalance = (Number(balance.coin.value) / 100000000).toFixed(4);
      setBalance(aptBalance);
      
      console.log(`Баланс APT для ${account.address}: ${aptBalance} APT`);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [account?.address, network]);

  return {
    aptosClient,
    network,
    balance,
    loading,
    fetchBalance
  };
}; 