'use client';

import { useState, useEffect } from 'react';
import { Typography, Button, Card, Row, Col, Input, Form, message, Space, Divider, Dropdown, Tag, Spin } from 'antd';
import { WalletOutlined, DownOutlined, SunOutlined, MoonOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { useWallet } from '@/components/WalletProvider';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { NFTMinter } from '@/components/NFTMinter';
import { NFTGallery } from '@/components/NFTGallery';
import { useAptos } from '@/hooks/useAptos';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

const { Title, Text } = Typography;

export default function GamePage() {
  const { connected, account, connect, disconnect, walletName, network, setNetwork } = useWallet();
  const { aptosClient, balance, loading: balanceLoading, fetchBalance } = useAptos();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  const handleWalletSelect = async (walletKey: string) => {
    if (walletKey === 'demo') {
      await connect();
    } else {
      // Для реальных кошельков показываем инструкцию
      message.info(`${t('common.install')} ${walletKey} ${t('common.wallet')} ${t('common.and')} ${t('common.refresh')} ${t('common.page')}`);
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

  const handleProfileClick = () => {
    if (account?.address) {
      router.push(`/profile/${account.address}`);
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {!connected ? (
            <Card className="card-gradient" style={{ textAlign: 'center', marginTop: 100 }}>
              <Title level={2}>{t('game.welcome')}</Title>
              <Text style={{ fontSize: 16, marginBottom: 24, display: 'block' }}>
                {t('game.connect_description')}
              </Text>
              <div style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  {t('game.supported_wallets')}
                </Text>
              </div>
              <Dropdown menu={walletMenu} placement="bottomCenter">
                <Button 
                  type="primary" 
                  size="large"
                  icon={<WalletOutlined />}
                  loading={loading}
                >
                  {t('game.select_wallet')} <DownOutlined />
                </Button>
              </Dropdown>
            </Card>
          ) : (
            <>
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                  <Card className="card-gradient" title={t('game.create_nft')}>
                    <NFTMinter />
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card className="balance-card" title={t('game.balance')}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Title level={2} style={{ color: 'white', margin: 0 }}>
                          {balanceLoading ? (
                            <Spin size="large" />
                          ) : (
                            `${balance} APT`
                          )}
                        </Title>
                      </div>
                      <Button 
                        type="default" 
                        icon={<ReloadOutlined />}
                        onClick={fetchBalance}
                        loading={balanceLoading}
                      >
                        {t('game.refresh_balance')}
                      </Button>
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card className="card-gradient" title={t('game.wallet_info')}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>{t('game.wallet_address')}</Text>
                      <Text code>{account?.address}</Text>
                      <Divider />
                      <Text strong>{t('game.wallet_name')}</Text>
                      <Text>{walletName === 'demo' ? t('header.demo_mode') : walletName}</Text>
                      <Divider />
                      <Text strong>{t('game.network')}</Text>
                      <Text>Aptos {network === 'mainnet' ? t('network.mainnet') : t('network.testnet')}</Text>
                      <Divider />
                      <Text strong>{t('game.status')}</Text>
                      <Text type="success">{t('game.connected')}</Text>
                      <Button 
                        type="primary" 
                        icon={<UserOutlined />}
                        onClick={handleProfileClick}
                        style={{ marginTop: 8 }}
                      >
                        {t('game.open_profile')}
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
              
              <Card className="card-gradient" title={t('game.my_nfts')} style={{ marginTop: 24 }}>
                <NFTGallery />
              </Card>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 