import { useState } from "react";
import { useDeviceLogs } from "../hooks/useDeviceLogs";
import { Input, Skeleton, Segmented, Tag, Typography, Flex } from "antd";
import { Search } from "lucide-react";
import type { SmsMessage } from "../types";

type Box = "all" | "inbox" | "sent";

function formatSmsDate(date: string): string {
  if (!date) return "";
  const d = new Date(Number(date));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SmsLogs() {
  const { sms, lastSyncedAt, loading } = useDeviceLogs();
  const [box, setBox] = useState<Box>("all");
  const [searchText, setSearchText] = useState("");

  const query = searchText.trim().toLowerCase();
  const filtered = sms.filter((m: SmsMessage) => {
    if (box !== "all" && m.box !== box) return false;
    if (
      query &&
      !m.address.toLowerCase().includes(query) &&
      !m.body.toLowerCase().includes(query)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Messages
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {sms.length} messages synced from your device
            {lastSyncedAt
              ? ` • last synced ${new Date(lastSyncedAt).toLocaleString("en-GB")}`
              : " • nothing synced yet"}
          </Typography.Text>
        </div>
      </Flex>

      <Segmented
        block
        value={box}
        onChange={(v) => setBox(v as Box)}
        options={[
          { label: "All", value: "all" },
          { label: "Inbox", value: "inbox" },
          { label: "Sent", value: "sent" },
        ]}
      />

      <form
        onSubmit={(e) => e.preventDefault()}
        style={{ position: "relative" }}
      >
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
          placeholder="Search messages..."
          style={{ paddingLeft: 36, width: "100%" }}
        />
      </form>

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
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 16px" }}>
          <Typography.Text type="secondary" style={{ fontSize: 15 }}>
            No messages found
          </Typography.Text>
          <Typography.Text
            type="secondary"
            style={{ display: "block", fontSize: 13, marginTop: 4 }}
          >
            Open the Messages screen in the mobile app and tap Sync to upload
            them here.
          </Typography.Text>
        </div>
      ) : (
        <div
          style={{
            borderRadius: 12,
            border: "1px solid #f0f0f0",
            overflow: "hidden",
          }}
        >
          {filtered.map((m: SmsMessage, i: number) => (
            <div
              key={m.deviceId}
              style={{
                padding: "12px 16px",
                borderBottom:
                  i < filtered.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <Flex align="center" justify="space-between" gap={8}>
                <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                  <Typography.Text
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.address || "Unknown"}
                  </Typography.Text>
                  <Tag style={{ marginInlineEnd: 0 }} color={m.box === "sent" ? "blue" : "default"}>
                    {m.box === "sent" ? "Sent" : "Inbox"}
                  </Tag>
                </Flex>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 11, flexShrink: 0 }}
                >
                  {formatSmsDate(m.date)}
                </Typography.Text>
              </Flex>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 13, display: "block", marginTop: 4 }}
              >
                {m.body}
              </Typography.Text>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
