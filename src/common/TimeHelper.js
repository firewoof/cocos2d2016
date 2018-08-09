/**
 * Created by Administrator on 2016/5/6.
 */
var TimeHelper = TimeHelper || {};

/**
 * 获取当前时间（毫秒），返回1970-01-01 00:00:00到现在经过的毫秒数，不建议同一个函数内多次调用此方法
 * @returns {number}
 */
TimeHelper.getCurrentTime = function() {
    return cs.getDate().getTime();
};

///**
// * 将millisec（毫秒）格式化为hh:mm:ss的字符串
// * @param {number} millisec
// * @returns {string}
// */
//TimeHelper.getTimeString = function(millisec) {
//    var tempDate = new Date(millisec);
//    var locDate = new Date(millisec + tempDate.getTimezoneOffset() * 60000);
//    return locDate.toLocaleTimeString();
//};

/**
 * 将millisec（毫秒）格式化为day:hh:mm:ss的字符串
 * @param {number} milliSec
 * @returns {string}
 */
TimeHelper.getTimeString = function(milliSec) {
    var endTime = new Date(milliSec);
    var days = parseInt(Math.abs(milliSec) / 1000 / 60 / 60 /24);//把相差的毫秒数转换为天数
    var hours = parseInt(Math.abs(milliSec) / 1000 / 60 / 60);
    var locDate = new Date(milliSec + endTime.getTimezoneOffset() * 60000);
    var str = locDate.toLocaleTimeString();
    if(days > 0)
    {
        str = days + LocalString.getString("COMMON_DAY") + " " + str;
    }
//    cc.log("days: "+days);
    //不够一小时
    if(hours < 1){
        str = str.substr(3, 5);
    }

    return str;
};

/**
 *
 * @param sec
 * @returns {string}
 */
TimeHelper.getOfflineString = function(sec) {
    var days = parseInt(sec / 60 / 60 /24);//把相差的毫秒数转换为天数
    var hours = parseInt(sec / 60 / 60);
    var minutes = parseInt(sec / 60);
    var str = LocalString.getString("COMMON_ON_LINE");
    if(days > 0)
    {
        str = cc.formatStr(LocalString.getString("COMMON_OFF_LINE_DAYS_FORMAT"), days);
        return str;
    }

    if(days == 0 && hours > 0){
        str = cc.formatStr(LocalString.getString("COMMON_OFF_LINE_HOURS_FORMAT"), hours);
        return str;
    }

    if(days == 0 && hours == 0 && minutes > 0){
        str = LocalString.getString("COMMON_OFF_LINE_NOT_LONG");
        return str;
    }

    return str;
};


/**
 将String类型解析为Date类型.
 parseDate('2006-1-1') return new Date(2006,0,1)
 parseDate(' 2006-1-1 ') return new Date(2006,0,1)
 parseDate('2006-1-1 15:14:16') return new Date(2006,0,1,15,14,16)
 parseDate(' 2006-1-1 15:14:16 ') return new Date(2006,0,1,15,14,16);
 parseDate('2006-1-1 15:14:16.254') return new Date(2006,0,1,15,14,16,254)
 parseDate(' 2006-1-1 15:14:16.254 ') return new Date(2006,0,1,15,14,16,254)
 parseDate('不正确的格式') retrun null
 */
TimeHelper.parseDate = function(str){
    if(typeof str == 'string'){
        var results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) *$/);
        if(results && results.length>3)
            return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]));
        results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/);
        if(results && results.length>6)
            return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]),parseInt(results[6]));
        results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2})\.(\d{1,9}) *$/);
        if(results && results.length>7)
            return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]),parseInt(results[6]),parseInt(results[7]));
    }
    return null;
};

/**
 * @param {Number} [milliSec] default currentMillSeconds
 *@param {String} [format] for example "yy:MM:dd HH:mm:ss" /// default "yy:MM:dd HH:mm:ss"
 */
TimeHelper.formatMilliSec = function(milliSec, format)
{
    var milliSec = milliSec || cs.getCurTime();
    var locDate = new Date(milliSec);
    var format = format || "yy:MM:dd HH:mm:ss";
    //var str = ALCommon.pad(locDate.getHours(), 2) + ":" + ALCommon.pad(locDate.getMinutes(), 2);
    var str = format.replace("yy", locDate.getFullYear());
    str = str.replace("MM", ALCommon.pad(locDate.getMonth()+1, 2));
    str = str.replace("dd", ALCommon.pad(locDate.getDate(), 2));
    str = str.replace("HH", ALCommon.pad(locDate.getHours(), 2));
    str = str.replace("mm", ALCommon.pad(locDate.getMinutes(), 2));
    str = str.replace("ss", ALCommon.pad(locDate.getSeconds(), 2));
    return str;
};

/**
 * @param {*|Number} [secs]
 *@param {String} [format] for example "yy:MM:dd HH:mm:ss"
 */
TimeHelper.formatSecs = function(secs, format)
{
    var secs = secs || cs.getCurSecs();
    var locDate = new Date(secs * 1000);
    var format = format || "yy:MM:dd HH:mm:ss";
    //var str = ALCommon.pad(locDate.getHours(), 2) + ":" + ALCommon.pad(locDate.getMinutes(), 2);
    var str = format.replace("yy", locDate.getFullYear());
    str = str.replace("MM", ALCommon.pad(locDate.getMonth()+1, 2));
    str = str.replace("dd", ALCommon.pad(locDate.getDate(), 2));
    str = str.replace("HH", ALCommon.pad(locDate.getHours(), 2));
    str = str.replace("mm", ALCommon.pad(locDate.getMinutes(), 2));
    str = str.replace("ss", ALCommon.pad(locDate.getSeconds(), 2));
    return str;
};