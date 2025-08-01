'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, Button, Select, Space, Typography, Divider, Row, Col, Slider, InputNumber, message } from 'antd';
import { DownloadOutlined, UndoOutlined, RedoOutlined, ClearOutlined, SaveOutlined } from '@ant-design/icons';
import { useLanguage } from '@/components/LanguageProvider';
import AppLayout from '@/components/AppLayout';

const { Title, Text } = Typography;
const { Option } = Select;

interface SceneObject {
  id: string;
  type: 'texture' | 'sprite';
  x: number;
  y: number;
  width: number;
  height: number;
  spriteName?: string;
  textureName?: string;
}

export default function SceneGeneratorPage() {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([]);
  const [selectedTexture, setSelectedTexture] = useState<string>('grass_tile');
  const [selectedSprite, setSelectedSprite] = useState<string>('house_farm_small');
  const [brushSize, setBrushSize] = useState<number>(32);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawMode, setDrawMode] = useState<'texture' | 'sprite'>('texture');
  const [waterMode, setWaterMode] = useState<boolean>(false);

  const textures = [
    { name: 'grass_tile', label: t('scene.grass'), color: '#90EE90' },
    { name: 'dirt_tile', label: t('scene.dirt'), color: '#8B4513' },
    { name: 'water_tile', label: t('scene.water'), color: '#4682B4' },
    { name: 'stone_floor', label: t('scene.stone'), color: '#696969' },
  ];

  const sprites = [
    { name: 'house_farm_small', label: t('scene.small_house'), category: 'architecture' },
    { name: 'house_farm_large', label: t('scene.large_house'), category: 'architecture' },
    { name: 'windmill', label: t('scene.windmill'), category: 'architecture' },
    { name: 'well', label: t('scene.well'), category: 'architecture' },
    { name: 'tree_oak_large', label: t('scene.oak_tree'), category: 'vegetation' },
    { name: 'tree_pine_tall', label: t('scene.pine_tree'), category: 'vegetation' },
    { name: 'crop_ready', label: t('scene.crop'), category: 'vegetation' },
    { name: 'campfire_lit', label: t('scene.campfire'), category: 'objects' },
    { name: 'barrel_wood', label: t('scene.barrel'), category: 'objects' },
  ];

  const canvasWidth = 1024;
  const canvasHeight = 1024;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем канвас
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Рисуем все объекты
    sceneObjects.forEach(obj => {
      if (obj.type === 'texture') {
        drawTexture(ctx, obj);
      } else {
        drawSprite(ctx, obj);
      }
    });
  }, [sceneObjects]);

  const drawTexture = (ctx: CanvasRenderingContext2D, obj: SceneObject) => {
    const texture = textures.find(t => t.name === obj.textureName);
    if (!texture) return;

    // Создаем паттерн текстуры
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 32;
    patternCanvas.height = 32;
    const patternCtx = patternCanvas.getContext('2d');
    if (!patternCtx) return;

    // Рисуем базовый цвет
    patternCtx.fillStyle = texture.color;
    patternCtx.fillRect(0, 0, 32, 32);

    // Добавляем вариации для травы
    if (texture.name === 'grass_tile') {
      patternCtx.fillStyle = '#228B22';
      for (let i = 0; i < 8; i++) {
        patternCtx.fillRect(i * 4, 28, 1, 4);
      }
      // Добавляем дополнительные травинки
      patternCtx.fillStyle = '#32CD32';
      for (let i = 0; i < 4; i++) {
        patternCtx.fillRect(i * 8 + 2, 26, 1, 3);
      }
    }

    // Добавляем вариации для воды
    if (texture.name === 'water_tile') {
      patternCtx.fillStyle = '#87CEEB';
      patternCtx.beginPath();
      patternCtx.moveTo(2, 8);
      patternCtx.quadraticCurveTo(8, 6, 16, 8);
      patternCtx.quadraticCurveTo(24, 10, 30, 8);
      patternCtx.stroke();
      
      // Добавляем дополнительные волны
      patternCtx.beginPath();
      patternCtx.moveTo(4, 16);
      patternCtx.quadraticCurveTo(12, 14, 20, 16);
      patternCtx.quadraticCurveTo(28, 18, 30, 16);
      patternCtx.stroke();
      
      // Добавляем блики
      patternCtx.fillStyle = '#FFFFFF';
      patternCtx.globalAlpha = 0.3;
      patternCtx.fillRect(6, 6, 2, 2);
      patternCtx.fillRect(20, 10, 1, 1);
      patternCtx.globalAlpha = 1;
    }

    // Добавляем вариации для земли
    if (texture.name === 'dirt_tile') {
      patternCtx.fillStyle = '#654321';
      for (let i = 0; i < 6; i++) {
        patternCtx.fillRect(i * 5 + 2, i * 5 + 2, 1, 1);
      }
    }

    // Добавляем вариации для камня
    if (texture.name === 'stone_floor') {
      patternCtx.fillStyle = '#556B2F';
      patternCtx.fillRect(0, 0, 16, 16);
      patternCtx.fillRect(16, 16, 16, 16);
      patternCtx.fillStyle = '#A9A9A9';
      patternCtx.fillRect(16, 0, 16, 16);
      patternCtx.fillRect(0, 16, 16, 16);
    }

    // Создаем паттерн
    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
  };

  const drawSprite = async (ctx: CanvasRenderingContext2D, obj: SceneObject) => {
    const sprite = sprites.find(s => s.name === obj.spriteName);
    if (!sprite) return;

    try {
      const img = new Image();
      img.src = `/sprites/${sprite.name}.svg`;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
    } catch (error) {
      console.error('Ошибка загрузки спрайта:', error);
      // Рисуем заглушку
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (drawMode === 'texture') {
      addTexture(x, y);
    } else {
      addSprite(x, y);
    }
  };

  const addTexture = (x: number, y: number) => {
    const newObject: SceneObject = {
      id: Date.now().toString(),
      type: 'texture',
      x: Math.floor(x / brushSize) * brushSize,
      y: Math.floor(y / brushSize) * brushSize,
      width: brushSize,
      height: brushSize,
      textureName: selectedTexture,
    };

    setSceneObjects(prev => [...prev, newObject]);
  };

  const addSprite = (x: number, y: number) => {
    const newObject: SceneObject = {
      id: Date.now().toString(),
      type: 'sprite',
      x: x - 32, // Центрируем спрайт
      y: y - 32,
      width: 64,
      height: 64,
      spriteName: selectedSprite,
    };

    setSceneObjects(prev => [...prev, newObject]);
  };

  const handleMouseDown = () => {
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && drawMode === 'texture') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      addTexture(x, y);
    }
  };

  const clearCanvas = () => {
    setSceneObjects([]);
  };

  const undo = () => {
    setSceneObjects(prev => prev.slice(0, -1));
  };

  const downloadScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'guiland-scene.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const createWaterBody = () => {
    if (!waterMode) return;

    // Создаем озеро или реку
    const waterObjects: SceneObject[] = [];
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Создаем озеро (овальная форма)
    for (let x = centerX - 250; x < centerX + 250; x += 32) {
      for (let y = centerY - 180; y < centerY + 180; y += 32) {
        const distanceX = Math.abs(x - centerX);
        const distanceY = Math.abs(y - centerY);
        const normalizedDistance = Math.sqrt((distanceX / 250) ** 2 + (distanceY / 180) ** 2);
        
        if (normalizedDistance < 1) {
          waterObjects.push({
            id: `water_${x}_${y}`,
            type: 'texture',
            x,
            y,
            width: 32,
            height: 32,
            textureName: 'water_tile',
          });
        }
      }
    }

    setSceneObjects(prev => [...prev, ...waterObjects]);
  };

  const createRiver = () => {
    if (!waterMode) return;

    const waterObjects: SceneObject[] = [];
    
    // Создаем извилистую реку
    for (let x = 0; x < canvasWidth; x += 32) {
      const riverY = canvasHeight / 2 + Math.sin(x / 100) * 100;
      
      for (let y = riverY - 64; y < riverY + 64; y += 32) {
        if (y >= 0 && y < canvasHeight) {
          waterObjects.push({
            id: `river_${x}_${y}`,
            type: 'texture',
            x,
            y,
            width: 32,
            height: 32,
            textureName: 'water_tile',
          });
        }
      }
    }

    setSceneObjects(prev => [...prev, ...waterObjects]);
  };

  useEffect(() => {
    if (waterMode) {
      // Создаем случайно озеро или реку
      if (Math.random() > 0.5) {
        createWaterBody();
      } else {
        createRiver();
      }
    }
  }, [waterMode]);

  return (
    <AppLayout>
      <div style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
                 <div style={{ maxWidth: 1200, margin: '0 auto' }}>
           <Title level={2} style={{ fontFamily: 'var(--font-family)', fontWeight: 700 }}>
             🎨 {t('scene.generator_title')}
           </Title>
           <Text type="secondary" style={{ fontFamily: 'var(--font-family)', fontSize: '1.1em' }}>
             {t('scene.generator_description')}
           </Text>

          <Row gutter={24} style={{ marginTop: 24 }}>
            <Col span={16}>
              <Card title={t('scene.canvas')} style={{ marginBottom: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    style={{
                      border: '2px solid #d9d9d9',
                      borderRadius: '8px',
                      cursor: 'crosshair',
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                    onClick={handleCanvasClick}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                  />
                </div>
              </Card>
            </Col>

            <Col span={8}>
              <Card title={t('scene.controls')} style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  {/* Режим рисования */}
                                     <div>
                     <Text strong style={{ fontFamily: 'var(--font-family)', fontWeight: 600 }}>
                       {t('scene.draw_mode')}:
                     </Text>
                     <Select
                       value={drawMode}
                       onChange={setDrawMode}
                       style={{ width: '100%', marginTop: 8 }}
                     >
                       <Option value="texture">{t('scene.texture_mode')}</Option>
                       <Option value="sprite">{t('scene.sprite_mode')}</Option>
                     </Select>
                   </div>

                  {/* Выбор текстуры */}
                  {drawMode === 'texture' && (
                    <div>
                      <Text strong>{t('scene.select_texture')}:</Text>
                      <Select
                        value={selectedTexture}
                        onChange={setSelectedTexture}
                        style={{ width: '100%', marginTop: 8 }}
                      >
                        {textures.map(texture => (
                          <Option key={texture.name} value={texture.name}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ 
                                width: 16, 
                                height: 16, 
                                backgroundColor: texture.color, 
                                border: '1px solid #d9d9d9' 
                              }} />
                              {texture.label}
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  )}

                  {/* Выбор спрайта */}
                  {drawMode === 'sprite' && (
                    <div>
                      <Text strong>{t('scene.select_sprite')}:</Text>
                      <Select
                        value={selectedSprite}
                        onChange={setSelectedSprite}
                        style={{ width: '100%', marginTop: 8 }}
                      >
                        {sprites.map(sprite => (
                          <Option key={sprite.name} value={sprite.name}>
                            {sprite.label}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  )}

                  {/* Размер кисти */}
                  <div>
                    <Text strong>{t('scene.brush_size')}:</Text>
                    <Slider
                      min={16}
                      max={64}
                      step={16}
                      value={brushSize}
                      onChange={setBrushSize}
                      style={{ marginTop: 8 }}
                    />
                    <InputNumber
                      value={brushSize}
                      onChange={setBrushSize}
                      min={16}
                      max={64}
                      style={{ width: '100%', marginTop: 8 }}
                    />
                  </div>

                  {/* Водный режим */}
                  <div>
                    <Text strong>{t('scene.water_mode')}:</Text>
                    <Button
                      type={waterMode ? 'primary' : 'default'}
                      onClick={() => setWaterMode(!waterMode)}
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      {waterMode ? t('scene.disable_water') : t('scene.create_water')}
                    </Button>
                  </div>

                  <Divider />

                  {/* Кнопки управления */}
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button icon={<UndoOutlined />} onClick={undo} block>
                      {t('scene.undo')}
                    </Button>
                    <Button icon={<ClearOutlined />} onClick={clearCanvas} danger block>
                      {t('scene.clear')}
                    </Button>
                    <Button icon={<DownloadOutlined />} onClick={downloadScene} type="primary" block>
                      {t('scene.download')}
                    </Button>
                  </Space>
                </Space>
              </Card>

              <Card title={t('scene.info')}>
                <Text type="secondary">
                  {t('scene.info_text')}
                </Text>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </AppLayout>
  );
} 