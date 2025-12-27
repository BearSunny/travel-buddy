'use client';

import React, { useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface SmartInputProps {
  type: 'date' | 'time';
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  Icon: LucideIcon;
}

export default function SmartInput({ type, value, onChange, placeholder, Icon }: SmartInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    // This triggers the browser's native date/time picker popup
    if (inputRef.current) {
      try {
        inputRef.current.showPicker();
      } catch (error) {
        // Fallback for older browsers (unlikely on modern laptop)
        inputRef.current.focus(); 
      }
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative flex cursor-pointer items-center justify-between rounded-xl bg-gray-100 px-4 py-3 transition-colors hover:bg-gray-200"
    >
      {/* Visual Layer */}
      <span className={`text-sm font-medium ${value ? 'text-gray-900' : 'text-gray-500'}`}>
        {value || placeholder}
      </span>
      <Icon className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />

      {/* Logic Layer (Hidden) */}
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="invisible absolute inset-0 opacity-0" // Hide it but keep it in DOM
      />
    </div>
  );
}