import React, { useState, useEffect } from 'react';
import { Carousel, Input, Button, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Tuyendung1 from '../assets/Tuyendung1.png';

const { Option } = Select;

const SlidePrimary: React.FC = () => (
  <div className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 text-white">
    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent)]" />
    <div className="text-center z-10 px-6">
      <h2 className="text-3xl md:text-4xl font-bold tracking-wide">Part-Time Job Finder</h2>
      <p className="mt-2 text-lg md:text-xl text-blue-100">Ket noi viec lam nhanh tren moi nen tang</p>
      <Button
        type="primary"
        size="large"
        className="mt-6 bg-white text-sky-700 border-none hover:bg-blue-100"
      >
        Tim hieu them
      </Button>
    </div>
  </div>
);

const SlideSecondary: React.FC = () => (
  <div className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden bg-gradient-to-r from-blue-900 via-slate-900 to-sky-900 text-white">
    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.4),_transparent)]" />
    <div className="text-center z-10 px-6">
      <h2 className="text-3xl md:text-4xl font-bold">Tim viec sieu toc</h2>
      <p className="mt-2 text-lg md:text-xl text-blue-100">Hang ngan co hoi moi duoc cap nhat moi ngay</p>
      <Button type="primary" size="large" className="mt-6 bg-sky-500 border-none hover:bg-sky-400">
        Xem ngay
      </Button>
    </div>
  </div>
);

const HeroSection: React.FC = () => {
  const [provinces, setProvinces] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };

    fetchProvinces();
  }, []);

  const handleProvinceChange = (values: string[]) => {
    setSelectedProvinces(values);
    console.log('Selected provinces:', values);
  };

  return (
    <section className="relative pt-28 pb-16 bg-white">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-[120rem] px-4 z-20">
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
          <Input
            size="large"
            placeholder="Nhap ten viec lam, cong ty, tu khoa"
            prefix={<SearchOutlined className="text-blue-400" />}
            className="w-full md:flex-1 rounded-xl shadow-sm !h-14 placeholder-gray-600 border-gray-200 focus:border-blue-500"
          />

          <Select
            mode="multiple"
            showSearch
            size="large"
            placeholder="Chon tinh, thanh pho"
            optionFilterProp="children"
            onChange={handleProvinceChange}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            className="w-full md:flex-1 rounded-xl shadow-sm !h-14 border-gray-200 focus:border-blue-500"
          >
            {provinces.map((province: any) => (
              <Option key={province.code} value={province.name}>
                {province.name}
              </Option>
            ))}
          </Select>

          <Button
            type="primary"
            size="large"
            className="w-full md:w-auto rounded-xl !h-14 bg-gradient-to-r from-sky-500 to-blue-600 border-none shadow-lg"
          >
            <SearchOutlined />
            <span className="ml-1">Tim kiem</span>
          </Button>
        </div>
      </div>

      <div className="rounded-[32px] overflow-hidden border border-gray-200 shadow-[0_35px_120px_rgba(15,23,42,0.2)] max-w-[120rem] mx-auto bg-white">
        <Carousel arrows autoplay dots className="hero-carousel">
          <div className="h-64 md:h-80">
            <img src={Tuyendung1} alt="Tuyen dung" className="w-full h-full object-cover" />
          </div>
          <div>
            <SlidePrimary />
          </div>
          <div>
            <SlideSecondary />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default HeroSection;
