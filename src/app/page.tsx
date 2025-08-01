'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Card, Row, Col, Space, Divider, Tag, Statistic, Carousel, Avatar, List, message } from 'antd';
import { 
  WalletOutlined, 
  TrophyOutlined, 
  FireOutlined, 
  StarOutlined, 
  CrownOutlined,
  UserOutlined,
  RocketOutlined,
  SafetyOutlined,
  TeamOutlined,
  GlobalOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useWallet } from '@/components/WalletProvider';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import AppLayout from '@/components/AppLayout';
import HeroSwiper from '@/components/HeroSwiper';

const { Title, Text, Paragraph } = Typography;

export default function HomePage() {
  const router = useRouter();
  const { connected, account } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const features = [
    {
      icon: '🎨',
      title: t('landing.feature_nft_creation'),
      description: t('landing.feature_nft_desc')
    },
    {
      icon: '⚔️',
      title: t('landing.feature_battles'),
      description: t('landing.feature_battles_desc')
    },
    {
      icon: '🏆',
      title: t('landing.feature_achievements'),
      description: t('landing.feature_achievements_desc')
    },
    {
      icon: '💰',
      title: t('landing.feature_economy'),
      description: t('landing.feature_economy_desc')
    }
  ];

  const gameMechanics = [
    {
      title: t('landing.mechanic_levels'),
      description: t('landing.mechanic_levels_desc'),
      icon: '📈'
    },
    {
      title: t('landing.mechanic_rating'),
      description: t('landing.mechanic_rating_desc'),
      icon: '🏅'
    },
    {
      title: t('landing.mechanic_collections'),
      description: t('landing.mechanic_collections_desc'),
      icon: '📦'
    },
    {
      title: t('landing.mechanic_pvp'),
      description: t('landing.mechanic_pvp_desc'),
      icon: '⚔️'
    }
  ];

  const stats = [
    { number: '10,000+', label: t('landing.stats_players'), icon: '👥' },
    { number: '50,000+', label: t('landing.stats_nfts'), icon: '🎨' },
    { number: '100,000+', label: t('landing.stats_battles'), icon: '⚔️' },
    { number: '1,000+', label: t('landing.stats_collections'), icon: '📦' }
  ];

  return (
    <AppLayout>
      {/* Hero Section с Swiper слайдером */}
      <HeroSwiper />

      {/* Статистика */}
      <div style={{ 
        background: 'var(--bg-primary)', 
        padding: '80px 0'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Row gutter={[48, 48]} justify="center">
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {stat.icon}
                  </div>
                  <Statistic
                    title={stat.label}
                    value={stat.number}
                    valueStyle={{ 
                      color: 'var(--text-primary)',
                      fontSize: '2.5rem',
                      fontWeight: 'bold'
                    }}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Особенности */}
      <div style={{ 
        background: 'var(--bg-secondary)', 
        padding: '80px 0'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Title level={2} style={{ marginBottom: '1rem' }}>
              {t('landing.features_title')}
            </Title>
            <Paragraph style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
              {t('landing.features_subtitle')}
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card 
                  className="card-gradient"
                  style={{ 
                    textAlign: 'center',
                    height: '100%'
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {feature.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: '1rem' }}>
                    {feature.title}
                  </Title>
                  <Text type="secondary">
                    {feature.description}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Игровые механики */}
      <div style={{ 
        background: 'var(--bg-primary)', 
        padding: '80px 0'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Title level={2} style={{ marginBottom: '1rem' }}>
              {t('landing.mechanics_title')}
            </Title>
            <Paragraph style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
              {t('landing.mechanics_subtitle')}
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            {gameMechanics.map((mechanic, index) => (
              <Col xs={24} md={12} key={index}>
                <Card 
                  className="card-gradient"
                  style={{ 
                    height: '100%'
                  }}
                >
                  <Row gutter={[16, 16]} align="middle">
                    <Col span={4}>
                      <div style={{ fontSize: '2.5rem' }}>
                        {mechanic.icon}
                      </div>
                    </Col>
                    <Col span={20}>
                      <Title level={4} style={{ marginBottom: '0.5rem' }}>
                        {mechanic.title}
                      </Title>
                      <Text type="secondary">
                        {mechanic.description}
                      </Text>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 0',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <Title level={2} style={{ color: 'white', marginBottom: '1rem' }}>
            {t('landing.ready_adventure')}
          </Title>
          <Paragraph style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.9)' }}>
            {t('landing.join_revolution')}
          </Paragraph>
          <Space size="large">
            <Button 
              type="primary" 
              size="large" 
              icon={<PlayCircleOutlined />}
              onClick={() => router.push('/game')}
              style={{ 
                height: '50px', 
                fontSize: '1.1rem',
                background: 'white',
                color: '#667eea',
                border: 'none',
                boxShadow: '0 8px 32px rgba(255, 255, 255, 0.3)'
              }}
            >
              {t('landing.start_game')}
            </Button>
            <Button 
              type="default" 
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => router.push('/landing')}
              style={{ 
                height: '50px', 
                fontSize: '1.1rem',
                color: 'white',
                border: '2px solid white',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {t('landing.learn_more')}
            </Button>
          </Space>
        </div>
      </div>
    </AppLayout>
  );
} 