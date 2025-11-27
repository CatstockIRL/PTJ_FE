import React, {
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  Input,
  InputNumber,
  Select,
  Checkbox,
  TimePicker,
  Space,
  Upload,
  Modal,
  Image
} from "antd";
import { PlusOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import type { JobPostData } from "../../jobTypes";
import JoditEditor from "jodit-react";
import debounce from "lodash.debounce";
import "jodit/es2021/jodit.min.css";
import { useCategories } from "../../../category/hook";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import locationService, {
  type LocationOption,
} from "../../../location/locationService";
import { useSubCategories } from "../../../subcategory/hook";

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, required, children }) => (
  <div className="grid grid-cols-3 gap-4 mb-4 items-start">
    <label className="text-sm font-medium text-gray-700 text-left pt-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="col-span-2">{children}</div>
  </div>
);

const timeRangeRegex = /^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/;

export const JobInfoFormSection: React.FC<{
  data: JobPostData;
  onDataChange: (field: keyof JobPostData, value: any) => void;
  isEditMode?: boolean;
}> = ({ data, onDataChange, isEditMode }) => {
  const editor = useRef(null);
  const { categories, isLoading } = useCategories();
  const { subCategories, isLoading: isLoadingSubCategories } = useSubCategories(
    data.categoryID ?? null
  );

  const [validation, setValidation] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [timeRange, setTimeRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [isNegotiable, setIsNegotiable] = useState(false);

  // --- Location State ---
  const [provinceOptions, setProvinceOptions] = useState<LocationOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<LocationOption[]>([]);
  const [wardOptions, setWardOptions] = useState<LocationOption[]>([]);
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");
  const [locationLoading, setLocationLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  // --- Image Upload State ---
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // Sync fileList with data.images manually if needed (mostly one-way UI -> Data)
  useEffect(() => {
    // Reset fileList if data.images is cleared externally (e.g. reset form)
    if (!data.images || data.images.length === 0) {
      if (fileList.length > 0 && fileList.every(f => f.originFileObj)) {
         setFileList([]);
      }
    }
  }, [data.images]);

  // --- Location Effects ---
  useEffect(() => {
    let mounted = true;
    const fetchProvinces = async () => {
      setLocationLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const provinces = await locationService.getProvinces();
        if (mounted) setProvinceOptions(provinces);
      } catch (error) {
        console.error("Failed to load provinces", error);
      } finally {
        if (mounted) setLocationLoading((prev) => ({ ...prev, provinces: false }));
      }
    };
    fetchProvinces();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!data.provinceId) {
      setDistrictOptions([]); setWardOptions([]);
      setDistrictName(""); setWardName("");
      return;
    }
    let mounted = true;
    const fetchDistricts = async () => {
      setLocationLoading((prev) => ({ ...prev, districts: true }));
      try {
        const districts = await locationService.getDistricts(data.provinceId as number);
        if (mounted) setDistrictOptions(districts);
      } catch (error) { console.error("Failed"); } 
      finally { if (mounted) setLocationLoading((prev) => ({ ...prev, districts: false })); }
    };
    fetchDistricts();
    return () => { mounted = false; };
  }, [data.provinceId]);

  useEffect(() => {
    if (!data.districtId) {
      setWardOptions([]); setWardName(""); return;
    }
    let mounted = true;
    const fetchWards = async () => {
      setLocationLoading((prev) => ({ ...prev, wards: true }));
      try {
        const wards = await locationService.getWards(data.districtId as number);
        if (mounted) setWardOptions(wards);
      } catch (error) { console.error("Failed"); } 
      finally { if (mounted) setLocationLoading((prev) => ({ ...prev, wards: false })); }
    };
    fetchWards();
    return () => { mounted = false; };
  }, [data.districtId]);

  // --- Location Names ---
  useEffect(() => {
    if (!data.provinceId) { setProvinceName(""); return; }
    const p = provinceOptions.find((i) => i.code === data.provinceId);
    if (p) setProvinceName(p.name);
  }, [provinceOptions, data.provinceId]);

  useEffect(() => {
    if (!data.districtId) { setDistrictName(""); return; }
    const d = districtOptions.find((i) => i.code === data.districtId);
    if (d) setDistrictName(d.name);
  }, [districtOptions, data.districtId]);

  useEffect(() => {
    if (!data.wardId) { setWardName(""); return; }
    const w = wardOptions.find((i) => i.code === data.wardId);
    if (w) setWardName(w.name);
  }, [wardOptions, data.wardId]);

  const locationDisplay = useMemo(() => {
    const parts = [
      data.detailAddress?.trim(),
      wardName,
      districtName,
      provinceName,
    ].filter((part) => part && part.length > 0);
    return parts.join(", ");
  }, [data.detailAddress, wardName, districtName, provinceName]);

  useEffect(() => {
    if (locationDisplay !== data.location) {
      onDataChange("location", locationDisplay);
    }
  }, [locationDisplay, data.location, onDataChange]);

  // --- Salary & Time Logic ---
  useEffect(() => { setIsNegotiable(Boolean(data.salaryText)); }, [data.salaryText]);

  useEffect(() => {
    if (!touched.workHours) return;
    const invalid = !timeRange[0] || !timeRange[1] || !timeRange[1]?.isAfter(timeRange[0]!);
    setValidation((prev) => ({ ...prev, workHours: invalid }));
  }, [timeRange, touched.workHours]);

  useEffect(() => {
    const { workHourStart, workHourEnd, workHours } = data;
    if (workHourStart && workHourEnd) {
      setTimeRange([dayjs(workHourStart, "HH:mm"), dayjs(workHourEnd, "HH:mm")]);
      return;
    }
    const match = workHours ? workHours.match(timeRangeRegex) : null;
    if (match) {
      setTimeRange([dayjs(match[1], "HH:mm"), dayjs(match[2], "HH:mm")]);
    } else {
      setTimeRange([null, null]);
    }
  }, [data.workHourStart, data.workHourEnd, data.workHours]);

  // --- Editor Config ---
  const config = useMemo(() => ({
    readonly: false,
    placeholder: "Mô tả công việc...",
    height: 200,
    showPoweredBy: false,
    toolbarAdaptive: false,
    buttons: ["bold", "italic", "underline", "|", "ul", "ol", "|", "alignleft", "aligncenter", "alignright", "|", "undo", "redo", "|", "find"],
  }), []);

  const handleEditorChange = useCallback(
    debounce((content: string) => { onDataChange("jobDescription", content); }, 400),
    [onDataChange]
  );

  // --- Handlers ---
  const handleBlur = (field: keyof JobPostData, value: any) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let isInvalid = false;
    const phoneRegex = /^(?:\+84|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/;

    if (["jobTitle", "detailAddress", "requirements", "contactPhone"].includes(field as string)) {
      isInvalid = !value || (value as string).trim() === "";
      if (field === "contactPhone" && !isInvalid && !phoneRegex.test((value as string).trim())) {
        isInvalid = true;
      }
    }
    if (field === "jobDescription") {
      const normalized = typeof value === "string" ? value.replace(/<[^>]*>/g, " ").trim() : "";
      isInvalid = !normalized || normalized.length < 20;
    }
    if (field === "categoryID" || field === "subCategoryId") isInvalid = !value;
    if (field === "salaryValue") isInvalid = !isNegotiable && (!value || value <= 0);
    if (["provinceId", "districtId", "wardId"].includes(field as string)) isInvalid = !value;
    if (field === "workHours") {
      const [start, end] = timeRange;
      isInvalid = !start || !end || !end.isAfter(start);
    }
    setValidation((prev) => ({ ...prev, [field]: isInvalid }));
  };

  const handleChange = (field: keyof JobPostData, value: any) => {
    if (field === "categoryID") {
      onDataChange(field, value);
      onDataChange("subCategoryId", null);
      setValidation((prev) => ({ ...prev, subCategoryId: false }));
    } else {
      onDataChange(field, value);
    }
    if (validation[field]) setValidation((prev) => ({ ...prev, [field]: false }));
  };

  const handleSalaryNegotiableChange = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    setIsNegotiable(checked);
    if (checked) {
      handleChange("salaryValue", null);
      handleChange("salaryText", "Thỏa thuận");
      setValidation((prev) => ({ ...prev, salaryValue: false }));
    } else {
      handleChange("salaryText", null);
    }
  };

  const handleTimeRangeChange = (values: [Dayjs | null, Dayjs | null]) => {
    setTimeRange(values);
    setTouched((prev) => ({ ...prev, workHours: true }));
    const [start, end] = values;
    if (start && end) {
      if (!end.isAfter(start)) {
        setValidation((prev) => ({ ...prev, workHours: true }));
        handleChange("workHourStart", null); handleChange("workHourEnd", null); handleChange("workHours", "");
        return;
      }
      const formatted = `${start.format("HH:mm")} - ${end.format("HH:mm")}`;
      handleChange("workHourStart", start.format("HH:mm"));
      handleChange("workHourEnd", end.format("HH:mm"));
      handleChange("workHours", formatted);
      setValidation((prev) => ({ ...prev, workHours: false }));
      return;
    }
    handleChange("workHourStart", null); handleChange("workHourEnd", null); handleChange("workHours", "");
    setValidation((prev) => ({ ...prev, workHours: true }));
  };

  const handleProvinceChange = (value: number | null) => {
    handleChange("provinceId", value ?? null); handleChange("districtId", null); handleChange("wardId", null);
    setTouched((prev) => ({ ...prev, provinceId: true, districtId: false, wardId: false }));
    setValidation((prev) => ({ ...prev, provinceId: !value, districtId: false, wardId: false }));
  };
  const handleDistrictChange = (value: number | null) => {
    handleChange("districtId", value ?? null); handleChange("wardId", null);
    setTouched((prev) => ({ ...prev, districtId: true, wardId: false }));
    setValidation((prev) => ({ ...prev, districtId: !value, wardId: false }));
  };
  const handleWardChange = (value: number | null) => {
    handleChange("wardId", value ?? null);
    setTouched((prev) => ({ ...prev, wardId: true }));
    setValidation((prev) => ({ ...prev, wardId: !value }));
  };

  // --- Image Upload Handlers ---
  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    const validFiles = newFileList
      .map(f => f.originFileObj)
      .filter((f): f is File => f !== undefined);
    
    onDataChange("images", validFiles);
  };

  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-blue-700 mb-6">Thông tin công việc</h3>

      {/* Tên công việc */}
      <FormField label="Tên công việc" required>
        <Input
          size="large"
          placeholder="Nhập tiêu đề công việc"
          value={data.jobTitle}
          onChange={(e) => handleChange("jobTitle", e.target.value)}
          onBlur={() => handleBlur("jobTitle", data.jobTitle)}
          className={validation.jobTitle ? "border-red-500" : ""}
        />
        {validation.jobTitle && <p className="text-red-500 text-sm mt-1">Vui lòng nhập tiêu đề công việc</p>}
      </FormField>

      {/* Địa điểm */}
      <FormField label="Địa điểm" required>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Select
                size="large" placeholder="Chọn tỉnh/thành" loading={locationLoading.provinces}
                value={data.provinceId ?? undefined}
                options={provinceOptions.map((o) => ({ value: o.code, label: o.name }))}
                onChange={(v) => handleProvinceChange(v as number)}
                allowClear
              />
              {validation.provinceId && touched.provinceId && <p className="text-red-500 text-sm mt-1">Vui lòng chọn tỉnh/thành</p>}
            </div>
            <div>
              <Select
                size="large" placeholder="Chọn quận/huyện" loading={locationLoading.districts}
                value={data.districtId ?? undefined} disabled={!data.provinceId}
                options={districtOptions.map((o) => ({ value: o.code, label: o.name }))}
                onChange={(v) => handleDistrictChange(v as number)}
                allowClear
              />
              {validation.districtId && touched.districtId && <p className="text-red-500 text-sm mt-1">Vui lòng chọn quận/huyện</p>}
            </div>
            <div>
              <Select
                size="large" placeholder="Chọn phường/xã" loading={locationLoading.wards}
                value={data.wardId ?? undefined} disabled={!data.districtId}
                options={wardOptions.map((o) => ({ value: o.code, label: o.name }))}
                onChange={(v) => handleWardChange(v as number)}
                allowClear
              />
              {validation.wardId && touched.wardId && <p className="text-red-500 text-sm mt-1">Vui lòng chọn phường/xã</p>}
            </div>
          </div>
          <Input
            size="large" placeholder="Số nhà, tên đường..."
            value={data.detailAddress}
            onChange={(e) => handleChange("detailAddress", e.target.value)}
            onBlur={() => handleBlur("detailAddress", data.detailAddress)}
            className={validation.detailAddress ? "border-red-500" : ""}
          />
          {validation.detailAddress && <p className="text-red-500 text-sm mt-1">Vui lòng nhập địa chỉ chi tiết</p>}
        </div>
      </FormField>

      {/* Lương */}
      <FormField label="Mức lương (VND)">
        <InputNumber
          size="large" min={0}
          className={`w-full ${validation.salaryValue ? "border-red-500" : ""}`}
          placeholder="Nhập mức lương (ví dụ: 15000000)"
          value={data.salaryValue ?? undefined}
          onChange={(value) => handleChange("salaryValue", value ?? null)}
          onBlur={() => handleBlur("salaryValue", data.salaryValue)}
          disabled={isNegotiable}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
        />
        <Checkbox checked={isNegotiable} onChange={handleSalaryNegotiableChange} className="mt-2">
          Thỏa thuận (Không hiển thị lương)
        </Checkbox>
        {validation.salaryValue && <p className="text-red-500 text-sm mt-1">Vui lòng nhập mức lương hợp lệ</p>}
      </FormField>

      {/* Mô tả */}
      <FormField label="Mô tả công việc" required>
        <div className={validation.jobDescription ? "jodit-invalid" : ""}>
          <JoditEditor
            ref={editor} value={data.jobDescription} config={config}
            onBlur={(newContent) => { handleEditorChange(newContent); handleBlur("jobDescription", newContent); }}
            onChange={() => { if (validation.jobDescription) setValidation((p) => ({ ...p, jobDescription: false })); }}
          />
        </div>
        {validation.jobDescription && <p className="text-red-500 text-sm mt-1">Vui lòng nhập mô tả (ít nhất 20 ký tự)</p>}
        <style>{`.jodit-invalid .jodit-container { border: 1px solid #ef4444; }`}</style>
      </FormField>

      {/* Yêu cầu */}
      <FormField label="Yêu cầu công việc" required>
        <Input.TextArea
          rows={3} placeholder="Nhập yêu cầu về kỹ năng, kinh nghiệm..."
          value={data.requirements}
          onChange={(e) => handleChange("requirements", e.target.value)}
          onBlur={() => handleBlur("requirements", data.requirements)}
          className={validation.requirements ? "border-red-500" : ""}
        />
        {validation.requirements && <p className="text-red-500 text-sm mt-1">Vui lòng nhập yêu cầu công việc</p>}
      </FormField>

      {/* HÌNH ẢNH (MỚI) */}
      <FormField label="Hình ảnh mô tả">
        <div className="space-y-4">
          {/* Hiển thị ảnh cũ nếu có */}
          {isEditMode && data.existingImages && data.existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-500 text-xs mb-2">Hình ảnh hiện tại:</p>
              <div className="flex flex-wrap gap-2">
                 <Image.PreviewGroup>
                  {data.existingImages.map((url, index) => (
                    <div key={index} className="relative group border rounded p-1">
                      <Image width={100} height={100} src={url} className="object-cover rounded" />
                      {/* Lưu ý: Backend cần trả về ID ảnh để thực hiện xóa chính xác. 
                          Hiện tại BE trả về string url nên không thể map chính xác vào deleteImageIds. 
                          Tạm thời chỉ hiển thị. */}
                    </div>
                  ))}
                </Image.PreviewGroup>
              </div>
            </div>
          )}

          {/* Upload ảnh mới */}
          <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleUploadChange}
            beforeUpload={() => false} // Chặn auto upload, chỉ lưu file object
            multiple
            accept="image/*"
          >
            {fileList.length >= 5 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Thêm ảnh</div>
              </div>
            )}
          </Upload>
          <p className="text-xs text-gray-400">Hỗ trợ định dạng JPG, PNG. Tối đa 5 ảnh.</p>
          
          <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </div>
      </FormField>

      {/* Giờ làm việc */}
      <FormField label="Giờ làm việc" required>
        <Space.Compact className="w-full">
          <TimePicker
            value={timeRange[0]} onChange={(t) => handleTimeRangeChange([t, timeRange[1]])}
            format="HH:mm" placeholder="Từ" className={validation.workHours ? "border-red-500" : ""} style={{ width: "50%" }}
          />
          <TimePicker
            value={timeRange[1]} onChange={(t) => handleTimeRangeChange([timeRange[0], t])}
            format="HH:mm" placeholder="Đến" className={validation.workHours ? "border-red-500" : ""} style={{ width: "50%" }}
          />
        </Space.Compact>
        {validation.workHours && <p className="text-red-500 text-sm mt-1">Giờ kết thúc phải sau giờ bắt đầu</p>}
      </FormField>

      {/* Ngành nghề */}
      <FormField label="Ngành nghề" required>
        <Select
          size="large" placeholder={isLoading ? "Đang tải..." : "Chọn ngành nghề"}
          loading={isLoading} value={data.categoryID ?? undefined}
          onChange={(v) => handleChange("categoryID", v)}
          onBlur={() => handleBlur("categoryID", data.categoryID)}
          className={validation.categoryID ? "select-invalid" : ""}
          options={categories.map((c: any) => ({ value: c.categoryId, label: c.name }))}
        />
        {validation.categoryID && <p className="text-red-500 text-sm mt-1">Vui lòng chọn ngành nghề</p>}
        <style>{`.select-invalid .ant-select-selector { border-color: #ef4444 !important; }`}</style>
      </FormField>

      {/* Nhóm nghề */}
      <FormField label="Nhóm nghề" required>
        <Select
          size="large" placeholder={data.categoryID ? (isLoadingSubCategories ? "Đang tải..." : "Chọn nhóm nghề") : "Chọn ngành trước"}
          loading={isLoadingSubCategories} disabled={!data.categoryID}
          value={data.subCategoryId ?? undefined}
          onChange={(v) => handleChange("subCategoryId", v)}
          onBlur={() => handleBlur("subCategoryId", data.subCategoryId)}
          className={validation.subCategoryId ? "select-invalid" : ""}
          options={subCategories.map((s: any) => ({ value: s.subCategoryId, label: s.name }))}
          allowClear
        />
        {validation.subCategoryId && <p className="text-red-500 text-sm mt-1">Vui lòng chọn nhóm nghề</p>}
      </FormField>

      {/* Điện thoại */}
      <FormField label="Số điện thoại liên hệ" required>
        <Input
          size="large" placeholder="0912345678"
          value={data.contactPhone}
          onBlur={() => handleBlur("contactPhone", data.contactPhone)}
          onChange={(e) => handleChange("contactPhone", e.target.value)}
          className={validation.contactPhone ? "border-red-500" : ""}
        />
        {validation.contactPhone && <p className="text-red-500 text-sm mt-1">Số điện thoại không hợp lệ</p>}
      </FormField>
    </div>
  );
};