import { theme } from './styles/theme';

type CustomThemeInterface = typeof theme;

declare module '@emotion/react' {
  interface Theme extends CustomThemeInterface {}
}
