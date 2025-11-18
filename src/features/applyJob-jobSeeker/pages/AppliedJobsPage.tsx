import React from 'react'
import { useEffect } from 'react'
import { Alert, message, Spin, Typography } from 'antd'

import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import type { RootState } from '../../../app/store'
import AppliedJobCard from '../components/AppliedJobCard'
import { fetchAppliedJobs, withdrawApplication } from '../slices/appliedJobsSlice'

const { Title } = Typography

const AppliedJobsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { id: jobSeekerId } = useAppSelector((state: RootState) => state.auth.user) || {}
  const {
    jobs,
    status,
    error
  } = useAppSelector((state: RootState) => state.appliedJobs)

  useEffect(() => {
    if (jobSeekerId) {
      dispatch(fetchAppliedJobs(jobSeekerId))
    }
  }, [dispatch, jobSeekerId])

  const handleWithdraw = async (jobSeekerId: number, employerPostId: number) => {
    try {
      await dispatch(withdrawApplication({ jobSeekerId, employerPostId })).unwrap()
      message.success('Rút đơn ứng tuyển thành công!')
      dispatch(fetchAppliedJobs(jobSeekerId))
    } catch (err) {
      message.error('Rút đơn ứng tuyển thất bại. Vui lòng thử lại.')
      console.error('Failed to withdraw application:', err)
    }
  }

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div className='flex h-64 items-center justify-center'>
          <Spin size='large' />
        </div>
      )
    }

    if (status === 'failed') {
      return <Alert message='Lỗi' description={error || 'Không thể tải danh sách công việc.'} type='error' showIcon />
    }

    if (status === 'succeeded' && jobs.length === 0) {
      return (
        <div className='text-center'>
          {/* <img src='/src/assets/empty-box.png' alt='No jobs found' className='mx-auto mb-4 h-40' /> */}
          <Title level={5}>Bạn chưa ứng tuyển công việc nào.</Title>
          <p>Hãy bắt đầu tìm kiếm và ứng tuyển những công việc mơ ước của bạn!</p>
        </div>
      )
    }

    return (
      <div className='space-y-4'>
        {jobs.map((appliedJob) => (
          <AppliedJobCard key={appliedJob.candidateListId} appliedJob={appliedJob} onWithdraw={handleWithdraw} />
        ))}
      </div>
    )
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-6'>
        <Title level={2} className='text-center'>
          Công Việc Đã Ứng Tuyển
        </Title>
        <p className='text-center text-gray-600'>Quản lý và theo dõi trạng thái các công việc bạn đã nộp đơn.</p>
      </div>

      <div className='mx-auto max-w-4xl'>{renderContent()}</div>
    </div>
  )
}

export default AppliedJobsPage