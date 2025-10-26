import React from 'react';
import { ArticleCardLarge } from './ArticleCardLarge';
import { ArticleCardSmall } from './ArticleCardSmall';

// Dữ liệu giả (mock data) - Sau này bạn sẽ thay bằng API
const largeArticle = {
  id: '1',
  title: 'Khi ứng viên phỏng vấn ngược, làm sao để ghi điểm "cực chất"? | Cẩm Nang Tuyển Dụng',
  description: 'Phỏng vấn ngày nay không còn là cuộc trao đổi một chiều giữa nhà tuyển dụng và ứng viên nữa. Đặc biệt với những ứng viên giỏi, có kinh nghiệm, họ thường chủ...',
  imageUrl: './src/assets/anh-tuyen-dung-lao-dong.jpg',
};

const smallArticle = {
  id: '2',
  title: 'HR và Manager "lệch pha" khi tuyển dụng: làm sao để đồng điệu? | Cẩm Nang Tuyển Dụng',
  description: 'Bạn có bao giờ tự hỏi vì sao HR và Manager lệch pha khi tuyển dụng lại xảy ra thường...',
  imageUrl: './src/assets/tuyen-dung-nhan-vien-le-tan.webp',
};

// Component chính
export const HandbookSection: React.FC = () => {
  return (
    <section>
      {/* Tiêu đề khối */}
      <h2 className="text-lg font-bold bg-gray-700 text-white p-3 rounded-t-md">
        Cẩm nang tuyển dụng
      </h2>
      
      {/* Nội dung khối */}
      <div className="bg-white p-4 border border-gray-200 border-t-0 rounded-b-md">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Bài viết chính (trái) */}
          <div className="lg:col-span-2">
            <ArticleCardLarge
              title={largeArticle.title}
              description={largeArticle.description}
              imageUrl={largeArticle.imageUrl}
            />
          </div>
          
          {/* Cột bài viết phụ (phải) */}
          <aside className="lg:col-span-1 space-y-4">
            <ArticleCardSmall
              title={smallArticle.title}
              description={smallArticle.description}
              imageUrl={smallArticle.imageUrl}
            />
            {/* Bạn có thể thêm các <ArticleCardSmall /> khác ở đây */}
          </aside>

        </div>
      </div>
    </section>
  );
};