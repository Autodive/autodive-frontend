import Vue from 'vue'
import './i18n';
import App from './App'
import store from './store'
import router from './router'
import './plugins'
import '@/layouts/export'
import * as echarts from 'echarts'
import i18next from './i18n';

import dayjs from 'dayjs';

Vue.prototype.$echarts = echarts
console.log(router)
Vue.config.productionTip = false

i18next.on('initialized', () => {
  let app = createApp();
  dayjs.locale(i18next.language);

  i18next.on('languageChanged', function reload(lng) {
    console.log(dayjs.locale(), lng);
    dayjs.locale(lng);
    if (app) {
      app.$destroy();
    }
    app = createApp();
  });
});

function createApp() {
  return new Vue({
    el: '#vue-admin-beautiful',
    router,
    store,
    render: (h) => h(App),
  });
}
