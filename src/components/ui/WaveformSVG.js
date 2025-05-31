import React from 'react';

function WaveformSVG({ width = 120, height = 60, color = '#2196f3' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="30" width="6" height="20" rx="3" fill={color} opacity="0.7"/>
      <rect x="17" y="20" width="6" height="30" rx="3" fill={color} opacity="0.8"/>
      <rect x="29" y="10" width="6" height="40" rx="3" fill={color} opacity="0.9"/>
      <rect x="41" y="5" width="6" height="50" rx="3" fill={color} opacity="1"/>
      <rect x="53" y="10" width="6" height="40" rx="3" fill={color} opacity="0.9"/>
      <rect x="65" y="20" width="6" height="30" rx="3" fill={color} opacity="0.8"/>
      <rect x="77" y="30" width="6" height="20" rx="3" fill={color} opacity="0.7"/>
      <rect x="89" y="20" width="6" height="30" rx="3" fill={color} opacity="0.8"/>
      <rect x="101" y="10" width="6" height="40" rx="3" fill={color} opacity="0.9"/>
    </svg>
  );
}

export default WaveformSVG; 