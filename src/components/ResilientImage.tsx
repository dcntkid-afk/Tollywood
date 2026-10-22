import React, { useState } from 'react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-[#EDE3D2] via-[#F5EFE3] to-[#E5D7C0] flex flex-col items-center justify-center p-4 text-center border border-[#D8C9AF] ${className}`}
        role="img"
        aria-label={alt}
      >
        <i className="fa-solid fa-bowl-rice text-[#B58A3A] text-2xl mb-2" />
        <span className="font-cinzel text-xs font-semibold text-[#171717] line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
