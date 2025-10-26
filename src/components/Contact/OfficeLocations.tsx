import React from 'react';

// Dùng emoji thay cho icons
const ICONS = {
  location: '📍',
  phone: '📞',
  email: '✉️',
};

interface OfficeInfoProps {
  city: string;
  address: string;
  phone: string;
  email: string;
}

const OfficeInfo: React.FC<OfficeInfoProps> = ({ city, address, phone, email }) => {
  return (
    <div>
      <h4 className="font-bold text-base">{city}</h4>
      <p className="text-sm text-gray-600 mt-2 flex items-start">
        <span className="mr-2">{ICONS.location}</span>
        <span>{address}</span>
      </p>
      <p className="text-sm text-gray-600 mt-1">
        <span className="mr-2">{ICONS.phone}</span>
        <span>{phone}</span>
      </p>
      <p className="text-sm text-gray-600 mt-1">
        <span className="mr-2">{ICONS.email}</span>
        <a href={`mailto:${email}`} className="hover:underline">{email}</a>
      </p>
    </div>
  );
}

export const OfficeLocations: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-4">Văn phòng Part-time Job Finder</h3>
      <div className="space-y-5">
        <OfficeInfo
          city="Hồ Chí Minh"
          address="Phòng 302, 270-272 Cộng Hòa, Phường Tân Bình, TP. Hồ Chí Minh"
          phone="028 3813 0501"
          email="contact@jobfinder.vn"
        />
        <OfficeInfo
          city="Hà Nội"
          address="307, DMC Tower, 535 Kim Mã, Phường Giảng Võ, Hà Nội"
          phone="024 3519 0410"
          email="contact@jobfinder.vn"
        />
        <OfficeInfo
          city="Đà Nẵng"
          address="Tầng 8, 218 Bạch Đằng, P.Hải Châu, Đà Nẵng"
          phone="0236 3221 767"
          email="contact@jobfinder.vn"
        />
      </div>
    </div>
  );
};