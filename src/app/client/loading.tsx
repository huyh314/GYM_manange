import React from 'react';

export default function ClientLoading() {
  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300">
      {/* Skeleton for Header/Title */}
      <div className="h-8 bg-gray-200 rounded-md w-1/3 animate-pulse" />

      {/* Skeleton for Hero Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-48 animate-pulse">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="w-32 h-32 rounded-full border-8 border-gray-100" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>

      {/* Skeleton for Section Title */}
      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse mt-8 mb-4 px-1" />

      {/* Skeleton for Grid/List */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl p-4 h-24 border border-gray-100 shadow-sm animate-pulse" />
        <div className="bg-white rounded-2xl p-4 h-24 border border-gray-100 shadow-sm animate-pulse" />
      </div>

      {/* Skeleton for Status Cards */}
      <div className="grid grid-cols-3 gap-3 pt-4">
        <div className="bg-white rounded-xl h-20 border border-gray-100 shadow-sm animate-pulse" />
        <div className="bg-white rounded-xl h-20 border border-gray-100 shadow-sm animate-pulse" />
        <div className="bg-white rounded-xl h-20 border border-gray-100 shadow-sm animate-pulse" />
      </div>
    </div>
  );
}
