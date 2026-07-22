import React, { useState } from "react";

const OptimizedImage = ({
  src,
  alt,
  className = "",
  fallbackText = "📦",
  fallbackClassName = "",
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const getImageSource = () => {
    if (!src) return null;

    if (typeof src === "string") {
      return src;
    }

    if (typeof src === "object") {
      return src.url || src.src || src.thumbnail || src.full || null;
    }

    return null;
  };

  const imageSrc = getImageSource();

  if (!imageSrc || hasError) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${fallbackClassName}`}
      >
        <span className="text-2xl sm:text-3xl">{fallbackText}</span>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
