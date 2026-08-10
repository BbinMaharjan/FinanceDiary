import { useState } from "react";
import { useDeviceLogs } from "../hooks/useDeviceLogs";
import { Input, Skeleton, Tag, Typography, Flex } from "antd";
import { Search } from "lucide-react";
import type { DeviceCallLog } from "../types";

const TYPE_LABELS: Record<string, string> = {
  INCOMING: "Incoming",
  OUTGOING: "Outgoing",
  MISSED: "Missed",
  VOICEMAIL: "Voicemail",
  REJECTED: "Rejected",
  BLOCKED: "Blocked",
  ANSWERED_EXTERNALLY: "Answered",
  WIFI_INCOMING: "WiFi Incoming",
  WIFI_OUTGOING: "WiFi Outgoing",
  UNKNOWN: "Unknown",
};

const TYPE_COLORS: Record<string, string> = {
  OUTGOING: "green",
  WIFI_OUTGOING: "green",
  MISSED: "red",
  BLOCKED: "red",
};

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatCallDate(dateTime: string, timestamp: string): string {
  if (dateTime) return dateTime;
  if (timestamp) {
    const d = new Date(Number(timestamp));
    if (!isNaN(d.getTime())) {
      return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  return "";
}

export default function CallLogs() {
  const { callLogs, lastSyncedAt, loading } = useDeviceLogs();
  const [searchText, setSearchText] = useState("");

  const query = searchText.trim().toLowerCase();
  const filtered = query
    ? callLogs.filter(
        (log: DeviceCallLog) =>
          (log.name || "").toLowerCase().includes(query) ||
          log.formattedNumber.toLowerCase().includes(query) ||
          log.phoneNumber.toLowerCase().includes(query)
      )
    : callLogs;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Call Logs
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {callLogs.length} calls synced from your device
            {lastSyncedAt
              ? ` • last synced ${new Date(lastSyncedAt).toLocaleString("en-GB")}`
              : " • nothing synced yet"}
          </Typography.Text>
        </div>
      </Flex>

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
          placeholder="Search calls..."
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
            No call logs found
          </Typography.Text>
          <Typography.Text
            type="secondary"
            style={{ display: "block", fontSize: 13, marginTop: 4 }}
          >
            Open the Call Logs screen in the mobile app and tap Sync to upload
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
          {filtered.map((log: DeviceCallLog, i: number) => {
            const number =
              log.formattedNumber || log.phoneNumber || "Unknown";
            return (
              <div
                key={log.deviceId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom:
                    i < filtered.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Flex align="center" gap={8} wrap="wrap">
                    <Typography.Text
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {log.name || number}
                    </Typography.Text>
                    {!log.name ? (
                      <Tag style={{ marginInlineEnd: 0 }}>Unsaved</Tag>
                    ) : null}
                  </Flex>
                  {log.name ? (
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: 12, display: "block" }}
                    >
                      {number}
                    </Typography.Text>
                  ) : null}
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 12 }}
                  >
                    {formatCallDate(log.dateTime, log.timestamp)} •{" "}
                    {formatDuration(log.duration)}
                  </Typography.Text>
                </div>
                <Tag color={TYPE_COLORS[log.type]} style={{ flexShrink: 0 }}>
                  {TYPE_LABELS[log.type] ?? log.type}
                </Tag>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
