/**
 * Tailwind CSS Mixins
 * 
 * This file contains reusable tailwind class combinations that can be used
 * throughout the application to maintain consistency.
 */

import { cn } from '@/lib/utils';

// Container styles
export const container = cn('w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl');

// Card styles
export const cardBase = cn(
  'rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden'
);

export const cardContent = cn('p-6');
export const cardHeader = cn('space-y-1.5 p-6');
export const cardFooter = cn('flex items-center p-6 pt-0');
export const cardTitle = cn('text-2xl font-semibold leading-none tracking-tight');
export const cardDescription = cn('text-sm text-muted-foreground');

// Typography styles
export const heading = {
  h1: cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'),
  h2: cn('scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0'),
  h3: cn('scroll-m-20 text-2xl font-semibold tracking-tight'),
  h4: cn('scroll-m-20 text-xl font-semibold tracking-tight'),
  h5: cn('scroll-m-20 text-lg font-semibold tracking-tight'),
  h6: cn('scroll-m-20 text-base font-semibold tracking-tight'),
};

export const paragraph = cn('leading-7 [&:not(:first-child)]:mt-6');
export const lead = cn('text-xl text-muted-foreground');
export const large = cn('text-lg font-semibold');
export const small = cn('text-sm font-medium leading-none');
export const muted = cn('text-sm text-muted-foreground');

// Form styles
export const formLabel = cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70');
export const formItem = cn('space-y-2');
export const formControl = cn('flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50');
export const formDescription = cn('text-sm text-muted-foreground');
export const formMessage = cn('text-sm font-medium text-destructive');

// Layout styles
export const grid = {
  cols1: cn('grid grid-cols-1 gap-4'),
  cols2: cn('grid grid-cols-1 md:grid-cols-2 gap-4'),
  cols3: cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'),
  cols4: cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'),
};

export const flexRow = cn('flex flex-row items-center');
export const flexCol = cn('flex flex-col');
export const flexCenter = cn('flex items-center justify-center');
export const flexBetween = cn('flex items-center justify-between');

// Button styles - additional composable variants
export const buttonGroup = cn('inline-flex items-center justify-center rounded-md bg-background p-1 text-muted-foreground');

// Badge styles - additional composable variants
export const badgeSecondary = cn('bg-secondary text-secondary-foreground hover:bg-secondary/80');
export const badgeOutline = cn('text-foreground');

// Interactive styles
export const hoverCard = cn('transition-all duration-200 hover:shadow-md');
export const activeCard = cn('transition-all duration-200 hover:shadow-md active:scale-95');

// Responsive styles
export const responsiveContainer = {
  sm: cn('w-full max-w-sm mx-auto'),
  md: cn('w-full max-w-md mx-auto'),
  lg: cn('w-full max-w-lg mx-auto'),
  xl: cn('w-full max-w-xl mx-auto'),
  '2xl': cn('w-full max-w-2xl mx-auto'),
  '3xl': cn('w-full max-w-3xl mx-auto'),
  '4xl': cn('w-full max-w-4xl mx-auto'),
  '5xl': cn('w-full max-w-5xl mx-auto'),
  '6xl': cn('w-full max-w-6xl mx-auto'),
  '7xl': cn('w-full max-w-7xl mx-auto'),
}; 