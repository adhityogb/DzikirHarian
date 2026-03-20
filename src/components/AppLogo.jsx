import React, { memo } from 'react';
import appLogo from '../assets/app-logo.png';

function AppLogo({ compact = false }) {
  return (
    <div className={`relative ${compact ? 'w-11 h-11' : 'w-14 h-14'} shrink-0 overflow-hidden rounded-2xl shadow-sm`}>
      <img src={appLogo} alt="DzikirHarian Logo" className="w-full h-full object-cover" loading="lazy" decoding="async" />
    </div>
  );
}

export default memo(AppLogo);
