import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Select,
  Card,
  InputNumber,
  Radio,
  message,
  Spin,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../app/store";
import { useAuth } from "../../auth/hooks";
import { createPosting, resetPostStatus, fetchPostById, updatePosting } from "../slice/slice";
import { useCategories } from "../../category/hook";
import type {
  CreateJobSeekerPostPayload,
  UpdateJobSeekerPostPayload,
} from "../types";
import locationService, {
  type LocationOption,
} from "../../location/locationService";

const { Title } = Typography;
const { TextArea } = Input;

const CreatePostingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const isCreateMode = location.pathname.includes("/tao-bai-dang-tim-viec");
  const isViewMode = location.pathname.includes("/xem-bai-dang-tim-viec");
  const isEditMode = location.pathname.includes("/sua-bai-dang-tim-viec");
  const [isReadOnly, setIsReadOnly] = useState(isViewMode);

  const { user } = useAuth();
  const { loading: isSubmitting, success, error } = useSelector(
    (state: RootState) => state.jobSeekerPosting.create.create
  );
  const { post: postDetail, loading: isLoadingDetail } = useSelector(
    (state: RootState) => state.jobSeekerPosting.create.detail
  );

  const { categories, isLoading: isLoadingCategories } = useCategories();
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [locationLoading, setLocationLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  const pageTitle = isCreateMode
    ? "T?o bài dang tìm vi?c Part-time"
    : isEditMode
    ? "Ch?nh s?a bài dang tìm vi?c"
    : "Chi ti?t bài dang tìm vi?c";
  const buttonText = isCreateMode ? "Ðang bài" : "Luu thay d?i";

  useEffect(() => {
    setIsReadOnly(isViewMode);
  }, [isViewMode]);

  useEffect(() => {
    const loadProvinces = async () => {
      setLocationLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch (err) {
        message.error("Không th? t?i danh sách khu v?c");
      } finally {
        setLocationLoading((prev) => ({ ...prev, provinces: false }));
      }
    };
    loadProvinces();
  }, []);

  const handleProvinceChange = async (value?: number) => {
    form.setFieldsValue({ districtId: undefined, wardId: undefined });
    setDistricts([]);
    setWards([]);
    if (!value) return;
    setLocationLoading((prev) => ({ ...prev, districts: true }));
    try {
      const data = await locationService.getDistricts(value);
      setDistricts(data);
    } catch (err) {
      message.error("Không th? t?i danh sách qu?n/huy?n");
    } finally {
      setLocationLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const handleDistrictChange = async (value?: number) => {
    form.setFieldsValue({ wardId: undefined });
    setWards([]);
    if (!value) return;
    setLocationLoading((prev) => ({ ...prev, wards: true }));
    try {
      const data = await locationService.getWards(value);
      setWards(data);
    } catch (err) {
      message.error("Không th? t?i danh sách phu?ng/xã");
    } finally {
      setLocationLoading((prev) => ({ ...prev, wards: false }));
    }
  };

  useEffect(() => {
    if ((isViewMode || isEditMode) && id) {
      dispatch(fetchPostById(Number(id)));
    }
  }, [dispatch, id, isViewMode, isEditMode]);

  useEffect(() => {
    if (postDetail && (isViewMode || isEditMode)) {
      form.setFieldsValue({
        ...postDetail,
        locationDetail: postDetail.preferredLocation,
      });
    }
    if (postDetail && categories.length > 0 && (isViewMode || isEditMode)) {
      const category = categories.find((c) => c.name === postDetail.categoryName);
      if (category) {
        form.setFieldsValue({
          categoryID: category.categoryId,
        });
      }
    }
  }, [postDetail, categories, isViewMode, isEditMode, form]);

  useEffect(() => {
    if (success) {
      message.success(
        isCreateMode ? "T?o bài dang thành công!" : "C?p nh?t thành công!"
      );
      dispatch(resetPostStatus());
      navigate("/quan-ly-bai-dang");
    }
    if (error) {
      message.error(`Thao tác th?t b?i: ${error}`);
      dispatch(resetPostStatus());
    }
  }, [success, error, dispatch, navigate, isCreateMode]);

  const buildPreferredLocation = (values: any) => {
    const provinceName = provinces.find((p) => p.code === values.provinceId)?.name;
    const districtName = districts.find((d) => d.code === values.districtId)?.name;
    const wardName = wards.find((w) => w.code === values.wardId)?.name;
    return [values.locationDetail?.trim(), wardName, districtName, provinceName]
      .filter((part) => part && part.length > 0)
      .join(", ");
  };

  const onFinish = (values: any) => {
    if (!user) {
      message.error("Vui lòng dang nh?p d? th?c hi?n ch?c nang này");
      return;
    }

    const {
      locationDetail,
      provinceId,
      districtId,
      wardId,
      ...rest
    } = values;

    const preferredLocation = buildPreferredLocation(values) || locationDetail || "";

    if (isCreateMode) {
      const payload: CreateJobSeekerPostPayload = {
        ...rest,
        preferredLocation,
        userID: user.id,
        age: Number(values.age),
        categoryID: Number(values.categoryID),
      };
      dispatch(createPosting(payload));
    } else if (isEditMode && id) {
      const payload: UpdateJobSeekerPostPayload = {
        ...rest,
        preferredLocation,
        jobSeekerPostId: Number(id),
        userID: user.id,
        age: Number(values.age),
        categoryID: Number(values.categoryID),
      };
      dispatch(updatePosting(payload));
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Title level={2} className="mb-6 text-center">
          {pageTitle}
        </Title>
        <Spin spinning={isSubmitting || isLoadingDetail}>
          <Card>
            <Form form={form} layout="vertical" name="create-posting-form" onFinish={onFinish}>
              <Form.Item
                name="title"
                label="Tiêu d? bài dang"
                rules={[
                  { required: true, message: "Vui lòng nh?p tiêu d?!" },
                  { max: 100, message: "Tiêu d? không vu?t quá 100 ký t?!" },
                ]}
              >
                <Input placeholder="Ví d?: Sinh viên nam 2 tìm vi?c làm ph?c v?" readOnly={isReadOnly} />
              </Form.Item>

              <Form.Item
                name="categoryID"
                label="Ngành ngh? mong mu?n"
                rules={[{ required: true, message: "Vui lòng ch?n ngành ngh?!" }]}
              >
                <Select
                  placeholder="Ch?n ngành ngh?"
                  loading={isLoadingCategories}
                  disabled={isReadOnly}
                >
                  {categories.map((category) => (
                    <Select.Option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="locationDetail"
                label="Ð?a ch? chi ti?t"
                rules={[{ required: true, message: "Vui lòng nh?p d?a ch? chi ti?t!" }]}
              >
                <Input placeholder="Ví d?: S? 12, du?ng Láng" readOnly={isReadOnly} />
              </Form.Item>

              <Form.Item
                name="provinceId"
                label="T?nh / Thành ph?"
                rules={[{ required: true, message: "Vui lòng ch?n t?nh/thành!" }]}
              >
                <Select
                  showSearch
                  placeholder="Ch?n t?nh / thành"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as string).toLowerCase().includes(input.toLowerCase())
                  }
                  disabled={isReadOnly}
                  loading={locationLoading.provinces}
                  onChange={(value) => handleProvinceChange(value as number)}
                  allowClear
                >
                  {provinces.map((province) => (
                    <Select.Option key={province.code} value={province.code}>
                      {province.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="districtId"
                label="Qu?n / Huy?n"
                rules={[{ required: true, message: "Vui lòng ch?n qu?n/huy?n!" }]}
              >
                <Select
                  placeholder="Ch?n qu?n / huy?n"
                  disabled={isReadOnly || !form.getFieldValue("provinceId")}
                  loading={locationLoading.districts}
                  onChange={(value) => handleDistrictChange(value as number)}
                  allowClear
                >
                  {districts.map((district) => (
                    <Select.Option key={district.code} value={district.code}>
                      {district.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="wardId"
                label="Phu?ng / Xã"
                rules={[{ required: true, message: "Vui lòng ch?n phu?ng/xã!" }]}
              >
                <Select
                  placeholder="Ch?n phu?ng / xã"
                  disabled={isReadOnly || !form.getFieldValue("districtId")}
                  loading={locationLoading.wards}
                  allowClear
                >
                  {wards.map((ward) => (
                    <Select.Option key={ward.code} value={ward.code}>
                      {ward.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="preferredWorkHours"
                label="Th?i gian làm vi?c mong mu?n"
                rules={[
                  { required: true, message: "Vui lòng nh?p th?i gian làm vi?c!" },
                  {
                    validator: (_, value) => {
                      const hourFormatRegex = /^(\d{1,2})(h|:00)?\s*-\s*(\d{1,2})(h|:00)?$/;
                      if (!value || hourFormatRegex.test(value) || value.includes("-")) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error('Vui lòng nh?p dúng d?nh d?ng "gi? - gi?" (VD: 8:00-17:00)')
                      );
                    },
                  },
                ]}
              >
                <Input placeholder="Ví d?: Bu?i t?i các ngày trong tu?n" readOnly={isReadOnly} />
              </Form.Item>

              <Form.Item
                name="phoneContact"
                label="S? di?n tho?i liên h?"
                rules={[
                  { required: true, message: "Vui lòng nh?p s? di?n tho?i!" },
                  { pattern: /^\d{10}$/, message: "S? di?n tho?i ph?i có 10 ch? s?!" },
                ]}
              >
                <Input type="tel" placeholder="Nhà tuy?n d?ng s? liên h? qua s? này" readOnly={isReadOnly} />
              </Form.Item>

              <Form.Item
                name="age"
                label="Tu?i"
                rules={[{ required: true, message: "Vui lòng nh?p tu?i c?a b?n!" }]}
              >
                <InputNumber min={16} max={60} style={{ width: "100%" }} readOnly={isReadOnly} />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Gi?i tính"
                rules={[{ required: true, message: "Vui lòng ch?n gi?i tính!" }]}
              >
                <Radio.Group disabled={isReadOnly}>
                  <Radio value="Nam">Nam</Radio>
                  <Radio value="N?">N?</Radio>
                  <Radio value="Khác">Khác</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô t? chi ti?t v? b?n thân và kinh nghi?m"
                rules={[{ required: true, message: "Vui lòng nh?p mô t?!" }]}
              >
                <TextArea rows={6} placeholder="Gi?i thi?u v? k? nang, kinh nghi?m làm vi?c..." readOnly={isReadOnly} />
              </Form.Item>

              <Form.Item>
                {isViewMode ? (
                  user && postDetail && user.id === postDetail.userID && (
                    <Button
                      type="primary"
                      block
                      onClick={() => navigate(`/sua-bai-dang-tim-viec/${id}`)}
                    >
                      Ch?nh s?a bài dang
                    </Button>
                  )
                ) : (
                  <Button type="primary" htmlType="submit" block loading={isSubmitting}>
                    {buttonText}
                  </Button>
                )}
              </Form.Item>
            </Form>
          </Card>
        </Spin>
      </div>
    </div>
  );
};

export default CreatePostingPage;
