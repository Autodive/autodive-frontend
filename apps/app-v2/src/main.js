import { createApp } from 'vue';
import { RouterView } from 'vue-router';
import '@/styles/index.scss';
import '@/styles/vab.scss';
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-notification.css'

import 'nprogress/nprogress.css';

import routes from './init/routes.js';
import elementPlus from './init/elementPlus.js';
import i18n from './init/i18n.js';
import i18n1 from './language';
import pinia from './init/pinia.js';
import request from './init/request.js';
import './init/dayjs.js';

const app = createApp(RouterView);
routes(app)
elementPlus(app)
i18n(app)
pinia(app)
request(app)
app.i18n = i18n1

app.mount('#app');

