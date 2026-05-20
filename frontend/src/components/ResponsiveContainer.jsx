import React from 'react';

export const Container = ({ children, className = '', size = 'default' }) => {
  const sizes = {
    sm: 'max-w-2xl',
    default: 'max-w-7xl',
    lg: 'max-w-full',
    xl: 'max-w-screen-2xl'
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
};

export const Grid = ({ children, cols = 1, gap = 4, className = '' }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  return (
    <div className={`grid ${gridCols[cols]} gap-${gap} ${className}`}>
      {children}
    </div>
  );
};

export const Flex = ({ children, direction = 'row', justify = 'start', align = 'start', className = '', wrap = false }) => {
  const directions = {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse'
  };

  const justifies = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignments = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  };

  return (
    <div className={`
      flex ${directions[direction]} ${justifies[justify]} ${alignments[align]}
      ${wrap ? 'flex-wrap' : 'flex-nowrap'}
      ${className}
    `}>
      {children}
    </div>
  );
};

export const Hidden = ({ children, below = 'md', above = 'lg' }) => {
  const breakpoints = {
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block',
    xl: 'hidden xl:block'
  };

  return (
    <div className={breakpoints[below]}>
      {children}
    </div>
  );
};
