'use client';

import { useState, useEffect } from 'react';
import { Typography, Button, Card, Row, Col, Input, Form, message, Space, Divider, Dropdown, Tag, Spin, Progress, Statistic, List, Avatar, Tabs, Modal, Select, DatePicker, Popconfirm, Tooltip, Calendar, Badge } from 'antd';
import { 
  WalletOutlined, 
  DownOutlined, 
  SunOutlined, 
  MoonOutlined, 
  ReloadOutlined, 
  UserOutlined,
  TrophyOutlined,
  TeamOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  StarOutlined,
  DollarOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useWallet } from '@/components/WalletProvider';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { useGameContract } from '@/hooks/useGameContract';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import WalletStatus from '@/components/WalletStatus';
import GuildLeaderPanel from '@/components/GuildLeaderPanel';

const { Title, Text } = Typography;

// Компонент табов для игровых систем
interface GameTabsProps {
  player: any | null;
  territories: any[];
  guilds: any[];
  gameStats: any;
  gameLoading: boolean;
  account: any;
  createGuild: (name: string) => void;
  joinGuild: (id: string) => void;
  contributeToGuild: (gui: string, treats: string) => void;
  attackTerritory: (id: string) => void;
  loadAllData: () => void;
  getTerrainTypeName: (type: number) => string;
  t: (key: string) => string;
  isGuildLeader: boolean;
  playerGuild: any | null;
  onUpdateGuildName: (newName: string) => Promise<void>;
  onUpdateTaxRate: (newRate: number) => Promise<void>;
  onKickMember: (memberId: string) => Promise<void>;
  onPromoteMember: (memberId: string) => Promise<void>;
  onDemoteMember: (memberId: string) => Promise<void>;
  onTransferLeadership: (memberId: string) => Promise<void>;
  onPostAnnouncement: (announcement: string) => Promise<void>;
  onCreateEvent: (event: any) => Promise<void>;
  onDeclareWar: (targetGuildId: string, duration: number) => Promise<void>;
  onProposeAlliance: (targetGuildId: string, terms: string) => Promise<void>;
}

