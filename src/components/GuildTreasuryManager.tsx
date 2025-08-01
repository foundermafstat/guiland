'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Button, Modal, Form, Input, Select, message, Table, Tag, Space, Typography, Progress, Divider } from 'antd';
import { DollarOutlined, StarOutlined, ThunderboltOutlined, CrownOutlined, SendOutlined, HistoryOutlined, PieChartOutlined } from '@ant-design/icons';
import { useLanguage } from './LanguageProvider';

const { Title, Text } = Typography;
const { Option } = Select;

interface TreasuryTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'distribution' | 'tax';
  amount: number;
  currency: string;
  from: string;
  to: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

interface GuildTreasuryManagerProps {
  treasury: {
    gui_tokens: string;
    treats: string;
    crystals: string;
    loyalty_points: string;
  };
  transactions: TreasuryTransaction[];
  onDistributeResources: (memberId: string, amount: number, currency: string) => Promise<void>;
  onWithdrawResources: (amount: number, currency: string, reason: string) => Promise<void>;
  onSetTaxRate: (rate: number) => Promise<void>;
  onViewTransactionHistory: () => void;
}

export default function GuildTreasuryManager({
  treasury,
  transactions,
  onDistributeResources,
  onWithdrawResources,
  onSetTaxRate,
  onViewTransactionHistory
}: GuildTreasuryManagerProps) {
  const { t } = useLanguage();
  const [distributeModalVisible, setDistributeModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [taxModalVisible, setTaxModalVisible] = useState(false);
  const [distributeForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();
  const [taxForm] = Form.useForm();

  const handleDistributeResources = async (values: any) => {
    try {
      await onDistributeResources(values.memberId, values.amount, values.currency);
      message.success(t('guild.resources_distributed'));
      setDistributeModalVisible(false);
      distributeForm.resetFields();
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handleWithdrawResources = async (values: any) => {
    try {
      await onWithdrawResources(values.amount, values.currency, values.reason);
      message.success(t('guild.resources_withdrawn'));
      setWithdrawModalVisible(false);
      withdrawForm.resetFields();
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handleSetTaxRate = async (values: any) => {
    try {
      await onSetTaxRate(values.taxRate);
      message.success(t('guild.tax_rate_updated'));
      setTaxModalVisible(false);
      taxForm.resetFields();
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const transactionColumns = [
    {
      title: t('guild.transaction_type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeConfig = {
          deposit: { color: 'green', text: t('guild.deposit') },
          withdrawal: { color: 'red', text: t('guild.withdrawal') },
          distribution: { color: 'blue', text: t('guild.distribution') },
          tax: { color: 'orange', text: t('guild.tax') },
        };
        const config = typeConfig[type as keyof typeof typeConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: t('guild.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: TreasuryTransaction) => (
        <Text strong>
          {amount.toLocaleString()} {record.currency}
        </Text>
      ),
    },
    {
      title: t('guild.from'),
      dataIndex: 'from',
      key: 'from',
      render: (from: string) => <Text code>{from}</Text>,
    },
    {
      title: t('guild.to'),
      dataIndex: 'to',
      key: 'to',
      render: (to: string) => <Text code>{to}</Text>,
    },
    {
      title: t('guild.description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('guild.timestamp'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
    {
      title: t('guild.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'orange', text: t('guild.pending') },
          completed: { color: 'green', text: t('guild.completed') },
          failed: { color: 'red', text: t('guild.failed') },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Card title={t('guild.treasury_management')} extra={
        <Space>
          <Button 
            icon={<SendOutlined />} 
            onClick={() => setDistributeModalVisible(true)}
          >
            {t('guild.distribute_resources')}
          </Button>
          <Button 
            icon={<HistoryOutlined />} 
            onClick={onViewTransactionHistory}
          >
            {t('guild.transaction_history')}
          </Button>
        </Space>
      }>
        {/* Статистика казны */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} md={6}>
            <Statistic 
              title={t('game.gui_tokens')} 
              value={parseInt(treasury.gui_tokens)} 
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic 
              title={t('game.treats')} 
              value={parseInt(treasury.treats)} 
              prefix={<StarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic 
              title={t('game.crystals')} 
              value={parseInt(treasury.crystals)} 
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic 
              title={t('game.loyalty_points')} 
              value={parseInt(treasury.loyalty_points)} 
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
        </Row>

        <Divider />

        {/* График распределения ресурсов */}
        <Card title={t('guild.resource_distribution')} size="small">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text>{t('game.gui_tokens')}</Text>
                <Progress 
                  percent={Math.min(100, (parseInt(treasury.gui_tokens) / 10000) * 100)} 
                  strokeColor="#3f8600"
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text>{t('game.treats')}</Text>
                <Progress 
                  percent={Math.min(100, (parseInt(treasury.treats) / 5000) * 100)} 
                  strokeColor="#1890ff"
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text>{t('game.crystals')}</Text>
                <Progress 
                  percent={Math.min(100, (parseInt(treasury.crystals) / 1000) * 100)} 
                  strokeColor="#722ed1"
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Text>{t('game.loyalty_points')}</Text>
                <Progress 
                  percent={Math.min(100, (parseInt(treasury.loyalty_points) / 10000) * 100)} 
                  strokeColor="#faad14"
                />
              </div>
            </Col>
          </Row>
        </Card>

        <Divider />

        {/* Последние транзакции */}
        <Card title={t('guild.recent_transactions')} size="small">
          <Table
            columns={transactionColumns}
            dataSource={transactions.slice(0, 5)}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      </Card>

      {/* Модальное окно для распределения ресурсов */}
      <Modal
        title={t('guild.distribute_resources')}
        open={distributeModalVisible}
        onCancel={() => {
          setDistributeModalVisible(false);
          distributeForm.resetFields();
        }}
        footer={null}
      >
        <Form form={distributeForm} onFinish={handleDistributeResources}>
          <Form.Item
            name="memberId"
            label={t('guild.select_member')}
            rules={[{ required: true, message: t('guild.select_member') + ' ' + t('common.required') }]}
          >
            <Select placeholder={t('guild.select_member')}>
              <Option value="member1">Player 1</Option>
              <Option value="member2">Player 2</Option>
              <Option value="member3">Player 3</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="currency"
            label={t('guild.currency')}
            rules={[{ required: true, message: t('guild.currency') + ' ' + t('common.required') }]}
          >
            <Select placeholder={t('guild.select_currency')}>
              <Option value="gui_tokens">{t('game.gui_tokens')}</Option>
              <Option value="treats">{t('game.treats')}</Option>
              <Option value="crystals">{t('game.crystals')}</Option>
              <Option value="loyalty_points">{t('game.loyalty_points')}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label={t('guild.amount')}
            rules={[{ required: true, message: t('guild.amount') + ' ' + t('common.required') }]}
          >
            <Input type="number" min="1" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('guild.distribute')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно для вывода ресурсов */}
      <Modal
        title={t('guild.withdraw_resources')}
        open={withdrawModalVisible}
        onCancel={() => {
          setWithdrawModalVisible(false);
          withdrawForm.resetFields();
        }}
        footer={null}
      >
        <Form form={withdrawForm} onFinish={handleWithdrawResources}>
          <Form.Item
            name="currency"
            label={t('guild.currency')}
            rules={[{ required: true, message: t('guild.currency') + ' ' + t('common.required') }]}
          >
            <Select placeholder={t('guild.select_currency')}>
              <Option value="gui_tokens">{t('game.gui_tokens')}</Option>
              <Option value="treats">{t('game.treats')}</Option>
              <Option value="crystals">{t('game.crystals')}</Option>
              <Option value="loyalty_points">{t('game.loyalty_points')}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label={t('guild.amount')}
            rules={[{ required: true, message: t('guild.amount') + ' ' + t('common.required') }]}
          >
            <Input type="number" min="1" />
          </Form.Item>
          <Form.Item
            name="reason"
            label={t('guild.reason')}
            rules={[{ required: true, message: t('guild.reason') + ' ' + t('common.required') }]}
          >
            <Input.TextArea rows={3} placeholder={t('guild.withdrawal_reason')} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('guild.withdraw')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно для установки налоговой ставки */}
      <Modal
        title={t('guild.set_tax_rate')}
        open={taxModalVisible}
        onCancel={() => {
          setTaxModalVisible(false);
          taxForm.resetFields();
        }}
        footer={null}
      >
        <Form form={taxForm} onFinish={handleSetTaxRate}>
          <Form.Item
            name="taxRate"
            label={t('guild.tax_rate_percentage')}
            rules={[{ required: true, message: t('guild.tax_rate_percentage') + ' ' + t('common.required') }]}
          >
            <Input type="number" min="0" max="100" suffix="%" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('guild.update_tax_rate')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 