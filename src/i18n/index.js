import Vue from 'vue';
import i18next from 'i18next';
import I18NextVue from 'i18next-vue';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import locale from 'element-ui/lib/locale';
import cnLocale from 'element-ui/lib/locale/lang/zh-CN';
import enLocale from 'element-ui/lib/locale/lang/en';
import _ from 'lodash';

i18next
  .use(Backend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
  });

locale.i18n((k, v) => {
  if (i18next.exists(k)) {
    return i18next.t(k, v);
  }

  const _p = i18next.language?.startsWith('zh') ? _.propertyOf(cnLocale) : _.propertyOf(enLocale);
  return _.template(_p(k), { interpolate: /{([\s\S]+?)}/g })(v);
});

// i18next.t=i18next
Vue.use(I18NextVue, { i18next });

export default i18next;
