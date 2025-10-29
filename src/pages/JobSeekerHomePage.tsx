import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedJobs from '../features/homepage-jobSeeker/components/FeaturedJobs'; // Cập nhật đường dẫn
import JobCategoriesSlider from '../features/homepage-jobSeeker/components/JobCategoriesSlider'; // Cập nhật đường dẫn
import TopEmployersSlider from '../features/homepage-jobSeeker/components/TopEmployersSlider'; // Thêm import TopEmployersSlider

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
