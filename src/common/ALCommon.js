/**
 * 算法相关
 * Created by Administrator on 2016/5/6.
 */
var ALCommon = ALCommon || {};

/**
 * @param {Object|JSON} dic
 * @param {String} key
 * @param {*} defaultValue
 * @returns {*}
 */
ALCommon.getValueWithKey = function(dic, key, defaultValue) {
    var value = dic[key];
    if(typeof(defaultValue) == "boolean" && value != undefined)
        return value == true ? true : false;
    if(typeof(defaultValue) == "number" && value != undefined && Number(value) != NaN)
        return Number(value);
    else
        return value != undefined ? value : defaultValue;
};

/**
 *
 * @param dic
 * @param key
 * @param defaultValue
 * @param [splitStr] {String} default ","
 * @param [type]
 * @returns {*}
 */
ALCommon.getSplitArrayWithKey = function(dic, key, defaultValue, splitStr, isNumber) {
    if(dic == undefined) return defaultValue;
    var value = dic[key];
    if(value != undefined){
        if(isNumber == undefined || isNumber){
            defaultValue = value.split(splitStr || ",");
            for( var i = 0; i < defaultValue.length; i++){
                defaultValue[i] = Number(defaultValue[i]);
            }
        }else{
            defaultValue = value.split(splitStr || ",");
        }
    }

    return defaultValue;
};

/**
 * @param dic
 * @param key
 * @param defaultValue
 * @param className
 */
ALCommon.getClassObjectWithKey = function(dic, key, defaultValue, className) {
    if(dic == undefined) return defaultValue;
    var value = dic[key];
    if(value != undefined){
        if(defaultValue){
            defaultValue.initFromJson(value);
        }else{
            defaultValue = new className();
            defaultValue.initFromJson(value);
        }
    }

    return defaultValue;
};

/**
 * @param jsonData
 * @param defaultValue
 * @param className
 */
ALCommon.getClassObjectWithJsonData = function(jsonData, defaultValue, className) {
    if(jsonData != undefined){
        if(defaultValue){
            defaultValue.initFromJson(jsonData);
        }else{
            defaultValue = new className();
            defaultValue.initFromJson(jsonData);
        }
    }

    return defaultValue;
};

/**
 * @param dic
 * @param key
 * @param defaultValue
 * @param className
 */
ALCommon.getArrayWithKey = function(dic, key, defaultValue, className) {
    var arrayData = dic[key];
    if(arrayData != undefined && arrayData instanceof Array){
        var array = [];
        for(var i = 0; i < arrayData.length; i++){
            var info = new className();
            info.initFromJson(arrayData[i]);
            array.push(info);
            if(info.setIndex && info.setIndex instanceof Function){
                info.setIndex(i);
            }
        }
        defaultValue = array;
    }

    return defaultValue;
};

/**
 * 深克隆对象(仅限于js层对象)
 * @param obj
 * @returns {object | *}
 */
ALCommon.deepClone = function(obj) {
    var value;
    //jsb版 cc.isObject没有剔除undefined，这里不能适用
    if (typeof obj === "object" && Object.prototype.toString.call(obj) === '[object Object]' ){
        value = new obj.constructor();
        for(var key in obj){
            value[key] = this.deepClone(obj[key]);
        }
    }else if(typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Array]'){
        value = [];
        for(var i = 0; i < obj.length; i++){
            value.push(this.deepClone(obj[i]))
        }
    }else{
        value = obj;
    }
    return value;
};

/**
 * 浅拷贝对象
 * @param obj
 */
ALCommon.shallowClone = function(obj) {
    var value;
    if (typeof obj === "object" && Object.prototype.toString.call(obj) === '[object Object]' ){
        value = new obj.constructor();
        for(var key in obj){
            value[key] = obj[key];
        }
    }else if(typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Array]'){
        value = [];
        for(var i = 0; i < obj.length; i++){
            value.push(obj[i])
        }
    }else{
        value = obj;
    }
    return value;
};

/**
 * 取min~max浮点数
 * @param min
 * @param max
 * @returns {Number}
 */
ALCommon.getRandomFloat = function(min,max) {
    var range = max - min;
    var rand = Math.random();
    return (min + Math.round(rand * range));
};

/**
 * 取min~max的随机整数
 * @param min
 * @param max
 * @returns {Number}
 */
ALCommon.getRandomInteger = function(min,max) {
    var range = max - min;
    var rand = Math.random();
    return Math.floor(min + Math.round(rand * range));
};

