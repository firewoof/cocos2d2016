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
    return value != undefined ? value : defaultValue;
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
    if(arrayData != undefined){
        var array = [];
        for(var i = 0; i < arrayData.length; i++){
            var info = new className();
            info.initFromJson(arrayData[i]);
            array.push(info);
            if(info.setIndex instanceof Function){
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
            value[key] = this.clone(obj[key]);
        }
    }else if(typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Array]'){
        value = [];
        for(var i = 0; i < obj.length; i++){
            value.push(this.clone(obj[i]))
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
}