import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div className={clsx("glass-card", className)} {...props}>
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => (
  <button 
    className={clsx("btn", `btn-${variant}`, className)} 
    {...props}
  >
    {children}
  </button>
);

export const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ children, className, style, ...props }) => (
  <span 
    style={{
      padding: '0.4rem 0.8rem',
      borderRadius: '8px',
      fontSize: '0.75rem',
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      ...style
    }}
    className={className}
    {...props}
  >
    {children}
  </span>
);
