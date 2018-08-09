/**
 * Created by Administrator on 2016/5/31.
 */

//服务器时区（协调世界时）
var SERVER_UTC = 8; //东区符号+ 西区符号-

/**
 * 获得相对精确的当前时间(1970至今的毫秒数)
 */
cs.getCurTime = function()
{
  //return MainController.getInstance()._gameStartTime + this.NativeTool.getClockTick();
  //return MainController.getInstance()._fixedTime + this.NativeTool.getCurMillSecs();
    var date = new Date();
    var time = date.getTime();
    return MainController.getInstance()._fixedTime + time;
};

/**
 * 获得Date类型的日期
 */
cs.getDate = function(milliSecs)
{
    var milliSecs = milliSecs || this.getCurTime();
    if(milliSecs instanceof String)
        milliSecs = parseInt(milliSecs);
    var date = new Date(milliSecs);
    date.setUTCHours(SERVER_UTC);
    return date;
};

/**
 * 服务器所在的时区与本地时区偏差
 * @returns {number|*}
 */
cs.getServerOffsetSecs = function(){
    if(this._serverOffsetSecs == undefined){
        //将本地现在时间换算成0时区时间
        var date = new Date();
        var localZoneOffset = date.getTimezoneOffset();
        this._serverOffsetSecs = (localZoneOffset + SERVER_UTC * 60) * 60;
        cc.log("_serverOffsetSecs::",this._serverOffsetSecs);
        cc.log("_serverOffsetmin::",this._serverOffsetSecs/60);
    }
    return this._serverOffsetSecs;
};

/**
 * 时间戳的秒数(1970至今的秒数)
 */
cs.getCurSecs = function()
{
    return this._curSecs;
   //return parseInt(this.getCurTime()/1000);
};

/**
 * 每帧公共调用 防止逻辑代码中大量频繁new Date()
 * @returns {Number}
 * @private
 */
cs._genCurSecs = function()
{
   this._curSecs = parseInt(this.getCurTime()/1000);
   return this._curSecs;
};

/**
 * 得到凌晨的时间戳（s）
 */
cs.getZeroSecs = function(milliSecs)
{
    var curDate = cs.getDate(milliSecs);
    curDate.setHours(0);
    curDate.setMinutes(0);
    curDate.setSeconds(0);
    curDate.setMilliseconds(0);

    return parseInt(curDate.getTime() / 1000 - cs.getServerOffsetSecs());
};

/**
 * 是否是周六周日
 */
cs.isWeekend = function()
{
    var curData = this.getDate();
    var day = curData.getDay();
    return day == 0 || day == 6;
};

/**
 * 将对象字符串化写到文件里(默认是覆盖)
 * sample: cs.writeDataToFile("tradeData.json", {key1: "value1", key2: "value2"} );
 */
cs.writeJsonToFile = function(filePath, jsonData)
{
    cs.GameFileUtils.writeStringToFile(jsb.fileUtils.getWritablePath() +  filePath, JSON.stringify(jsonData));
};

cs.writeStringToFile = function(filePath, str)
{
    cs.GameFileUtils.writeStringToFile(jsb.fileUtils.getWritablePath() +  filePath, str);
};


/**
 * @param filePath 要打开的文件名( 可包含路径 )
 * @param callFunc (jsonData, err) 打开文件返回的json数据
 */
cs.readJsonFromFile = function(filePath, callFunc)
{
    var isFileExists = jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath() + filePath);
    if(!isFileExists){
        cc.log("readJsonFromFile ::"+ filePath + "not exists");
        return;
    }
    cc.loader.loadJson(jsb.fileUtils.getWritablePath() + filePath,function(err,jsonData){
        try{
            if(!err){
                callFunc(jsonData, err);
            }else{
                cc.log(err);
                callFunc(undefined, err);
            }
        }catch(e){
            cc.log(e.stack);
        }
    });
};

cs.setItem = function(key, value){
    if(value == null){
        cc.sys.localStorage.removeItem(key);
    }else{
        cc.sys.localStorage.setItem(key, value);
    }
};
cs.getItem = cc.sys.localStorage.getItem;
cs.removeItem = cc.sys.localStorage.removeItem;


/**
 * 硬日志 测试服版本才支持(最多支持n条)
 */
var maxSolidLog = 50;
var g_solidLogArray = [];
cs.solidLog = function(content)
{
    if(!isTestServer)
        return;
    var curSecs = cs.getCurSecs();
    var logInfo = {"time":TimeHelper.formatSecs(curSecs), "content":content};

    if(g_solidLogArray.length > maxSolidLog){
        g_solidLogArray.pop();
    }
    g_solidLogArray.unshift(logInfo);
    cc.log("solidLog:"+JSON.stringify(logInfo));
    cs.writeJsonToFile("solidLog.json", g_solidLogArray);
};

/**
 * 测试服专用提示
 * @param logStr
 * @param showType
 */
testSeverLog = function(logStr){
    if(!isTestServer)
        return;
    var timeStr = TimeHelper.formatSecs(undefined, "HH:mm:ss");
    var content = "测试服专用log "+ timeStr + ": " + logStr;
    cc.log("content::", content);
    if(!(MainController.getTopLayer() instanceof PopLayer)) {
        MainController.showConfirmByText(content);
    }
};