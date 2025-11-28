import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../app/store';
import HeroSection from '../components/HeroSection';
import FeaturedJobs from '../features/homepage-jobSeeker/components/FeaturedJobs';
import HotNewsSection from '../features/homepage-jobSeeker/components/HotNewsSection';
import TopEmployersSlider from '../features/homepage-jobSeeker/components/TopEmployersSlider';
import { fetchFeaturedJobs } from '../features/homepage-jobSeeker/homepageSlice';

const JobSeekerHomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Gọi thunk để lấy dữ liệu featured jobs khi component được mount
    dispatch(fetchFeaturedJobs());
  }, [dispatch]);

  const sections = [
    { key: 'featured', node: <FeaturedJobs /> },
    { key: 'news', node: <HotNewsSection /> },
    { key: 'employers', node: <TopEmployersSlider /> }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <HeroSection />
      {sections.map((section, index) => (
        <div
          key={section.key}
          className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} py-16`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{section.node}</div>
        </div>
      ))}
    </div>
  );
};
export default JobSeekerHomePage;
