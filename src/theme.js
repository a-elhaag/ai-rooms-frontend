// AI Rooms - Creative Theme System
// This theme creates a modern "AI Control Room" aesthetic with bold colors and depth

export const theme = {
  // Primary brand colors - calm modern blue
  primary: '#2563EB', // Blue 600
  primarySoft: '#3B82F6', // Blue 500
  primaryStrong: '#1D4ED8', // Blue 700
  primaryMuted: 'rgba(37, 99, 235, 0.12)', // Transparent blue

  // Accent colors - lighter blue/cyan for subtle highlights
  accent: '#0EA5E9', // Sky 500
  accentSoft: '#38BDF8', // Sky 400
  accentStrong: '#0284C7', // Sky 600
  accentMuted: 'rgba(14, 165, 233, 0.12)', // Transparent sky

  // Background colors - Dark with depth
  background: '#020617', // Deep navy
  backgroundElevated: '#020617',
  backgroundSoft: '#020617',
  backgroundAccent: 'rgba(15, 23, 42, 1)',

  // Surface colors for cards and panels
  surface: '#020617',
  surfaceElevated: '#020617',
  surfaceHover: '#020617',

  // Border colors
  border: 'rgba(148, 163, 184, 0.12)',
  borderSubtle: 'rgba(148, 163, 184, 0.06)',
  borderStrong: 'rgba(148, 163, 184, 0.22)',
  borderAccent: '#2563EB',

  // Text colors
  textPrimary: '#E5F0FF', // Soft white-blue
  textSecondary: '#A5B8D8',
  textMuted: '#64748B',
  textOnAccent: '#FFFFFF', // White on colored backgrounds

  // Semantic colors
  success: '#10B981', // Green
  successSoft: '#34D399',
  warning: '#F59E0B',
  warningSoft: '#FBBF24',
  danger: '#EF4444',
  dangerSoft: '#F87171',
  info: '#3B82F6',
  infoSoft: '#60A5FA',

  // AI-specific colors
  aiMessage: '#2563EB',
  aiMessageBg: 'rgba(37, 99, 235, 0.12)',
  humanMessage: '#0EA5E9',
  humanMessageBg: 'rgba(14, 165, 233, 0.12)',
  systemMessage: '#64748B', // Slate for system
  systemMessageBg: 'rgba(100, 116, 139, 0.1)',

  // Status indicators
  statusActive: '#10B981', // Green
  statusIdle: '#F59E0B', // Amber
  statusOffline: '#64748B', // Gray
  statusThinking: '#8B5CF6', // Purple

  // Shadows and effects
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  shadowGlow: '0 0 20px rgba(139, 92, 246, 0.3)',
  shadowGlowAccent: '0 0 20px rgba(6, 182, 212, 0.3)',

  // Glassmorphism
  glassBackground: 'rgba(30, 41, 59, 0.7)',
  glassBlur: '12px',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Transitions
  transitionFast: '150ms ease',
  transitionBase: '250ms ease',
  transitionSlow: '400ms ease',

  // Border radius
  radiusSm: '0.375rem', // 6px
  radiusMd: '0.5rem', // 8px
  radiusLg: '0.75rem', // 12px
  radiusXl: '1rem', // 16px
  radiusFull: '9999px',

  // Spacing scale (in rem)
  space1: '0.25rem', // 4px
  space2: '0.5rem', // 8px
  space3: '0.75rem', // 12px
  space4: '1rem', // 16px
  space5: '1.25rem', // 20px
  space6: '1.5rem', // 24px
  space8: '2rem', // 32px
  space10: '2.5rem', // 40px
  space12: '3rem', // 48px
  space16: '4rem', // 64px
}

// Function to apply theme to CSS variables
export function applyTheme(themeObj = theme) {
  const root = document.documentElement

  Object.entries(themeObj).forEach(([key, value]) => {
    // Convert camelCase to kebab-case for CSS variables
    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    root.style.setProperty(cssVarName, value)
  })
}

export default theme
