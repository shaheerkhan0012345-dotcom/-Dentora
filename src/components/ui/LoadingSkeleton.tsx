import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = 'h-4 w-full',
  count = 1,
}) => {
  return (
    <div className="space-y-2.5 animate-pulse w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-slate-200/70 rounded-xl ${className}`} />
      ))}
    </div>
  );
};
