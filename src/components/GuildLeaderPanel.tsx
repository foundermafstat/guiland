'use client';

import React, { useState } from 'react';
import { Card, Typography, Tabs, Button, Input, Form, message, Statistic, List, Avatar, Space, Divider, Tag, Modal, Select, DatePicker } from 'antd';
import { CrownOutlined, TeamOutlined, SettingOutlined, TrophyOutlined, BellOutlined, CalendarOutlined, ThunderboltOutlined, HeartOutlined, BarChartOutlined, UserOutlined, DeleteOutlined, UpOutlined, DownOutlined, SwapOutlined, DollarOutlined } from '@ant-design/icons';
import { useLanguage } from './LanguageProvider';
import GuildMembersManager from './GuildMembersManager';
import GuildTreasuryManager from './GuildTreasuryManager';
import GuildEventsManager from './GuildEventsManager';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface GuildMember {
  id: string;
  name: string;
  level: number;
  contribution: number;
  joinDate: string;
  isOfficer: boolean;
}

interface GuildEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  reward: string;
  participants: number;
}

interface GuildActivity {
  id: string;
  type: 'member_joined' | 'member_left' | 'contribution' | 'territory_captured' | 'battle_won';
  description: string;
  timestamp: string;
  member?: string;
}

interface GuildLeaderPanelProps {
  guildData: {
    id: string;
    name: string;
    level: number;
    memberCount: number;
    treasury: {
      gui_tokens: string;
      treats: string;
      crystals: string;
      loyalty_points: string;
    };
    territoriesOwned: string[];
    taxRate: number;
    creationDate: string;
    rank: number;
  };
  members: GuildMember[];
  events: GuildEvent[];
  activities: GuildActivity[];
  onUpdateGuildName: (newName: string) => Promise<void>;
  onUpdateTaxRate: (newRate: number) => Promise<void>;
  onKickMember: (memberId: string) => Promise<void>;
  onPromoteMember: (memberId: string) => Promise<void>;
  onDemoteMember: (memberId: string) => Promise<void>;
  onTransferLeadership: (memberId: string) => Promise<void>;
  onPostAnnouncement: (announcement: string) => Promise<void>;
  onCreateEvent: (event: Omit<GuildEvent, 'id' | 'participants'>) => Promise<void>;
  onDeclareWar: (targetGuildId: string, duration: number) => Promise<void>;
  onProposeAlliance: (targetGuildId: string, terms: string) => Promise<void>;
}

