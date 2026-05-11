import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Form, Input, Typography, Alert } from "antd";
import { Mail, Lock, ArrowRight, Loader2, Wallet, Eye, EyeOff } from "lucide-react";
import type { ApiError } from "../types";
import { motion } from "framer-motion";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError("");
    setLoading(true);
    try {
      await login(values.email, values.password);
      navigate("/");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          className="absolute -top-32 -right-32 size-80 rounded-full blur-3xl"
          style={{ background: "var(--primary)" }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0], x: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 size-72 rounded-full blur-3xl"
          style={{ background: "var(--income)" }}
          animate={{ scale: [1.1, 1, 1.1], rotate: [0, -30, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 size-64 rounded-full blur-3xl"
          style={{ background: "var(--expense)" }}
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full blur-3xl"
          style={{ background: "color-mix(in oklab, var(--primary) 30%, transparent)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="rounded-2xl border shadow-soft overflow-hidden"
          style={{
            borderColor: "var(--border)",
            background: "color-mix(in oklab, var(--card) 75%, transparent)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <div className="p-8 sm:p-10">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex flex-col items-center mb-8"
            >
              <div
                className="size-14 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: "linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--primary) 65%, black))",
                  boxShadow: "0 8px 32px -8px color-mix(in oklab, var(--primary) 45%, transparent)",
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, -6, 6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Wallet className="size-7" style={{ color: "var(--primary-foreground)" }} />
                </motion.div>
              </div>
              <Typography.Title
                level={3}
                style={{
                  margin: 0,
                  marginBottom: 4,
                  textAlign: "center",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-display)",
                }}
              >
                Welcome back
              </Typography.Title>
              <Typography.Text style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
                Sign in to your account
              </Typography.Text>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 20 }}
              >
                <Alert message={error} type="error" showIcon closable onClose={() => setError("")} />
              </motion.div>
            )}

            <Form onFinish={handleSubmit} layout="vertical" requiredMark={false}>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Form.Item
                  label={<span style={{ color: "var(--foreground)", fontWeight: 500 }}>Email</span>}
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Enter a valid email" },
                  ]}
                >
                  <Input
                    prefix={<Mail className="size-4" style={{ color: "var(--muted-foreground)" }} />}
                    placeholder="you@example.com"
                    size="large"
                    style={{
                      background: "var(--background)",
                      borderColor: "var(--input)",
                    }}
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Form.Item
                  label={<span style={{ color: "var(--foreground)", fontWeight: 500 }}>Password</span>}
                  name="password"
                  rules={[{ required: true, message: "Please enter your password" }]}
                >
                  <Input.Password
                    prefix={<Lock className="size-4" style={{ color: "var(--muted-foreground)" }} />}
                    placeholder="••••••••"
                    size="large"
                    style={{
                      background: "var(--background)",
                      borderColor: "var(--input)",
                    }}
                    iconRender={(visible) =>
                      visible ? (
                        <EyeOff className="size-4" style={{ color: "var(--muted-foreground)" }} />
                      ) : (
                        <Eye className="size-4" style={{ color: "var(--muted-foreground)" }} />
                      )
                    }
                  />
                </Form.Item>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Form.Item style={{ marginBottom: 16 }}>
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
                      boxShadow: "0 8px 32px -8px color-mix(in oklab, var(--primary) 40%, transparent)",
                    }}
                    className="hover:opacity-90 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <Loader2 className="size-4 animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        Sign in
                        <ArrowRight className="size-4" />
                      </span>
                    )}
                  </Button>
                </Form.Item>
              </motion.div>
            </Form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{ textAlign: "center" }}
            >
              <Typography.Text style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
                Don't have an account?{" "}
                <Link
                  to="/register"
                  style={{
                    color: "var(--primary)",
                    fontWeight: 500,
                  }}
                >
                  Create one
                </Link>
              </Typography.Text>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
