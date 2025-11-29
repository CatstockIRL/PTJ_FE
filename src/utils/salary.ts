export type SalaryTypeCode = 1 | 2 | 3 | 4 | 5;

export interface SalaryTypeOption {
  value: SalaryTypeCode;
  label: string;
  suffix: string;
}

export const salaryTypeOptions: SalaryTypeOption[] = [
  { value: 1, label: "Theo giờ", suffix: "/giờ" },
  { value: 2, label: "Theo ca", suffix: "/ca" },
  { value: 3, label: "Theo ngày", suffix: "/ngày" },
  { value: 4, label: "Theo tháng", suffix: "/tháng" },
  { value: 5, label: "Theo dự án", suffix: "/dự án" },
];

export const getSalarySuffix = (
  type?: SalaryTypeCode | number | null
): string => {
  if (!type) return "";
  const option = salaryTypeOptions.find((opt) => opt.value === type);
  return option?.suffix ?? "";
};

export const isNegotiableSalary = (
  min?: number | null,
  max?: number | null,
  type?: SalaryTypeCode | number | null
): boolean => {
  return min == null && max == null && type == null;
};

export const formatSalaryRange = (
  min?: number | null,
  max?: number | null,
  type?: SalaryTypeCode | number | null,
  fallback = "Thỏa thuận"
): string => {
  if (isNegotiableSalary(min, max, type)) {
    return fallback;
  }

  const suffix = getSalarySuffix(type);

  if (min != null && max != null) {
    return `${min.toLocaleString("vi-VN")} - ${max.toLocaleString(
      "vi-VN"
    )}${suffix}`;
  }

  if (min != null) {
    return `Từ ${min.toLocaleString("vi-VN")}${suffix}`;
  }

  if (max != null) {
    return `Đến ${max.toLocaleString("vi-VN")}${suffix}`;
  }

  return fallback;
};

export const getRepresentativeSalaryValue = (
  min?: number | null,
  max?: number | null
): number | null => {
  if (min != null && max != null) {
    return (min + max) / 2;
  }
  if (max != null) return max;
  if (min != null) return min;
  return null;
};
