import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTransactions } from "../hooks/useTransactions";
import { TransactionItem } from "../components/cashbook/TransactionItem";
import {
  Button,
  Input,
  Select,
  Skeleton,
  Row,
  Col,
  Typography,
  Flex,
  Modal,
  Grid,
} from "antd";
import { Plus, Search, Trash2 } from "lucide-react";
import type { Transaction } from "../types";

const { useBreakpoint } = Grid;

interface Props {
  type?: string | null;
}

export default function Transactions({ type: routeType }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const effectiveType = routeType || params.type || "";
  const queryParams = { ...params, type: effectiveType || undefined };
  const { transactions, total, page, pages, loading, deleteTransaction } =
    useTransactions(queryParams);
  const [searchText, setSearchText] = useState(params.search || "");
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleDelete = (id: string, title: string) => {
    Modal.confirm({
      title: "Delete Transaction",
      content: `Are you sure you want to delete "${title}"?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: () => deleteTransaction(id),
    });
  };

  const setFilter = (key: string, value: string) => {
    const next = { ...params };
    if (value) next[key] = value;
    else delete next[key];
    setSearchParams(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("search", searchText);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 16 }}>
      {/* Header */}
      <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {routeType === "income"
            ? "Income"
            : routeType === "expense"
              ? "Expense"
              : "All"}{" "}
          Transactions
        </Typography.Title>
        <Link to="/transactions/new">
          <Button
            type="primary"
            icon={<Plus style={{ width: 16, height: 16 }} />}
          >
            Add
          </Button>
        </Link>
      </Flex>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ position: "relative" }}>
        <Search
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            width: 16,
            height: 16,
            color: "#8c8c8c",
            zIndex: 1,
          }}
        />
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search transactions..."
          style={{ paddingLeft: 36, width: "100%" }}
        />
      </form>

      {/* Filters */}
      <Row gutter={[8, 8]}>
        {!routeType && (
          <Col xs={12} sm={8} md={6} lg={5}>
            <Select
              value={effectiveType || undefined}
              onChange={(v) => setFilter("type", v || "")}
              placeholder="Type"
              style={{ width: "100%" }}
              allowClear
            >
              <Select.Option value="">All Types</Select.Option>
              <Select.Option value="income">Income</Select.Option>
              <Select.Option value="expense">Expense</Select.Option>
            </Select>
          </Col>
        )}
        <Col xs={12} sm={8} md={6} lg={5}>
          <Select
            value={params.paymentType || undefined}
            onChange={(v) => setFilter("paymentType", v || "")}
            placeholder="Payment"
            style={{ width: "100%" }}
            allowClear
          >
            <Select.Option value="">All Payment</Select.Option>
            <Select.Option value="Cash">Cash</Select.Option>
            <Select.Option value="Bank Transfer">Bank</Select.Option>
            <Select.Option value="Card">Card</Select.Option>

            <Select.Option value="Other">Other</Select.Option>
          </Select>
        </Col>
        <Col xs={12} sm={8} md={6} lg={5}>
          <Input
            type="date"
            value={params.startDate || ""}
            onChange={(e) => setFilter("startDate", e.target.value)}
            placeholder="Start date"
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={12} sm={8} md={6} lg={5}>
          <Input
            type="date"
            value={params.endDate || ""}
            onChange={(e) => setFilter("endDate", e.target.value)}
            placeholder="End date"
            style={{ width: "100%" }}
          />
        </Col>
      </Row>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton.Button
              key={i}
              active
              style={{ height: 64, borderRadius: 12, width: "100%" }}
            />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 16px" }}>
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: 8, fontSize: 15 }}
          >
            No transactions found
          </Typography.Text>
          <Link to="/transactions/new">
            <Button type="primary" ghost>
              Add your first transaction
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div
            style={{
              borderRadius: 12,
              border: "1px solid #f0f0f0",
              overflow: "hidden",
            }}
          >
            {transactions.map((tx: Transaction, i: number) => (
              <div
                key={tx._id}
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  borderBottom:
                    i < transactions.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <Flex align="center" style={{ padding: isMobile ? "6px 0 6px 4px" : "8px 0 8px 8px" }}>
                  <Button
                    type="text"
                    danger
                    icon={<Trash2 style={{ width: isMobile ? 16 : 14, height: isMobile ? 16 : 14 }} />}
                    onClick={() => handleDelete(tx._id, tx.title)}
                  />
                </Flex>
                <Link
                  to={`/transactions/edit/${tx._id}`}
                  style={{
                    display: "block",
                    flex: 1,
                    minWidth: 0,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <TransactionItem
                    title={tx.title}
                    amount={tx.amount}
                    type={tx.type}
                    date={tx.date}
                    categoryName={tx.category?.name}
                    categoryIcon={tx.category?.icon}
                    paymentType={tx.paymentType}
                    index={i}
                  />
                </Link>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <Flex justify="center" gap={8} wrap="wrap">
              {Array.from({ length: pages }).map((_, i) => (
                <Button
                  key={i}
                  type={page === i + 1 ? "primary" : "default"}
                  size="small"
                  onClick={() => setFilter("page", String(i + 1))}
                >
                  {i + 1}
                </Button>
              ))}
            </Flex>
          )}
        </>
      )}
    </div>
  );
}
