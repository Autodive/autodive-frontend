import axios from 'axios'
export const config = (await axios.get('config.json')).data


export const publicPath = ''
export const outputDir = 'dist'
export const assetsDir = 'static'
export const lintOnSave = false
export const transpileDependencies = ['vue-echarts', 'resize-detector']
export const baseURL = import.meta.env.VUE_APP_BASE_API
export const abbreviation = 'vab'
export const devPort = '80'
export const version = import.meta.env.VUE_APP_VERSION
export const copyright = 'vab'
export const footerCopyright = false
export const progressBar = true
export const keepAliveMaxNum = 99
export const routerMode = 'hash'
export const routesWhiteList = ['/login', '/register', '/404', '/401', '/password']
export const loadingText = '正在加载中...'
export const tokenName = 'Authorization'
export const tokenTableName = 'accessToken'
export const storage = 'localStorage'
export const recordRoute = true
export const logo = false
export const errorLog = ['development']
export const loginInterception = true
export const loginRSA = false
export const authentication = 'intelligence'
export const uniqueOpened = true
export const defaultOopeneds = ['/vab']
export const debounce = ['doEdit']
export const providePlugin = { maptalks: 'maptalks', 'window.maptalks': 'maptalks' }
export const build7z = false
export const templateFolder = 'project'
export const donation = false
export const contentType = 'application/json;charset=UTF-8'
export const messageDuration = 3000
export const requestTimeout = 50000
export const successCode = [200, 0]
export const invalidCode = 402
export const noPermissionCode = 401
