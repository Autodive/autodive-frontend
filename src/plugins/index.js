import Vue from 'vue'
import './dayjs';
import './element'
import './support'
import '@/styles/vab.scss'
import '@/remixIcon'
import '@/colorfulIcon'
import '@/config/permission'
import '@/utils/errorLog'
import './vabIcon'

import Vab from '@/utils/vab'
import VabPermissions from 'zx-layouts/Permissions'

Vue.use(Vab)
Vue.use(VabPermissions)
