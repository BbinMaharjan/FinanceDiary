import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Button, Form, Input, Typography, Alert, Checkbox, Card } from "antd";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Wallet } from "lucide-react";
import type { ApiError } from "../types";
import { motion } from "framer-motion";

const GRADIENT = {
  from: "#346fde",
  mid: "#1a73e8",
  to: "#007cd6",
};

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(
    () => localStorage.getItem("rememberedEmail") || "",
  );
  const { login } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) {
      form.setFieldsValue({ email: saved });
      setRemember(saved);
    }
  }, [form]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError("");
    setLoading(true);
    try {
      await login(values.email, values.password);
      if (remember) {
        localStorage.setItem("rememberedEmail", values.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      navigate("/");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <Card
      className="w-full border-0 sm:border"
      styles={{
        body: { padding: 0 },
      }}
      style={{
        background: "transparent",
        boxShadow: dark ? "none" : undefined,
      }}
    >
      <div className="sm:px-8 sm:py-10">
        {/* Desktop-only brand header inside card */}
        <div className="hidden md:block mb-8">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="size-12 rounded-xl flex items-center justify-center mb-4">
              <Wallet className="size-6 text-white" />
              DayBook
            </div>
            <Typography.Title
              level={3}
              style={{
                margin: 0,
                marginBottom: 4,
                fontWeight: 700,
                color: dark ? "#e2e8f0" : "#1e293b",
              }}
            >
              Welcome back
            </Typography.Title>
            <Typography.Text
              style={{ color: dark ? "#94a3b8" : "#64748b", fontSize: 15 }}
            >
              Sign in to your account
            </Typography.Text>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 20 }}
          >
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError("")}
            />
          </motion.div>
        )}

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <Form.Item
              label={
                <span
                  style={{
                    color: dark ? "#cbd5e1" : "#334155",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Email
                </span>
              }
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input
                prefix={
                  <Mail className="size-4" style={{ color: "#94a3b8" }} />
                }
                placeholder="you@example.com"
                size="large"
                autoFocus
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderColor: dark ? "#334155" : "#e2e8f0",
                  background: dark ? "#1e293b" : "#f8fafc",
                  fontSize: 15,
                  color: dark ? "#e2e8f0" : undefined,
                }}
                className="hover:!border-blue-500 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-500/20 transition-all"
              />
            </Form.Item>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <Form.Item
              label={
                <span
                  style={{
                    color: dark ? "#cbd5e1" : "#334155",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Password
                </span>
              }
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                prefix={
                  <Lock className="size-4" style={{ color: "#94a3b8" }} />
                }
                placeholder="••••••••"
                size="large"
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderColor: dark ? "#334155" : "#e2e8f0",
                  background: dark ? "#1e293b" : "#f8fafc",
                  fontSize: 15,
                }}
                className="hover:!border-blue-500 focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-500/20 transition-all"
                iconRender={(visible) =>
                  visible ? (
                    <EyeOff className="size-4" style={{ color: "#94a3b8" }} />
                  ) : (
                    <Eye className="size-4" style={{ color: "#94a3b8" }} />
                  )
                }
              />
            </Form.Item>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
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
                  border: "none",
                }}
                className="hover:!opacity-90 hover:!shadow-lg transition-all cursor-pointer"
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {loading ? "Signing in..." : "Sign in"}
                  {!loading && <ArrowRight className="size-4" />}
                </span>
              </Button>
            </Form.Item>
          </motion.div>
        </Form>
      </div>
    </Card>
  );

  return (
    <div
      className="min-h-screen flex"
      style={{ background: dark ? "#0f172a" : undefined }}
    >
      {/* Right side - Login form */}
      <div
        className="flex-1 flex items-center justify-center min-h-screen px-4 py-8"
        style={{ background: dark ? "#0f172a" : "white" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px]"
        >
          {formContent}
        </motion.div>
      </div>
    </div>
  );
}
