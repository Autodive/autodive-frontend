if (window.addEventListener) {
  window.addEventListener('resize', function () {
      setHtmlFontSize()
  }, false)
}
export function setHtmlFontSize () {
    //deviceWidth = document.documentElement.clientWidth > 1366 ? 1366 : document.documentElement.clientWidth
  	var deviceWidth = document.documentElement.clientWidth
    return document.getElementsByTagName('html')[0].style.cssText = 'font-size:' + deviceWidth / 1920 + 'px !important'
}