function GameTabs({ 
  player, 
  territories, 
  guilds, 
  gameStats, 
  gameLoading, 
  account, 
  createGuild, 
  joinGuild, 
  contributeToGuild, 
  attackTerritory, 
  loadAllData, 
  getTerrainTypeName, 
  t,
  isGuildLeader,
  playerGuild,
  onUpdateGuildName,
  onUpdateTaxRate,
  onKickMember,
  onPromoteMember,
  onDemoteMember,
  onTransferLeadership,
  onPostAnnouncement,
  onCreateEvent,
  onDeclareWar,
  onProposeAlliance
}: GameTabsProps) {
  const [guildName, setGuildName] = useState('');
  const [selectedGuildId, setSelectedGuildId] = useState('');
  const [guiAmount, setGuiAmount] = useState('');
  const [treatsAmount, setTreatsAmount] = useState('');

  const baseItems = [
    {
      key: 'resources',
      label: `💰 ${t('game.resources')}`,
      children: (
        <Card className="card-gradient">
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              💡 {t('game.resources_tip')}
            </Text>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Statistic title={t('game.gui_tokens')} value={player?.resources?.gui_tokens || 0} prefix={<DollarOutlined />} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title={t('game.treats')} value={player?.resources?.treats || 0} prefix={<StarOutlined />} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title={t('game.crystals')} value={player?.resources?.crystals || 0} prefix={<ThunderboltOutlined />} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title={t('game.loyalty_points')} value={player?.resources?.loyalty_points || 0} prefix={<CrownOutlined />} />
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'stats',
      label: `⚔️ ${t('game.stats')}`,
      children: (
        <Card className="card-gradient">
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              💡 {t('game.stats_tip')}
            </Text>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={12} md={4}>
              <Statistic title={t('game.attack')} value={player?.stats?.attack || 0} prefix="⚔️" />
            </Col>
            <Col xs={12} md={4}>
              <Statistic title={t('game.defense')} value={player?.stats?.defense || 0} prefix="🛡️" />
            </Col>
            <Col xs={12} md={4}>
              <Statistic title={t('game.speed')} value={player?.stats?.speed || 0} prefix="⚡" />
            </Col>
            <Col xs={12} md={4}>
              <Statistic title={t('game.leadership')} value={player?.stats?.leadership || 0} prefix="👑" />
            </Col>
            <Col xs={12} md={4}>
              <Statistic title={t('game.strategy')} value={player?.stats?.strategy || 0} prefix="🧠" />
            </Col>
            <Col xs={12} md={4}>
              <Statistic title={t('game.economy')} value={player?.stats?.economy || 0} prefix="💼" />
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'guilds',
      label: `🏰 ${t('game.guilds')}`,
      children: (
        <Card className="card-gradient">
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              💡 {t('game.guilds_tip')}
            </Text>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card title={t('game.create_guild')} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input 
                    placeholder={t('game.guild_name')} 
                    value={guildName}
                    onChange={(e) => setGuildName(e.target.value)}
                  />
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => createGuild(guildName)}
                    loading={gameLoading}
                    disabled={!guildName}
                  >
                    {t('game.create_guild_cost')}
                  </Button>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title={t('game.join_guild')} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input 
                    placeholder={t('game.guild_id')} 
                    value={selectedGuildId}
                    onChange={(e) => setSelectedGuildId(e.target.value)}
                  />
                  <Button 
                    type="primary" 
                    icon={<TeamOutlined />}
                    onClick={() => joinGuild(selectedGuildId)}
                    loading={gameLoading}
                    disabled={!selectedGuildId}
                  >
                    {t('game.join')}
                  </Button>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title={t('game.guild_contribution')} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input 
                    placeholder={t('game.gui_tokens')} 
                    value={guiAmount}
                    onChange={(e) => setGuiAmount(e.target.value)}
                    type="number"
                  />
                  <Input 
                    placeholder={t('game.treats')} 
                    value={treatsAmount}
                    onChange={(e) => setTreatsAmount(e.target.value)}
                    type="number"
                  />
                  <Button 
                    type="primary" 
                    icon={<CrownOutlined />}
                    onClick={() => contributeToGuild(guiAmount, treatsAmount)}
                    loading={gameLoading}
                    disabled={!guiAmount && !treatsAmount}
                  >
                    {t('game.contribute')}
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
          
          {/* Список гильдий */}
          <Divider />
          <div style={{ marginTop: 16 }}>
            <Title level={4}>{t('game.available_guilds')}</Title>
            <Row gutter={[16, 16]}>
              {guilds.length > 0 ? (
                guilds.map((guild) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={guild.id}>
                    <Card 
                      title={guild.name} 
                      size="small"
                      extra={
                        guild.leader === account?.address ? (
                          <Tag color="gold">👑 {t('guild.leader')}</Tag>
                        ) : (
                          <Tag color="blue">{t('guild.member')}</Tag>
                        )
                      }
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>{t('game.level')}: {guild.level}</Text>
                        <Text>{t('guild.members')}: {guild.members.length}</Text>
                        <Text>{t('game.leader')}: {guild.leader.slice(0, 8)}...</Text>
                        <Text>{t('game.treasury')}: {guild.treasury.gui_tokens} GUI</Text>
                        {guild.leader !== account?.address && (
                          <Button 
                            type="primary" 
                            size="small"
                            icon={<TeamOutlined />}
                            onClick={() => joinGuild(guild.id)}
                            loading={gameLoading}
                            disabled={player?.guild_id === guild.id}
                          >
                            {player?.guild_id === guild.id ? t('game.already_member') : t('game.join')}
                          </Button>
                        )}
                      </Space>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Text type="secondary">{t('game.no_guilds_available')}</Text>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        </Card>
      ),
    },
    {
      key: 'territories',
      label: `🗺️ ${t('game.territories_title')}`,
      children: (
        <Card className="card-gradient">
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              💡 {t('game.territories_tip')}
            </Text>
          </div>
          <Row gutter={[16, 16]}>
            {territories.map((territory) => (
              <Col xs={24} sm={12} md={8} lg={6} key={territory.id}>
                <Card 
                  title={territory.name} 
                  size="small"
                  extra={
                    territory.owner ? (
                      <Tag color="red">{t('game.occupied')}</Tag>
                    ) : (
                      <Tag color="green">{t('game.free')}</Tag>
                    )
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text>{t('game.terrain_type')}: {getTerrainTypeName(parseInt(territory.terrain_type))}</Text>
                    <Text>{t('game.defense_rating')}: {territory.defense_rating}</Text>
                    <Text>{t('game.resource_multiplier')}: {territory.resource_multiplier}%</Text>
                    {territory.owner && (
                      <Text>{t('game.owner')}: {territory.owner.slice(0, 8)}...</Text>
                    )}
                    <Button 
                      type="primary" 
                      size="small"
                      icon={<TrophyOutlined />}
                      onClick={() => attackTerritory(territory.id)}
                      loading={gameLoading}
                      disabled={territory.owner === account?.address}
                    >
                      {territory.owner ? t('game.attack_territory') : t('game.capture_territory')}
                    </Button>
                    {territory.owner === account?.address && (
                      <Tag color="green">{t('game.your_territory')}</Tag>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      ),
    },
    {
      key: 'game_stats',
      label: `📊 ${t('game.game_stats')}`,
      children: (
        <Card className="card-gradient">
          {gameStats ? (
            <Row gutter={[24, 24]}>
              <Col xs={12} md={6}>
                <Statistic title={t('game.total_players')} value={gameStats.total_players} />
              </Col>
              <Col xs={12} md={6}>
                <Statistic title={t('game.total_guilds')} value={gameStats.total_guilds} />
              </Col>
              <Col xs={12} md={6}>
                <Statistic title={t('game.game_status')} value={gameStats.paused ? t('game.paused') : t('game.active')} />
              </Col>
              <Col xs={12} md={6}>
                <Button 
                  type="default" 
                  icon={<ReloadOutlined />}
                  onClick={loadAllData}
                  loading={gameLoading}
                >
                  {t('game.update')}
                </Button>
              </Col>
            </Row>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>{t('common.loading')}</Text>
              </div>
            </div>
          )}
        </Card>
      ),
    },
  ];

  // Добавляем таб управления гильдией только для лидеров
  const guildManagementTab = isGuildLeader && playerGuild ? {
    key: 'guild_management',
    label: `👑 ${t('guild.leader_panel')}`,
    children: (
      <Card className="card-gradient">
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            💡 {t('guild.manage_guild')}
          </Text>
        </div>
        <GuildLeaderPanel
          guildData={{
            id: playerGuild.id,
            name: playerGuild.name,
            level: parseInt(playerGuild.level || '1'),
            memberCount: playerGuild.members?.length || 0,
            treasury: {
              gui_tokens: playerGuild.treasury?.gui_tokens || '0',
              treats: playerGuild.treasury?.treats || '0',
              crystals: playerGuild.treasury?.crystals || '0',
              loyalty_points: playerGuild.treasury?.loyalty_points || '0'
            },
            territoriesOwned: playerGuild.territories || [],
            taxRate: parseInt(playerGuild.tax_rate || '0'),
            creationDate: playerGuild.creation_time ? new Date(parseInt(playerGuild.creation_time) * 1000).toISOString() : new Date().toISOString(),
            rank: 1 // Пока не реализовано в API
          }}
          members={playerGuild.members?.map((memberAddress: string) => ({
            id: memberAddress,
            name: memberAddress === account?.address ? t('game.you') : `${memberAddress.slice(0, 6)}...${memberAddress.slice(-4)}`,
            level: 1, // Пока не реализовано в API
            contribution: 0, // Пока не реализовано в API
            joinDate: new Date().toISOString(), // Пока не реализовано в API
            isOfficer: memberAddress !== playerGuild.leader
          })) || []}
          events={[]} // Пока не реализовано в API
          activities={[
            {
              id: '1',
              type: 'member_joined' as const,
              description: `${t('guild.guild_created')} ${playerGuild.name}`,
              timestamp: playerGuild.creation_time ? new Date(parseInt(playerGuild.creation_time) * 1000).toLocaleString() : new Date().toLocaleString(),
              member: playerGuild.leader
            }
          ]}
          onUpdateGuildName={onUpdateGuildName}
          onUpdateTaxRate={onUpdateTaxRate}
          onKickMember={onKickMember}
          onPromoteMember={onPromoteMember}
          onDemoteMember={onDemoteMember}
          onTransferLeadership={onTransferLeadership}
          onPostAnnouncement={onPostAnnouncement}
          onCreateEvent={onCreateEvent}
          onDeclareWar={onDeclareWar}
          onProposeAlliance={onProposeAlliance}
        />
      </Card>
    ),
  } : null;

  // Объединяем базовые табы с табом управления гильдией
  const items = guildManagementTab ? [...baseItems, guildManagementTab] : baseItems;

  return (
    <Tabs 
      items={items} 
      type="card" 
      size="large"
      style={{ height: '100%' }}
      tabBarStyle={{ marginBottom: 16 }}
    />
  );
}

export default function GamePage() {
  const { connected, account, connect, disconnect, walletName, network, setNetwork, checkWalletAvailability } = useWallet();
  const [isClient, setIsClient] = useState(false);

  // Предотвращаем ошибку гидратации
  useEffect(() => {
    setIsClient(true);
  }, []);
  const { 
    player, 
    territories, 
    guilds, 
    gameStats, 
    loading: gameLoading,
    createPlayer,
    collectResources,
    createGuild,
    joinGuild,
    contributeToGuild,
    attackTerritory,
    levelUp,
    loadAllData
  } = useGameContract();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testGuildLeader, setTestGuildLeader] = useState(false);

  // Принудительная загрузка данных при монтировании компонента
  useEffect(() => {
    console.log('GamePage useEffect сработал:', { 
      connected, 
      accountAddress: account?.address, 
      player: !!player, 
      gameLoading,
      playerData: player 
    });
    if (connected && account) {
      console.log('Компонент игры смонтирован, загружаем данные...');
      loadAllData();
    }
  }, [connected, account, loadAllData]);

  // Дополнительная отладка состояния
  useEffect(() => {
    console.log('=== СОСТОЯНИЕ ИГРОКА ИЗМЕНИЛОСЬ ===');
    console.log('player:', player ? 'Есть данные' : 'Нет данных');
    console.log('gameLoading:', gameLoading);
    console.log('connected:', connected);
    console.log('playerDetails:', player);
    console.log('player type:', typeof player);
    console.log('player keys:', player ? Object.keys(player) : 'null');
    console.log('=====================================');
  }, [player, gameLoading, connected]);

  // Вспомогательная функция для названий типов местности
  const getTerrainTypeName = (terrainType: number): string => {
    switch (terrainType) {
      case 0: return t('game.terrain_plains');
      case 1: return t('game.terrain_mountains');
      case 2: return t('game.terrain_forest');
      case 3: return t('game.terrain_mines');
      case 4: return t('game.terrain_port');
      default: return t('game.terrain_unknown');
    }
  };

  // Получаем данные гильдии игрока
  const playerGuild = player && player.guild_id ? guilds.find(guild => guild.id === player.guild_id) : null;
  
  // Проверяем, является ли игрок лидером гильдии
  const isGuildLeader = (playerGuild && playerGuild.leader === account?.address) || testGuildLeader;

  // Отладочная информация
  console.log('=== ОТЛАДКА ГИЛЬДИИ ===');
  console.log('player:', player);
  console.log('player.guild_id:', player?.guild_id);
  console.log('guilds:', guilds);
  console.log('playerGuild:', playerGuild);
  console.log('account?.address:', account?.address);
  console.log('playerGuild?.leader:', playerGuild?.leader);
  console.log('isGuildLeader:', isGuildLeader);
  console.log('testGuildLeader:', testGuildLeader);
  console.log('========================');

  // Обработчики для управления гильдией (заглушки для демонстрации)
  const handleUpdateGuildName = async (newName: string) => {
    console.log('Обновление названия гильдии:', newName);
    message.success(t('guild.update_name') + ' ' + t('common.success'));
  };

  const handleUpdateTaxRate = async (newRate: number) => {
    console.log('Обновление налоговой ставки:', newRate);
    message.success(t('guild.update_tax_rate') + ' ' + t('common.success'));
  };

  const handleKickMember = async (memberId: string) => {
    console.log('Исключение участника:', memberId);
    message.success(t('guild.kick_member') + ' ' + t('common.success'));
  };

  const handlePromoteMember = async (memberId: string) => {
    console.log('Повышение участника:', memberId);
    message.success(t('guild.promote_member') + ' ' + t('common.success'));
  };

  const handleDemoteMember = async (memberId: string) => {
    console.log('Понижение участника:', memberId);
    message.success(t('guild.demote_member') + ' ' + t('common.success'));
  };

  const handleTransferLeadership = async (memberId: string) => {
    console.log('Передача лидерства:', memberId);
    message.success(t('guild.transfer_leadership') + ' ' + t('common.success'));
  };

  const handlePostAnnouncement = async (announcement: string) => {
    console.log('Публикация объявления:', announcement);
    message.success(t('guild.post_announcement') + ' ' + t('common.success'));
  };

  const handleCreateEvent = async (event: any) => {
    console.log('Создание события:', event);
    message.success(t('guild.create_event') + ' ' + t('common.success'));
  };

  const handleDeclareWar = async (targetGuildId: string, duration: number) => {
    console.log('Объявление войны:', targetGuildId, duration);
    message.success(t('guild.declare_war') + ' ' + t('common.success'));
  };

  const handleProposeAlliance = async (targetGuildId: string, terms: string) => {
    console.log('Предложение альянса:', targetGuildId, terms);
    message.success(t('guild.propose_alliance') + ' ' + t('common.success'));
  };

  const walletAvailability = isClient ? checkWalletAvailability() : { petra: false, martian: false, pontem: false, nightly: false };
  
  const walletOptions = [
    { 
      key: 'petra', 
      label: t('wallet.petra'), 
      icon: '🦊',
      available: walletAvailability.petra,
      status: walletAvailability.petra ? 'available' : 'not_installed'
    },
    { 
      key: 'martian', 
      label: t('wallet.martian'), 
      icon: '🚀',
      available: walletAvailability.martian,
      status: walletAvailability.martian ? 'available' : 'not_installed'
    },
    { 
      key: 'pontem', 
      label: t('wallet.pontem'), 
      icon: '🔗',
      available: walletAvailability.pontem,
      status: walletAvailability.pontem ? 'available' : 'not_installed'
    },
    { 
      key: 'nightly', 
      label: t('wallet.nightly'), 
      icon: '🌙',
      available: walletAvailability.nightly,
      status: walletAvailability.nightly ? 'available' : 'not_installed'
    },
    { 
      key: 'demo', 
      label: t('wallet.demo'), 
      icon: '🎮',
      available: true,
      status: 'available'
    },
  ];

  const networkOptions = [
    { key: 'testnet', label: t('network.testnet'), icon: '🧪', color: 'orange' },
    { key: 'mainnet', label: t('network.mainnet'), icon: '🌐', color: 'green' },
  ];

  const handleWalletSelect = async (walletKey: string) => {
    setLoading(true);
    try {
      await connect(walletKey);
      message.success(`${t('wallet.connected')} ${walletKey}`);
    } catch (error: any) {
      console.error('Ошибка подключения кошелька:', error);
      
      if (error.message.includes('не найден') || error.message.includes('not found')) {
        message.error(`${t('wallet.not_installed')} ${walletKey}. ${t('wallet.install_instructions')}`);
      } else if (error.message.includes('отклонено') || error.message.includes('rejected')) {
        message.warning(t('wallet.connection_rejected'));
      } else {
        message.error(`${t('wallet.connection_error')}: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const walletMenu = {
    items: walletOptions.map(option => ({
      key: option.key,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {option.available ? (
              <Tag color="green">✓</Tag>
            ) : (
              <Tag color="red">✗</Tag>
            )}
          </div>
        </div>
      ),
      onClick: () => handleWalletSelect(option.key),
      disabled: !option.available && option.key !== 'demo'
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
                <div style={{ marginTop: 8 }}>
                  <WalletStatus walletKey="petra" walletName={t('wallet.petra')} icon="🦊" />
                  <WalletStatus walletKey="martian" walletName={t('wallet.martian')} icon="🚀" />
                  <WalletStatus walletKey="pontem" walletName={t('wallet.pontem')} icon="🔗" />
                  <WalletStatus walletKey="nightly" walletName={t('wallet.nightly')} icon="🌙" />
                  <WalletStatus walletKey="demo" walletName={t('wallet.demo')} icon="🎮" isDemo={true} />
                </div>
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
          ) : gameLoading ? (
            <Card className="card-gradient" style={{ textAlign: 'center', marginTop: 100 }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>{t('game.loading_player')}</Text>
              </div>
            </Card>
          ) : !player ? (
            <>
              {console.log('ПОКАЗЫВАЕМ ЭКРАН СОЗДАНИЯ ПЕРСОНАЖА')}
              {console.log('Отображаем экран создания персонажа. Состояние:', { 
                connected, 
                gameLoading, 
                player: player ? 'Есть данные' : 'Нет данных',
                playerDetails: player,
                playerType: typeof player,
                playerKeys: player ? Object.keys(player) : 'null'
              })}
              <Card className="card-gradient" style={{ textAlign: 'center', marginTop: 100 }}>
                <Title level={2}>🏰 {t('game.welcome_guiland')}</Title>
                <Text style={{ fontSize: 16, marginBottom: 24, display: 'block' }}>
                  {t('game.create_character_tip')}
                </Text>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<PlusOutlined />}
                  loading={gameLoading}
                  onClick={createPlayer}
                >
                  {t('game.create_character')}
                </Button>
                <div style={{ marginTop: 16 }}>
                  <Button 
                    type="default" 
                    size="small"
                    onClick={() => {
                      console.log('Принудительная загрузка данных...');
                      loadAllData();
                    }}
                  >
                    Отладка: Загрузить данные
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <>
              {console.log('=== ОТОБРАЖАЕМ ОСНОВНОЙ ИГРОВОЙ ИНТЕРФЕЙС ===')}
              {console.log('Состояние:', { 
                connected, 
                gameLoading, 
                player: player ? 'Есть данные' : 'Нет данных',
                playerType: typeof player,
                playerKeys: player ? Object.keys(player) : 'null',
                isGuildLeader,
                playerGuild: playerGuild ? 'Есть данные гильдии' : 'Нет данных гильдии'
              })}
              {player ? (
                  // Обычный игровой интерфейс
                  <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 200px)' }}>
                    {/* Левая панель - Информация об игроке */}
                    <div style={{ width: '300px', flexShrink: 0 }}>
                    <Card className="card-gradient" title={`👤 ${t('game.character')}`} style={{ height: '100%' }}>
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary">
                          💡 {t('game.character_tip')}
                        </Text>
                      </div>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                          <Title level={2} style={{ margin: 0 }}>
                            {t('game.level')} {player.level}
                          </Title>
                          <Progress 
                            percent={Math.min(100, (parseInt(player.experience) / 1000) * 100)} 
                            format={() => `${player.experience}/1000 XP`}
                          />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {parseInt(player.experience) >= 1000 ? t('game.ready_for_levelup') : `${t('game.need_xp')} ${1000 - parseInt(player.experience)} XP`}
                          </Text>
                        </div>
                        
                        <Divider />
                        
                        <div style={{ marginBottom: 16 }}>
                          <Text type="secondary">{t('game.reputation')}: {player.reputation}</Text>
                          <br />
                          <Text type="secondary">{t('game.last_battle')}: {player.last_battle === '0' ? t('game.never') : new Date(parseInt(player.last_battle) * 1000).toLocaleString()}</Text>
                          <br />
                          <Text type="secondary">{t('game.territories')}: {player.territories_owned?.length || 0}</Text>
                          <br />
                          <Text type="secondary">{t('game.equipment')}: {player.equipment?.length || 0}</Text>
                          <br />
                          <Text type="secondary">
                            {t('game.guild')}: {playerGuild ? (
                              <>
                                {playerGuild.name}
                                {playerGuild.leader === account?.address && (
                                  <Tag color="gold" style={{ marginLeft: 8 }}>👑 {t('guild.leader')}</Tag>
                                )}
                              </>
                            ) : (player.guild_id ? `ID: ${player.guild_id}` : t('game.not_member'))}
                          </Text>
                        </div>
                        
                        <Divider />
                        
                        <Button 
                          type="primary" 
                          icon={<ReloadOutlined />}
                          onClick={collectResources}
                          loading={gameLoading}
                          style={{ marginBottom: 8 }}
                          block
                        >
                          {t('game.collect_resources')}
                        </Button>
                        <Button 
                          type="default" 
                          icon={<StarOutlined />}
                          onClick={levelUp}
                          loading={gameLoading}
                          disabled={parseInt(player.experience) < 1000}
                          block
                          style={{ marginBottom: 8 }}
                        >
                          {t('game.level_up')}
                        </Button>
                        
                        {/* Кнопка для тестирования интерфейса создателя гильдии */}
                        <Button 
                          type="dashed" 
                          icon={<CrownOutlined />}
                          onClick={() => {
                            setTestGuildLeader(!testGuildLeader);
                            message.info(testGuildLeader ? t('common.normal_mode') : t('guild.leader_panel') + ' (' + t('common.test') + ')');
                          }}
                          block
                        >
                          🧪 {testGuildLeader ? t('common.normal_mode') : t('guild.leader_panel')} ({t('common.test')})
                        </Button>
                      </Space>
                    </Card>
                  </div>

                  {/* Правая панель - Табы с системами */}
                  <div style={{ flex: 1 }}>
                    <GameTabs 
                      player={player}
                      territories={territories}
                      guilds={guilds}
                      gameStats={gameStats}
                      gameLoading={gameLoading}
                      account={account}
                      createGuild={createGuild}
                      joinGuild={joinGuild}
                      contributeToGuild={contributeToGuild}
                      attackTerritory={attackTerritory}
                      loadAllData={loadAllData}
                      getTerrainTypeName={getTerrainTypeName}
                      t={t}
                      isGuildLeader={isGuildLeader}
                      playerGuild={playerGuild}
                      onUpdateGuildName={handleUpdateGuildName}
                      onUpdateTaxRate={handleUpdateTaxRate}
                      onKickMember={handleKickMember}
                      onPromoteMember={handlePromoteMember}
                      onDemoteMember={handleDemoteMember}
                      onTransferLeadership={handleTransferLeadership}
                      onPostAnnouncement={handlePostAnnouncement}
                      onCreateEvent={handleCreateEvent}
                      onDeclareWar={handleDeclareWar}
                      onProposeAlliance={handleProposeAlliance}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {console.log('ПОКАЗЫВАЕМ ЭКРАН ОШИБКИ')}
                  <Card className="card-gradient" style={{ textAlign: 'center', marginTop: 100 }}>
                    <Title level={2}>❌ Ошибка загрузки данных</Title>
                    <Text style={{ fontSize: 16, marginBottom: 24, display: 'block' }}>
                      Не удалось загрузить данные игрока. Попробуйте обновить страницу.
                    </Text>
                    <Button 
                      type="primary" 
                      size="large"
                      icon={<ReloadOutlined />}
                      onClick={loadAllData}
                      loading={gameLoading}
                    >
                      Обновить данные
                    </Button>
                  </Card>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 