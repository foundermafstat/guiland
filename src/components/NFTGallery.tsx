'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, message, Empty, Spin, Typography, Space, Tag } from 'antd';
import { EyeOutlined, SendOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useWallet } from '@/components/WalletProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { Aptos } from '@aptos-labs/ts-sdk';

const { Text, Title } = Typography;

interface NFT {
  token_id: string;
  name: string;
  description: string;
  uri: string;
  balance: number;
  collection: string;
  owner: string;
}

export function NFTGallery() {
  const { account, connected, signAndSubmitTransaction, network } = useWallet();
  const { t } = useLanguage();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNFTs = async () => {
    if (!connected || !account?.address) return;

    setLoading(true);
    try {
      const urls = {
        mainnet: 'https://fullnode.mainnet.aptoslabs.com',
        testnet: 'https://fullnode.testnet.aptoslabs.com'
      };
      const client = new Aptos(urls[network]);
      
      // Получаем ресурсы аккаунта
      const resources = await client.getAccountResources({ accountAddress: account.address });
      
      // Ищем токены GUILAND
      const tokenResources = resources.filter((resource: any) => 
        resource.type.includes('guiland_nft::GUILANDNFT')
      );

      const fetchedNFTs: NFT[] = [];
      
      for (const resource of tokenResources) {
        try {
          const tokenData = await client.getTokenData({
            tokenDataId: {
              creator: account.address,
              collection: 'guiland_nft',
              name: 'GUILANDNFT',
              propertyVersion: resource.type.split('::').pop() || ''
            }
          });
          
          fetchedNFTs.push({
            token_id: resource.type,
            name: tokenData.name,
            description: tokenData.description,
            uri: tokenData.uri,
            owner: account.address,
            balance: 1,
            collection: 'GUILAND NFT Collection'
          });
        } catch (error) {
          console.error(t('nft.token_data_error'), error);
        }
      }

      // Если нет реальных NFT, показываем примеры
      if (fetchedNFTs.length === 0) {
        const mockNFTs: NFT[] = [
          {
            token_id: 'GUILAND_Castle_1',
            name: 'GUILAND Castle',
            description: t('nft.castle_description'),
            uri: 'https://via.placeholder.com/300x300/667eea/ffffff?text=Castle',
            owner: account.address,
            balance: 1,
            collection: t('nft.collection')
          },
          {
            token_id: 'Dragon_Guardian_1',
            name: 'Dragon Guardian',
            description: t('nft.dragon_description'),
            uri: 'https://via.placeholder.com/300x300/764ba2/ffffff?text=Dragon',
            owner: account.address,
            balance: 1,
            collection: t('nft.collection')
          },
          {
            token_id: 'Magic_Sword_1',
            name: 'Magic Sword',
            description: t('nft.sword_description'),
            uri: 'https://via.placeholder.com/300x300/f093fb/ffffff?text=Sword',
            owner: account.address,
            balance: 1,
            collection: t('nft.collection')
          }
        ];
        
        setNfts(mockNFTs);
      } else {
        setNfts(fetchedNFTs);
      }
    } catch (error) {
      console.error(t('nft.load_error'), error);
      message.error(t('nft.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (nft: NFT) => {
    if (!signAndSubmitTransaction) {
      message.error(t('nft.wallet_no_transactions'));
      return;
    }

    try {
      const payload = {
        function: `${account?.address}::guiland_nft::transfer_nft`,
        type_arguments: [],
        arguments: [
          nft.token_id,
          '0x' + '0'.repeat(64) // recipient address (placeholder)
        ]
      };

      await signAndSubmitTransaction(payload);
      message.success(t('nft.transfer_success'));
      fetchNFTs(); // Обновляем список
    } catch (error: any) {
      message.error(`${t('nft.transfer_error')} ${error.message}`);
    }
  };

  const handleBurn = async (nft: NFT) => {
    if (!signAndSubmitTransaction) {
      message.error(t('nft.wallet_no_transactions'));
      return;
    }

    try {
      const payload = {
        function: `${account?.address}::guiland_nft::burn_nft`,
        type_arguments: [],
        arguments: [nft.token_id]
      };

      await signAndSubmitTransaction(payload);
      message.success(t('nft.burn_success'));
      fetchNFTs(); // Обновляем список
    } catch (error: any) {
      message.error(`${t('nft.burn_error')} ${error.message}`);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, [connected, account?.address]);

  if (!connected) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Empty description={t('nft.connect_to_view')} />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <Text style={{ display: 'block', marginTop: 16 }}>{t('nft.loading')}</Text>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>{t('nft.your_nfts')} ({nfts.length})</Title>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchNFTs}
          loading={loading}
        >
          {t('nft.refresh')}
        </Button>
      </div>
      
             {nfts.length === 0 ? (
         <Empty description={t('nft.no_nfts_yet')} />
       ) : (
        <Row gutter={[16, 16]}>
          {nfts.map((nft) => (
            <Col xs={24} sm={12} md={8} lg={6} key={nft.token_id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={nft.name}
                    src={nft.uri}
                    style={{ height: 200, objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x300/667eea/ffffff?text=NFT';
                    }}
                  />
                }
                                 actions={[
                   <Button key="view" type="text" icon={<EyeOutlined />}>
                     {t('nft.view')}
                   </Button>,
                   <Button 
                     key="transfer" 
                     type="text" 
                     icon={<SendOutlined />}
                     onClick={() => handleTransfer(nft)}
                   >
                     {t('nft.transfer')}
                   </Button>,
                   <Button 
                     key="burn" 
                     type="text" 
                     danger
                     icon={<DeleteOutlined />}
                     onClick={() => handleBurn(nft)}
                   >
                     {t('nft.burn')}
                   </Button>
                 ]}
              >
                <Card.Meta
                  title={nft.name}
                  description={
                    <div>
                      <Text type="secondary">{nft.description}</Text>
                      <div style={{ marginTop: 8 }}>
                                                 <Space direction="vertical" size="small">
                           <Tag color="blue">{t('nft.token_id')} {nft.token_id.slice(-4)}</Tag>
                           <Tag color="green">{nft.collection}</Tag>
                           <Tag color="orange">{t('nft.quantity')} {nft.balance}</Tag>
                         </Space>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
} 