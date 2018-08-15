class HQQTool {
    
    static isInApp = false;

    /**
     * 解析url中的参数
     * arr: 需要解析的keys
     * parseHash: 是否解析url中带hash的参数
     */
    static queryUrlWithKeys = (arr=[], isParseHash = false) => {
        let result = {};
        arr.map((key)=>{
            result[key] = HQQTool.getQueryString(key, isParseHash);
            return result;
        });
        return result;
    }
    static getQueryString = (name, isParseHash) => {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
        let paramsString = window.location.search.substr(1);
        if (window.location.search.length === 0) {
            if (isParseHash) {
                let arr = window.location.href.split('#');
                if (arr.length > 1) {
                    let p = arr[arr.length - 1];
                    let arr2 = p.split('?');
                    if (arr2.length > 1) {
                        paramsString = arr2[arr2.length - 1];
                    }
                }
            }
        }
        var r = paramsString.match(reg); //获取url中"?"符后的字符串并正则匹配
        var context = "";
        if (r !== null) {
            context = r[2];
        }
        reg = null;
        r = null;
        return context === null || context === "" || context === "undefined" ? "" : context; 
    }

    static getUrlParamters = (isParseHash) => {
        let parameters = {};
        let paramsString = window.location.search.substring(1);
        if (window.location.search.length === 0) {
            if (isParseHash) {
                let arr = window.location.href.split('#');
                if (arr.length > 1) {
                    let p = arr[arr.length - 1];
                    let arr2 = p.split('?');
                    if (arr2.length > 1) {
                        paramsString = arr2[arr2.length - 1];
                    }
                }
            }
        }
        let pattern = /(\w+)=(\w+)/ig;
        paramsString.replace(pattern, function(pair, name, value){
          parameters[name] = value;
        });
        return parameters;
    }

    static parseJson2Url = (param, key) => {
        let paramStr = '';
        let mappingOperator = '=';
        let separator = '&';
        if (param instanceof String || typeof (param) === 'string' || param instanceof Number || typeof (param) === 'number' || param instanceof Boolean || typeof (param) === 'boolean') {
            paramStr += separator + key + mappingOperator + encodeURIComponent(param);
        } else {
            for (let i in param) {
                let value = param[i];
                let k = key === null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
                paramStr += separator + HQQTool.parseJson2Url(value, k);
            }
        }
        return paramStr.substr(1);
    };

    // 校验手机号格式
    static isPhone = (phoneNo) => {
        const moreg = /^(((13[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
        return moreg.test(phoneNo);
    }

    // 手机号中间4位变成星号
    static secretPhone = (phoneNo) => {
        if (!HQQTool.isPhone(phoneNo)) {
            return '';
        } else {
            return phoneNo.substr(0, 3) + '****' + phoneNo.substr(7, 11);
        }
    }

    // 页面是否在iOS设备上打开
    static isIOS = () => {
        const u = navigator.userAgent;
        return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    }

    // 页面是否在Android设备打开
    static isAndroid = () => {
        const u = navigator.userAgent;
        return u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
    }

    static isInWeixin = () => {
        const u = navigator.userAgent.toLowerCase();
        return (/micromessenger/.test(u)) ? true : false;
    }

    /**
     * 数字补齐位数
     * num      需要补0的数字
     * length   补齐后的数字长度
     */
    static paddingZero = (num, length) => {
        if((num + "").length >= length) {
            return num;
        }
        return HQQTool.padding("0" + num, length);
    }

    /**
     * 生成一个min-max的随机数
     */
    static random = (min, max) => {
        return parseInt(Math.random() * (max - min + 1) + min, 10);
    }

    /**
     * 只是字母
     */
    static isLetter = (value) => {
        return /^[A-Za-z/\n/\s]+$/.test(value);
    }
}

export default HQQTool;