/**
 * Created by Administrator on 2016/5/6.
 */
TimeHelper = function() {

};

/**
 * 获取当前时间（毫秒），返回1970-01-01 00:00:00到现在经过的毫秒数，不建议同一个函数内多次调用此方法
 * @returns {number}
 */
TimeHelper.getCurrentTime = function() {
    return (new Date()).getTime();
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