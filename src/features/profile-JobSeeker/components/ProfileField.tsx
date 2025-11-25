import React, { useState } from "react";
import { Typography, Button, Input, Space } from "antd";
import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";

interface ProfileFieldProps {
  label: string;
  value?: string | number | null;
  inputType?: "text" | "textarea";
  onSave?: (value: string) => void | Promise<void>;
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  inputType = "text",
  onSave
}) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentValue, setCurrentValue] = useState<string>(
    value !== null && value !== undefined ? String(value) : ""
  );

  const startEditing = () => {
    setCurrentValue(value !== null && value !== undefined ? String(value) : "");
    setEditing(true);
  };

  const cancelEditing = () => {
    setCurrentValue(value !== null && value !== undefined ? String(value) : "");
    setEditing(false);
  };

  const handleSave = async () => {
    if (!onSave) {
      setEditing(false);
      return;
    }

    try {
      setSaving(true);
      await Promise.resolve(onSave(currentValue));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const displayValue = value !== null && value !== undefined ? value : "Chua cap nhat";

  return (
    <div className="py-3 border-b last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
          {editing ? (
            inputType === "textarea" ? (
              <Input.TextArea
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            ) : (
              <Input value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} />
            )
          ) : (
            <Typography.Text className="text-base">{displayValue}</Typography.Text>
          )}
        </div>
        {onSave && (
          <Space size="small">
            {editing ? (
              <>
                <Button size="small" onClick={cancelEditing} icon={<CloseOutlined />}>
                  Huy
                </Button>
                <Button
                  type="primary"
                  size="small"
                  loading={saving}
                  onClick={handleSave}
                  icon={<SaveOutlined />}
                >
                  Luu
                </Button>
              </>
            ) : (
              <Button size="small" onClick={startEditing} icon={<EditOutlined />}>
                Sua
              </Button>
            )}
          </Space>
        )}
      </div>
    </div>
  );
};

export default ProfileField;
