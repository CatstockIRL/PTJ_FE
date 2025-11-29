import { useParams } from "react-router-dom";
import { Breadcrumb, Select, Pagination } from "antd";
import JobCard from "../../homepage-jobSeeker/components/JobCard";
import { mockJobs } from "../mockData";
import { SearchBar } from "../components/SearchBar";
import type { JobSearchFilters } from "../types";

const { Option } = Select;

const JobListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const title = slug
    ? slug.replace(/-/g, " ").replace(/^(nganh|tai)\s*/i, "")
    : "Việc làm";

  const handlePageChange = (page: number) => {
    console.log("Page changed to:", page);
  };

  const placeholderFilters: JobSearchFilters = {
    keyword: "",
    provinceId: null,
    categoryId: null,
    categoryName: null,
    salary: "all",
    salaryRange: "all",
  };

  return (
    <div className="container mx-auto p-4">
      <SearchBar value={placeholderFilters} onSearch={() => {}} />
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
        <Breadcrumb.Item href="/viec-lam">Việc làm</Breadcrumb.Item>
        <Breadcrumb.Item className="capitalize">{title}</Breadcrumb.Item>
      </Breadcrumb>

      <h1 className="text-2xl font-bold mb-4 capitalize">Việc làm {title}</h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex items-center justify-between">
          <div className="text-gray-700">
            <span>Sắp xếp theo: </span>
            <Select defaultValue="newest" style={{ width: 150 }}>
              <Option value="newest">Mới nhất</Option>
              <Option value="relevance">Liên quan nhất</Option>
            </Select>
          </div>
          <div className="text-gray-600">
            Hiển thị <strong>{mockJobs.length}</strong> kết quả
          </div>
        </div>

        <div className="space-y-4">
          {mockJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <Pagination
            defaultCurrent={1}
            total={mockJobs.length * 2}
            pageSize={mockJobs.length}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default JobListPage;
