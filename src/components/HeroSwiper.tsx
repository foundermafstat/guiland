'use client';

import { useEffect, useRef, useState } from 'react';
import { Typography, Button, Space } from 'antd';
import { 
  PlayCircleOutlined, 
  WalletOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/WalletProvider';
import { useLanguage } from '@/components/LanguageProvider';

const { Title, Paragraph } = Typography;

interface SlideData {
  id: number;
  backgroundImage: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaIcon: React.ReactNode;
  overlayColor: string;
  parallaxElements: Array<{
    icon: string;
    position: { top?: string; left?: string; right?: string; bottom?: string };
    speed: number;
    size: string;
  }>;
}

export default function HeroSwiper() {
  const router = useRouter();
  const { connected } = useWallet();
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const slides: SlideData[] = [
    {
      id: 1,
      backgroundImage: '',
      title: '🏰 GUILAND',
      subtitle: t('landing.hero_subtitle'),
      description: t('landing.hero_description'),
      ctaText: t('landing.start_game'),
      ctaIcon: <PlayCircleOutlined />,
      overlayColor: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
      parallaxElements: [
        { icon: '🏰', position: { top: '20%', left: '10%' }, speed: 0.2, size: '3rem' },
        { icon: '⚔️', position: { top: '60%', right: '15%' }, speed: -0.1, size: '2rem' },
        { icon: '🐉', position: { bottom: '20%', left: '20%' }, speed: 0.15, size: '2.5rem' }
      ]
    },
    {
      id: 2,
      backgroundImage: '',
      title: '⚔️ ' + t('landing.battles_title'),
      subtitle: t('landing.battles_subtitle'),
      description: t('landing.battles_description'),
      ctaText: t('landing.start_battle'),
      ctaIcon: <ArrowRightOutlined />,
      overlayColor: 'linear-gradient(135deg, rgba(255, 107, 107, 0.9) 0%, rgba(255, 193, 7, 0.9) 100%)',
      parallaxElements: [
        { icon: '⚔️', position: { top: '15%', left: '15%' }, speed: 0.3, size: '4rem' },
        { icon: '🛡️', position: { top: '70%', right: '10%' }, speed: -0.2, size: '3rem' },
        { icon: '🔥', position: { bottom: '25%', left: '25%' }, speed: 0.25, size: '3.5rem' }
      ]
    },
    {
      id: 3,
      backgroundImage: '',
      title: '🎨 ' + t('landing.nft_title'),
      subtitle: t('landing.nft_subtitle'),
      description: t('landing.nft_description'),
      ctaText: t('landing.create_nft'),
      ctaIcon: <ArrowRightOutlined />,
      overlayColor: 'linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(33, 150, 243, 0.9) 100%)',
      parallaxElements: [
        { icon: '🎨', position: { top: '25%', left: '20%' }, speed: 0.15, size: '3.5rem' },
        { icon: '💎', position: { top: '65%', right: '20%' }, speed: -0.1, size: '2.5rem' },
        { icon: '🌟', position: { bottom: '30%', left: '15%' }, speed: 0.2, size: '3rem' }
      ]
    },
    {
      id: 4,
      backgroundImage: '',
      title: '🏆 ' + t('landing.achievements_title'),
      subtitle: t('landing.achievements_subtitle'),
      description: t('landing.achievements_description'),
      ctaText: t('landing.view_rating'),
      ctaIcon: <ArrowRightOutlined />,
      overlayColor: 'linear-gradient(135deg, rgba(156, 39, 176, 0.9) 0%, rgba(233, 30, 99, 0.9) 100%)',
      parallaxElements: [
        { icon: '🏆', position: { top: '20%', left: '25%' }, speed: 0.25, size: '4rem' },
        { icon: '👑', position: { top: '70%', right: '15%' }, speed: -0.15, size: '3rem' },
        { icon: '⭐', position: { bottom: '20%', left: '30%' }, speed: 0.3, size: '3.5rem' }
      ]
    }
  ];

  // Автоматическое переключение слайдов
  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isClient, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (!isClient) {
    return (
      <div style={{ 
        height: 'calc(100vh - 64px)', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div style={{ height: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden' }}>
             {/* Текущий слайд */}
       <div
         style={{
           height: '100%',
           background: currentSlideData.overlayColor,
           position: 'relative',
           transition: 'all 0.5s ease-in-out'
         }}
       >
        {/* Параллакс элементы */}
        {currentSlideData.parallaxElements.map((element, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: element.position.top,
              left: element.position.left,
              right: element.position.right,
              bottom: element.position.bottom,
              fontSize: element.size,
              opacity: 0.3,
              zIndex: 1,
              pointerEvents: 'none',
              animation: `float ${3 + index}s ease-in-out infinite`
            }}
          >
            {element.icon}
          </div>
        ))}

                 {/* Контент слайда */}
         <div
           style={{
             position: 'absolute',
             top: '50%',
             left: '50%',
             transform: 'translate(-50%, -50%)',
             textAlign: 'center',
             color: 'white',
             zIndex: 2,
             width: '100%',
             padding: '0 24px',
             animation: 'slideIn 0.8s ease-out'
           }}
         >
           <Title
             level={1}
             style={{
               color: 'white',
               fontSize: '4rem',
               marginBottom: '1rem',
               textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
               animation: 'fadeInUp 0.8s ease-out'
             }}
           >
             {currentSlideData.title}
           </Title>
           
           <Title
             level={2}
             style={{
               color: 'white',
               fontSize: '2rem',
               marginBottom: '2rem',
               fontWeight: 300,
               textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
               animation: 'fadeInUp 0.8s ease-out 0.2s both'
             }}
           >
             {currentSlideData.subtitle}
           </Title>
           
           <Paragraph
             style={{
               fontSize: '1.2rem',
               marginBottom: '2rem',
               maxWidth: '600px',
               margin: '0 auto 2rem',
               color: 'white',
               textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
               animation: 'fadeInUp 0.8s ease-out 0.4s both'
             }}
           >
             {currentSlideData.description}
           </Paragraph>
          
          <Space
            size="large"
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.6s both'
            }}
          >
            <Button
              type="primary"
              size="large"
              icon={currentSlideData.ctaIcon}
              onClick={() => router.push('/game')}
              style={{
                height: '50px',
                fontSize: '1.1rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid white',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              {currentSlideData.ctaText}
            </Button>
            
            {connected && currentSlideData.id === 1 && (
              <Button
                type="default"
                size="large"
                icon={<WalletOutlined />}
                style={{
                  height: '50px',
                  fontSize: '1.1rem',
                  color: 'white',
                  border: '2px solid white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {t('landing.connect_wallet')}
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Кнопки навигации */}
      <div
        className="swiper-button-prev"
        onClick={prevSlide}
        style={{
          position: 'absolute',
          top: '50%',
          left: '20px',
          transform: 'translateY(-50%)',
          color: 'white',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 3,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <ArrowLeftOutlined />
      </div>
      
      <div
        className="swiper-button-next"
        onClick={nextSlide}
        style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          color: 'white',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 3,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <ArrowRightOutlined />
      </div>

      {/* Пагинация */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 3
        }}
      >
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: index === currentSlide ? 'white' : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: index === currentSlide ? 'scale(1.2)' : 'scale(1)'
            }}
          />
        ))}
      </div>

             {/* CSS анимации */}
       <style jsx>{`
         @keyframes fadeInUp {
           from {
             opacity: 0;
             transform: translateY(30px);
           }
           to {
             opacity: 1;
             transform: translateY(0);
           }
         }
         
         @keyframes slideIn {
           from {
             opacity: 0;
             transform: translate(-50%, -50%) translateX(-50px);
           }
           to {
             opacity: 1;
             transform: translate(-50%, -50%) translateX(0);
           }
         }
         
         @keyframes float {
           0%, 100% {
             transform: translateY(0px);
           }
           50% {
             transform: translateY(-10px);
           }
         }
       `}</style>
    </div>
  );
} 