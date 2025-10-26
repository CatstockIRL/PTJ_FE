// src/utils/date.ts

const TIME_UNITS = [
  { unit: 'năm', seconds: 31536000 },
  { unit: 'tháng', seconds: 2592000 },
  { unit: 'ngày', seconds: 86400 },
  { unit: 'giờ', seconds: 3600 },
  { unit: 'phút', seconds: 60 },
  { unit: 'giây', seconds: 1 }
];

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) {
    return 'Cập nhật vừa xong';
  }

  for (const { unit, seconds: unitSeconds } of TIME_UNITS) {
    const interval = Math.floor(seconds / unitSeconds);
    if (interval >= 1) {
      return `Cập nhật ${interval} ${unit} trước`;
    }
  }
  return 'Cập nhật vừa xong';
};