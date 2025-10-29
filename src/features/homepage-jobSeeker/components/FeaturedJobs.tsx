import { LeftOutlined, RightOutlined } from '@ant-design/icons';
// 1. Import Carousel, Row, Col và bỏ Button
import { Carousel, Row, Col } from 'antd';
// 2. Import kiểu của Carousel
import type { CarouselRef } from 'antd/es/carousel';
import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import JobCard from './JobCard'; // Cập nhật đường dẫn import JobCard

// 4. Giữ lại các component Arrow (nhưng dùng div thay vì Button để tránh lỗi style)
// Chúng ta sẽ dùng ref để điều khiển thay vì props onClick
const PrevArrow = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="custom-arrow !w-12 !h-12 !rounded-full !bg-white !shadow-md !flex !items-center !justify-center !z-10 cursor-pointer hover:!bg-gray-100"
      style={{
        position: 'absolute', // Carousel sẽ đặt nó vào vị trí
        left: '0px', // Đặt bên ngoài
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
        right: '0px', // Đặt bên ngoài
        top: '50%',
        transform: 'translate(50%, -50%)',
      }}
    >
      <RightOutlined className="!text-xl !text-gray-600" />
    </div>
  );
};

// 5. Hàm tiện ích để chia mảng jobs thành các trang 12 phần tử
const chunkArray = (array: any[], chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const FeaturedJobs: React.FC = () => {
  const jobs = useSelector((state: RootState) => state.homepage.featuredJobs);
  // 6. Tạo một ref cho Carousel
  const carouselRef = React.useRef<CarouselRef>(null);

  // 7. Chia mảng jobs thành các trang, mỗi trang 12 jobs (3 cột * 4 hàng)
  const jobsPerPage = 12;
  const jobPages = chunkArray(jobs, jobsPerPage);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1, // Luôn luôn là 1 slide (trang)
    slidesToScroll: 1, // Cuộn 1 lần 1 trang
  };

  return (
    <section className="py-12 px-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Việc làm hấp dẫn</h2>
        <a href="#" className="text-blue-600 hover:underline">Xem tất cả &gt;</a>
      </div>

      {/* 9. Thêm div bọc ngoài với padding để chứa các nút mũi tên */}
      <div className="relative px-10 md:px-16">
        <Carousel ref={carouselRef} {...settings} dotPosition='bottom' style={{ paddingBottom: '40px' }} autoplay>
          {/* 10. Lặp qua các "trang" (mỗi trang 12 jobs) */}
          {jobPages.map((page, pageIndex) => (
            <div key={pageIndex}>
              {/* 11. Dùng Row và Col để tạo lưới 3 cột */}
              <Row gutter={[16, 16]}>
                {/* Lặp qua 12 jobs trong trang đó */}
                {page.map(job => (
                  <Col key={job.id} span={8}>
                    {/* px-2 py-2 đã được thay bằng gutter của Row */}
                    <JobCard job={job} />
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Carousel>
        
        {/* 12. Thêm các nút điều khiển tùy chỉnh bên ngoài Carousel */}
        <PrevArrow onClick={() => carouselRef.current?.prev()} />
        <NextArrow onClick={() => carouselRef.current?.next()} />
      </div>
    </section>
  );
};

export default FeaturedJobs;