'use client';

import { useState } from 'react';
import { Form, Input, Button, message, Space, Typography, Upload } from 'antd';
import { PlusOutlined, WalletOutlined } from '@ant-design/icons';
import { useWallet } from '@/components/WalletProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { AptosClient } from '@aptos-labs/ts-sdk';

const { TextArea } = Input;
const { Text } = Typography;

interface MintFormData {
  name: string;
  description: string;
  uri: string;
}

export function NFTMinter() {
  const { connected, account, signAndSubmitTransaction, network } = useWallet();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const createNFTPayload = async (name: string, description: string, uri: string) => {
    const payload = {
      function: `${account?.address}::guiland_nft::mint_nft`,
      type_arguments: [],
      arguments: [
        name,
        description,
        uri,
        account?.address, // royalty payee
        10000, // royalty denominator
        500, // royalty numerator (5%)
      ]
    };

    return payload;
  };

  const handleMint = async (values: MintFormData) => {
    if (!connected || !account || !signAndSubmitTransaction) {
      message.error(t('nft.connect_first'));
      return;
    }

    setLoading(true);
    try {
      // Создаем payload для транзакции
      const payload = await createNFTPayload(
        values.name,
        values.description,
        values.uri
      );

      // Отправляем транзакцию через кошелек
      const response = await signAndSubmitTransaction(payload);
      
      message.success(`${t('nft.success_created')} ${response.hash}`);
      form.resetFields();
    } catch (error: any) {
      console.error('Ошибка при создании NFT:', error);
      message.error(`${t('nft.error_creating')} ${error.message || t('nft.unknown_error')}`);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <WalletOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
        <Text strong>{t('nft.connect_wallet')}</Text>
      </div>
    );
  }

  return (
    <div>
             <Space direction="vertical" style={{ width: '100%' }}>
         <Text type="secondary">
           {t('nft.wallet')} {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}
         </Text>
         <Text type="secondary">
           {t('nft.network')} {network === 'mainnet' ? t('network.mainnet') : t('network.testnet')}
         </Text>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleMint}
          initialValues={{
            uri: 'https://example.com/metadata.json',
          }}
        >
          <Form.Item
            label={t('nft.name')}
            name="name"
            rules={[{ required: true, message: t('nft.name_required') }]}
          >
            <Input placeholder={t('nft.name_placeholder')} />
          </Form.Item>

          <Form.Item
            label={t('nft.description')}
            name="description"
            rules={[{ required: true, message: t('nft.description_required') }]}
          >
            <TextArea 
              rows={3} 
              placeholder={t('nft.description_placeholder')}
            />
          </Form.Item>

          <Form.Item
            label={t('nft.uri')}
            name="uri"
            rules={[{ required: true, message: t('nft.uri_required') }]}
          >
            <Input placeholder={t('nft.uri_placeholder')} />
          </Form.Item>

          <Form.Item
            label={t('nft.upload_file')}
            name="image"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              onChange={(info) => {
                if (info.file.status === 'done') {
                  // В реальном приложении здесь была бы загрузка на IPFS
                  form.setFieldsValue({ uri: 'https://via.placeholder.com/400x400' });
                }
              }}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>{t('nft.upload')}</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                style={{ width: '100%' }}
                icon={<WalletOutlined />}
              >
                {t('nft.create_via_wallet')}
              </Button>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t('nft.royalty_note')}
              </Text>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </div>
  );
} 