import React, { useState, useEffect, useCallback } from "react";
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
  TimePicker,
  Space,
  Empty,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../app/store";
import { useAuth } from "../../auth/hooks";
import {
  createPosting,
  resetPostStatus,
  fetchPostById,
  updatePosting,
  fetchPostSuggestions,
} from "../slice/slice";
import { useCategories } from "../../category/hook";
import type {
  CreateJobSeekerPostPayload,
  UpdateJobSeekerPostPayload,
} from "../types";
import locationService, {
  type LocationOption,
} from "../../location/locationService";
import { fetchMyCvs } from "../../jobSeekerCv/services";
import type { JobSeekerCv } from "../../jobSeekerCv/types";
import JobCard from "../../homepage-jobSeeker/components/JobCard";

const { Title } = Typography;
const { TextArea } = Input;
const timeFormat = "HH:mm";

const parseTimeValue = (value?: string | null): Dayjs | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed
    .replace(/[hH]/, ":")
    .replace(/\s/g, "")
    .replace(/(\d)(?=[ap]m$)/i, "$1"); // best effort cleanup
  const [hourPart, minutePart = "00"] = normalized.split(":");
  if (!hourPart) return null;
  const hours = hourPart.padStart(2, "0").slice(-2);
  const minutes = minutePart.padEnd(2, "0").slice(0, 2);
  const formatted = `${hours}:${minutes}`;
  const parsed = dayjs(formatted, timeFormat, true);
  return parsed.isValid() ? parsed : null;
};

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
  const { jobs: suggestedJobs, loading: isLoadingSuggestions } = useSelector(
    (state: RootState) => state.jobSeekerPosting.create.suggestions
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
  const [cvOptions, setCvOptions] = useState<JobSeekerCv[]>([]);
  const [isLoadingCvs, setIsLoadingCvs] = useState(false);

  const pageTitle = isCreateMode
    ? "Tß║ío b├ái ─æ─âng t├¼m viß╗çc Part-time"
    : isEditMode
    ? "Chß╗ënh sß╗¡a b├ái ─æ─âng t├¼m viß╗çc"
    : "Chi tiß║┐t b├ái ─æ─âng t├¼m viß╗çc";
  const buttonText = isCreateMode ? "─É─âng b├ái" : "L╞░u thay ─æß╗òi";

  useEffect(() => {
    setIsReadOnly(isViewMode);
  }, [isViewMode]);

  useEffect(() => {
    const loadProvinces = async () => {
      setLocationLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch {
        message.error("Kh├┤ng thß╗â tß║úi danh s├ích khu vß╗▒c");
      } finally {
        setLocationLoading((prev) => ({ ...prev, provinces: false }));
      }
    };
    loadProvinces();
  }, []);

  const handleProvinceChange = useCallback(
    async (value?: number, preserveSelection = false) => {
      if (!preserveSelection) {
        form.setFieldsValue({ districtId: undefined, wardId: undefined });
      }
      setDistricts([]);
      setWards([]);
      if (!value) return;
      setLocationLoading((prev) => ({ ...prev, districts: true }));
      try {
        const data = await locationService.getDistricts(value);
        setDistricts(data);
      } catch {
        message.error("Kh├┤ng thß╗â tß║úi danh s├ích quß║¡n/huyß╗çn");
      } finally {
        setLocationLoading((prev) => ({ ...prev, districts: false }));
      }
    },
    [form]
  );

  const handleDistrictChange = useCallback(
    async (value?: number, preserveSelection = false) => {
      if (!preserveSelection) {
        form.setFieldsValue({ wardId: undefined });
      }
      setWards([]);
      if (!value) return;
      setLocationLoading((prev) => ({ ...prev, wards: true }));
      try {
        const data = await locationService.getWards(value);
        setWards(data);
      } catch {
        message.error("Kh├┤ng thß╗â tß║úi danh s├ích ph╞░ß╗¥ng/x├ú");
      } finally {
        setLocationLoading((prev) => ({ ...prev, wards: false }));
      }
    },
    [form]
  );

  useEffect(() => {
    if ((isViewMode || isEditMode) && id) {
      dispatch(fetchPostById(Number(id)));
    }
  }, [dispatch, id, isViewMode, isEditMode]);

  useEffect(() => {
    if (isViewMode && id) {
      dispatch(fetchPostSuggestions(Number(id)));
    }
  }, [dispatch, isViewMode, id]);

  useEffect(() => {
    if (postDetail && (isViewMode || isEditMode)) {
      const fallbackParts =
        postDetail.preferredWorkHours
          ?.split("-")
          .map((part) => part.trim()) ?? [];
      const [fallbackStart, fallbackEnd] = fallbackParts;
      const startTime = parseTimeValue(
        postDetail.preferredWorkHourStart ?? fallbackStart
      );
      const endTime = parseTimeValue(
        postDetail.preferredWorkHourEnd ?? fallbackEnd
      );

      form.setFieldsValue({
        ...postDetail,
        preferredWorkHourStart: startTime || undefined,
        preferredWorkHourEnd: endTime || undefined,
        locationDetail: postDetail.preferredLocation,
        selectedCvId: postDetail.selectedCvId ?? postDetail.cvId ?? undefined,
      });

      (async () => {
        if (postDetail.provinceId) {
          await handleProvinceChange(postDetail.provinceId, true);
          if (postDetail.districtId) {
            await handleDistrictChange(postDetail.districtId, true);
          }
        }
      })();
    }
  }, [
    postDetail,
    isViewMode,
    isEditMode,
    form,
    handleProvinceChange,
    handleDistrictChange,
  ]);

  useEffect(() => {
    if (!user || isViewMode) return;
    const loadCvs = async () => {
      setIsLoadingCvs(true);
      try {
        const data = await fetchMyCvs();
        setCvOptions(data);
      } catch {
        message.error("Kh├┤ng thß╗â tß║úi danh s├ích CV");
      } finally {
        setIsLoadingCvs(false);
      }
    };
    loadCvs();
  }, [user, isViewMode]);

  useEffect(() => {
    if (success) {
      message.success(
        isCreateMode ? "Tß║ío b├ái ─æ─âng th├ánh c├┤ng!" : "Cß║¡p nhß║¡t th├ánh c├┤ng!"
      );
      dispatch(resetPostStatus());
      navigate("/quan-ly-bai-dang");
    }
    if (error) {
      message.error(`Thao t├íc thß║Ñt bß║íi: ${error}`);
      dispatch(resetPostStatus());
    }
  }, [success, error, dispatch, navigate, isCreateMode]);

  const { provinces: provincesLoading, districts: districtsLoading, wards: wardsLoading } =
    locationLoading;

  const buildPreferredLocation = (values: any) => {
    const provinceName = provinces.find(
      (p) => p.code === values.provinceId
    )?.name;
    const districtName = districts.find(
      (d) => d.code === values.districtId
    )?.name;
    const wardName = wards.find((w) => w.code === values.wardId)?.name;
    return [
      values.locationDetail?.trim(),
      wardName,
      districtName,
      provinceName,
    ]
      .filter((part) => part && part.length > 0)
      .join(", ");
  };

  const onFinish = (values: any) => {
    if (!user) {
      message.error("Vui l├▓ng ─æ─âng nhß║¡p ─æß╗â thß╗▒c hiß╗çn chß╗⌐c n─âng n├áy");
      return;
    }

    const {
      locationDetail,
      provinceId,
      districtId,
      wardId,
      preferredWorkHourStart,
      preferredWorkHourEnd,
      selectedCvId,
      ...rest
    } = values;

    const preferredLocation =
      buildPreferredLocation({ ...values, locationDetail }) || "";

    const startTime = (preferredWorkHourStart as Dayjs).format(timeFormat);
    const endTime = (preferredWorkHourEnd as Dayjs).format(timeFormat);

    const payload: CreateJobSeekerPostPayload = {
      ...rest,
      preferredLocation,
      userID: user.id,
      age: Number(rest.age),
      categoryID: Number(rest.categoryID),
      provinceId: Number(provinceId),
      districtId: Number(districtId),
      wardId: Number(wardId),
      preferredWorkHourStart: startTime,
      preferredWorkHourEnd: endTime,
      selectedCvId: selectedCvId ? Number(selectedCvId) : undefined,
    };

    if (isCreateMode) {
      dispatch(createPosting(payload));
    } else if (isEditMode && id) {
      const updatePayload: UpdateJobSeekerPostPayload = {
        ...payload,
        jobSeekerPostId: Number(id),
      };
      dispatch(updatePosting(updatePayload));
    }
  };

  const disabledTimePicker = isReadOnly;
  const MainContent = (
    <Spin spinning={isSubmitting || isLoadingDetail}>
      <Card>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="title"
            label="Ti├¬u ─æß╗ü b├ái ─æ─âng"
            rules={[
              { required: true, message: "Vui l├▓ng nhß║¡p ti├¬u ─æß╗ü!" },
              { max: 120, message: "Ti├¬u ─æß╗ü kh├┤ng v╞░ß╗út qu├í 120 k├╜ tß╗▒!" },
              {
                validator: (_, value) => {
                  const text = (value || "").trim();
                  if (!text) {
                    return Promise.resolve();
                  }
                  if (text.length < 5) {
                    return Promise.reject(
                      new Error("Ti├¬u ─æß╗ü phß║úi c├│ ├¡t nhß║Ñt 5 k├╜ tß╗▒!")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              placeholder="V├¡ dß╗Ñ: Sinh vi├¬n n─âm 2 t├¼m viß╗çc l├ám phß╗Ñc vß╗Ñ"
              readOnly={isReadOnly}
            />
          </Form.Item>

          <Form.Item
            name="categoryID"
            label="Ng├ánh nghß╗ü mong muß╗æn"
            rules={[{ required: true, message: "Vui l├▓ng chß╗ìn ng├ánh nghß╗ü!" }]}
          >
            <Select
              placeholder="Chß╗ìn ng├ánh nghß╗ü"
              loading={isLoadingCategories}
              disabled={isReadOnly}
              showSearch
              optionFilterProp="children"
            >
              {categories.map((category) => (
                <Select.Option
                  key={category.categoryId}
                  value={category.categoryId}
                >
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="provinceId"
            label="Tß╗ënh / Th├ánh phß╗æ"
            rules={[{ required: true, message: "Vui l├▓ng chß╗ìn tß╗ënh/th├ánh!" }]}
          >
            <Select
              showSearch
              placeholder="Chß╗ìn tß╗ënh / th├ánh"
              optionFilterProp="children"
              disabled={isReadOnly}
              loading={provincesLoading}
              onChange={(value) =>
                handleProvinceChange(value as number | undefined, false)
              }
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
            label="Quß║¡n / Huyß╗çn"
            rules={[{ required: true, message: "Vui l├▓ng chß╗ìn quß║¡n/huyß╗çn!" }]}
          >
            <Select
              placeholder="Chß╗ìn quß║¡n / huyß╗çn"
              disabled={isReadOnly || !form.getFieldValue("provinceId")}
              loading={districtsLoading}
              onChange={(value) =>
                handleDistrictChange(value as number | undefined, false)
              }
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
            label="Ph╞░ß╗¥ng / X├ú"
            rules={[{ required: true, message: "Vui l├▓ng chß╗ìn ph╞░ß╗¥ng/x├ú!" }]}
          >
            <Select
              placeholder="Chß╗ìn ph╞░ß╗¥ng / x├ú"
              disabled={isReadOnly || !form.getFieldValue("districtId")}
              loading={wardsLoading}
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
            name="locationDetail"
            label="─Éß╗ïa chß╗ë chi tiß║┐t"
            rules={[
              { required: true, message: "Vui l├▓ng nhß║¡p ─æß╗ïa chß╗ë chi tiß║┐t!" },
            ]}
          >
            <Input
              placeholder="V├¡ dß╗Ñ: Sß╗æ 12, ─æ╞░ß╗¥ng L├íng"
              readOnly={isReadOnly}
            />
          </Form.Item>

          <Form.Item
            label="Thß╗¥i gian l├ám viß╗çc mong muß╗æn"
            required
            className="time-picker-item"
          >
            <Space.Compact className="w-full">
              <Form.Item
                name="preferredWorkHourStart"
                noStyle
                rules={[
                  { required: true, message: "Vui l├▓ng chß╗ìn giß╗¥ bß║»t ─æß║ºu!" },
                ]}
              >
                <TimePicker
                  format={timeFormat}
                  placeholder="Tß╗½"
                  style={{ width: "50%" }}
                  disabled={disabledTimePicker}
                />
              </Form.Item>
              <Form.Item
                name="preferredWorkHourEnd"
                noStyle
                dependencies={["preferredWorkHourStart"]}
                rules={[
                  { required: true, message: "Vui l├▓ng chß╗ìn giß╗¥ kß║┐t th├║c!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const start: Dayjs | undefined = getFieldValue(
                        "preferredWorkHourStart"
                      );
                      if (!value || !start || value.isAfter(start)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Giß╗¥ kß║┐t th├║c phß║úi sau giß╗¥ bß║»t ─æß║ºu")
                      );
                    },
                  }),
                ]}
              >
                <TimePicker
                  format={timeFormat}
                  placeholder="─Éß║┐n"
                  style={{ width: "50%" }}
                  disabled={disabledTimePicker}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            name="phoneContact"
            label="Sß╗æ ─æiß╗çn thoß║íi li├¬n hß╗ç"
            rules={[
              { required: true, message: "Vui l├▓ng nhß║¡p sß╗æ ─æiß╗çn thoß║íi!" },
              {
                pattern: /^\d{10}$/,
                message: "Sß╗æ ─æiß╗çn thoß║íi phß║úi c├│ 10 chß╗» sß╗æ!",
              },
            ]}
          >
            <Input
              type="tel"
              placeholder="Nh├á tuyß╗ân dß╗Ñng sß║╜ li├¬n hß╗ç qua sß╗æ n├áy"
              readOnly={isReadOnly}
            />
          </Form.Item>

          <Form.Item
            name="age"
            label="Tuß╗òi"
            rules={[{ required: true, message: "Vui l├▓ng nhß║¡p tuß╗òi cß╗ºa bß║ín!" }]}
          >
            <InputNumber
              min={16}
              max={60}
              style={{ width: "100%" }}
              disabled={isReadOnly}
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Giß╗¢i t├¡nh"
            rules={[{ required: true, message: "Vui l├▓ng chß╗ìn giß╗¢i t├¡nh!" }]}
          >
            <Radio.Group disabled={isReadOnly}>
              <Radio value="Nam">Nam</Radio>
              <Radio value="Nß╗»">Nß╗»</Radio>
              <Radio value="Kh├íc">Kh├íc</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="description"
            label="M├┤ tß║ú chi tiß║┐t vß╗ü bß║ún th├ón v├á kinh nghiß╗çm"
            rules={[
              { required: true, message: "Vui l├▓ng nhß║¡p m├┤ tß║ú!" },
              {
                validator: (_, value) => {
                  const length = (value ?? "").trim().length;
                  return length >= 20
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          "M├┤ tß║ú phß║úi c├│ ├¡t nhß║Ñt 20 k├╜ tß╗▒ ─æß╗â hß╗ç thß╗æng hiß╗âu r├╡ vß╗ü bß║ín"
                        )
                      );
                },
              },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Giß╗¢i thiß╗çu vß╗ü kß╗╣ n─âng, kinh nghiß╗çm l├ám viß╗çc..."
              readOnly={isReadOnly}
            />
          </Form.Item>

          {!isViewMode && (
            <Form.Item name="selectedCvId" label="Chß╗ìn CV ─æ├¡nh k├¿m">
              <Select
                placeholder="Chß╗ìn mß╗Öt CV ─æß╗â AI ╞░u ti├¬n gß╗úi ├╜ viß╗çc l├ám"
                loading={isLoadingCvs}
                allowClear
                showSearch
                optionFilterProp="children"
                disabled={isReadOnly}
                notFoundContent={
                  !isLoadingCvs ? "Bß║ín ch╞░a c├│ CV n├áo." : undefined
                }
              >
                {cvOptions.map((cv) => (
                  <Select.Option key={cv.cvid} value={cv.cvid}>
                    {cv.cvTitle}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            {isViewMode ? (
              user &&
              postDetail &&
              user.id === postDetail.userID && (
                <Button
                  type="primary"
                  block
                  onClick={() => navigate(`/sua-bai-dang-tim-viec/${id}`)}
                >
                  Chß╗ënh sß╗¡a b├ái ─æ─âng
                </Button>
              )
            ) : (
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isSubmitting}
              >
                {buttonText}
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    </Spin>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className={`${isViewMode ? 'max-w-7xl' : 'max-w-2xl'} mx-auto`}>
        <Title level={2} className="mb-6 text-center">
          {pageTitle}
        </Title>
        
        {isViewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {MainContent}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <Title level={4} className="mb-4 text-indigo-700">
                  <i className="fas fa-bolt mr-2"></i>
                  C├┤ng viß╗çc ph├╣ hß╗úp
                </Title>
                <Spin spinning={isLoadingSuggestions}>
                  <div className="flex flex-col gap-4">
                    {suggestedJobs && suggestedJobs.length > 0 ? (
                      suggestedJobs.map((job) => (
                        <div key={job.id} className="transform hover:scale-102 transition-transform duration-200">
                           <JobCard job={job} />
                        </div>
                      ))
                    ) : (
                      <Empty description="Ch╞░a t├¼m thß║Ñy c├┤ng viß╗çc ph├╣ hß╗úp" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                  </div>
                </Spin>
              </div>
            </div>
          </div>
        ) : (
          MainContent
        )}
      </div>
    </div>
  );
};

export default CreatePostingPage;
