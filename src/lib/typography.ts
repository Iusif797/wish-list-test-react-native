import { TextStyle } from 'react-native';

export const FontSize = {
  caption: 12,
  secondary: 14,
  body: 16,
  title: 20,
  header: 24,
} as const;

export const Typography = {
  caption: {
    fontSize: FontSize.caption,
    lineHeight: 16,
  } as TextStyle,
  secondary: {
    fontSize: FontSize.secondary,
    lineHeight: 20,
  } as TextStyle,
  body: {
    fontSize: FontSize.body,
    lineHeight: 24,
  } as TextStyle,
  title: {
    fontSize: FontSize.title,
    lineHeight: 28,
  } as TextStyle,
  header: {
    fontSize: FontSize.header,
    lineHeight: 32,
  } as TextStyle,
};
