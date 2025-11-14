import { Colors, Spacing, Radius } from '@/constants/theme';
import { Body, Heading } from '@/shared/components/ui/Typography';
import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage, type Language } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
];

export function LanguageSelector() {
  const { t } = useTranslation();
  const colors = Colors.light;
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <Heading size="sm" weight="semiBold" style={styles.title}>
        {t('settings.selectLanguage')}
      </Heading>

      <View style={styles.optionsContainer}>
        {languages.map((lang) => {
          const isSelected = language === lang.code;

          return (
            <Pressable
              key={lang.code}
              style={[
                styles.languageOption,
                {
                  backgroundColor: isSelected ? colors.background : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <View style={styles.languageInfo}>
                <Body size="lg" style={styles.flag}>
                  {lang.flag}
                </Body>
                <View style={styles.textContainer}>
                  <Body size="base" weight="semiBold" color={colors.text}>
                    {lang.nativeName}
                  </Body>
                  <Body size="sm" color={colors.textSecondary}>
                    {lang.name}
                  </Body>
                </View>
              </View>

              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  flag: {
    fontSize: 32,
  },
  textContainer: {
    gap: Spacing.xxs,
  },
});
