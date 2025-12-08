import React, { useEffect, useState } from "react";
import { Card, Tabs, Table, Tag, Typography, message } from "antd";
import baseService from "../../services/baseService";

type TransactionItem = {
  transactionId: number;
  planId?: number | null;
  amount?: number | null;
  status?: string | null;
  payOsorderCode?: string | null;
  createdAt?: string | null;
  paidAt?: string | null;
};

type SubscriptionItem = {
  subscriptionId: number;
  planName?: string | null;
  price?: number | null;
  remainingPosts?: number | null;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString("vi-VN") : "-";

const numberText = (value?: number | null) =>
  typeof value === "number" ? value.toLocaleString("vi-VN") : "-";

const EmployerBillingHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loadingTxn, setLoadingTxn] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);

  const fetchTransactions = async () => {
    setLoadingTxn(true);
    try {
      const res = await baseService.get("/payment/transaction-history");
      const data =
        res && typeof res === "object" && "data" in res
          ? (res as { data?: unknown }).data
          : (res as unknown);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("load transaction history error", error);
      message.error("Không thể tải lịch sử giao dịch");
    } finally {
      setLoadingTxn(false);
    }
  };

  const fetchSubscriptions = async () => {
    setLoadingSub(true);
    try {
      const res = await baseService.get("/payment/subscription-history");
      const data =
        res && typeof res === "object" && "data" in res
          ? (res as { data?: unknown }).data
          : (res as unknown);
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("load subscription history error", error);
      message.error("Không thể tải lịch sử gói");
    } finally {
      setLoadingSub(false);
    }
  };

  useEffect(() => {
    void fetchTransactions();
    void fetchSubscriptions();
  }, []);

  const txnColumns = [
    { title: "Mã GD", dataIndex: "transactionId", key: "transactionId", width: 100 },
    { title: "Gói", dataIndex: "planId", key: "planId", width: 80 },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: numberText,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: string) => <Tag color={v === "Paid" ? "green" : v === "Pending" ? "orange" : "default"}>{v}</Tag>,
    },
    { title: "Mã order", dataIndex: "payOsorderCode", key: "payOsorderCode" },
    { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", render: formatDateTime },
    { title: "Thanh toán", dataIndex: "paidAt", key: "paidAt", render: formatDateTime },
  ];

  const subColumns = [
    { title: "Gói", dataIndex: "planName", key: "planName" },
    { title: "Giá", dataIndex: "price", key: "price", render: numberText },
    { title: "Bài còn", dataIndex: "remainingPosts", key: "remainingPosts", render: numberText },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: string) => <Tag color={v === "Active" ? "green" : v === "Expired" ? "red" : "default"}>{v}</Tag>,
    },
    { title: "Bắt đầu", dataIndex: "startDate", key: "startDate", render: formatDateTime },
    { title: "Kết thúc", dataIndex: "endDate", key: "endDate", render: formatDateTime },
  ];

  return (
    <div className="p-4 space-y-4">
      <Typography.Title level={3} className="!mb-2">
        Lịch sử gói & giao dịch
      </Typography.Title>
      <Typography.Paragraph type="secondary" className="!mb-4">
        Theo dõi gói đã mua và các giao dịch thanh toán.
      </Typography.Paragraph>

      <Card>
        <Tabs
          items={[
            {
              key: "txn",
              label: "Giao dịch",
              children: (
                <Table
                  rowKey={(record: TransactionItem) => record.transactionId}
                  dataSource={transactions}
                  columns={txnColumns}
                  loading={loadingTxn}
                  pagination={false}
                  scroll={{ x: 800 }}
                />
              ),
            },
            {
              key: "sub",
              label: "Lịch sử gói",
              children: (
                <Table
                  rowKey={(record: SubscriptionItem) => record.subscriptionId}
                  dataSource={subscriptions}
                  columns={subColumns}
                  loading={loadingSub}
                  pagination={false}
                  scroll={{ x: 800 }}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default EmployerBillingHistoryPage;
