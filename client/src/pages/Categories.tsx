import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { Button, Input, Card, Skeleton, Tag } from "antd";
import type { Category, TransactionType, ApiError } from "../types";

const ICONS = [
  "💰",
  "💼",
  "🏠",
  "🛵",
  "⛽",
  "🍔",
  "📱",
  "🚗",
  "🛒",
  "📚",
  "💊",
  "👕",
  "🎮",
  "✈️",
  "🎁",
  "🏥",
  "🐾",
  "🔧",
  "🍺",
  "🏪",
  "💻",
  "📸",
  "🎬",
  "🏊",
  "🚴",
  "🌴",
  "🏖️",
  "⛰️",
  "🎓",
  "⚡",
  "🔌",
  "🔨",
  "🎉",
  "💳",
  "🏦",
  "📌",
  "🅿️",
  "🛍️",
  "🖐️",
];
const PALETTE = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
];

interface CategoryForm {
  name: string;
  icon: string;
  color: string;
}

export default function Categories() {
  const [type, setType] = useState<TransactionType>("expense");
  const {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories(type);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>({
    name: "",
    icon: "📁",
    color: "#6b7280",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateCategory(editing, { ...form, type });
      } else {
        await createCategory({ ...form, type });
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", icon: "📁", color: "#6b7280" });
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      alert(apiErr.response?.data?.message || "Failed to save");
    }
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat._id);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    await deleteCategory(id);
  };

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Categories</h2>
        <Button
          type="primary"
          icon={<Plus style={{ width: 16, height: 16 }} />}
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setForm({ name: "", icon: "📁", color: "#6b7280" });
          }}
        >
          Add
        </Button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {(["income", "expense"] as const).map((t) => (
          <Button
            key={t}
            type={type === t ? "primary" : "default"}
            size="small"
            onClick={() => setType(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card style={{ borderRadius: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
              {editing ? "Edit Category" : "New Category"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Name
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Category name"
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Icon
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      style={{
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        fontSize: 18,
                        border:
                          form.icon === icon
                            ? "2px solid #1677ff"
                            : "2px solid transparent",
                        background:
                          form.icon === icon ? "#e6f4ff" : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Color
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: color,
                        border:
                          form.color === color
                            ? "3px solid #1677ff"
                            : "2px solid transparent",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton.Button
              key={i}
              active
              style={{ height: 56, borderRadius: 12, width: "100%" }}
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card
          style={{ borderRadius: 12, textAlign: "center", padding: "32px 0" }}
        >
          <span style={{ color: "#8c8c8c" }}>No categories yet</span>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {categories.map((cat: Category, i: number) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 12,
                border: "1px solid #f0f0f0",
                padding: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    {cat.name}
                  </span>
                  <Tag style={{ marginLeft: 8 }}>{cat.type}</Tag>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <Button
                  type="text"
                  icon={<Pencil style={{ width: 14, height: 14 }} />}
                  onClick={() => handleEdit(cat)}
                />
                <Button
                  type="text"
                  danger
                  icon={<Trash2 style={{ width: 14, height: 14 }} />}
                  onClick={() => handleDelete(cat._id)}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
