import { useEffect, useState } from "react";
import { Input, Select, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import locationService, { type LocationOption } from "../../location/locationService";
import type { JobSearchFilters } from "../types";

const normalizeNumberValue = (
  value: number | string | null | undefined
): number | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

interface SearchBarProps {
  value: JobSearchFilters;
  onSearch: (filters: JobSearchFilters) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onSearch }) => {
  const [formState, setFormState] = useState<JobSearchFilters>(value);
  const [provinces, setProvinces] = useState<LocationOption[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch {
        setProvinces([]);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    setFormState(value);
  }, [value]);

  const handleChange = <T extends keyof JobSearchFilters>(
    field: T,
    newValue: JobSearchFilters[T]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: newValue }));
  };

  const handleSearch = () => {
    onSearch(formState);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white/95 shadow-2xl rounded-3xl px-4 py-4 md:px-6 md:py-5 border border-blue-50 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 flex items-center gap-3">
            <Input
              prefix={<SearchOutlined className="text-gray-400 mr-1" />}
              placeholder="Nhập vị trí, chức danh, kỹ năng..."
              value={formState.keyword}
              onChange={(e) => handleChange("keyword", e.target.value)}
              onPressEnter={handleSearch}
              allowClear
              size="large"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:items-center w-full md:w-auto">
            <Select
              placeholder="Tất cả tỉnh thành"
              value={formState.provinceId ?? undefined}
              onChange={(value) =>
                handleChange("provinceId", normalizeNumberValue(value))
              }
              allowClear
              showSearch
              optionFilterProp="children"
              size="large"
              className="md:min-w-[220px]"
            >
              {provinces.map((prov) => (
                <Select.Option key={prov.code} value={prov.code}>
                  {prov.name}
                </Select.Option>
              ))}
            </Select>
            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              className="md:px-6 bg-sky-600 hover:bg-sky-700 border-sky-600"
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
