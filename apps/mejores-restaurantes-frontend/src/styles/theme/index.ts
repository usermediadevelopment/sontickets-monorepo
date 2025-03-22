/**
 * Theme exports
 * 
 * This file re-exports all theme-related items for easy imports throughout the app
 */

// Export theme configuration
export * from './theme';

// Export theme mixins
export * from './mixins';

// Export theme components
export { ThemeSwitcher } from '@/components/ui/theme-switcher';
export { useTheme } from '@/providers/ThemeProvider'; 