/**
 *
 * @param array
 * @param compareFn
 * @returns {*}
 */
ALCommon.quickSort = function(array,compareFn) {
    function sort(prev, numsize){
        var nonius = prev;
        var j = numsize -1;
        var flag = array[prev];
        if ((numsize - prev) > 1) {
            while(nonius < j){
                for(; nonius < j; j--){
                    if (compareFn(flag,array[j])>0) {
                        array[nonius++] = array[j];//a[i] = a[j]; i += 1;
                        break;
                    };
                }
                for( ; nonius < j; nonius++){
                    if (compareFn(flag,array[nonius])>0){
                        array[j--] = array[nonius];
                        break;
                    }
                }
            }
            array[nonius] = flag;
            sort(0, nonius);
            sort(nonius + 1, numsize);
        }
    }
    sort(0, array.length);
    return array;
};

/**
 *
 * @param arr
 * @param compareFn
 * @returns {*}
 */
ALCommon.bubbleSort = function(arr,compareFn) {
    var i = arr.length, j;
    var tempExchangeVal;
    while (i > 0) {
        for (j = 0; j < i - 1; j++) {
            if (compareFn(arr[j], arr[j + 1])>0) {
                tempExchangeVal = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = tempExchangeVal;
            }
        }
        i--;
    }
    return arr;
};

/**
 * 补0
 * @param num
 * @param n
 * @returns {*}
 */
ALCommon.pad = function(num, n) {
    var len = num.toString().length;
    while(len < n) {
        num = "0" + num;
        len++;
    }
    return num;
};

/*
 * 将秒数格式化时间
 * @param {Number} seconds: 整数类型的秒数
 * @return {String} time: 格式化之后的时间
 */
ALCommon.formatTime = function (seconds) {
    var min = Math.floor(seconds / 60),
        second = seconds % 60,
        hour, newMin, time;

    if (min > 60) {
        hour = Math.floor(min / 60);
        newMin = min % 60;
    }

    if (second < 10) { second = '0' + second;}
    if (min < 10) { min = '0' + min;}
    if (hour < 10) { hour = '0' + hour;}

    return time = hour? (hour + ':' + newMin + ':' + second) : (min + ':' + second);
};

/**
 * getIPFromAddress 从"xxx.xxx.xxx.xxx:xxxx"这样的格式中解出ip
 * @param {string} address
 * @returns {string}
 */
ALCommon.getIPFromAddress = function(address) {
    return address.split(":")[0];
};

/**
 * getPortFromAddress 从"xxx.xxx.xxx.xxx:xxxx"这样的格式中解出端口
 * @param {string} address
 * @returns {string}
 */
ALCommon.getPortFromAddress = function(address) {
    return address.split(":")[1];
};

/**
 * @param {string} sourceStr
 * @returns {Object|JSON}
 */
ALCommon.parseStringAttribute = function(sourceStr) {
    var dic = new Object();
    var quoteNum = 0;

    for (var i = 0, l = sourceStr.length; i < l; ++i) {
        var c = sourceStr.charAt(i);
        if (c == '\"') {
            quoteNum = 1 - quoteNum;
        } else if (c == '=' && quoteNum == 0) {
            // 向前找key, 向后找value
            var keyBeginIndex = 0;
            var keyLength = 0;
            var valueBeginIndex = 0;
            var valueLength = 0;
            var tempChar;
            for (var j = i - 1; j >= 0; --j)
            {
                tempChar = sourceStr.charAt(j);
                if (tempChar == ' ') {
                    keyBeginIndex = j + 1;
                    break;
                } else if(j == 0) {
                    keyBeginIndex = 0;
                    keyLength += 1;
                    break;
                } else {
                    keyLength += 1;
                }
            }

            valueBeginIndex = i + 1;
            for (var j = i + 1; j < l; ++j)
            {
                tempChar = sourceStr.charAt(j);
                if(tempChar == ' ' || tempChar == '>' || tempChar == '/') { // 这里你不能要求最后的>前面必须有一个空格吧？
                    break;
                } else {
                    valueLength += 1;
                }
            }

            if (keyLength > 0 && valueLength > 0) {
                var key = sourceStr.substr(keyBeginIndex, keyLength);
                var value = sourceStr.substr(valueBeginIndex, valueLength);
                dic[key] = value;
            }
        }
    }

    return dic;
};

