import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, message, Modal, Select, Tag } from 'antd';
import DOMPurify from 'dompurify';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import type { RootState } from '../../../app/store';
import JobCard from '../../homepage-jobSeeker/components/JobCard';
import { fetchJobDetail } from '../jobDetailSlice';
import { addSavedJob, fetchSavedJobs, removeSavedJob } from '../../savedJob-jobSeeker/slice';
import { fetchAppliedJobs } from '../../applyJob-jobSeeker/slices/appliedJobsSlice';
import applyJobService from '../../applyJob-jobSeeker/services';
import jobSeekerCvService from '../../jobSeekerCv/services';
import type { JobSeekerCv } from '../../jobSeekerCv/types';
import jobPostService from '../../job/jobPostService';
import type { Job } from '../../../types';
import NoLogo from '../../../assets/no-logo.png';
import followService from '../services/followService';

const { TextArea } = Input;

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();

  const { job, status, error } = useAppSelector((state: RootState) => state.jobDetail);
  const { jobs: savedJobs } = useAppSelector((state: RootState) => state.savedJobs);
  const { jobs: appliedJobs } = useAppSelector((state: RootState) => state.appliedJobs);
  const jobSeekerId = useAppSelector((state: RootState) => state.auth.user?.id);

  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [cvOptions, setCvOptions] = useState<JobSeekerCv[]>([]);
  const [cvLoading, setCvLoading] = useState(false);
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const applyRequestLock = useRef(false);

  useEffect(() => {
    if (!jobSeekerId) {
      setCvOptions([]);
      return;
    }
    dispatch(fetchSavedJobs(String(jobSeekerId)));
    dispatch(fetchAppliedJobs(Number(jobSeekerId)));

    let isMounted = true;
    const loadCvs = async () => {
      setCvLoading(true);
      try {
        const cvs = await jobSeekerCvService.fetchMyCvs();
        if (isMounted) {
          setCvOptions(cvs);
        }
      } catch (err) {
        message.error('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch CV. Vui lÃ²ng thá»­ láº¡i sau.');
        console.error('Failed to load CV list', err);
      } finally {
        if (isMounted) {
          setCvLoading(false);
        }
      }
    };

    void loadCvs();

    return () => {
      isMounted = false;
    };
  }, [dispatch, jobSeekerId]);

  useEffect(() => {
    if (id) {
      dispatch(fetchJobDetail(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (job && savedJobs.some((savedJob) => savedJob.id === String(job.employerPostId))) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [job, savedJobs]);

  useEffect(() => {
    if (!job || !jobSeekerId) {
      setHasApplied(false);
      return;
    }
    const applied = appliedJobs.some(
      (application) =>
        application.employerPostId === job.employerPostId &&
        application.status?.toLowerCase() !== 'withdraw'
    );
    setHasApplied(applied);
  }, [appliedJobs, job, jobSeekerId]);

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      if (!job?.categoryName) {
        setSimilarJobs([]);
        return;
      }
      setSimilarLoading(true);
      try {
        const response = await jobPostService.getAllJobs();
        const allJobs = response.data ?? [];
        const filteredJobs = allJobs
          .filter(
            (post) =>
              post.categoryName === job.categoryName &&
              post.employerPostId !== job.employerPostId
          )
          .slice(0, 4)
          .map((post) => ({
            id: String(post.employerPostId),
            title: post.title,
            description: post.description || '',
            company: post.employerName || null,
            location: post.location || null,
            salary:
              post.salaryText ||
              (typeof post.salary === 'number'
                ? `${post.salary.toLocaleString()} VNÄ`
                : null),
            updatedAt: post.createdAt,
            companyLogo: null,
            isHot: null,
          }));
        setSimilarJobs(filteredJobs);
      } catch (err) {
        console.error('Failed to fetch similar jobs', err);
        setSimilarJobs([]);
      } finally {
        setSimilarLoading(false);
      }
    };

    void fetchSimilarJobs();
  }, [job?.categoryName, job?.employerPostId]);

  useEffect(() => {
    if (cvOptions.length === 0) {
      form.setFieldsValue({ cvId: undefined });
      return;
    }
    const currentCv = form.getFieldValue('cvId');
    if (!currentCv) {
      form.setFieldsValue({ cvId: cvOptions[0].cvid });
    }
  }, [cvOptions, form]);

  const extractAxiosErrorMessage = (error: unknown): string | null => {
    if (!axios.isAxiosError(error)) {
      return null;
    }
    const data = error.response?.data as { message?: string; error?: string; title?: string } | string | undefined;
    if (!data) {
      return null;
    }
    if (typeof data === 'string') {
      return data;
    }
    if (typeof data.message === 'string') {
      return data.message;
    }
    if (typeof data.error === 'string') {
      return data.error;
    }
    if (typeof data.title === 'string') {
      return data.title;
    }
    return null;
  };

  useEffect(() => {
    const checkFollow = async () => {
      if (!job || !jobSeekerId) {
        setIsFollowing(false);
        return;
      }
      try {
        const payload = await followService.check(jobSeekerId, job.employerId);
        const followState =
          typeof payload === 'boolean'
            ? payload
            : typeof payload?.isFollowing === 'boolean'
              ? payload.isFollowing
              : false;
        setIsFollowing(followState);
      } catch (err) {
        console.error('Failed to check follow status', err);
      }
    };
    void checkFollow();
  }, [job?.employerId, jobSeekerId]);

  const isDuplicateApplicationError = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) {
      return false;
    }
    if (error.response?.status === 409) {
      return true;
    }
    const messageText = extractAxiosErrorMessage(error);
    if (!messageText) {
      return false;
    }
    const normalized = messageText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const duplicateMarkers = ['da ung tuyen', 'da nop don', 'already applied'];
    return duplicateMarkers.some((marker) => normalized.includes(marker));
  };

    const handleSaveToggle = async () => {
    if (!job || !jobSeekerId) {
      message.warning('Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ lÆ°u tin.');
      return;
    }
    const jobId = String(job.employerPostId);
    try {
      if (isSaved) {
        await dispatch(removeSavedJob({ jobSeekerId: String(jobSeekerId), jobId })).unwrap();
        message.success('ÄÃ£ há»§y lÆ°u cÃ´ng viá»‡c');
        setIsSaved(false);
      } else {
        await dispatch(addSavedJob({ jobSeekerId: String(jobSeekerId), jobId })).unwrap();
        message.success('ÄÃ£ lÆ°u cÃ´ng viá»‡c thÃ nh cÃ´ng');
        setIsSaved(true);
      }
    } catch (err) {
      message.error('CÃ³ lá»—i xáº£y ra. Vui lÃ²ng thá»­ láº¡i.');
      console.error('Failed to save/unsave the job: ', err);
    }
  };

  const handleFollowToggle = async () => {
    if (!job || !jobSeekerId) {
      message.warning('Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ theo dÃµi nhÃ  tuyá»ƒn dá»¥ng.');
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const res = await followService.unfollow(jobSeekerId, job.employerId);
        message.success(res.data?.message || 'ÄÃ£ há»§y theo dÃµi nhÃ  tuyá»ƒn dá»¥ng.');
        setIsFollowing(false);
      } else {
        const res = await followService.follow(jobSeekerId, job.employerId);
        message.success(res.data?.message || 'ÄÃ£ theo dÃµi nhÃ  tuyá»ƒn dá»¥ng.');
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Toggle follow failed', err);
      message.error('KhÃ´ng thá»ƒ cáº­p nháº­t theo dÃµi. Vui lÃ²ng thá»­ láº¡i.');
    } finally {
      setFollowLoading(false);
    }
  };

  
  const handleApplyNow = () => {
    if (!jobSeekerId) {
      message.warning('Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ á»©ng tuyá»ƒn.');
      navigate('/login');
      return;
    }
    setIsApplyModalVisible(true);
  };

  const refreshJobData = async () => {
    const tasks: Array<Promise<unknown>> = [];
    if (jobSeekerId) {
      tasks.push(
        dispatch(fetchAppliedJobs(Number(jobSeekerId))).unwrap().catch(() => undefined)
      );
    }
    if (id) {
      tasks.push(dispatch(fetchJobDetail(id)).unwrap().catch(() => undefined));
    }
    if (tasks.length) {
      await Promise.all(tasks);
    }
  };

  const handleApplySuccess = async (successMessage: string) => {
    message.success(successMessage);
    setIsApplyModalVisible(false);
    form.resetFields();
    setHasApplied(true);
    await refreshJobData();
  };

  const verifyApplicationRecorded = async (
    employerPostId: number,
    expectedCvId?: number
  ): Promise<boolean> => {
    if (!jobSeekerId) return false;
    const seekerId = jobSeekerId;
    try {
      const response = await applyJobService.getAppliedJobsBySeeker(seekerId);
      const application = response?.data?.find(
        (item) => item.employerPostId === employerPostId
      );
      if (!application) {
        return false;
      }
      const recordedCvId =
        application.cvId ?? application.cvid ?? application.selectedCvId;
      if (
        typeof expectedCvId === "number" &&
        recordedCvId &&
        recordedCvId !== expectedCvId
      ) {
        console.warn(
          "Application recorded with different CV id",
          recordedCvId,
          expectedCvId
        );
      }
      return true;
    } catch (verifyError) {
      console.error("Failed to verify application status", verifyError);
      return false;
    }
  };
  const handleApplySubmit = async (values: { note: string; cvId?: number }) => {
    if (!job || !jobSeekerId) return;
    if (!values.cvId) {
      message.warning('Vui lòng ch?n CV d? ?ng tuy?n.');
      return;
    }
    if (applying || applyRequestLock.current) {
      return;
    }
    applyRequestLock.current = true;
    setApplying(true);
    try {
      await applyJobService.applyJob({
        jobSeekerId,
        employerPostId: job.employerPostId,
        cvid: values.cvId,
        note: values.note,
      });
      await handleApplySuccess('N?p don thành công!');
    } catch (error) {
      console.error('Apply failed:', error);
      if (isDuplicateApplicationError(error)) {
        await handleApplySuccess('B?n dã n?p don công vi?c này tru?c dó. Ðã c?p nh?t l?i thông tin.');
        return;
      }

      const recorded = await verifyApplicationRecorded(
        job.employerPostId,
        values.cvId
      );
      if (recorded) {
        await handleApplySuccess('N?p don ?ng tuy?n thành công!');
        return;
      }

      message.error('N?p don th?t b?i. Vui lòng th? l?i sau.');
    } finally {
      setApplying(false);
      applyRequestLock.current = false;
    }
  };
  if (status === 'loading') {
    return <div className="container mx-auto p-4 text-center">Äang táº£i...</div>;
  }
  if (status === 'failed') {
    return <div className="container mx-auto p-4 text-center">Lá»—i: {error}</div>;
  }
  if (!job) {
    return null;
  }

  const salaryText =
    job.salary && !Number.isNaN(Number(job.salary))
      ? `${Number(job.salary).toLocaleString()} VNÄ`
      : 'ThÆ°Æ¡ng lÆ°á»£ng';
  const requirementLines =
    job.requirements?.split('\n').map((l) => l.trim()).filter(Boolean) ?? [];
  const gallery = [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80'
  ];

  return (
    <div className="bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-gray-200 bg-white flex items-center justify-center">
                  <img
                    src={(job as any).logoUrl || NoLogo}
                    alt={job.employerName || 'Company logo'}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = NoLogo;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">{job.title}</h1>
                  <p className="text-lg text-gray-700 mt-1">{job.employerName}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-money-bill-wave text-green-600" />
                      <div>
                        <p className="text-xs text-slate-500">Thu nháº­p</p>
                        <p className="font-semibold">{salaryText}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500">Äá»‹a Ä‘iá»ƒm</p>
                        <p className="font-semibold">{job.location || 'Äang cáº­p nháº­t'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-user-clock text-emerald-600" />
                      <div>
                        <p className="text-xs text-slate-500">Kinh nghiá»‡m</p>
                        <p className="font-semibold">{job.workHours || 'KhÃ´ng yÃªu cáº§u'}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Háº¡n ná»™p há»“ sÆ¡: {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <Button
                      type="primary"
                      size="large"
                      className="bg-green-600 hover:bg-green-500"
                      onClick={handleApplyNow}
                      disabled={hasApplied}
                    >
                      {hasApplied ? 'ÄÃ£ ná»™p Ä‘Æ¡n' : 'á»¨ng tuyá»ƒn ngay'}
                    </Button>
                    <Button
                      size="large"
                      loading={followLoading}
                      onClick={handleFollowToggle}
                      type={isFollowing ? 'default' : 'primary'}
                      className={isFollowing ? '' : 'bg-blue-600 hover:bg-blue-500'}
                    >
                      {isFollowing ? 'Äang theo dÃµi' : 'Theo dÃµi nhÃ  tuyá»ƒn dá»¥ng'}
                    </Button>
                    <Button
                      size="large"
                      onClick={handleSaveToggle}
                      icon={isSaved ? <i className="fas fa-heart text-red-500"></i> : <i className="far fa-heart"></i>}
                    >
                      {isSaved ? 'ÄÃ£ lÆ°u tin' : 'LÆ°u tin'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 space-y-8">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <i className="fas fa-briefcase text-green-600" /> Chi tiáº¿t tin tuyá»ƒn dá»¥ng
                </h2>
                <Button type="text" icon={<i className="far fa-paper-plane text-green-600"></i>} className="text-green-600">
                  Gá»­i tá»›i viá»‡c lÃ m tÆ°Æ¡ng tá»±
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(requirementLines.length ? requirementLines.slice(0, 6) : ['KhÃ´ng yÃªu cáº§u']).map((item, idx) => (
                  <Tag key={idx} color="blue" className="px-3 py-1 text-sm rounded-full">
                    {item}
                  </Tag>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="rounded-2xl border-green-100">
                  <p className="text-xs text-slate-500">Thu nháº­p</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{salaryText}</p>
                </Card>
                <Card className="rounded-2xl border-blue-100">
                  <p className="text-xs text-slate-500">Äá»‹a Ä‘iá»ƒm</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{job.location || 'Äang cáº­p nháº­t'}</p>
                </Card>
                <Card className="rounded-2xl border-emerald-100">
                  <p className="text-xs text-slate-500">Kinh nghiá»‡m</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{job.workHours || 'KhÃ´ng yÃªu cáº§u'}</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {gallery.map((src, idx) => (
                  <div key={src} className="rounded-2xl overflow-hidden border border-gray-200 h-44">
                    <img src={src} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">MÃ´ táº£ cÃ´ng viá»‡c</h3>
                  <div
                    className="prose max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description || 'ChÆ°a cáº­p nháº­t mÃ´ táº£.') }}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">YÃªu cáº§u á»©ng viÃªn</h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-800">
                    {requirementLines.length ? (
                      requirementLines.map((line, idx) => <li key={idx}>{line.replace(/^- /, '')}</li>)
                    ) : (
                      <li>KhÃ´ng yÃªu cáº§u cá»¥ thá»ƒ.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Quyá»n lá»£i</h3>
                  <p className="text-slate-800">
                    Quyá»n lá»£i sáº½ trao Ä‘á»•i chi tiáº¿t khi phá»ng váº¥n. Báº¡n sáº½ Ä‘Æ°á»£c hÆ°á»Ÿng cháº¿ Ä‘á»™ lÆ°Æ¡ng thÆ°á»Ÿng, phá»¥ cáº¥p vÃ  mÃ´i
                    trÆ°á»ng lÃ m viá»‡c phÃ¹ há»£p theo chÃ­nh sÃ¡ch cÃ´ng ty.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Äá»‹a Ä‘iá»ƒm lÃ m viá»‡c</h3>
                  <p className="text-slate-800">{job.location || 'Äang cáº­p nháº­t'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6">
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Viá»‡c lÃ m tÆ°Æ¡ng tá»±</h3>
              {similarLoading ? (
                <p>Äang táº£i viá»‡c lÃ m tÆ°Æ¡ng tá»±...</p>
              ) : similarJobs.length ? (
                <div className="space-y-4">
                  {similarJobs.map((similarJob) => (
                    <JobCard key={similarJob.id} job={similarJob} />
                  ))}
                </div>
              ) : (
                <p>Hiá»‡n chÆ°a cÃ³ gá»£i Ã½.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={`á»¨ng tuyá»ƒn: ${job.title}`}
        open={isApplyModalVisible}
        onCancel={() => setIsApplyModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleApplySubmit}
          initialValues={{ note: '', cvId: undefined }}
        >
          <Form.Item name="note" label="Lá»i nháº¯n Ä‘áº¿n nhÃ  tuyá»ƒn dá»¥ng">
            <TextArea rows={4} placeholder="Viáº¿t Ä‘Ã´i lá»i vá» báº¡n hoáº·c lÃ½ do phÃ¹ há»£p vá»›i vá»‹ trÃ­ nÃ y." />
          </Form.Item>

          <Form.Item
            name="cvId"
            label="Chá»n CV cá»§a báº¡n"
            rules={[{ required: true, message: 'Vui lÃ²ng chá»n má»™t CV Ä‘á»ƒ á»©ng tuyá»ƒn!' }]}
          >
            <Select placeholder="Chá»n CV" loading={cvLoading} disabled={cvOptions.length === 0}>
              {cvOptions.map((cv) => (
                <Select.Option key={cv.cvid} value={cv.cvid}>
                  {cv.cvTitle || `CV #${cv.cvid}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {cvOptions.length === 0 && (
            <p className="text-sm text-gray-500 mb-4">
              Báº¡n chÆ°a cÃ³ CV nÃ o.{' '}
              <button
                type="button"
                className="text-blue-600 underline"
                onClick={() => {
                  setIsApplyModalVisible(false);
                  navigate('/cv-cua-toi');
                }}
              >
                Táº¡o CV ngay
              </button>
              .
            </p>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={applying} block disabled={cvOptions.length === 0}>
              XÃ¡c nháº­n á»©ng tuyá»ƒn
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default JobDetailPage;

