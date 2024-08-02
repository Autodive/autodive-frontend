import { createI18n } from 'vue-i18n';
import en from './locales/en/translation.json'
import zh from './locales/zh/translation.json' 

let defaultLang = 'zh'
export default createI18n({
    legacy: false,
    locale: defaultLang,
    fallbackLocale: 'en',
    globalInjection: true,

    silentTranslationWarn: true,
    missingWarn: false,
    silentFallbackWarn: true,
    messages: {
        zh,
        en,
    },
});
