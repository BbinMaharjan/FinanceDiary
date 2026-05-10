import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Form, Input, Typography, Alert } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { name: string; email: string; password: string }) => {
    setError('');
    setLoading(true);
    try {
      await register(values.name, values.email, values.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        Create account
      </Typography.Title>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Form onFinish={handleSubmit} layout="vertical" requiredMark={false}>
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
          <Input prefix={<UserOutlined />} placeholder="Your name" size="large" />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email' }]}>
          <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }, { min: 6, message: 'At least 6 characters' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="At least 6 characters" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center' }}>
        <Typography.Text type="secondary">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </Typography.Text>
      </div>
    </Card>
  );
}