export default function GuildLeaderPanel({
  guildData,
  members,
  events,
  activities,
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
}: GuildLeaderPanelProps) {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [announcementForm] = Form.useForm();
  const [eventForm] = Form.useForm();
  const [warForm] = Form.useForm();
  const [allianceForm] = Form.useForm();
  
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [isTaxModalVisible, setIsTaxModalVisible] = useState(false);
  const [isAnnouncementModalVisible, setIsAnnouncementModalVisible] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [isWarModalVisible, setIsWarModalVisible] = useState(false);
  const [isAllianceModalVisible, setIsAllianceModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const handleUpdateName = async (values: { newName: string }) => {
    try {
      await onUpdateGuildName(values.newName);
      message.success(t('guild.update_name') + ' ' + t('common.success'));
      setIsNameModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handleUpdateTaxRate = async (values: { newTaxRate: number }) => {
    try {
      await onUpdateTaxRate(values.newTaxRate);
      message.success(t('guild.update_tax_rate') + ' ' + t('common.success'));
      setIsTaxModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handlePostAnnouncement = async (values: { announcement: string }) => {
    try {
      await onPostAnnouncement(values.announcement);
      message.success(t('guild.post_announcement') + ' ' + t('common.success'));
      setIsAnnouncementModalVisible(false);
      announcementForm.resetFields();
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handleCreateEvent = async (values: any) => {
    try {
      await onCreateEvent({
        name: values.eventName,
        description: values.eventDescription,
        date: values.eventDate.format('YYYY-MM-DD'),
        reward: values.eventReward
      });
      message.success(t('guild.create_event') + ' ' + t('common.success'));
      setIsEventModalVisible(false);
      eventForm.resetFields();
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handleDeclareWar = async (values: any) => {
    try {
      await onDeclareWar(values.targetGuild, values.warDuration);
      message.success(t('guild.declare_war') + ' ' + t('common.success'));
      setIsWarModalVisible(false);
      warForm.resetFields();
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handleProposeAlliance = async (values: any) => {
    try {
      await onProposeAlliance(values.allianceGuild, values.allianceTerms);
      message.success(t('guild.propose_alliance') + ' ' + t('common.success'));
      setIsAllianceModalVisible(false);
      allianceForm.resetFields();
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handleTransferLeadership = async (values: { memberId: string }) => {
    try {
      await onTransferLeadership(values.memberId);
      message.success(t('guild.transfer_leadership') + ' ' + t('common.success'));
      setIsTransferModalVisible(false);
      setSelectedMember(null);
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handleKickMember = async (memberId: string) => {
    try {
      await onKickMember(memberId);
      message.success(t('guild.kick_member') + ' ' + t('common.success'));
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handlePromoteMember = async (memberId: string) => {
    try {
      await onPromoteMember(memberId);
      message.success(t('guild.promote_member') + ' ' + t('common.success'));
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handleDemoteMember = async (memberId: string) => {
    try {
      await onDemoteMember(memberId);
      message.success(t('guild.demote_member') + ' ' + t('common.success'));
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <CrownOutlined style={{ fontSize: '24px', color: '#faad14', marginRight: '12px' }} />
          <Title level={2} style={{ margin: 0 }}>{t('guild.leader_welcome')}</Title>
        </div>

        <Tabs defaultActiveKey="overview" size="large">
          {/* Overview Tab */}
          <TabPane tab={<span><BarChartOutlined />{t('guild.guild_info')}</span>} key="overview">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <Statistic title={t('guild.guild_name')} value={guildData.name} />
              <Statistic title={t('guild.guild_level')} value={guildData.level} />
              <Statistic title={t('guild.member_count')} value={guildData.memberCount} />
              <Statistic title={t('guild.guild_rank')} value={`#${guildData.rank}`} />
            </div>

            <Card title={t('guild.treasury')} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <Statistic title={t('game.gui_tokens')} value={guildData.treasury.gui_tokens} />
                <Statistic title={t('game.treats')} value={guildData.treasury.treats} />
                <Statistic title={t('game.crystals')} value={guildData.treasury.crystals} />
                <Statistic title={t('game.loyalty_points')} value={guildData.treasury.loyalty_points} />
              </div>
            </Card>

            <Card title={t('guild.guild_statistics')}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <Statistic title={t('guild.total_contributions')} value="0" />
                <Statistic title={t('guild.average_level')} value="1" />
                <Statistic title={t('guild.battles_won')} value="0" />
                <Statistic title={t('guild.territories_captured')} value={guildData.territoriesOwned.length} />
              </div>
              <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 6 }}>
                <Text type="secondary">
                  💡 {t('guild.statistics_note') || 'Статистика будет обновляться по мере развития игры'}
                </Text>
              </div>
            </Card>
          </TabPane>

          {/* Members Management Tab */}
          <TabPane tab={<span><TeamOutlined />{t('guild.members_management')}</span>} key="members">
            <Card>
              <div style={{ marginBottom: 24 }}>
                <Title level={4}>{t('guild.guild_members')} ({members.length})</Title>
                <List
                  dataSource={members}
                  renderItem={(member) => (
                    <List.Item
                      actions={[
                        member.id === guildData.id ? (
                          <Tag color="gold">👑 {t('guild.leader')}</Tag>
                        ) : (
                          <Space>
                            <Button 
                              size="small" 
                              onClick={() => onPromoteMember(member.id)}
                              disabled={member.isOfficer}
                            >
                              {t('guild.promote')}
                            </Button>
                            <Button 
                              size="small" 
                              danger
                              onClick={() => onKickMember(member.id)}
                            >
                              {t('guild.kick')}
                            </Button>
                            <Button 
                              size="small" 
                              type="dashed"
                              onClick={() => {
                                setSelectedMember(member.id);
                                setIsTransferModalVisible(true);
                              }}
                            >
                              {t('guild.transfer_leadership')}
                            </Button>
                          </Space>
                        )
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          <Space>
                            {member.name}
                            {member.isOfficer && <Tag color="blue">{t('guild.officer')}</Tag>}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <Text type="secondary">{t('game.level')}: {member.level}</Text>
                            <Text type="secondary">{t('guild.contribution')}: {member.contribution}</Text>
                            <Text type="secondary">{t('guild.joined')}: {new Date(member.joinDate).toLocaleDateString()}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
              
              <Divider />
              
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <TeamOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
                <Title level={4}>{t('guild.advanced_management_coming_soon') || 'Расширенное управление'}</Title>
                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '16px' }}>
                  {t('guild.advanced_management_description') || 'Расширенные функции управления участниками будут доступны в ближайшем обновлении'}
                </Text>
                <Space>
                  <Button type="primary" disabled>
                    {t('guild.invite_member')}
                  </Button>
                  <Button disabled>
                    {t('guild.set_permissions')}
                  </Button>
                </Space>
              </div>
            </Card>
          </TabPane>

          {/* Guild Settings Tab */}
          <TabPane tab={<span><SettingOutlined />{t('guild.guild_settings')}</span>} key="settings">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Card title={t('guild.change_name')}>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">{t('guild.current_name')}: <strong>{guildData.name}</strong></Text>
                </div>
                <Button type="primary" onClick={() => setIsNameModalVisible(true)}>
                  {t('guild.change_name')}
                </Button>
              </Card>

              <Card title={t('guild.change_tax_rate')}>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">{t('guild.current_tax_rate')}: <strong>{guildData.taxRate}%</strong></Text>
                </div>
                <Button type="primary" onClick={() => setIsTaxModalVisible(true)}>
                  {t('guild.change_tax_rate')}
                </Button>
              </Card>

              <Card title={t('guild.guild_announcements')}>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">{t('guild.announcements_description') || 'Публикуйте объявления для всех участников гильдии'}</Text>
                </div>
                <Button type="primary" icon={<BellOutlined />} onClick={() => setIsAnnouncementModalVisible(true)}>
                  {t('guild.post_announcement')}
                </Button>
              </Card>

              <Card title={t('guild.guild_events')}>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">{t('guild.events_description') || 'Создавайте события для участников гильдии'}</Text>
                </div>
                <Button type="primary" icon={<CalendarOutlined />} onClick={() => setIsEventModalVisible(true)} disabled>
                  {t('guild.create_event')} ({t('common.coming_soon')})
                </Button>
              </Card>

              <Card title={t('guild.guild_war')}>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">{t('guild.war_description') || 'Объявляйте войну другим гильдиям'}</Text>
                </div>
                <Button type="primary" icon={<ThunderboltOutlined />} onClick={() => setIsWarModalVisible(true)} disabled>
                  {t('guild.declare_war')} ({t('common.coming_soon')})
                </Button>
              </Card>

              <Card title={t('guild.guild_alliance')}>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">{t('guild.alliance_description') || 'Предлагайте альянсы другим гильдиям'}</Text>
                </div>
                <Button type="primary" icon={<HeartOutlined />} onClick={() => setIsAllianceModalVisible(true)} disabled>
                  {t('guild.propose_alliance')} ({t('common.coming_soon')})
                </Button>
              </Card>
            </Space>
          </TabPane>

          {/* Treasury Management Tab */}
          <TabPane tab={<span><BarChartOutlined />{t('guild.treasury_management')}</span>} key="treasury">
            <Card>
              <div style={{ marginBottom: 24 }}>
                <Title level={4}>{t('guild.current_treasury')}</Title>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: 16 }}>
                  <Statistic title={t('game.gui_tokens')} value={guildData.treasury.gui_tokens} />
                  <Statistic title={t('game.treats')} value={guildData.treasury.treats} />
                  <Statistic title={t('game.crystals')} value={guildData.treasury.crystals} />
                  <Statistic title={t('game.loyalty_points')} value={guildData.treasury.loyalty_points} />
                </div>
              </div>
              
              <Divider />
              
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <BarChartOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
                <Title level={4}>{t('guild.treasury_management_coming_soon') || 'Управление казной'}</Title>
                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '16px' }}>
                  {t('guild.treasury_description') || 'Расширенное управление казной гильдии будет доступно в ближайшем обновлении'}
                </Text>
                <Space>
                  <Button type="primary" disabled>
                    {t('guild.distribute_resources')}
                  </Button>
                  <Button disabled>
                    {t('guild.view_history')}
                  </Button>
                </Space>
              </div>
            </Card>
          </TabPane>

          {/* Events Management Tab */}
          <TabPane tab={<span><CalendarOutlined />{t('guild.events_management')}</span>} key="events">
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <CalendarOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                <Title level={3}>{t('guild.events_coming_soon') || 'События гильдии'}</Title>
                <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '24px' }}>
                  {t('guild.events_description') || 'Система событий гильдии будет доступна в ближайшем обновлении'}
                </Text>
                <Button type="primary" disabled>
                  {t('guild.create_event')}
                </Button>
              </div>
            </Card>
          </TabPane>

          {/* Activity Log Tab */}
          <TabPane tab={<span><TrophyOutlined />{t('guild.guild_logs')}</span>} key="activity">
            <Card>
              <div style={{ marginBottom: 24 }}>
                <Title level={4}>{t('guild.recent_activity')}</Title>
                {activities.length > 0 ? (
                  <List
                    dataSource={activities}
                    renderItem={(activity) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              icon={
                                activity.type === 'member_joined' ? <UserOutlined /> :
                                activity.type === 'contribution' ? <DollarOutlined /> :
                                activity.type === 'territory_captured' ? <TrophyOutlined /> :
                                <ThunderboltOutlined />
                              }
                            />
                          }
                          title={activity.description}
                          description={
                            <Space>
                              <Text type="secondary">{activity.timestamp}</Text>
                              {activity.member && (
                                <Tag color="blue">{activity.member}</Tag>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <TrophyOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                    <Text type="secondary">{t('guild.no_activity') || 'Пока нет активности'}</Text>
                  </div>
                )}
              </div>
              
              <Divider />
              
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <TrophyOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
                <Title level={4}>{t('guild.detailed_logs_coming_soon') || 'Подробные логи'}</Title>
                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '16px' }}>
                  {t('guild.detailed_logs_description') || 'Подробная система логов активности будет доступна в ближайшем обновлении'}
                </Text>
                <Button disabled>
                  {t('guild.export_logs')}
                </Button>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modals */}
      <Modal
        title={t('guild.change_name')}
        open={isNameModalVisible}
        onCancel={() => setIsNameModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdateName}>
          <Form.Item
            name="newName"
            label={t('guild.new_name')}
            rules={[{ required: true, message: t('guild.new_name') + ' ' + t('common.required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('guild.update_name')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('guild.change_tax_rate')}
        open={isTaxModalVisible}
        onCancel={() => setIsTaxModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdateTaxRate}>
          <Form.Item
            name="newTaxRate"
            label={t('guild.new_tax_rate')}
            rules={[{ required: true, message: t('guild.new_tax_rate') + ' ' + t('common.required') }]}
          >
            <Input type="number" min="0" max="100" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('guild.update_tax_rate')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('guild.post_announcement')}
        open={isAnnouncementModalVisible}
        onCancel={() => setIsAnnouncementModalVisible(false)}
        footer={null}
      >
        <Form form={announcementForm} onFinish={handlePostAnnouncement}>
          <Form.Item
            name="announcement"
            label={t('guild.announcement')}
            rules={[{ required: true, message: t('guild.announcement') + ' ' + t('common.required') }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('guild.post_announcement')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('guild.create_event')}
        open={isEventModalVisible}
        onCancel={() => setIsEventModalVisible(false)}
        footer={null}
      >
        <Form form={eventForm} onFinish={handleCreateEvent}>
          <Form.Item
            name="eventName"
            label={t('guild.event_name')}
            rules={[{ required: true, message: t('guild.event_name') + ' ' + t('common.required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="eventDescription"
            label={t('guild.event_description')}
            rules={[{ required: true, message: t('guild.event_description') + ' ' + t('common.required') }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="eventDate"
            label={t('guild.event_date')}
            rules={[{ required: true, message: t('guild.event_date') + ' ' + t('common.required') }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="eventReward"
            label={t('guild.event_reward')}
            rules={[{ required: true, message: t('guild.event_reward') + ' ' + t('common.required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('guild.create_event_button')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('guild.declare_war')}
        open={isWarModalVisible}
        onCancel={() => setIsWarModalVisible(false)}
        footer={null}
      >
        <Form form={warForm} onFinish={handleDeclareWar}>
          <Form.Item
            name="targetGuild"
            label={t('guild.target_guild')}
            rules={[{ required: true, message: t('guild.target_guild') + ' ' + t('common.required') }]}
          >
            <Select placeholder={t('guild.target_guild')}>
              <Option value="guild1">Guild Alpha</Option>
              <Option value="guild2">Guild Beta</Option>
              <Option value="guild3">Guild Gamma</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="warDuration"
            label={t('guild.war_duration')}
            rules={[{ required: true, message: t('guild.war_duration') + ' ' + t('common.required') }]}
          >
            <Input type="number" min="1" max="168" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('guild.declare_war_button')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('guild.propose_alliance')}
        open={isAllianceModalVisible}
        onCancel={() => setIsAllianceModalVisible(false)}
        footer={null}
      >
        <Form form={allianceForm} onFinish={handleProposeAlliance}>
          <Form.Item
            name="allianceGuild"
            label={t('guild.alliance_guild')}
            rules={[{ required: true, message: t('guild.alliance_guild') + ' ' + t('common.required') }]}
          >
            <Select placeholder={t('guild.alliance_guild')}>
              <Option value="guild1">Guild Alpha</Option>
              <Option value="guild2">Guild Beta</Option>
              <Option value="guild3">Guild Gamma</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="allianceTerms"
            label={t('guild.alliance_terms')}
            rules={[{ required: true, message: t('guild.alliance_terms') + ' ' + t('common.required') }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('guild.propose_alliance_button')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('guild.transfer_leadership')}
        open={isTransferModalVisible}
        onCancel={() => setIsTransferModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleTransferLeadership}>
          <Form.Item
            name="memberId"
            initialValue={selectedMember}
            hidden
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Text>{t('guild.transfer_leadership')} - {t('common.confirm')}?</Text>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" danger>
              {t('guild.transfer_leadership')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 