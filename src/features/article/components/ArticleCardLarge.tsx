import React from 'react';

// TODO: Thay thế bằng ảnh thật
const largeImageUrl = 'https://via.placeholder.com/500x300?text=Interview';

interface ArticleCardLargeProps {
  title: string;
  description: string;
  imageUrl: string;
}

export const ArticleCardLarge: React.FC<ArticleCardLargeProps> = ({
  title,
  description,
  imageUrl,
}) => {
  return (
    <article>
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-auto object-cover rounded-md mb-3" 
      />
      <h3 className="text-xl font-bold hover:text-blue-600 cursor-pointer transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600 mt-2">
        {description}
      </p>
    </article>
  );
};