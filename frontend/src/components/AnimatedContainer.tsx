import React from 'react';

interface AnimatedContainerProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  animation?: 'fade' | 'slide' | 'scale';
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({ 
  children, 
  delay = 0, 
  className = '',
  animation = 'fade'
}) => {
  const animationClass = {
    fade: 'animate-fade-in',
    slide: 'animate-slide-up', 
    scale: 'animate-scale-in'
  }[animation];

  return (
    <div 
      className={`${animationClass} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;
