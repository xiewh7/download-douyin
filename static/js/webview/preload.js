// const XMLHttpRequestBreak = (fun = () => false) => {
//     // let originFun = XMLHttpRequest.prototype.response
//     let old = window.XMLHttpRequest
//     window.XMLHttpRequest = new Proxy(XMLHttpRequest, {
//         get (target, key) {
//             return target[key]
//         },
//         set(target, key, value) {
//             if (key === 'onreadystatechange') {
//                 value = (...arg) => {
//                     value.apply(target, arg)
//                     fun.apply(target, arg)
//                 }
//             }
//             return Reflect.set(target, key, value);
//           }
//     })
//     // XMLHttpRequest.prototype.onreadystatechange = function (...args) {
//     //     fun.apply(this, args)
//     // }

// }


// XMLHttpRequestBreak(function (...args) {
//     if (this.readyState === 4) {
//       console.warn(this.response)
//     } 
//   })

const {ipcRenderer} = require('electron');


/**
 * xhr_proxy.js
 * 通过劫持原生XMLHttpRequest实现对页面ajax请求的监听
 * @author binaryfire
 */
const READY_STATE_CHANGE = 'readystatechange'
let gHandlerList = []//截获请求的处理函数列表
    gIsInited = false//是否已经初始化
let T_RSC_HANDLERS = Symbol('readyStateChangeHandler')
let initProxy = function(){
    if(gIsInited)return
    gIsInited = true
 
    //这里先缓存一份原生的XMLHttpRequest类
    let winXMLHttpRequest = window.XMLHttpRequest;
 
    //用于替换原生XMLHttpRequest的类，继承自XMLHttpRequest
    let ProxyXHR = class extends winXMLHttpRequest{
        constructor(){
            super(...arguments);
            //readystatechange
            //数组中第0个为页面中调用xhr.onreadystatechange的回调函数
            //其他的为页面中调用addEventListener('readystatechange')时的回调函数
            this[T_RSC_HANDLERS] = [null]
            //调用原生XMLHttpRequest的addEventListener，添加对readystatechange事件的监听
            super.addEventListener(READY_STATE_CHANGE,async ()=>{
                if(this.readyState == 4 && gHandlerList.length){//只有4的时候会回调proxyHandler
                    try{
                        //调用注册的handler
                        await gHandlerList.map(proxyHandler => proxyHandler.call(this,this))
                    }
                    catch(e){
                        //TODO 这里可以替换为其他的错误处理逻辑
                        console.error(e)
                    }
                }
                //调用页面中注册的回调函数，保证页面中逻辑正常
                this[T_RSC_HANDLERS].forEach(handler => handler && handler.apply(this,arguments))
            });
        }
        /**
         * 重写addEventListener函数，对readystatechange事件做特殊处理
         */
        addEventListener(type,handler){
            if(type == READY_STATE_CHANGE){
                this[T_RSC_HANDLERS].push(handler);
            }
            else{
                return super.addEventListener(...arguments)
            }
        }
        /**
         * 重写removeEventListener函数，对readystatechange事件做特殊处理
         */
        removeEventListener(type,handler){
            if(type == READY_STATE_CHANGE){
                this[T_RSC_HANDLERS] = this[T_RSC_HANDLERS].filter(i => i!== handler)
            }
            else{
                return super.removeEventListener(...arguments)
            }
        }
        /**
         * 重写onreadystatechange属性的setter
         */
        set onreadystatechange(val){
            this[T_RSC_HANDLERS][0] = val
        }
        /**
         * 重写onreadystatechange属性的getter
         */
        get onreadystatechange(){
            return this[T_RSC_HANDLERS][0] || null;
        }
 
    }
    //覆盖原生的XMLHttpRequest
    window.XMLHttpRequest = ProxyXHR
}
 
/**
 * 增加一个handler
 * 当xhr.readyState == 4时，回调handler，handler中，可以通过xhr.responseText获取请求返回内容
 * @param {function} handler function(xhr){}
 */
let addHandler = function(handler){
    initProxy()
    gHandlerList.push(handler)
}
/**
 * 移除指定的handler
 * @param {function} handler 调用addHandler时添加的handler
 */
let removeHandler = function(handler){
    gHandlerList = gHandlerList.filter(h => h!== handler);
}

addHandler (function(xhr){
    let data = {};
    // if () {
        
    // }
    if (xhr.responseURL.includes('https://www.douyin.com/aweme/v1/web/search/item')) {
        console.warn({xhr, res: this.response, res2: JSON.parse(this.response)})
        ipcRenderer.sendToHost('search', JSON.parse(this.response));
    }
    //TODO 具体业务代码
    //通过ipcRenderer.sendToHost即可将xhr内容发送到BrowserWindow中
    
})