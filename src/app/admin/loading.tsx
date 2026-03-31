import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 rounded mt-2 animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white border border-gray-100 shadow-sm rounded-2xl animate-pulse p-5">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded-xl" />
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded mt-4" />
          </div>
        ))}
      </div>

      {/* Main Content Areas Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-white border border-gray-100 shadow-sm rounded-2xl animate-pulse p-6" />
        <div className="h-80 bg-white border border-gray-100 shadow-sm rounded-2xl animate-pulse p-6" />
      </div>
    </div>
  );
}
