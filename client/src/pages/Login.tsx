import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Button, Form, Input, Typography, Alert } from "antd";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import type { ApiError } from "../types";
import { motion } from "framer-motion";
import styled from "styled-components";

const GRADIENT = {
  from: "#346fde",
  mid: "#1a73e8",
  to: "#007cd6",
};

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  overflow: hidden;
`;

const GlowBlob = styled.div<{
  $top?: string;
  $left?: string;
  $bottom?: string;
  $right?: string;
  $size?: string;
}>`
  position: absolute;
  ${({ $top }) => $top && `top: ${$top};`}
  ${({ $left }) => $left && `left: ${$left};`}
  ${({ $bottom }) => $bottom && `bottom: ${$bottom};`}
  ${({ $right }) => $right && `right: ${$right};`}
  width: ${({ $size }) => $size ?? "24rem"};
  height: ${({ $size }) => $size ?? "24rem"};
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  filter: blur(64px);
`;

const CenterCard = styled(motion.div)<{ $dark: boolean }>`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
  background: ${({ $dark }) => ($dark ? "#0f172a" : "white")};
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: ${({ $dark }) =>
    $dark
      ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      : "0 25px 50px -12px rgba(0, 0, 0, 0.15)"};
  text-align: center;
`;

const WelcomeTitle = styled(Typography.Title)`
  && {
    margin: 0 0 4px 0 !important;
    font-weight: 700 !important;
    font-size: 24px !important;
  }
`;

const WelcomeSub = styled(Typography.Text)`
  && {
    font-size: 14px !important;
    display: block !important;
    margin-bottom: 24px !important;
  }
`;

const ErrorWrapper = styled(motion.div)`
  margin-bottom: 20px;
  text-align: left;
`;

const FieldLabel = styled.span<{ $dark: boolean }>`
  color: ${({ $dark }) => ($dark ? "#cbd5e1" : "#334155")};
  font-weight: 600;
  font-size: 14px;
`;

const StyledInput = styled(Input)<{ $dark: boolean }>`
  && {
    height: 48px;
    border-radius: 12px;
    font-size: 15px;
    border-color: ${({ $dark }) => ($dark ? "#334155" : "#e2e8f0")};
    background: ${({ $dark }) => ($dark ? "#1e293b" : "#f8fafc")};
    color: ${({ $dark }) => ($dark ? "#e2e8f0" : "inherit")};

    &:hover {
      border-color: #3b82f6 !important;
    }
    &:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
    }
  }
`;

const StyledPasswordInput = styled(Input.Password)<{ $dark: boolean }>`
  && {
    height: 48px;
    border-radius: 12px;
    font-size: 15px;
    border-color: ${({ $dark }) => ($dark ? "#334155" : "#e2e8f0")};
    background: ${({ $dark }) => ($dark ? "#1e293b" : "#f8fafc")};

    &:hover {
      border-color: #3b82f6 !important;
    }
    &:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
    }
  }
`;

const SubmitButton = styled(Button)`
  && {
    height: 48px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, ${GRADIENT.from}, ${GRADIENT.to});
    border: none;
    transition: all 0.2s;

    &:hover {
      opacity: 0.9 !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
    }
  }
`;

const ButtonContent = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const IconStyle = { color: "#94a3b8" };

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [form] = Form.useForm();

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
    <PageContainer>
      <GlowBlob $top="10%" $left="10%" $size="32rem" />
      <GlowBlob $bottom="10%" $right="10%" $size="28rem" />
      <GlowBlob $top="50%" $right="40%" $size="20rem" />

      <CenterCard
        $dark={dark}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <WelcomeTitle level={2}>Welcome to DayBook</WelcomeTitle>
        <WelcomeSub>Track your income and expenses effortlessly.</WelcomeSub>

        {error && (
          <ErrorWrapper
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError("")}
            />
          </ErrorWrapper>
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
              label={<FieldLabel $dark={dark}>Email</FieldLabel>}
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <StyledInput
                $dark={dark}
                prefix={<Mail className="size-4" style={IconStyle} />}
                placeholder="you@example.com"
                size="large"
                autoFocus
              />
            </Form.Item>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <Form.Item
              label={<FieldLabel $dark={dark}>Password</FieldLabel>}
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <StyledPasswordInput
                $dark={dark}
                prefix={<Lock className="size-4" style={IconStyle} />}
                placeholder="••••••••"
                size="large"
                iconRender={(visible) =>
                  visible ? (
                    <EyeOff className="size-4" style={IconStyle} />
                  ) : (
                    <Eye className="size-4" style={IconStyle} />
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
            <Form.Item style={{ marginBottom: 0 }}>
              <SubmitButton
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                <ButtonContent>
                  {loading ? "Signing in..." : "Sign in"}
                  {!loading && <ArrowRight className="size-4" />}
                </ButtonContent>
              </SubmitButton>
            </Form.Item>
          </motion.div>
        </Form>
      </CenterCard>
    </PageContainer>
  );
}
