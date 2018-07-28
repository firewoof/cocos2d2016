/**
 * Created by Administrator on 2016/5/6.
 */
var localStringDic = {
    COMMON_REWARD: "奖励",
    COMMON_RESET_BLANK:"重 置",
    COMMON_OK:"确 定",
    COMMON_CONTINUE:"继 续",
    COMMON_OFF_LINE_DAYS_FORMAT:"%d天前",
    COMMON_OFF_LINE_HOURS_FORMAT:"%d小时前",
    COMMON_OFF_LINE_NOT_LONG:"刚刚"
};

var LocalString =
{
    /**
     * 找到对应key的value否则返回key
     * @param {string} key
     * @returns {*|String}
     */
    getString:function(key) {
        var value = localStringDic[key];
        return value != undefined ? value : key;
    }
};