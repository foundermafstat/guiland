'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Layout, Typography, Button, Space, Dropdown, Tag } from 'antd';
import { WalletOutlined, DownOutlined, SunOutlined, MoonOutlined, UserOutlined, GlobalOutlined } from '@ant-design/icons';
import { useWallet } from '@/components/WalletProvider';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { useRouter } from 'next/navigation';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export default function AppLayout({ children, showHeader = true }: AppLayoutProps) {
  const { connected, account, connect, disconnect, walletName, network, setNetwork } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Предотвращаем ошибку гидратации
  useEffect(() => {
    setIsClient(true);
  }, []);

  const walletOptions = [
    { key: 'petra', label: t('wallet.petra'), icon: '🦊' },
    { key: 'martian', label: t('wallet.martian'), icon: '🚀' },
    { key: 'pontem', label: t('wallet.pontem'), icon: '🔗' },
    { key: 'nightly', label: t('wallet.nightly'), icon: '🌙' },
    { key: 'demo', label: t('wallet.demo'), icon: '🎮' },
  ];

  const networkOptions = [
    { key: 'testnet', label: t('network.testnet'), icon: '🧪', color: 'orange' },
    { key: 'mainnet', label: t('network.mainnet'), icon: '🌐', color: 'green' },
  ];

  const languageOptions = [
    { key: 'en', label: 'English', icon: '🇺🇸' },
    { key: 'ru', label: 'Русский', icon: '🇷🇺' },
  ];

  const handleWalletSelect = async (walletKey: string) => {
    if (!isClient) return;
    
    try {
      await connect(walletKey);
    } catch (error: any) {
      console.error('Ошибка подключения кошелька:', error);
    }
  };

  const walletMenu = {
    items: walletOptions.map(option => ({
      key: option.key,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{option.icon}</span>
          <span>{option.label}</span>
        </div>
      ),
      onClick: () => handleWalletSelect(option.key)
    }))
  };

  const networkMenu = {
    items: networkOptions.map(option => ({
      key: option.key,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{option.icon}</span>
          <span>{option.label}</span>
        </div>
      ),
      onClick: () => setNetwork(option.key as 'mainnet' | 'testnet')
    }))
  };

  const languageMenu = {
    items: languageOptions.map(option => ({
      key: option.key,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{option.icon}</span>
          <span>{option.label}</span>
        </div>
      ),
      onClick: () => setLanguage(option.key as 'en' | 'ru')
    }))
  };

  const handleProfileClick = () => {
    if (account?.address) {
      router.push(`/profile/${account.address}`);
    }
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {showHeader && (
        <Header style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Title 
              level={3} 
              style={{ color: 'white', margin: 0, cursor: 'pointer' }}
              onClick={handleLogoClick}
            >
              🏰 GUILAND
            </Title>
            <Button 
              type="text" 
              style={{ color: 'white' }}
              onClick={() => router.push('/test-wallets')}
            >
              🧪 Тест кошельков
            </Button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Переключатель темы */}
            <Button
              type="default"
              icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
              onClick={toggleTheme}
              className="header-button"
            />

            {/* Селектор языка */}
            <Dropdown menu={languageMenu} placement="bottomRight">
              <Button 
                type="default"
                icon={<GlobalOutlined />}
                className="header-button"
              >
                {languageOptions.find(opt => opt.key === language)?.icon} {language.toUpperCase()}
                <DownOutlined />
              </Button>
            </Dropdown>

            {/* Селектор сети */}
            <Dropdown menu={networkMenu} placement="bottomRight">
              <Button 
                type="default"
                className="header-button"
              >
                {networkOptions.find(opt => opt.key === network)?.icon} {network.toUpperCase()}
                <DownOutlined />
              </Button>
            </Dropdown>

            {connected && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text style={{ color: 'white', fontSize: '12px' }}>
                  {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
                </Text>
                <Tag color="green" style={{ margin: 0 }}>
                  {walletName === 'demo' ? 'Демо' : walletName}
                </Tag>
                <Button 
                  type="text" 
                  icon={<UserOutlined />}
                  onClick={handleProfileClick}
                  style={{ color: 'white' }}
                  size="small"
                >
                  {t('header.profile')}
                </Button>
              </div>
            )}
            
            {connected ? (
              <Button 
                type="default" 
                onClick={disconnect}
                className="header-button"
              >
                {t('header.disconnect')}
              </Button>
            ) : (
              <Dropdown menu={walletMenu} placement="bottomRight">
                <Button 
                  type="primary" 
                  icon={<WalletOutlined />}
                >
                  {t('header.connect_wallet')} <DownOutlined />
                </Button>
              </Dropdown>
            )}
          </div>
        </Header>
      )}

      <Content style={{ flex: 1 }}>
        {children}
      </Content>

      <Footer style={{ 
        textAlign: 'center', 
        background: 'var(--bg-primary)', 
        color: 'var(--text-primary)', 
        borderTop: '1px solid var(--border-color)' 
      }}>
        {t('footer.copyright')}
      </Footer>
    </Layout>
  );
} 