import React from "react";
import { Badge, Dropdown, List, Avatar, Button, Empty } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchNotifications,
  markNotificationAsRead,
  addNotification,
  setConnectionStatus,
} from "../slice";
import type { Notification } from "../types";
import { signalRService } from "../signalRService";
import type { AppDispatch } from "../../../app/store";

let subscriberCount = 0;
let currentUserKey: string | null = null;
let listenerAttached = false;
let globalDispatch: AppDispatch | null = null;

const handleRealtimeNotification = (notification: Notification) => {
  if (globalDispatch) {
    globalDispatch(addNotification(notification));
  }
};

const NotificationDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notification
  );
  const userId = useAppSelector((state) => state.auth.user?.id);

  React.useEffect(() => {
    if (!userId) return;

    const userKey = String(userId);
    globalDispatch = dispatch;

    const isNewUser = currentUserKey !== userKey;

    if (isNewUser && subscriberCount > 0) {
      // User changed while another subscriber was active; reset connection
      if (listenerAttached) {
        signalRService.offReceiveNotification(handleRealtimeNotification);
        listenerAttached = false;
      }
      signalRService.stopConnection();
      subscriberCount = 0;
    }

    if (subscriberCount === 0 || isNewUser) {
      dispatch(fetchNotifications(undefined));
      signalRService.startConnection(userKey);
      dispatch(setConnectionStatus("connected"));
      if (!listenerAttached) {
        signalRService.onReceiveNotification(handleRealtimeNotification);
        listenerAttached = true;
      }
    }

    subscriberCount += 1;
    currentUserKey = userKey;

    return () => {
      subscriberCount = Math.max(0, subscriberCount - 1);
      if (subscriberCount === 0) {
        if (listenerAttached) {
          signalRService.offReceiveNotification(handleRealtimeNotification);
          listenerAttached = false;
        }
        signalRService.stopConnection();
        dispatch(setConnectionStatus("disconnected"));
        currentUserKey = null;
        globalDispatch = null;
      }
    };
  }, [dispatch, userId]);

  const handleItemClick = (item: Notification) => {
    if (!item.isRead) {
      dispatch(markNotificationAsRead(item.notificationId));
    }
    // Navigate based on notification type if needed
    // if (item.relatedItemId) {
    //   navigate(`/some-path/${item.relatedItemId}`);
    // }
  };

  const menu = {
    items: [
      {
        key: "notifications",
        label: (
          <div className="w-80 bg-white max-h-96 overflow-y-auto">
            <div className="p-3 border-b flex justify-between items-center bg-gray-50">
              <span className="font-semibold text-gray-700">Thông báo</span>
              <Button
                type="link"
                size="small"
                onClick={() => dispatch(fetchNotifications(undefined))}
              >
                Làm mới
              </Button>
            </div>
            <List
              itemLayout="horizontal"
              dataSource={notifications}
              locale={{ emptyText: <Empty description="Không có thông báo nào" /> }}
              renderItem={(item) => (
                <List.Item
                  className={`cursor-pointer hover:bg-gray-50 transition-colors p-3 border-b last:border-b-0 ${
                    !item.isRead ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<BellOutlined />}
                        className={!item.isRead ? "bg-blue-500" : "bg-gray-300"}
                      />
                    }
                    title={
                      <span
                        className={`text-sm ${
                          !item.isRead ? "font-bold text-gray-800" : "text-gray-600"
                        }`}
                      >
                        {item.title}
                      </span>
                    }
                    description={
                      <div>
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {item.message}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        ),
      },
    ],
  };

  return (
    <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
      <Badge count={unreadCount} overflowCount={99}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: "20px" }} />}
          className="flex items-center justify-center"
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;
