import React, { useState } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  priority = false,
  quality = 75,
  imgStyle = {},
  containerStyle = {}
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const getWebpSrc = (originalSrc) => {
    if (typeof originalSrc !== 'string') return originalSrc;
    // Handle local paths and absolute URLs
    if (originalSrc.endsWith('.png') || originalSrc.endsWith('.jpg') || originalSrc.endsWith('.jpeg')) {
      return originalSrc.replace(/\.(png|jpg|jpeg)$/, '.webp');
    }
    return originalSrc;
  };

  const webpSrc = getWebpSrc(src);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width: width || '100%', height: height || '100%', ...containerStyle }}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 skeleton bg-slate-800/20 rounded-xl" />
      )}
      
      <picture className="w-full h-full">
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain', ...imgStyle }}
        />
      </picture>
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 text-slate-500 text-[10px] p-2 text-center">
          <span>Image Load Failed</span>
          <span className="opacity-50 mt-1">{src?.split('/').pop()}</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
