'use client';

import { useState, useEffect } from 'react';
import { Tag } from 'antd';

interface WalletStatusProps {
  walletKey: string;
  walletName: string;
  icon: string;
  isDemo?: boolean;
}

export default function WalletStatus({ walletKey, walletName, icon, isDemo = false }: WalletStatusProps) {
  const [isClient, setIsClient] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (isDemo) {
      setIsAvailable(true);
      return;
    }

    // Проверяем доступность кошелька только на клиенте
    if (typeof window !== 'undefined') {
      const wallet = window[walletKey as keyof Window] as any;
      setIsAvailable(!!wallet);
    }
  }, [walletKey, isDemo]);

  if (!isClient) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span>{icon}</span>
        <span>{walletName}</span>
        <Tag color="default">Загрузка...</Tag>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <span>{icon}</span>
      <span>{walletName}</span>
      {isDemo ? (
        <Tag color="blue">Демо режим</Tag>
      ) : isAvailable ? (
        <Tag color="green">✓ Доступен</Tag>
      ) : (
        <Tag color="red">✗ Не установлен</Tag>
      )}
    </div>
  );
} 