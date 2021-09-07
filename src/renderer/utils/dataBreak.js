import modules from "../store/modules"

export default {
    XMLHttpRequestBreak: (fun = () => false) => {
        // let originFun = XMLHttpRequest.prototype.response
        let old = window.XMLHttpRequest
        window.XMLHttpRequest = new Proxy(XMLHttpRequest, {
            get (target, key) {
                return target[key]
            },
            set(target, key, value) {
                if (key === 'onreadystatechange') {
                    value = (...arg) => {
                        value.apply(target, arg)
                        fun.apply(target, arg)
                    }
                }
                return Reflect.set(target, key, value);
              }
        })
        // XMLHttpRequest.prototype.onreadystatechange = function (...args) {
        //     fun.apply(this, args)
        // }
    
    }
}


