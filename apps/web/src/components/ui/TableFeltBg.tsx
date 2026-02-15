import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function TableFeltBg({ children, className = '' }: Props) {
  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-felt-green opacity-95" />
      <div className="relative z-10">{children as React.ReactNode}</div>
    </div>
  );
}
