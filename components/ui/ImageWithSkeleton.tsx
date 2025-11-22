import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

export const ImageWithSkeleton: React.FC<Props> = ({ src, alt, className, containerClassName, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-gray-200", containerClassName)}>
      {/* Skeleton Loader */}
      <div 
        className={cn(
          "absolute inset-0 bg-gray-200 animate-pulse z-10",
          isLoaded ? "hidden" : "block"
        )} 
      />
      
      {/* Image */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-500 ease-in-out",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
};
