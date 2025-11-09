// Định nghĩa các hằng số cho trạng thái ứng tuyển (application status)

// Trạng thái ứng tuyển bằng tiếng Anh, dùng để so khớp với dữ liệu từ API
export const APPLICATION_STATUS = {
  PENDING: 'pending', // Đang chờ duyệt
  WITHDRAWN: 'withdraw', // Đã rút đơn
  ACCEPTED: 'accept', // Đã chấp nhận
  REJECTED: 'reject' // Đã từ chối
} as const

// Trạng thái ứng tuyển bằng tiếng Việt, dùng để hiển thị trên giao diện người dùng
export const APPLICATION_STATUS_VN = {
  Pending: 'Đang chờ',
  Withdrawn: 'Đã rút đơn',
  Accept: 'Chấp nhận',
  Reject: 'Từ chối'
}

// Màu sắc tương ứng với từng trạng thái, sử dụng cho component Tag của Ant Design
export const STATUS_COLORS: { [key: string]: string } = {
  Pending: 'blue',
  Withdrawn: 'grey',
  Accept: 'green',
  Reject: 'red'
}
