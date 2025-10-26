import React from 'react';

interface ArticleCardSmallProps {
  title: string;
  description: string;
  imageUrl: string;
}

export const ArticleCardSmall: React.FC<ArticleCardSmallProps> = ({
  title,
  description,
  imageUrl,
}) => {
  return (
    <article className="flex gap-3">
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-24 h-16 object-cover rounded-md flex-shrink-0" 
      />
      <div className="flex-1">
        <h4 className="font-semibold text-sm hover:text-blue-600 cursor-pointer transition-colors">
          {title}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>
      </div>
    </article>
  );
};