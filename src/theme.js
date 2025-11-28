// AI Rooms - White, Black, and Azure Blue Theme
// This theme creates a modern, clean aesthetic

export const theme = {
  // Primary brand colors - Azure Blue
  primary: '#007FFF', // Azure Blue
  primarySoft: '#3399FF', // Lighter Azure
  primaryStrong: '#0066CC', // Darker Azure
  primaryMuted: 'rgba(0, 127, 255, 0.12)', // Transparent Azure

  // Accent colors - Using Azure variations
  accent: '#007FFF',
  accentSoft: '#3399FF',
  accentStrong: '#0066CC',
  accentMuted: 'rgba(0, 127, 255, 0.12)',

  // Background colors - White
  background: '#FFFFFF',
  backgroundElevated: '#F8FAFC', // Very light gray for elevation
  backgroundSoft: '#F1F5F9', // Light gray
  backgroundAccent: '#E0F2FE', // Light blue tint

  // Surface colors for cards and panels
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHover: '#F8FAFC',

  // Border colors
  border: '#E2E8F0', // Light gray border
  borderSubtle: '#F1F5F9',
  borderStrong: '#CBD5E1',
  borderAccent: '#007FFF',

  // Text colors - Black
  textPrimary: '#000000',
  textSecondary: '#334155', // Slate 700
  textMuted: '#64748B', // Slate 500
  textOnAccent: '#FFFFFF',

  // Semantic colors
  success: '#10B981', // Green
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  info: '#007FFF',
  infoSoft: '#E0F2FE',

  // AI-specific colors
  aiMessage: '#007FFF',
  aiMessageBg: '#F0F9FF',
  humanMessage: '#000000',
  humanMessageBg: '#F1F5F9',
  systemMessage: '#64748B',
  systemMessageBg: '#F8FAFC',

  // Status indicators
  statusActive: '#10B981',
  statusIdle: '#F59E0B',
  statusOffline: '#64748B',
  statusThinking: '#8B5CF6',

  // Shadows and effects
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  shadowGlow: '0 0 15px rgba(0, 127, 255, 0.2)',
  shadowGlowAccent: '0 0 15px rgba(0, 127, 255, 0.2)',

  // Glassmorphism (adjusted for light theme)
  glassBackground: 'rgba(255, 255, 255, 0.7)',
  glassBlur: '12px',
  glassBorder: 'rgba(255, 255, 255, 0.5)',

  // Transitions
  transitionFast: '150ms ease',
  transitionBase: '250ms ease',
  transitionSlow: '400ms ease',

  // Border radius
  radiusSm: '0.375rem',
  radiusMd: '0.5rem',
  radiusLg: '0.75rem',
  radiusXl: '1rem',
  radiusFull: '9999px',

  // Spacing scale
  space1: '0.25rem',
  space2: '0.5rem',
  space3: '0.75rem',
  space4: '1rem',
  space5: '1.25rem',
  space6: '1.5rem',
  space8: '2rem',
  space10: '2.5rem',
  space12: '3rem',
  space16: '4rem',
}

// Function to apply theme to CSS variables
export function applyTheme(themeObj = theme) {
  const root = document.documentElement

  Object.entries(themeObj).forEach(([key, value]) => {
    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    root.style.setProperty(cssVarName, value)
  })
}

export default theme
