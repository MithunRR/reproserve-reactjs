import React from 'react';








export function CoralOrangeButton({
  children,
  icon,
  size = 'md',
  fullWidth = false,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-3',
    lg: 'px-6 py-3 text-lg'
  };

  const baseClasses = `
    bg-coral-orange text-black rounded-xl hover:bg-coral-orange/90 hover:scale-105 
    transition-all duration-300 font-semibold shadow-lg cursor-pointer
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      className={baseClasses}
      {...props}>
      
      {icon ?
      <span className="flex items-center space-x-2">
          {icon}
          <span>{children}</span>
        </span> :

      children
      }
    </button>);

}