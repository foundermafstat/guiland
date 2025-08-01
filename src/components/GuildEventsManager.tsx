'use client';

import React, { useState } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, Select, message, List, Tag, Space, Typography, Calendar, Badge, Row, Col, Statistic } from 'antd';
import { CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useLanguage } from './LanguageProvider';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface GuildEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  duration: number; // в часах
  type: 'battle' | 'training' | 'social' | 'competition' | 'meeting';
  reward: string;
  participants: number;
  maxParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  requirements: string[];
  location: string;
}

interface GuildEventsManagerProps {
  events: GuildEvent[];
  onCreateEvent: (event: Omit<GuildEvent, 'id' | 'participants'>) => Promise<void>;
  onEditEvent: (eventId: string, event: Partial<GuildEvent>) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
  onJoinEvent: (eventId: string) => Promise<void>;
  onLeaveEvent: (eventId: string) => Promise<void>;
}

export default function GuildEventsManager({
  events,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onJoinEvent,
  onLeaveEvent
}: GuildEventsManagerProps) {
  const { t } = useLanguage();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GuildEvent | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const handleCreateEvent = async (values: any) => {
    try {
      await onCreateEvent({
        name: values.name,
        description: values.description,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
        duration: values.duration,
        type: values.type,
        reward: values.reward,
        maxParticipants: values.maxParticipants,
        status: 'upcoming',
        requirements: values.requirements || [],
        location: values.location
      });
      message.success(t('guild.event_created'));
      setCreateModalVisible(false);
      createForm.resetFields();
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handleEditEvent = async (values: any) => {
    if (!selectedEvent) return;
    
    try {
      await onEditEvent(selectedEvent.id, {
        name: values.name,
        description: values.description,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
        duration: values.duration,
        type: values.type,
        reward: values.reward,
        maxParticipants: values.maxParticipants,
        requirements: values.requirements || [],
        location: values.location
      });
      message.success(t('guild.event_updated'));
      setEditModalVisible(false);
      editForm.resetFields();
      setSelectedEvent(null);
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await onDeleteEvent(eventId);
      message.success(t('guild.event_deleted'));
    } catch (error) {
      message.error(t('common.error') + ': ' + error);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      battle: 'red',
      training: 'blue',
      social: 'green',
      competition: 'purple',
      meeting: 'orange'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getEventStatusColor = (status: string) => {
    const colors = {
      upcoming: 'blue',
      ongoing: 'green',
      completed: 'gray',
      cancelled: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getListData = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayEvents = events.filter(event => event.date === dateStr);
    
    return dayEvents.map(event => ({
      type: 'success',
      content: event.name,
      event
    }));
  };

  const dateCellRender = (value: dayjs.Dayjs) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index} style={{ marginBottom: 3 }}>
            <Badge
              color={getEventTypeColor(item.event.type)}
              text={
                <Text 
                  style={{ fontSize: '10px', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedEvent(item.event);
                    setEditModalVisible(true);
                    editForm.setFieldsValue({
                      name: item.event.name,
                      description: item.event.description,
                      date: dayjs(item.event.date),
                      time: dayjs(item.event.time, 'HH:mm'),
                      duration: item.event.duration,
                      type: item.event.type,
                      reward: item.event.reward,
                      maxParticipants: item.event.maxParticipants,
                      requirements: item.event.requirements,
                      location: item.event.location
                    });
                  }}
                >
                  {item.content}
                </Text>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  const upcomingEvents = events.filter(event => event.status === 'upcoming').slice(0, 5);

  return (
    <div>
      <Card title={t('guild.events_management')} extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          {t('guild.create_event')}
        </Button>
      }>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title={t('guild.events_calendar')} size="small">
              <Calendar 
                dateCellRender={dateCellRender}
                style={{ backgroundColor: 'white' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card title={t('guild.upcoming_events')} size="small">
              <List
                dataSource={upcomingEvents}
                renderItem={(event) => (
                  <List.Item
                    actions={[
                      <Button 
                        size="small" 
                        icon={<EditOutlined />}
                        onClick={() => {
                          setSelectedEvent(event);
                          setEditModalVisible(true);
                          editForm.setFieldsValue({
                            name: event.name,
                            description: event.description,
                            date: dayjs(event.date),
                            time: dayjs(event.time, 'HH:mm'),
                            duration: event.duration,
                            type: event.type,
                            reward: event.reward,
                            maxParticipants: event.maxParticipants,
                            requirements: event.requirements,
                            location: event.location
                          });
                        }}
                      >
                        {t('common.edit')}
                      </Button>,
                      <Button 
                        size="small" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        {t('common.delete')}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{event.name}</Text>
                          <Tag color={getEventTypeColor(event.type)}>
                            {t(`guild.event_type_${event.type}`)}
                          </Tag>
                          <Tag color={getEventStatusColor(event.status)}>
                            {t(`guild.event_status_${event.status}`)}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary">{event.description}</Text>
                          <Space>
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              {event.date} {event.time} ({event.duration}h)
                            </Text>
                          </Space>
                          <Space>
                            <TeamOutlined />
                            <Text type="secondary">
                              {event.participants}/{event.maxParticipants} {t('guild.participants')}
                            </Text>
                          </Space>
                          <Space>
                            <TrophyOutlined />
                            <Text type="secondary">{event.reward}</Text>
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            <Card title={t('guild.events_statistics')} size="small" style={{ marginTop: 16 }}>
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Statistic 
                    title={t('guild.total_events')} 
                    value={events.length} 
                    prefix={<CalendarOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title={t('guild.upcoming_events')} 
                    value={events.filter(e => e.status === 'upcoming').length}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title={t('guild.completed_events')} 
                    value={events.filter(e => e.status === 'completed').length}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title={t('guild.avg_participants')} 
                    value={Math.round(events.reduce((sum, e) => sum + e.participants, 0) / events.length || 0)}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Модальное окно для создания события */}
      <Modal
        title={t('guild.create_event')}
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={createForm} onFinish={handleCreateEvent} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={t('guild.event_name')}
                rules={[{ required: true, message: t('guild.event_name') + ' ' + t('common.required') }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label={t('guild.event_type')}
                rules={[{ required: true, message: t('guild.event_type') + ' ' + t('common.required') }]}
              >
                <Select placeholder={t('guild.select_event_type')}>
                  <Option value="battle">{t('guild.event_type_battle')}</Option>
                  <Option value="training">{t('guild.event_type_training')}</Option>
                  <Option value="social">{t('guild.event_type_social')}</Option>
                  <Option value="competition">{t('guild.event_type_competition')}</Option>
                  <Option value="meeting">{t('guild.event_type_meeting')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label={t('guild.event_description')}
            rules={[{ required: true, message: t('guild.event_description') + ' ' + t('common.required') }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="date"
                label={t('guild.event_date')}
                rules={[{ required: true, message: t('guild.event_date') + ' ' + t('common.required') }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="time"
                label={t('guild.event_time')}
                rules={[{ required: true, message: t('guild.event_time') + ' ' + t('common.required') }]}
              >
                <DatePicker.TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="duration"
                label={t('guild.event_duration')}
                rules={[{ required: true, message: t('guild.event_duration') + ' ' + t('common.required') }]}
              >
                <Input type="number" min="1" max="24" suffix={t('guild.hours')} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reward"
                label={t('guild.event_reward')}
                rules={[{ required: true, message: t('guild.event_reward') + ' ' + t('common.required') }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxParticipants"
                label={t('guild.max_participants')}
                rules={[{ required: true, message: t('guild.max_participants') + ' ' + t('common.required') }]}
              >
                <Input type="number" min="1" max="100" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="location"
            label={t('guild.event_location')}
          >
            <Input placeholder={t('guild.event_location_placeholder')} />
          </Form.Item>
          
          <Form.Item
            name="requirements"
            label={t('guild.event_requirements')}
          >
            <Select
              mode="tags"
              placeholder={t('guild.event_requirements_placeholder')}
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('guild.create_event')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно для редактирования события */}
      <Modal
        title={t('guild.edit_event')}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedEvent(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={editForm} onFinish={handleEditEvent} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={t('guild.event_name')}
                rules={[{ required: true, message: t('guild.event_name') + ' ' + t('common.required') }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label={t('guild.event_type')}
                rules={[{ required: true, message: t('guild.event_type') + ' ' + t('common.required') }]}
              >
                <Select placeholder={t('guild.select_event_type')}>
                  <Option value="battle">{t('guild.event_type_battle')}</Option>
                  <Option value="training">{t('guild.event_type_training')}</Option>
                  <Option value="social">{t('guild.event_type_social')}</Option>
                  <Option value="competition">{t('guild.event_type_competition')}</Option>
                  <Option value="meeting">{t('guild.event_type_meeting')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label={t('guild.event_description')}
            rules={[{ required: true, message: t('guild.event_description') + ' ' + t('common.required') }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="date"
                label={t('guild.event_date')}
                rules={[{ required: true, message: t('guild.event_date') + ' ' + t('common.required') }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="time"
                label={t('guild.event_time')}
                rules={[{ required: true, message: t('guild.event_time') + ' ' + t('common.required') }]}
              >
                <DatePicker.TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="duration"
                label={t('guild.event_duration')}
                rules={[{ required: true, message: t('guild.event_duration') + ' ' + t('common.required') }]}
              >
                <Input type="number" min="1" max="24" suffix={t('guild.hours')} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reward"
                label={t('guild.event_reward')}
                rules={[{ required: true, message: t('guild.event_reward') + ' ' + t('common.required') }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxParticipants"
                label={t('guild.max_participants')}
                rules={[{ required: true, message: t('guild.max_participants') + ' ' + t('common.required') }]}
              >
                <Input type="number" min="1" max="100" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="location"
            label={t('guild.event_location')}
          >
            <Input placeholder={t('guild.event_location_placeholder')} />
          </Form.Item>
          
          <Form.Item
            name="requirements"
            label={t('guild.event_requirements')}
          >
            <Select
              mode="tags"
              placeholder={t('guild.event_requirements_placeholder')}
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('guild.update_event')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 