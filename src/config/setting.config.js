const setting = {
    publicPath: '',
    outputDir: 'dist',
    assetsDir: 'static',
    lintOnSave: false,
    transpileDependencies: ['vue-echarts', 'resize-detector'],
    baseURL: process.env.VUE_APP_BASE_API,
    title: 'AutoDive一站式知识标注平台',
    abbreviation: 'vab',
    devPort: '8081',
    version: process.env.VUE_APP_VERSION,
    copyright: 'vab',
    footerCopyright: false,
    progressBar: true,
    keepAliveMaxNum: 99,
    routerMode: 'hash',
    routesWhiteList: ['/login', '/register', '/404', '/401','/password'],
    loadingText: 'Loading...',
    tokenName: 'Authorization',
    tokenTableName: 'accessToken',
    storage: 'localStorage',
    recordRoute: true,
    logo: false,
    errorLog: ['development'],
    loginInterception: true,
    loginRSA: false,
    authentication: 'intelligence',
    uniqueOpened: true,
    defaultOopeneds: ['/vab'],
    debounce: ['doEdit'],
    providePlugin: { maptalks: 'maptalks', 'window.maptalks': 'maptalks' },
    build7z: false,
    templateFolder: 'project',
    donation: false,
}
module.exports = setting
