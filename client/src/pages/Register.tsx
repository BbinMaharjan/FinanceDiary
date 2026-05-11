import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Form, Input, Typography, Alert } from 'antd';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import type { ApiError } from '../types';
import { motion } from 'framer-motion';

const GRADIENT = {
  from: '#346fde',
  mid: '#1a73e8',
  to: '#007cd6',
};

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
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: '0 25px 60px -15px rgba(0,0,0,0.08)' }}
        >
          <div className="px-8 pt-10 pb-8 sm:px-10 sm:pt-12 sm:pb-10">
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center mb-8"
            >
              <div
                className="size-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: `linear-gradient(135deg, ${GRADIENT.from}, ${GRADIENT.to})`,
                }}
              >
                <User className="size-7 text-white" />
              </div>
              <Typography.Title
                level={3}
                style={{ margin: 0, marginBottom: 4, fontWeight: 700, color: '#1e293b' }}
              >
                Create account
              </Typography.Title>
              <Typography.Text style={{ color: '#64748b', fontSize: 15 }}>
                Sign up to get started
              </Typography.Text>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 20 }}
              >
                <Alert message={error} type="error" showIcon closable onClose={() => setError('')} />
              </motion.div>
            )}

            <Form onFinish={handleSubmit} layout="vertical" requiredMark={false}>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <Form.Item
                  label={<span style={{ color: '#334155', fontWeight: 600, fontSize: 14 }}>Name</span>}
                  name="name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input
                    prefix={<User className="size-4" style={{ color: '#94a3b8' }} />}
                    placeholder="Your name"
                    size="large"
                    style={{ height: 48, borderRadius: 12, borderColor: '#e2e8f0', background: '#f8fafc', fontSize: 15 }}
                    className="hover:!border-blue-500 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-500/20 transition-all"
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Form.Item
                  label={<span style={{ color: '#334155', fontWeight: 600, fontSize: 14 }}>Email</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Enter a valid email' },
                  ]}
                >
                  <Input
                    prefix={<Mail className="size-4" style={{ color: '#94a3b8' }} />}
                    placeholder="you@example.com"
                    size="large"
                    style={{ height: 48, borderRadius: 12, borderColor: '#e2e8f0', background: '#f8fafc', fontSize: 15 }}
                    className="hover:!border-blue-500 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-500/20 transition-all"
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Form.Item
                  label={<span style={{ color: '#334155', fontWeight: 600, fontSize: 14 }}>Password</span>}
                  name="password"
                  rules={[
                    { required: true, message: 'Please enter your password' },
                    { min: 6, message: 'At least 6 characters' },
                  ]}
                >
                  <Input.Password
                    prefix={<Lock className="size-4" style={{ color: '#94a3b8' }} />}
                    placeholder="At least 6 characters"
                    size="large"
                    style={{ height: 48, borderRadius: 12, borderColor: '#e2e8f0', background: '#f8fafc', fontSize: 15 }}
                    className="hover:!border-blue-500 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-500/20 transition-all"
                    iconRender={(visible) =>
                      visible ? (
                        <EyeOff className="size-4" style={{ color: '#94a3b8' }} />
                      ) : (
                        <Eye className="size-4" style={{ color: '#94a3b8' }} />
                      )
                    }
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Form.Item style={{ marginBottom: 12 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    style={{
                      height: 48,
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${GRADIENT.from}, ${GRADIENT.to})`,
                      border: 'none',
                    }}
                    className="hover:!opacity-90 hover:!shadow-lg transition-all cursor-pointer"
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {loading ? 'Creating account...' : 'Create account'}
                      {!loading && <ArrowRight className="size-4" />}
                    </span>
                  </Button>
                </Form.Item>
              </motion.div>
            </Form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-center mt-4"
            >
              <Typography.Text style={{ color: '#64748b' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
                  className="hover:underline"
                >
                  Sign in
                </Link>
              </Typography.Text>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
