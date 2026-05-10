import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Form, Input, Typography, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError('');
    setLoading(true);
    try {
      await login(values.email, values.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        Welcome back
      </Typography.Title>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Form onFinish={handleSubmit} layout="vertical" requiredMark={false}>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email' }]}>
          <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center' }}>
        <Typography.Text type="secondary">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </Typography.Text>
      </div>
    </Card>
  );
}
