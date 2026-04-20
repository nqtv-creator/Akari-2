import React from 'react';

const AdBanner = () => {
  return (
    <div
      data-testid="ad-banner"
      className="mx-4 mb-2 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden"
      style={{ minHeight: '100px' }}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200 mb-2">
        Sponsorise
      </span>
      <div className="text-slate-300 text-sm font-medium">Espace Publicitaire</div>
      <div className="text-[10px] text-slate-300 mt-1">Google AdSense</div>
    </div>
  );
};

export default AdBanner;
