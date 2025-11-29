import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom"; // Dùng useLocation thay vì useSearchParams
import { fetchFindJobData } from "../slice";
import type { AppDispatch } from "../../../app/store";
import { SearchBar } from "../components/SearchBar";
import { JobFilters } from "../components/JobFilters";
import JobListSection from "../components/JobListSection";
import type { JobSearchFilters } from "../types";

const DEFAULT_FILTERS: JobSearchFilters = {
  keyword: "",
  provinceId: null,
  categoryId: null,
  categoryName: null,
  salary: "all",
  salaryRange: "all",
};

const FindJobPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation(); // Lấy state từ router
  const navigate = useNavigate();
  const [filters, setFilters] = useState<JobSearchFilters>(DEFAULT_FILTERS);
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "salaryDesc" | "salaryAsc"
  >("newest");

  useEffect(() => {
    dispatch(fetchFindJobData());
  }, [dispatch]);

  useEffect(() => {
    const stateFilters = location.state as Partial<JobSearchFilters> | null;
    if (stateFilters && Object.keys(stateFilters).length > 0) {
      setFilters((prev) => ({
        ...prev,
        ...stateFilters,
      }));

      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleSearch = (newFilters: JobSearchFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleFilterChange = (partial: Partial<JobSearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="bg-gradient-to-br from-sky-800 via-sky-600 to-blue-700 pt-10 pb-16 shadow-xl">
        <div className="container mx-auto px-4 space-y-6 text-white">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              Tìm việc nhanh – Lọc theo lương, địa điểm, ngành nghề chỉ trong vài giây
            </h1>
            <p className="text-sky-100/90">
              Cập nhật liên tục tin tuyển dụng mới, mức lương minh bạch, dễ lọc theo nhu cầu của bạn.
            </p>
          </div>
          <SearchBar value={filters} onSearch={handleSearch} />
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-72">
            <JobFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>
          <div className="flex-1">
            <JobListSection
              filters={filters}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindJobPage;
