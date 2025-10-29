import React from 'react';
import Slider from 'react-slick';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store'; // Cập nhật đường dẫn import RootState

// Reusing the arrow components from FeaturedJobs.tsx
const PrevArrow = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="custom-arrow !w-12 !h-12 !rounded-full !bg-white !shadow-md !flex !items-center !justify-center !z-10 cursor-pointer hover:!bg-gray-100"
      style={{
        position: 'absolute',
        left: '0px',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <LeftOutlined className="!text-xl !text-gray-600" />
    </div>
  );
};

const NextArrow = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="custom-arrow !w-12 !h-12 !rounded-full !bg-white !shadow-md !flex !items-center !justify-center !z-10 cursor-pointer hover:!bg-gray-100"
      style={{
        position: 'absolute',
        right: '0px',
        top: '50%',
        transform: 'translate(50%, -50%)',
      }}
    >
      <RightOutlined className="!text-xl !text-gray-600" />
    </div>
  );
};

const JobCategoriesSlider: React.FC = () => {
  const jobCategories = useSelector((state: RootState) => state.homepage.jobCategories);
  const sliderRef = React.useRef<Slider>(null); // Thêm ref cho Slider

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 6, // Display 6 categories at once
    slidesToScroll: 6,
    rows: 1, 
    slidesPerRow: 1, // Each slide contains 1 category
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section className="bg-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Việc làm theo ngành nghề</h2>
          <a href="#" className="text-blue-600 hover:underline">Xem tất cả &gt;</a>
        </div>
        <div className="relative px-10 md:px-16"> 
          <Slider ref={sliderRef} {...settings} autoplay>
            {jobCategories.map(category => (
              <div key={category.id} className="p-2">
                <div className="p-4 rounded-lg shadow-md bg-white flex flex-col items-center justify-center h-full"> {/* Added h-full */}
                  <img src={category.icon} alt={`${category.name} icon`} className="mx-auto mb-2 w-16 h-16" />
                  <h3 className="text-md font-semibold text-gray-800 text-center">{category.name}</h3> {/* Added text-center */}
                  <p className="text-gray-600 text-sm">{category.count} việc làm</p>
                </div>
              </div>
            ))}
          </Slider>
          <PrevArrow onClick={() => sliderRef.current?.slickPrev()} />
          <NextArrow onClick={() => sliderRef.current?.slickNext()} />
        </div>
      </div>
    </section>
  );
};

export default JobCategoriesSlider;