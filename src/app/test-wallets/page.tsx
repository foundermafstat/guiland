'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Tag, Alert, Divider } from 'antd';
import { WalletOutlined, ReloadOutlined } from '@ant-design/icons';
import { useWallet } from '@/components/WalletProvider';
import AppLayout from '@/components/AppLayout';
import WalletStatus from '@/components/WalletStatus';

const { Title, Text } = Typography;

export default function TestWalletsPage() {
  const { connected, account, connect, disconnect, walletName, checkWalletAvailability } = useWallet();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>({});
  const [isClient, setIsClient] = useState(false);

  // Предотвращаем ошибку гидратации
  useEffect(() => {
    setIsClient(true);
  }, []);

  const walletAvailability = isClient ? checkWalletAvailability() : { petra: false, martian: false, pontem: false, nightly: false };

  const testWallet = async (walletName: string) => {
    setLoading(true);
    setTestResults(prev => ({ ...prev, [walletName]: { status: 'testing', message: 'Тестирование...' } }));
    
    try {
      await connect(walletName);
      setTestResults(prev => ({ 
        ...prev, 
        [walletName]: { 
          status: 'success', 
          message: `Подключен: ${account?.address}` 
        } 
      }));
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        [walletName]: { 
          status: 'error', 
          message: error.message 
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const wallets = [
    { key: 'petra', name: 'Petra', icon: '🦊' },
    { key: 'martian', name: 'Martian', icon: '🚀' },
    { key: 'pontem', name: 'Pontem', icon: '🔗' },
    { key: 'nightly', name: 'Nightly', icon: '🌙' },
    { key: 'demo', name: 'Demo', icon: '🎮' },
  ];

  return (
    <AppLayout>
      <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <Title level={2}>🧪 Тест кошельков</Title>
          
          <Alert
            message="Информация"
            description="Эта страница поможет диагностировать проблемы с подключением кошельков"
            type="info"
            style={{ marginBottom: 24 }}
          />

                     <div style={{ marginBottom: 24 }}>
             <Title level={4}>Статус кошельков:</Title>
             <Space direction="vertical" style={{ width: '100%' }}>
               {wallets.map(wallet => (
                 <div key={wallet.key} style={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'space-between',
                   padding: '12px',
                   border: '1px solid #d9d9d9',
                   borderRadius: '6px'
                 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <span>{wallet.icon}</span>
                     <Text strong>{wallet.name}</Text>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <WalletStatus 
                       walletKey={wallet.key} 
                       walletName={wallet.name} 
                       icon={wallet.icon} 
                       isDemo={wallet.key === 'demo'}
                     />
                     <Button 
                       size="small"
                       onClick={() => testWallet(wallet.key)}
                       loading={loading && testResults[wallet.key]?.status === 'testing'}
                       disabled={!isClient || (wallet.key !== 'demo' && !walletAvailability[wallet.key as keyof typeof walletAvailability])}
                     >
                       Тест
                     </Button>
                   </div>
                 </div>
               ))}
             </Space>
           </div>

          {Object.keys(testResults).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>Результаты тестов:</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.entries(testResults).map(([walletKey, result]: [string, any]) => (
                  <Alert
                    key={walletKey}
                    message={`${wallets.find(w => w.key === walletKey)?.name}: ${result.message}`}
                    type={result.status === 'success' ? 'success' : result.status === 'error' ? 'error' : 'info'}
                    showIcon
                  />
                ))}
              </Space>
            </div>
          )}

          <Divider />

          <div>
            <Title level={4}>Текущее состояние:</Title>
            <Space direction="vertical">
              <Text>Подключен: {connected ? 'Да' : 'Нет'}</Text>
              {connected && (
                <>
                  <Text>Кошелек: {walletName}</Text>
                  <Text>Адрес: {account?.address}</Text>
                  <Button onClick={disconnect} danger>
                    Отключиться
                  </Button>
                </>
              )}
            </Space>
          </div>

          <Divider />

                     <div>
             <Title level={4}>Отладка:</Title>
             <Space direction="vertical" style={{ width: '100%' }}>
               <Text code>window.petra: {isClient && window.petra ? '✓' : '✗'}</Text>
               <Text code>window.martian: {isClient && window.martian ? '✓' : '✗'}</Text>
               <Text code>window.pontem: {isClient && window.pontem ? '✓' : '✗'}</Text>
               <Text code>window.nightly: {isClient && window.nightly ? '✓' : '✗'}</Text>
             </Space>
           </div>
        </Card>
      </div>
    </AppLayout>
  );
} 