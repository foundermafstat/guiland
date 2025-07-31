'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Typography, Card, Row, Col, Space, Divider, Tag, Spin, Statistic, Progress, Tabs, Avatar, Button, message } from 'antd';
import { 
  WalletOutlined, 
  TrophyOutlined, 
  FireOutlined, 
  StarOutlined, 
  CrownOutlined,
  UserOutlined,
  TrophyFilled,
  FireFilled,
  StarFilled,
  CrownFilled,
  ReloadOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useWallet } from '@/components/WalletProvider';
import { useAptos } from '@/hooks/useAptos';
import { useLanguage } from '@/components/LanguageProvider';
import { NFTGallery } from '@/components/NFTGallery';
import AppLayout from '@/components/AppLayout';

const { Title, Text } = Typography;

interface PlayerStats {
  totalNFTs: number;
  uniqueCollections: number;
  totalValue: number;
  rank: string;
  level: number;
  experience: number;
  achievements: number;
  battlesWon: number;
  battlesTotal: number;
  winRate: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export default function PlayerProfile() {
  const params = useParams();
  const address = params.address as string;
  const { connected, account, network } = useWallet();
  const { aptosClient, balance, loading: balanceLoading, fetchBalance } = useAptos();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalNFTs: 0,
    uniqueCollections: 0,
    totalValue: 0,
            rank: t('profile.ranks.Новичок'),
    level: 1,
    experience: 250,
    achievements: 3,
    battlesWon: 12,
    battlesTotal: 20,
    winRate: 60
  });
  
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_nft',
      name: t('profile.first_nft'),
      description: t('profile.first_nft_desc'),
      icon: '🎨',
      unlocked: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: 'collector',
      name: t('profile.collector'),
      description: t('profile.collector_desc'),
      icon: '📦',
      unlocked: true,
      progress: 5,
      maxProgress: 5
    },
    {
      id: 'warrior',
      name: t('profile.warrior'),
      description: t('profile.warrior_desc'),
      icon: '⚔️',
      unlocked: true,
      progress: 12,
      maxProgress: 10
    },
    {
      id: 'legend',
      name: t('profile.legend'),
      description: t('profile.legend_desc'),
      icon: '👑',
      unlocked: false,
      progress: 1,
      maxProgress: 10
    },
    {
      id: 'master',
      name: t('profile.master'),
      description: t('profile.master_desc'),
      icon: '🏆',
      unlocked: false,
      progress: 8,
      maxProgress: 50
    }
  ]);

  useEffect(() => {
    const loadPlayerData = async () => {
      setLoading(true);
      try {
        // Здесь будет загрузка данных игрока с блокчейна
        // Пока используем моковые данные
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Обновляем статистику на основе адреса
        const mockStats: PlayerStats = {
          totalNFTs: Math.floor(Math.random() * 20) + 5,
          uniqueCollections: Math.floor(Math.random() * 8) + 2,
          totalValue: Math.floor(Math.random() * 1000) + 100,
          rank: [t('profile.ranks.Новичок'), t('profile.ranks.Опытный'), t('profile.ranks.Ветеран'), t('profile.ranks.Мастер'), t('profile.ranks.Легенда')][Math.floor(Math.random() * 5)],
          level: Math.floor(Math.random() * 15) + 1,
          experience: Math.floor(Math.random() * 1000) + 100,
          achievements: Math.floor(Math.random() * 8) + 2,
          battlesWon: Math.floor(Math.random() * 50) + 10,
          battlesTotal: Math.floor(Math.random() * 80) + 20,
          winRate: Math.floor(Math.random() * 40) + 50
        };
        
        setPlayerStats(mockStats);
      } catch (error) {
        console.error(t('profile.load_error'), error);
        message.error(t('profile.load_error'));
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      loadPlayerData();
    }
  }, [address]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    message.success(t('profile.address_copied'));
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case t('profile.ranks.Легенда'): return <CrownFilled style={{ color: '#FFD700' }} />;
      case t('profile.ranks.Мастер'): return <TrophyFilled style={{ color: '#FFA500' }} />;
      case t('profile.ranks.Ветеран'): return <StarFilled style={{ color: '#87CEEB' }} />;
      case t('profile.ranks.Опытный'): return <FireFilled style={{ color: '#FF6347' }} />;
      default: return <UserOutlined />;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case t('profile.ranks.Легенда'): return '#FFD700';
      case t('profile.ranks.Мастер'): return '#FFA500';
      case t('profile.ranks.Ветеран'): return '#87CEEB';
      case t('profile.ranks.Опытный'): return '#FF6347';
      default: return '#52c41a';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
          <Spin size="large" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Профиль игрока */}
          <Card className="card-gradient" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar 
                    size={120} 
                    icon={<UserOutlined />}
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '48px'
                    }}
                  />
                  <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
                    {t('profile.player')}{address.slice(0, 8)}
                  </Title>
                  <Space>
                    {getRankIcon(playerStats.rank)}
                    <Tag color={getRankColor(playerStats.rank)} style={{ fontSize: '14px' }}>
                      {playerStats.rank}
                    </Tag>
                  </Space>
                </div>
              </Col>
              
              <Col xs={24} md={16}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>{t('profile.wallet_address')}</Text>
                    <Space style={{ marginLeft: 8 }}>
                      <Text code>{address}</Text>
                      <Button 
                        type="text" 
                        icon={<CopyOutlined />} 
                        onClick={copyAddress}
                        size="small"
                      />
                    </Space>
                  </div>
                  
                  <div>
                    <Text strong>{t('profile.network')}</Text>
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      Aptos {network === 'mainnet' ? t('network.mainnet') : t('network.testnet')}
                    </Tag>
                  </div>
                  
                  <div>
                    <Text strong>{t('profile.balance')}:</Text>
                    <Text strong style={{ marginLeft: 8, color: '#52c41a' }}>
                      {balance} APT
                    </Text>
                  </div>
                  
                  <div>
                    <Text strong>{t('profile.level')}</Text>
                    <Text strong style={{ marginLeft: 8 }}>
                      {playerStats.level}
                    </Text>
                    <Progress 
                      percent={Math.round((playerStats.experience % 1000) / 10)} 
                      size="small" 
                      style={{ marginLeft: 8, width: 200 }}
                    />
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Статистика */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card className="card-gradient">
                <Statistic
                  title={t('profile.total_nfts')}
                  value={playerStats.totalNFTs}
                  prefix="🎨"
                  valueStyle={{ color: '#667eea' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="card-gradient">
                <Statistic
                  title={t('profile.collections')}
                  value={playerStats.uniqueCollections}
                  prefix="📦"
                  valueStyle={{ color: '#764ba2' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="card-gradient">
                <Statistic
                  title={t('profile.victories')}
                  value={playerStats.battlesWon}
                  prefix="⚔️"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="card-gradient">
                <Statistic
                  title={t('profile.achievements')}
                  value={playerStats.achievements}
                  prefix="🏆"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Детальная информация */}
          <Tabs
            items={[
              {
                key: 'nfts',
                label: (
                  <span>
                    {t('profile.my_nfts')} ({playerStats.totalNFTs})
                  </span>
                ),
                children: (
                  <Card className="card-gradient">
                    <NFTGallery />
                  </Card>
                )
              },
              {
                key: 'battles',
                label: (
                  <span>
                    {t('profile.battles')} ({playerStats.battlesTotal})
                  </span>
                ),
                children: (
                  <Card className="card-gradient">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                          <Card title={t('profile.battle_stats')} size="small">
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <div>
                                <Text>{t('profile.wins')} </Text>
                                <Text strong style={{ color: '#52c41a' }}>
                                  {playerStats.battlesWon}
                                </Text>
                              </div>
                              <div>
                                <Text>{t('profile.losses')} </Text>
                                <Text strong style={{ color: '#ff4d4f' }}>
                                  {playerStats.battlesTotal - playerStats.battlesWon}
                                </Text>
                              </div>
                              <div>
                                <Text>{t('profile.win_rate')} </Text>
                                <Text strong style={{ color: '#1890ff' }}>
                                  {playerStats.winRate}%
                                </Text>
                              </div>
                            </Space>
                          </Card>
                        </Col>
                        <Col xs={24} md={12}>
                          <Card title={t('profile.recent_battles')} size="small">
                            <Space direction="vertical" style={{ width: '100%' }}>
                              {[
                                { opponent: `${t('profile.opponent')}1234`, result: t('profile.victory'), date: '2024-01-15' },
                                { opponent: `${t('profile.opponent')}5678`, result: t('profile.defeat'), date: '2024-01-14' },
                                { opponent: `${t('profile.opponent')}9012`, result: t('profile.victory'), date: '2024-01-13' }
                              ].map((battle, index) => (
                                <div key={index} style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  padding: '8px',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '4px'
                                }}>
                                  <Text>{battle.opponent}</Text>
                                  <Space>
                                    <Tag color={battle.result === t('profile.victory') ? 'green' : 'red'}>
                                      {battle.result}
                                    </Tag>
                                    <Text type="secondary">{battle.date}</Text>
                                  </Space>
                                </div>
                              ))}
                            </Space>
                          </Card>
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                )
              },
              {
                key: 'achievements',
                label: (
                  <span>
                    {t('profile.achievements_tab')} ({playerStats.achievements})
                  </span>
                ),
                children: (
                  <Card className="card-gradient">
                    <Row gutter={[16, 16]}>
                      {achievements.map((achievement) => (
                        <Col xs={24} sm={12} md={8} key={achievement.id}>
                          <Card 
                            size="small"
                            style={{ 
                              opacity: achievement.unlocked ? 1 : 0.5,
                              border: achievement.unlocked ? '2px solid #52c41a' : '1px solid var(--border-color)'
                            }}
                          >
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                                {achievement.icon}
                              </div>
                              <Title level={5}>{achievement.name}</Title>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {achievement.description}
                              </Text>
                              <Progress 
                                percent={Math.round((achievement.progress / achievement.maxProgress) * 100)}
                                size="small"
                                style={{ marginTop: '8px' }}
                              />
                              <Text style={{ fontSize: '12px' }}>
                                {achievement.progress}/{achievement.maxProgress}
                              </Text>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                )
              }
            ]}
          />
        </div>
      </div>
    </AppLayout>
  );
} 