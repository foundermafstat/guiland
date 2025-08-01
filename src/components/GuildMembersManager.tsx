'use client';

import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Tag, Space, Typography, Avatar, Tooltip, Popconfirm } from 'antd';
import { UserOutlined, CrownOutlined, StarOutlined, DeleteOutlined, UpOutlined, DownOutlined, SwapOutlined, MessageOutlined, TrophyOutlined } from '@ant-design/icons';
import { useLanguage } from './LanguageProvider';

const { Title, Text } = Typography;
const { Option } = Select;

interface GuildMember {
  id: string;
  name: string;
  level: number;
  contribution: number;
  joinDate: string;
  isOfficer: boolean;
  isLeader: boolean;
  lastActive: string;
  rank: string;
  permissions: string[];
}

interface GuildMembersManagerProps {
  members: GuildMember[];
  onKickMember: (memberId: string) => Promise<void>;
  onPromoteMember: (memberId: string) => Promise<void>;
  onDemoteMember: (memberId: string) => Promise<void>;
  onTransferLeadership: (memberId: string) => Promise<void>;
  onSendMessage: (memberId: string, message: string) => Promise<void>;
  onSetPermissions: (memberId: string, permissions: string[]) => Promise<void>;
}

export default function GuildMembersManager({
  members,
  onKickMember,
  onPromoteMember,
  onDemoteMember,
  onTransferLeadership,
  onSendMessage,
  onSetPermissions
}: GuildMembersManagerProps) {
  const { t } = useLanguage();
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(null);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  const [messageForm] = Form.useForm();
  const [permissionsForm] = Form.useForm();

  const handleSendMessage = async (values: { message: string }) => {
    if (!selectedMember) return;
    
    try {
      await onSendMessage(selectedMember.id, values.message);
      message.success(t('guild.message_sent'));
      setMessageModalVisible(false);
      messageForm.resetFields();
      setSelectedMember(null);
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handleSetPermissions = async (values: { permissions: string[] }) => {
    if (!selectedMember) return;
    
    try {
      await onSetPermissions(selectedMember.id, values.permissions);
      message.success(t('guild.permissions_updated'));
      setPermissionsModalVisible(false);
      permissionsForm.resetFields();
      setSelectedMember(null);
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const columns = [
    {
      title: t('guild.member_name'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: GuildMember) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {name}
              {record.isLeader && <CrownOutlined style={{ color: '#faad14', marginLeft: 4 }} />}
              {record.isOfficer && <StarOutlined style={{ color: '#1890ff', marginLeft: 4 }} />}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.rank}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('guild.member_level'),
      dataIndex: 'level',
      key: 'level',
      sorter: (a: GuildMember, b: GuildMember) => a.level - b.level,
      render: (level: number) => (
        <Tag color="blue">Level {level}</Tag>
      ),
    },
    {
      title: t('guild.member_contribution'),
      dataIndex: 'contribution',
      key: 'contribution',
      sorter: (a: GuildMember, b: GuildMember) => a.contribution - b.contribution,
      render: (contribution: number) => (
        <Text strong>{contribution.toLocaleString()} GUI</Text>
      ),
    },
    {
      title: t('guild.member_join_date'),
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('guild.last_active'),
      dataIndex: 'lastActive',
      key: 'lastActive',
      render: (date: string) => {
        const lastActive = new Date(date);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
        
        if (diffHours < 1) {
          return <Tag color="green">{t('guild.online')}</Tag>;
        } else if (diffHours < 24) {
          return <Tag color="orange">{diffHours}h {t('guild.ago')}</Tag>;
        } else {
          return <Tag color="red">{Math.floor(diffHours / 24)}d {t('guild.ago')}</Tag>;
        }
      },
    },
    {
      title: t('guild.actions'),
      key: 'actions',
      render: (record: GuildMember) => (
        <Space>
          <Tooltip title={t('guild.send_message')}>
            <Button
              size="small"
              icon={<MessageOutlined />}
              onClick={() => {
                setSelectedMember(record);
                setMessageModalVisible(true);
              }}
            />
          </Tooltip>
          
          {!record.isLeader && (
            <>
              <Tooltip title={record.isOfficer ? t('guild.demote_member') : t('guild.promote_member')}>
                <Button
                  size="small"
                  icon={record.isOfficer ? <DownOutlined /> : <UpOutlined />}
                  onClick={() => record.isOfficer ? onDemoteMember(record.id) : onPromoteMember(record.id)}
                />
              </Tooltip>
              
              <Tooltip title={t('guild.set_permissions')}>
                <Button
                  size="small"
                  icon={<TrophyOutlined />}
                  onClick={() => {
                    setSelectedMember(record);
                    setPermissionsModalVisible(true);
                    permissionsForm.setFieldsValue({ permissions: record.permissions });
                  }}
                />
              </Tooltip>
              
                               <Tooltip title={t('guild.transfer_leadership')}>
                   <Button
                     size="small"
                     icon={<SwapOutlined />}
                     onClick={() => onTransferLeadership(record.id)}
                   />
                 </Tooltip>
              
              <Popconfirm
                title={t('guild.kick_member_confirm')}
                description={t('guild.kick_member_warning')}
                onConfirm={() => onKickMember(record.id)}
                okText={t('common.confirm')}
                cancelText={t('common.cancel')}
              >
                <Tooltip title={t('guild.kick_member')}>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title={t('guild.members_management')} extra={
        <Space>
          <Text type="secondary">
            {t('guild.total_members')}: {members.length}
          </Text>
          <Text type="secondary">
            {t('guild.officers')}: {members.filter(m => m.isOfficer).length}
          </Text>
        </Space>
      }>
        <Table
          columns={columns}
          dataSource={members}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} ${t('guild.of')} ${total} ${t('guild.members')}`,
          }}
        />
      </Card>

      {/* Модальное окно для отправки сообщения */}
      <Modal
        title={`${t('guild.send_message_to')} ${selectedMember?.name}`}
        open={messageModalVisible}
        onCancel={() => {
          setMessageModalVisible(false);
          setSelectedMember(null);
          messageForm.resetFields();
        }}
        footer={null}
      >
        <Form form={messageForm} onFinish={handleSendMessage}>
          <Form.Item
            name="message"
            label={t('guild.message')}
            rules={[{ required: true, message: t('guild.message') + ' ' + t('common.required') }]}
          >
            <Input.TextArea rows={4} placeholder={t('guild.message_placeholder')} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('guild.send_message')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно для установки разрешений */}
      <Modal
        title={`${t('guild.set_permissions_for')} ${selectedMember?.name}`}
        open={permissionsModalVisible}
        onCancel={() => {
          setPermissionsModalVisible(false);
          setSelectedMember(null);
          permissionsForm.resetFields();
        }}
        footer={null}
      >
        <Form form={permissionsForm} onFinish={handleSetPermissions}>
          <Form.Item
            name="permissions"
            label={t('guild.permissions')}
            rules={[{ required: true, message: t('guild.permissions') + ' ' + t('common.required') }]}
          >
            <Select
              mode="multiple"
              placeholder={t('guild.select_permissions')}
              options={[
                { label: t('guild.can_invite'), value: 'invite' },
                { label: t('guild.can_kick'), value: 'kick' },
                { label: t('guild.can_promote'), value: 'promote' },
                { label: t('guild.can_manage_events'), value: 'events' },
                { label: t('guild.can_declare_war'), value: 'war' },
                { label: t('guild.can_manage_treasury'), value: 'treasury' },
                { label: t('guild.can_view_logs'), value: 'logs' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('guild.update_permissions')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}