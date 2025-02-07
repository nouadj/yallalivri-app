import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import en from './en.json';
import fr from './fr.json';
import ar from './ar.json';

const LANGUAGE_KEY = 'language';

const loadLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  return savedLanguage || 'fr'; // Français par défaut
};

loadLanguage().then((lang) => {
  i18n
    .use(initReactI18next)
    .init({
      resources: { en: { translation: en }, fr: { translation: fr }, ar: { translation: ar } },
      lng: lang,
      fallbackLng: 'fr',
      interpolation: { escapeValue: false },
    });

  // ✅ Active/Désactive le mode RTL pour l'arabe
  if (lang === 'ar') {
    I18nManager.forceRTL(true);
  } else {
    I18nManager.forceRTL(false);
  }
});

export const changeLanguage = async (lang) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  i18n.changeLanguage(lang);

  if (lang === 'ar') {
    I18nManager.forceRTL(true);
  } else {
    I18nManager.forceRTL(false);
  }
};

export default i18n;
