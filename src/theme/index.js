// ============================================
// THEME — Sistema de Diseño "Sistemas Tezontepec de Aldama"
// ============================================

export const COLORS = {
  // Primarios
  primary: '#1B3A8C',         // Azul cobalto intenso (botones, títulos, menú activo)
  primaryDark: '#0F2460',     // Azul oscuro (header, drawer)
  primaryLight: '#D6E4FF',    // Azul pastel claro (inputs, cards)

  // Degradados
  gradientBlue: '#1B3A8C',    // Inicio del degradado
  gradientPink: '#E040A0',    // Rosa magenta (final del degradado)
  gradientMid: '#6B3FA0',     // Punto medio violeta

  // Fondos
  background: '#FFFFFF',      // Fondo general blanco
  surface: '#F0F4FF',         // Fondo de tarjetas/cards
  inputBg: '#D6E4FF',         // Fondo de inputs azul pastel

  // Textos
  textPrimary: '#1B3A8C',     // Texto principal azul oscuro
  textSecondary: '#6B7B9E',   // Texto secundario gris medio
  textWhite: '#FFFFFF',       // Texto sobre botones/fondos oscuros
  textDark: '#1A1A2E',        // Texto negro/muy oscuro

  // Estados
  success: '#28A745',
  warning: '#FFC107',
  danger: '#DC3545',
  info: '#17A2B8',

  // Prioridades de tickets
  priorityHigh: '#DC3545',
  priorityNormal: '#1B3A8C',

  // Estados de tickets
  statusOpen: '#17A2B8',
  statusInProgress: '#FFC107',
  statusDone: '#28A745',

  // Otros
  border: '#C8D6F0',
  shadow: '#1B3A8C20',
  overlay: '#00000050',
  white: '#FFFFFF',
};

export const FONTS = {
  bold: {
    fontWeight: '700',
  },
  semiBold: {
    fontWeight: '600',
  },
  medium: {
    fontWeight: '500',
  },
  regular: {
    fontWeight: '400',
  },
  light: {
    fontWeight: '300',
  },
};

export const SIZES = {
  // Fuentes
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  caption: 14,
  small: 12,

  // Espaciado
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Bordes
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 20,
  radiusFull: 50,

  // Inputs
  inputHeight: 50,
  buttonHeight: 50,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
};

export default { COLORS, FONTS, SIZES, SHADOWS };
