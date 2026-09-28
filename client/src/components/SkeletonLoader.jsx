import React from "react";

export const SkeletonCard = () => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 bg-slate-800 rounded" />
        <div className="h-6 w-12 bg-slate-800 rounded-full" />
      </div>
      <div className="h-8 w-3/4 bg-slate-800 rounded" />
      <div className="h-3 w-1/2 bg-slate-800 rounded" />
      <div className="pt-2 flex gap-2">
        <div className="h-8 w-20 bg-slate-800 rounded-lg" />
        <div className="h-8 w-20 bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 animate-pulse flex items-center justify-between"
        >
          <div className="space-y-2 flex-1 mr-4">
            <div className="h-4 w-48 bg-slate-800 rounded" />
            <div className="h-3 w-32 bg-slate-800/60 rounded" />
          </div>
          <div className="h-8 w-24 bg-slate-800 rounded-lg" />
        </div>
      ))}
    </div>
  );
};
