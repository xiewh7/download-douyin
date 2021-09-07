import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App'
import router from './router'
import store from './store'

import downloadVideo from './utils/downloadFile'

// import { protocol }  from 'electron'

// protocol.registerHttpProtocol('http3', (req, cb) => {
//   cb({
//       url: 'http://v26-web.douyinvod.com',
//       referrer: "http://v26-web.douyinvod.com/aeb4b7a1b7608b9530a701416d7ef3b0/61371634/video/tos/cn/tos-cn-ve-15/9c0b41b6c6774084a6d9301aa0074dd3/?a=6383&br=1391&bt=1391&cd=0|0|0&ch=11&cr=0&cs=0&cv=1&dr=0&ds=4&er=&ft=~MeSY~88-oU-DYlnh7TQPqeUfTusNt9NWy&l=202109071429410101351541595806E203&lr=all&mime_type=video_mp4&net=0&pl=0&qs=0&rc=amxmdXlwc244eTMzZGkzM0ApNDRlOWY4NztmNzpkNzxkN2dwcF5vaF5vamZfLS0wLTBzc2IwNS4tYV82LV4zNV42Mi06Yw==&vl=&vr="
//   })
// })



Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(ElementUI)



Vue.prototype.preloadPath = `file://${require('path').resolve(__dirname,'../../')}/static/js/webview/preload.js`

Vue.prototype.$downloadVideo = downloadVideo

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
