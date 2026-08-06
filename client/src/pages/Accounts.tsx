import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Landmark } from "lucide-react";
import { useAccounts } from "../hooks/useAccounts";
import { Button, Input, Card, Skeleton, Select, Tag, Typography, Flex } from "antd";
import type { Account, AccountType, ApiError } from "../types";

const ACCOUNT_TYPES: AccountType[] = ["Savings", "Current", "Cash", "Other"];

const DEFAULT_FORM = {
  name: "",
  bankName: "",
  accountNumber: "",
  accountType: "Savings" as AccountType,
  openingBalance: "",
  notes: "",
};

export default function Accounts() {
  const { accounts, loading, createAccount, updateAccount, deleteAccount } = useAccounts();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, openingBalance: Number(form.openingBalance) || 0 };
      if (editing) {
        await updateAccount({ id: editing, ...payload });
      } else {
        await createAccount(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(DEFAULT_FORM);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.response?.data?.message || "Failed to save account");
    }
  };

  const handleEdit = (account: Account) => {
    setEditing(account._id);
    setForm({
      name: account.name,
      bankName: account.bankName || "",
      accountNumber: account.accountNumber || "",
      accountType: account.accountType || "Savings",
      openingBalance: String(account.openingBalance ?? 0),
      notes: account.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (account: Account) => {
    if (!window.confirm(`Delete "${account.name}"? Its transactions will be kept but no longer linked to this account.`)) return;
    await deleteAccount(account._id);
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Bank Accounts</h2>
        <Button
          type="primary"
          icon={<Plus style={{ width: 16, height: 16 }} />}
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setForm(DEFAULT_FORM);
            setError("");
          }}
        >
          Add
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card style={{ borderRadius: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
              {editing ? "Edit Account" : "New Account"}
            </h3>
            {error && (
              <div style={{ marginBottom: 16 }}>
                <Typography.Text type="danger">{error}</Typography.Text>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Account Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. My Savings" required />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Bank Name</label>
                <Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="e.g. Nabil Bank" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Account Number</label>
                <Input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} placeholder="e.g. 1234 5678 9012" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Account Type</label>
                <Select
                  value={form.accountType}
                  onChange={(v) => setForm({ ...form, accountType: v as AccountType })}
                  style={{ width: "100%" }}
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <Select.Option key={t} value={t}>{t}</Select.Option>
                  ))}
                </Select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Opening Balance (रू)</label>
                <Input type="number" step="0.01" value={form.openingBalance} onChange={(e) => setForm({ ...form, openingBalance: e.target.value })} placeholder="0.00" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="ant-input"
                  style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #d9d9d9" }}
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <Button type="primary" htmlType="submit">Save</Button>
                <Button onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton.Button key={i} active style={{ height: 96, borderRadius: 12, width: "100%" }} />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card style={{ borderRadius: 12, textAlign: "center", padding: "40px 16px" }}>
          <Landmark style={{ width: 32, height: 32, color: "#8c8c8c", margin: "0 auto 12px" }} />
          <Typography.Text type="secondary" style={{ display: "block", fontSize: 15 }}>
            No bank accounts yet
          </Typography.Text>
          <Typography.Text type="secondary" style={{ display: "block", fontSize: 13 }}>
            Add an account to track where your income and expenses go
          </Typography.Text>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {accounts.map((account: Account, i: number) => (
            <motion.div
              key={account._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                borderRadius: 12,
                border: "1px solid #f0f0f0",
                padding: 16,
              }}
            >
              <Flex align="flex-start" justify="space-between" gap={12}>
                <div style={{ minWidth: 0 }}>
                  <Flex align="center" gap={8} wrap="wrap">
                    <Typography.Text style={{ fontSize: 15, fontWeight: 600 }}>{account.name}</Typography.Text>
                    <Tag>{account.accountType}</Tag>
                  </Flex>
                  <Typography.Text type="secondary" style={{ fontSize: 13, display: "block" }}>
                    {account.bankName || "Bank account"}
                    {account.accountNumber ? ` • ${account.accountNumber}` : ""}
                  </Typography.Text>
                  <Flex gap={16} wrap="wrap" style={{ marginTop: 8 }}>
                    <div>
                      <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>Opening Balance</Typography.Text>
                      <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>रू {account.openingBalance.toLocaleString("en-IN")}</Typography.Text>
                    </div>
                    <div>
                      <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>Income</Typography.Text>
                      <Typography.Text style={{ fontSize: 13, color: "#22c55e", fontWeight: 500 }}>+रू {(account.totalIncome || 0).toLocaleString("en-IN")}</Typography.Text>
                    </div>
                    <div>
                      <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>Expense</Typography.Text>
                      <Typography.Text style={{ fontSize: 13, color: "#f97316", fontWeight: 500 }}>-रू {(account.totalExpense || 0).toLocaleString("en-IN")}</Typography.Text>
                    </div>
                  </Flex>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <Typography.Text
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      color: (account.balance || 0) >= 0 ? "#22c55e" : "#f97316",
                    }}
                  >
                    रू {(account.balance ?? 0).toLocaleString("en-IN")}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>Current Balance</Typography.Text>
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    <Button type="text" icon={<Pencil style={{ width: 14, height: 14 }} />} onClick={() => handleEdit(account)} />
                    <Button type="text" danger icon={<Trash2 style={{ width: 14, height: 14 }} />} onClick={() => handleDelete(account)} />
                  </div>
                </div>
              </Flex>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
