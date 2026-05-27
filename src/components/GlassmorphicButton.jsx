import React from 'react';








export function GlassmorphicButton({
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
    text-white rounded-xl hover:scale-105 transition-all duration-300 font-semibold shadow-lg cursor-pointer
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      className={baseClasses}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
        pointerEvents: 'auto'
      }}
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