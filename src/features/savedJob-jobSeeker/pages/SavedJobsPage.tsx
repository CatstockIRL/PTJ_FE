import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../app/store';
import { fetchSavedJobs, removeSavedJob } from '../slice';
import SavedJobCard from '../components/SavedJobCard';
import { Pagination } from 'antd';

const SavedJobsPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { jobs, status, error, total } = useSelector((state: RootState) => state.savedJobs);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchJobs = useCallback(() => {
    dispatch(fetchSavedJobs());
  }, [dispatch]);

  useEffect(() => {
    if (status === 'idle') {
      fetchJobs();
    }
  }, [status, fetchJobs]);

  const handleDelete = (jobId: string) => {
    dispatch(removeSavedJob(jobId));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentJobs = jobs.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Công việc đã lưu ({total})</h1>
      
      {status === 'loading' && <p>Đang tải...</p>}
      {status === 'failed' && <p className="text-red-500">{error}</p>}
      
      {status === 'succeeded' && (
        <div className="max-w-4xl mx-auto">
          {currentJobs.length > 0 ? (
            <div className="space-y-4">
              {currentJobs.map(job => (
                <SavedJobCard key={job.id} job={job} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <p>Bạn chưa lưu công việc nào.</p>
          )}
          {total > 0 && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage;
