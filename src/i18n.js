import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

i18n.use(initReactI18next).use(LanguageDetector).init({
    lng: window.localStorage.getItem('i18nextLng'),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources:{
        en: {
            translation: {
                Signup : 'Signup',        
            }
        },
        da: {
            translation: {
                Signup : 'Tilmeld dig',
            }
        },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
  });

export default i18n;