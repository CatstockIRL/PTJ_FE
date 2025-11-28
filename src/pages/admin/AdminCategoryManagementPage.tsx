import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Space,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Switch,
  message,
  Drawer
} from 'antd';
import { ReloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import adminCategoryService from '../../features/admin/services/adminCategory.service';
import { subCategoryService } from '../../features/subcategory/service';
import type {
  AdminCategory,
  AdminCategoryDetail,
  AdminCreateCategoryPayload,
  AdminUpdateCategoryPayload
} from '../../features/admin/types/category';
import type { SubCategory } from '../../features/subcategory/type';
import AdminSectionHeader from './components/AdminSectionHeader';
const { Option } = Select;

interface CategoryFormValues {
  name: string;
  description?: string;
  type?: string;
  isActive?: boolean;
}

interface FilterState {
  keyword: string;
  type: string;
  status: 'all' | 'active' | 'inactive';
}

type AdminCategoryFilters = {
  keyword?: string;
  type?: string;
  isActive?: boolean;
};

const normalizeVietnamese = (text?: string | null) =>
  text ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

const AdminCategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    type: 'all',
    status: 'all'
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm<CategoryFormValues>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AdminCategoryDetail | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subSubmitting, setSubSubmitting] = useState(false);
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null);
  const [subForm] = Form.useForm<{ name: string; description?: string | null; isActive?: boolean }>();
  const [subCategoryMap, setSubCategoryMap] = useState<Record<number, SubCategory[]>>({});
  const [subMapLoading, setSubMapLoading] = useState(false);

  const normalizedFilters = useMemo<AdminCategoryFilters>(() => {
    const trimmedKeyword = filters.keyword.trim();
    const normalized = normalizeVietnamese(trimmedKeyword);
    const hasDiacritics = trimmedKeyword !== '' && normalized !== trimmedKeyword.toLowerCase();

    return {
      keyword: hasDiacritics ? trimmedKeyword : undefined,
      type: filters.type !== 'all' ? filters.type : undefined,
      isActive:
        filters.status === 'all'
          ? undefined
          : filters.status === 'active'
            ? true
            : false
    };
  }, [filters.keyword, filters.status, filters.type]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminCategoryService.getCategories(normalizedFilters);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      message.error('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  }, [normalizedFilters]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const fetchAllSubCategories = useCallback(async () => {
    setSubMapLoading(true);
    try {
      const data = await subCategoryService.getAll();
      const map: Record<number, SubCategory[]> = {};
      data.forEach((sub) => {
        if (!map[sub.categoryId]) map[sub.categoryId] = [];
        map[sub.categoryId].push(sub);
      });
      Object.values(map).forEach((list) =>
        list.sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }))
      );
      setSubCategoryMap(map);
    } catch (error) {
      console.error('Failed to fetch subcategories', error);
      message.error('Không tải được nhóm nghề con');
    } finally {
      setSubMapLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAllSubCategories();
  }, [fetchAllSubCategories]);

  const categoryTypes = useMemo(() => {
    const typeSet = new Set(
      categories
        .map((category) => category.type?.trim())
        .filter((type): type is string => Boolean(type))
    );
    return Array.from(typeSet).sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
  }, [categories]);

  const displayedCategories = useMemo(() => {
    const keyword = filters.keyword.trim();
    if (!keyword) {
      return categories;
    }
    const normalizedKeyword = normalizeVietnamese(keyword);
    return categories.filter((category) => {
      const normalizedName = normalizeVietnamese(category.name);
      const normalizedDescription = normalizeVietnamese(category.description);
      return (
        normalizedName.includes(normalizedKeyword) || normalizedDescription.includes(normalizedKeyword)
      );
    });
  }, [categories, filters.keyword]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (category: AdminCategory) => {
    setModalMode('edit');
    setEditingId(category.categoryId);
    form.setFieldsValue({
      name: category.name,
      description: category.description ?? undefined,
      type: category.type ?? undefined,
      isActive: category.isActive
    });
    setModalOpen(true);
  };

  const handleSubmitCategory = async (values: CategoryFormValues) => {
    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const payload: AdminCreateCategoryPayload = {
          name: values.name,
          description: values.description,
          type: values.type || undefined,
          isActive: values.isActive ?? true
        };
        await adminCategoryService.createCategory(payload);
        message.success('Đã tạo danh mục');
      } else if (editingId !== null) {
        const payload: AdminUpdateCategoryPayload = {
          name: values.name,
          description: values.description,
          type: values.type || undefined,
          isActive: values.isActive ?? true
        };
        await adminCategoryService.updateCategory(editingId, payload);
        message.success('Đã cập nhật danh mục');
      }
      setModalOpen(false);
      form.resetFields();
      await fetchCategories();
    } catch (error) {
      console.error('Failed to submit category form', error);
      message.error('Không thể lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (categoryId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const detail = await adminCategoryService.getCategory(categoryId);
      setSelectedCategory(detail);
      setSubLoading(true);
      try {
        const subs = await subCategoryService.getByCategory(categoryId);
        setSubCategories(subs);
      } catch (error) {
        console.error('Failed to fetch subcategories', error);
        message.error('Không tải được danh mục con');
      } finally {
        setSubLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch category detail', error);
      message.error('Không thể tải chi tiết danh mục');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: ColumnsType<AdminCategory> = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{text}</span>
          {record.description && <span className="text-xs text-gray-500">{record.description}</span>}
        </Space>
      )
    },
    {
      title: 'Nhóm nghề con',
      dataIndex: 'subCategories',
      key: 'subCategories',
      render: (_: any, record) => {
        if (subMapLoading) return 'Đang tải...';
        const subs = subCategoryMap[record.categoryId] ?? [];
        if (!subs.length) return '---';
        return (
          <Space size={[4, 4]} wrap>
            {subs.map((sub) => (
              <Tag key={sub.subCategoryId} color={sub.isActive ? 'blue' : 'default'}>
                {sub.name}
              </Tag>
            ))}
          </Space>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 140,
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'red'}>{value ? 'Đang áp dụng' : 'Đang tắt'}</Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              openEditModal(record);
            }}
          >
            Chỉnh sửa
          </Button>
        </Space>
      )
    },
  ];

  return (
    <>
      <AdminSectionHeader
        title="Quản lý danh mục công việc"
        description="Cập nhật các nhóm ngành, lĩnh vực sử dụng trong tuyển dụng và tìm việc."
        gradient="from-emerald-500 via-teal-500 to-green-500"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchCategories()} loading={loading}>
              Tai lai
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Tạo danh mục
            </Button>
          </Space>
        }
      />

      <Card bordered={false} className="shadow-sm mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên hoặc mô tả..."
            allowClear
            value={filters.keyword}
            onChange={(event) => handleFilterChange('keyword', event.target.value)}
          />
          <Space wrap size="middle">
            <Select
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              style={{ width: 220 }}
              showSearch
              optionFilterProp="children"
            >
              <Option value="all">Tất cả loại</Option>
              {categoryTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
            <Select
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              style={{ width: 220 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Đang áp dụng</Option>
              <Option value="inactive">Đang tắt</Option>
            </Select>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} className="shadow-sm">
        <Table
          rowKey="categoryId"
          loading={loading}
          columns={columns}
          dataSource={displayedCategories}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 900 }}
          onRow={(record) => ({
            onClick: () => openDetail(record.categoryId),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>

      <Drawer
        title="Chi tiết danh mục"
        placement="right"
        width={420}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {detailLoading ? (
          <p>Đang tải...</p>
        ) : selectedCategory ? (
          <Space direction="vertical" size="middle" className="w-full">
            <Card
              size="small"
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 shadow-sm"
              title={
                <Space align="center" size="middle">
                  <span
                    className="text-lg font-semibold text-slate-800"
                    style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                  >
                    {selectedCategory.name}
                  </span>
                  <Tag color={selectedCategory.isActive ? 'green' : 'red'}>
                    {selectedCategory.isActive ? 'Đang áp dụng' : 'Đang tắt'}
                  </Tag>
                </Space>
              }
            >
              <div className="rounded-lg bg-white/70 border border-blue-100 px-4 py-3 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {selectedCategory.description || 'Chưa có mô tả.'}
              </div>
            </Card>
            <Card size="small" title="Nhóm nghề con" loading={subLoading}>
              {subCategories.length === 0 ? (
                <p>Chưa có nhóm nghề.</p>
              ) : (
                <Space direction="vertical" className="w-full">
                  {subCategories.map((sub) => (
                    <Card
                      key={sub.subCategoryId}
                      size="small"
                      className="border border-gray-200"
                      extra={
                        <Button
                          size="small"
                          onClick={() => {
                            setEditingSub(sub);
                            subForm.setFieldsValue({
                              name: sub.name,
                              description: sub.keywords ?? undefined,
                              isActive: sub.isActive ?? true
                            });
                            setSubModalOpen(true);
                          }}
                        >
                          Chỉnh sửa
                        </Button>
                      }
                    >
                      <Space direction="vertical" size={2}>
                        <span className="font-medium">{sub.name}</span>
                        <Tag color={sub.isActive ? 'green' : 'red'}>
                          {sub.isActive ? 'Đang áp dụng' : 'Đang tắt'}
                        </Tag>
                        {sub.keywords && <span className="text-xs text-gray-500">{sub.keywords}</span>}
                      </Space>
                    </Card>
                  ))}
                </Space>
              )}
            </Card>
            <Button type="primary" onClick={() => selectedCategory && openEditModal(selectedCategory)}>
              Chỉnh sửa
            </Button>
          </Space>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </Drawer>

      <Modal
        title={modalMode === 'create' ? 'Tạo danh mục' : 'Cập nhật danh mục'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        destroyOnClose
        okText={modalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitCategory}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item name="type" label="Loại">
            <Select
              allowClear
              placeholder="Chọn loại"
              showSearch
              optionFilterProp="children"
              notFoundContent="Chưa có loại nào"
            >
              {categoryTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Đang áp dụng" unCheckedChildren="Đang tắt" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chỉnh sửa nhóm nghề"
        open={subModalOpen}
        onCancel={() => setSubModalOpen(false)}
        onOk={() => subForm.submit()}
        confirmLoading={subSubmitting}
        destroyOnClose
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={subForm}
          layout="vertical"
          onFinish={async (values) => {
            if (!editingSub) return;
            setSubSubmitting(true);
            try {
              await subCategoryService.update(editingSub.subCategoryId, {
                name: values.name,
                description: values.description,
                isActive: values.isActive
              });
              message.success('Đã cập nhật nhóm nghề');
              if (selectedCategory) {
                const subs = await subCategoryService.getByCategory(selectedCategory.categoryId);
                setSubCategories(subs);
              }
              setSubModalOpen(false);
            } catch (error) {
              console.error('Failed to update subcategory', error);
              message.error('Không thể cập nhật nhóm nghề');
            } finally {
              setSubSubmitting(false);
            }
          }}
        >
          <Form.Item name="name" label="Tên nhóm nghề" rules={[{ required: true, message: 'Nhập tên nhóm nghề' }]}>
            <Input placeholder="Nhập tên nhóm nghề" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn (nếu có)" />
          </Form.Item>
          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Đang áp dụng" unCheckedChildren="Đang tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminCategoryManagementPage;
