const setting = require('./setting.config')
const theme = require('./theme.config')
const network = require('./net.config')
module.exports = Object.assign({}, setting, theme, network)
