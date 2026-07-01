import { type ThemeConfig, theme } from 'antd';

export const getThemeConfig = (dark: boolean): ThemeConfig => ({
  algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
    borderRadius: 8,
  },
  components: {
    Card: {
      paddingLG: 24,
    },
  },
});
