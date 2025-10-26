import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedJobs from '../features/homepage/components/FeaturedJobs'; // Cập nhật đường dẫn
import JobCategoriesSlider from '../features/homepage/components/JobCategoriesSlider'; // Cập nhật đường dẫn
import TopEmployersSlider from '../features/homepage/components/TopEmployersSlider'; // Thêm import TopEmployersSlider

const JobSeekerHomePage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <HeroSection/>

      {/* Featured Jobs Section */}
      <FeaturedJobs />

      {/* Job Categories Section */}
      <JobCategoriesSlider />

      {/* Top Employers Section */}
      <TopEmployersSlider />
    </>
  );
}
export default JobSeekerHomePage;
