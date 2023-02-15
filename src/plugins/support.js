import { MessageBox } from 'element-ui'
import { donation } from '@/config'
import { dependencies, repository } from '../../package.json'

if (!!window.ActiveXObject || 'ActiveXObject' in window) {
  MessageBox({
    title: 'Reminder',
    message:
      'Please use edge browser, <a target="_blank" style="color:blue" href="https://www.microsoft.com/zh-cn/edge/">click</a>',
    type: 'warning',
    showClose: false,
    showConfirmButton: false,
    closeOnClickModal: false,
    closeOnPressEscape: false,
    closeOnHashChange: false,
    dangerouslyUseHTMLString: true,
  })
}
if (!dependencies['vab-icon'] || !dependencies['zx-layouts'])
  document.body.innerHTML = ''
