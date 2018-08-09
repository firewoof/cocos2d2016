/**
 * 趋势图modeLs
 * Created by Administrator on 2016/5/16.
 */
var LineChartInfo = cc.Class.extend({
    _dataArray: undefined,
    _dataLength:0,              //实际数据长度
    _productInfo: undefined,    //数据对应的产品

   ctor:function(jsonData)
   {
       //
       this._extendOffset = (24 + 5) * 60 * 60;
       //做一个n小时的池子
       this._dataArray = new Array(24 * 60 * 60 + this._extendOffset);

       //起始重置
       this.resetTime();

       if(jsonData)
            this.initFromJson(jsonData);
   },

    initFromJson:function(jsonData)
    {
    },

    /**
     * 检查是否需要重置
     */
    checkResetTime:function()
    {
        //超过48小时就需要重置
        if(this._dataLength > (24 * 2 * 60 * 60)){
            this.resetTime();
        }
    },

    /**
     * 重置队列
     */
    resetTime:function(){
        //设置第一个数据的时间为当天凌晨
        var zeroSecs = cs.getZeroSecs();            //凌晨的时间戳
        var resetTime = zeroSecs - 24 * 60 * 60;
        var simpleData = new SamplePointData();
        simpleData.setXValue(resetTime);
        simpleData.setIndex(0);
        simpleData.setReal(false);

        //为防止旧的数据影响 直接重新开辟内存
        if(this._dataArray[0] && this._dataArray[0].getXValue() != resetTime ){
            this._dataArray = new Array(24 * 60 * 60 + this._extendOffset);
        }

        this._dataArray[0] = simpleData;
        this._dataLength = 1;
    }

});

LineChartInfo.prototype.getDataArray = function()
{
    return this._dataArray;
};

LineChartInfo.prototype.getProductInfo = function()
{
    return this._productInfo;
};

LineChartInfo.prototype.getIndexByTime = function(time)
{
    return time - this._dataArray[0].getXValue();
};

LineChartInfo.prototype.getDataByTime = function(time)
{
    return this._dataArray[time - this._dataArray[0].getXValue()];
};

LineChartInfo.prototype.getTradeStageGap = function()
{
    return this._productInfo.getTradeStageGap();
};

LineChartInfo.prototype.getDataLength = function()
{
    return this._dataLength;
};

/**
 * @returns {number}
 */
LineChartInfo.prototype.getTradeSettleGap = function()
{
    return this._productInfo.getTradeSettleGap();
};

/**
 * @param {Number} [idx] 1表示倒数第一个，2表示倒数第二个....
 * @returns {SamplePointData}*
 */
LineChartInfo.prototype.getLatestData = function(idx)
{
    //cc.log("this._dataArray.length: ", this._dataArray.length);
    //cc.log("this._dataArray[0]", JSON.stringify(this._dataArray[0]));
    idx = idx == undefined ? 1 : idx;
    if(idx < 1)
        return undefined;
    else
        return this._dataArray[this._dataLength - 1 - (idx - 1)];
};

/**
 * @returns {SamplePointData}
 */
LineChartInfo.prototype.getDataByIdx = function(index)
{
    if(index >= 0)
    {
        return this._dataArray[index];
    }
    else
    {
        //-1 表示倒数第一个
        return this._dataArray[this._dataLength + index];
    }
};

/**
 * 可添加重复数据
 * @param {SamplePointData} samplePoint
 */
LineChartInfo.prototype.pushData = function(samplePoint)
{
    var startTime = this._dataArray[0].getXValue();
    var time = samplePoint.getXValue();
    var index = time - startTime;
    var slotData = this._dataArray[index];
    if(slotData == undefined)
    {
        this._dataArray[index] = samplePoint;
        samplePoint.setIndex(index);
    }else {
        slotData.setXValue(samplePoint.getXValue());
        slotData.setYValue(samplePoint.getYValue());
        slotData.setIndex(index);
        slotData.setReal(samplePoint.isReal());
    }

    if((index+1) > this._dataLength){
        this._dataLength = index+1;
        //cc.log("this._dataLength::", this._dataLength);
    }
};

/**
 * 检查一段行情  找出需要补全的区段
 * @param startime
 * @param endTime
 * @returns {Array}
 */
LineChartInfo.prototype.getPaddingScopes = function(startSecs, endSecs)
{
    //判断前置
    var curSecs = cs.getCurSecs();
    var endTime = Math.min(endSecs, curSecs - 1);//防止超前后退n秒
    var startTime = startSecs;
    var paddingScope = {};
    var paddingScopeArray = [];
    for(var i = startTime; i <= endTime; i++){
        var data = this.getDataByTime(i);
        var nextData = this.getDataByTime(i+1);
        var imperfect = false;
        if((!data || !data.isReal())){
            imperfect = true;
            if(!paddingScope.startSecs && !paddingScope.endSecs)
            {
                paddingScope.startSecs = i;
                //cc.log("3333paddingScope.startSecs::", paddingScope.startSecs);
            }
            else if(paddingScope.startSecs && !paddingScope.endSecs && (nextData && nextData.isReal() || i == endTime))
            {
                paddingScope.endSecs = i;
                paddingScopeArray.push(ALCommon.deepClone(paddingScope));
                cc.log("paddingScope.endSecs::", paddingScope.endSecs);
                paddingScope.startSecs = null;
                paddingScope.endSecs = null;
            }
        }
    }
    if(paddingScope.startSecs && paddingScope.endSecs == null){
        paddingScope.endSecs = paddingScope.startSecs;
        paddingScopeArray.push(paddingScope);
    }
    if(imperfect && paddingScopeArray.length == 0){
        cc.log("imperfect。。。。。。。。。。。。。。。");
    }
    return paddingScopeArray;
};

/**
 * 带步长的历史行情补全
 */
LineChartInfo.prototype.paddingWithStride = function(startTime, endTime, stride, dots, successCallBack, isShowLoading)
{
    //检查需要补全的
    //找到最近的整除 stride的数
    var paddingScope = {};
    var paddingScopeArray = [];
    var startTime = startTime - (startTime % stride);
    var endTime = endTime - (endTime % stride);
    var maxPadding = 600;
    var minPadding = 200;
    for(var i = startTime; i <= endTime; i+=stride){
        var data = this.getDataByTime(i);
        var nextData = this.getDataByTime(i+stride);
        if(!data || !data._isReal){
            if(!paddingScope.startSecs && !paddingScope.endSecs)
            {
                paddingScope.startSecs = i;
                paddingScope.stride = stride;
                cc.log("no data::", TimeHelper.formatSecs(paddingScope.startSecs));
            }
            else if(paddingScope.startSecs && !paddingScope.endSecs && nextData)
            {
                var paddingNum = (i - paddingScope.startSecs)/stride;
                //考虑步长太短会产生大量碎片scope问题 这里先做一次集中
                if(paddingNum < 400){
                    continue;
                }
                paddingScope.endSecs = i;
                paddingScopeArray.push(ALCommon.deepClone(paddingScope));
                cc.log("temp paddingScope::" + paddingScope.startSecs + " ~ "+ paddingScope.endSecs);
                paddingScope.startSecs = null;
                paddingScope.endSecs = null;
            }
        }
    }

    if(paddingScope.startSecs && paddingScope.endSecs == null){
        paddingScope.endSecs = endTime;
        paddingScopeArray.push(paddingScope);
    }

    //检查一遍 对于太短的间，直接合并,太长的进行分割
    if(paddingScopeArray.length > 1){
        for(var i = 0; i < paddingScopeArray.length; i++){
            var scope = paddingScopeArray[i];
            var nextScope = paddingScopeArray[i+1];
            if(nextScope){
                var paddingNum = (scope.endSecs - scope.startSecs) / stride;
                var plusPadding = (nextScope.endSecs - scope.startSecs) / stride;
                if(paddingNum < minPadding && plusPadding < maxPadding){
                    nextScope.startSecs == scope.startSecs;
                    paddingScopeArray.splice(i, 1);
                    i--;
                    cc.log("######间隔太短,合并.......cur length:"+paddingScopeArray.length);
                }
                else if(paddingNum > maxPadding) //大于600 拆分
                {
                    var addScope = ALCommon.deepClone(scope);
                    var divSecs = scope.startSecs + parseInt(paddingNum/2) - parseInt(paddingNum/2)%stride;
                    addScope.startSecs = divSecs;
                    scope.endSecs = divSecs;
                    paddingScopeArray.splice(i+1, 0, addScope);
                    i++;
                    cc.log("######间隔太长,拆分.......");
                }
            }
        }
    }

    cc.log("paddingScopeArray.length::",paddingScopeArray.length);
    if(paddingScopeArray.length == 0 && successCallBack){
        successCallBack();
        return;
    }

    //分段请求
    var self = this;
    //用来确认返回的数组
    var verifyArray = new Array(paddingScopeArray.length);
    for(var i = 0; i < paddingScopeArray.length; i++){
        var args = {};
        var tempScope = paddingScopeArray[i];
        args["startTime"] = tempScope.startSecs;
        args["endTime"] = tempScope.endSecs;
        args["stride"] = tempScope.stride;
        args["lineData"] = this;
        args["index"] = i;

        cc.log("to paddding num::", (tempScope.endSecs - tempScope.startSecs)/tempScope.stride);

        //每段返回 都回调一下
        args["afterCallBack"] = function(){
            verifyArray[this.index] = true;
            cc.log("分段回调.. ", this.index);
        }.bind(args);

        //延迟0.xx秒间隔请求一段
        setTimeout(function(){
            self.requestPaddingWithStride(this);
        }.bind(args), i + 0.05 * 1000);
    }

    if(isShowLoading)
        MainController.getInstance().showLoadingWaitLayer();
    //启动查询 一旦分段所有请求都已经返回 则告知上层
    if(successCallBack instanceof Function)
    {
        var poll = new PollingHelper(function(poll){
            var hasPadded = true;
            for(var i = 0 ; i < verifyArray.length; i++){
                if(!verifyArray[i]){
                    hasPadded = false;
                    break;
                }
            }

            if(hasPadded)
            {
                poll.end();
                if(isShowLoading)
                    MainController.getInstance().hideLoadingWaitLayer();
                successCallBack();
            }
        }, 0, 30);
        poll.start();
    }
};

/**
 * 请求(一组)行情段，无论大小(内部)
 * @param originScopeArray
 * @param successCallBack
 */
LineChartInfo.prototype.setPaddingScopeArray = function(originScopeArray, successCallBack){
    //辅助确认返回
    var verifyArray = new Array(originScopeArray.length);
    //带callBack表示要显示loading界面
    if(successCallBack instanceof Function)
        MainController.getInstance().showLoadingWaitLayer();
    for(var i = 0; i < originScopeArray.length; i++){
        var scope = originScopeArray[i];
        cc.log(this.getProductInfo().getName() + "  ::"+ "[" + TimeHelper.formatSecs(scope.startSecs, "HH:mm:ss") + " ~ " + TimeHelper.formatSecs(scope.endSecs, "HH:mm:ss") + "]");
        //每一段的请求确认
        var afterCallBack = function(){
            verifyArray[this.index] = true;
            cc.log("第"+this.index+"段返回....");
        }.bind({"index":i});

        this.setPaddingScope(scope, afterCallBack);
    }

    if(successCallBack){
        var pollObject = new PollingHelper(function(pollObject){
            var hasPadded = true;
            for(var i = 0; i < verifyArray.length; i++){
                if(!verifyArray[i]){
                    hasPadded = false;
                    break;
                }
            }

            if(!hasPadded){
                return;
            }

            MainController.getInstance().hideLoadingWaitLayer();
            pollObject.end();

            if(successCallBack){
                successCallBack();
            }
        }.bind(this), 0, 10);   //10秒内 没有加载完直接终止循环
        pollObject.start();
    }
};

/**
 * @param originScope 原始区间
 * @param successCallBack 填充成功回调
 * @isShowLoading 是否在请求返回前显示loading
 * 填充一段(但会对超长的区间做分割)
 */
LineChartInfo.prototype.setPaddingScope = function(originScope, successCallBack, isShowLoading)
{
    cc.log(this.getProductInfo().getName() + "---PaddingScope::"+ "[" + TimeHelper.formatSecs(originScope.startSecs, "HH:mm:ss") + " ~ " + TimeHelper.formatSecs(originScope.endSecs, "HH:mm:ss") + "]");
    var stageLen = 400; //n个点分段请求
    var gap = originScope.endSecs - originScope.startSecs;
    //分段
    var stageNum = Math.ceil(gap/stageLen);  //每次最多请求stageLen长度的数据
    var paddingScopeArray = [];
    if(stageNum == 1 || stageNum == 0){
        paddingScopeArray.push(originScope);
    }
    if(stageNum > 1)
    {
        var startCounter = originScope.startSecs - stageLen;
        for(var i = 0; i < stageNum; i++) {
            var scope = {"startSecs":startCounter += stageLen, "endSecs":startCounter + stageLen};
            if(i == (stageNum - 1))
                scope.endSecs = scope.endSecs;
            //cc.log("segmentScope::"+ "[" + TimeHelper.formatSecs(scope.startSecs, "HH:mm:ss") + " ~ " + TimeHelper.formatSecs(scope.endSecs, "HH:mm:ss") + "]");
            paddingScopeArray.push(scope);
        }
    }

    //分段请求
    var self = this;
    //用来确认返回的数组
    var verifyArray = new Array(paddingScopeArray.length);
    for(var i = 0; i < paddingScopeArray.length; i++){
        var args = {};
        var tempScope = paddingScopeArray[i];
        args["startTime"] = tempScope.startSecs;
        args["endTime"] = tempScope.endSecs;
        args["lineData"] = this;
        args["index"] = i;

        //每段返回 都回调一下
        args["afterCallBack"] = function(){
            verifyArray[this.index] = true;
            cc.log("分段回调.. ", this.index);
        }.bind(args);

        //延迟0.xx秒间隔请求一段
        setTimeout(function(){
            self.fillUpScopeData(this);
        }.bind(args), i + 0.05 * 1000);
    }

    if(isShowLoading)
        MainController.getInstance().showLoadingWaitLayer();
    //启动查询 一旦分段所有请求都已经返回 则告知上层
    if(successCallBack instanceof Function)
    {
        var poll = new PollingHelper(function(poll){
            var hasPadded = true;
            for(var i = 0 ; i < verifyArray.length; i++){
                if(!verifyArray[i]){
                    hasPadded = false;
                    break;
                }
            }

            if(hasPadded)
            {
                poll.end();
                if(isShowLoading)
                    MainController.getInstance().hideLoadingWaitLayer();
                successCallBack();
            }
        }, 0, 30);
        poll.start();
    }
};

LineChartInfo.prototype.requestPaddingWithStride = function(args)
{
    var startTime = args["startTime"];
    var endTime = args["endTime"];
    var afterCallBack = args["afterCallBack"];
    var perDataCallBack = args["perDataCallBack"];
    var lineData = args["lineData"];
    var isShowLoading = args["isShowLoading"];
    var stride = args["stride"];
    var dots = args["dots"];

    //防止补全超出当前时间
    var curSecs = cs.getCurSecs();
    if(endTime > curSecs){
        cc.log("fillUpScope 超出当前时间 重设为curSecs");
        endTime = curSecs;
    }

    var productInfo = lineData.getProductInfo();
    cc.log("请求数据::["+ TimeHelper.formatSecs(startTime, "HH:mm:ss") +" ~ " + TimeHelper.formatSecs(endTime, "HH:mm:ss") +"]" + " stride:"+stride);

    var responseCallBack = function(jsonData)
    {
        cc.log("jsonData::", JSON.stringify(jsonData));
        if(isShowLoading)
            MainController.getInstance().hideLoadingWaitLayer();

        var priceList = jsonData["pl"];

        //-------------空数据处理------------------
        if(!priceList){
            var logStr = "行情历史请求为空:" + "["+ TimeHelper.formatSecs(startTime, "HH:mm:ss") +" ~ " + TimeHelper.formatSecs(endTime, "HH:mm:ss") +"]";
            G_collectLog(logStr);
            cc.log(logStr);
            return;
        }

        if(priceList.length > 0){
            //----------数据正常返回-------------
            var dataArray = lineData.getDataArray();
            var startIndex = lineData.getIndexByTime(startTime);
            //var endIndex = lineData.getIndexByTime(endTime);
            var indexCount = 0;
            for(var i = startTime; i <= endTime; i+=stride){
                var data = dataArray[i - startTime + startIndex];
                var time = i;
                var pData = priceList[indexCount];
                if(pData && time == pData["t"]){
                    if(!data || !data._isReal){
                        var tempPoint = new SamplePointData(pData);
                        lineData.pushData(tempPoint);
                    }
                    indexCount++;
                }else if(pData && time < pData["t"]){
                    cc.log("11time no data::", TimeHelper.formatSecs(time));
                    var tempPoint = new SamplePointData(pData);
                    tempPoint.setXValue(time);
                    tempPoint.setNull(true);
                    lineData.pushData(tempPoint);
                }else if(!pData){
                    cc.log("22time no data::", TimeHelper.formatSecs(time));
                    var tempPoint = new SamplePointData(priceList[indexCount - 1] || priceList[indexCount + 1]);
                    tempPoint.setXValue(time);
                    tempPoint.setNull(true);
                    lineData.pushData(tempPoint);
                    indexCount++;
                }
            }

        }

        if(afterCallBack)
            afterCallBack();

    }.bind(this);

    if(isShowLoading)
        MainController.getInstance().showLoadingWaitLayer();
    HttpManager.requestQuoteHistory(responseCallBack, productInfo.getId(), startTime, endTime, stride, dots);
};

/**
 * 填充一段(不对区间做分割)
 * @param args
 */
LineChartInfo.prototype.fillUpScopeData = function(args)
{
    var startTime = args["startTime"];
    var endTime = args["endTime"];
    var afterCallBack = args["afterCallBack"];
    var perDataCallBack = args["perDataCallBack"];
    var lineData = args["lineData"];
    var isShowLoading = args["isShowLoading"];

    //防止补全超出当前时间
    var curSecs = cs.getCurSecs();
    if(endTime > curSecs){
        cc.log("fillUpScope 超出当前时间 重设为curSecs");
        endTime = curSecs;
    }

    var productInfo = lineData.getProductInfo();
    var startIndex = lineData.getIndexByTime(startTime);
     cc.log("请求数据::["+ TimeHelper.formatSecs(startTime, "HH:mm:ss") +" ~ " + TimeHelper.formatSecs(endTime, "HH:mm:ss") +"]");

    var responseCallBack = function(jsonData)
    {
        cc.log("jsonData::", JSON.stringify(jsonData));
        if(isShowLoading)
            MainController.getInstance().hideLoadingWaitLayer();

        var dataArray = lineData.getDataArray();
        var indexCount = 0;
        var sampleNum = endTime - startTime + 1;
        var priceList = jsonData["pl"];

        //-------------空数据处理------------------
        if(!priceList){
            var logStr = "行情历史请求为空:" + "["+ TimeHelper.formatSecs(startTime, "HH:mm:ss") +" ~ " + TimeHelper.formatSecs(endTime, "HH:mm:ss") +"]";
            G_collectLog(logStr);
            cc.log(logStr);
            return;
        }

        //-------------空数组的处理----------------------
        //空数组也返回，这样不会导致长时间loading (但可能导致绘制报错)
        // 历史数返据返回空，表示服务端采集丢失，服务端也无法恢复，客户端填充的数据默认为真实的
        if(priceList && priceList.length == 0){
            this.paddingDummyData(startTime, endTime, true);
            var logStr = "行情历史空数组:" + "["+ TimeHelper.formatSecs(startTime, "HH:mm:ss") +" ~ " + TimeHelper.formatSecs(endTime, "HH:mm:ss") +"]";
            cc.log(logStr);

            if(afterCallBack)
                afterCallBack();
            return;
        }

        //--------------测试代码---------------
        // 去掉行情波动(方便测试极端情况下的k线表现)
        if(G_TEST_NO_WEAVE_QUOTE)
        {
            for(var i = 0; i < priceList.length; i++)
            {
                var data = priceList[i];
                data["p"] =  dataArray[0].getYValue();
            }
        }

        //----------数据正常返回-------------
        var listLastTime = priceList.last()["t"];
        for(var len = sampleNum, i = 0; i < len; i++)
        {
            //cc.log("indexCount::", indexCount);
            var data = priceList[indexCount];
            var time = startTime + i;
            //做数据补齐
            if(time < data["t"])
            {
                var validIndex = (indexCount - 1) < 0 ? 0 : (indexCount - 1);
                data = priceList[validIndex];
                if(!cc.sys.isMobile)
                {
                    cc.log("time no date::", time , TimeHelper.formatSecs(time, "HH:mm:ss"));
                }
            }
            else if(time >= listLastTime)
            {
                data = priceList.last();
            }
            else
            {
                indexCount++;
            }
            //更新
            var tempPoint = dataArray[startIndex + i] ;
            if(tempPoint){
                tempPoint.setYValue(data["p"]);
                tempPoint.setReal(true);
            }else{
                var tempPoint = new SamplePointData(data);
                tempPoint.setXValue(time);
                tempPoint.setYValue(data["p"]);
                lineData.pushData(tempPoint);
            }

            //每个数据更新时的回调
            if(perDataCallBack)
                perDataCallBack(tempPoint);

            //打印实际补齐的时间段
            if((i + 1) == len)
            {
                cc.log("產品數據補齊：", productInfo.getName());
                cc.log("补齐的时间段:: " + TimeHelper.formatSecs(startTime) + " ~ " + TimeHelper.formatSecs(time));
            }
        }

        if(afterCallBack)
            afterCallBack();

    }.bind(this);

    //超时
    var timeoutCallBack = function(){
        this.paddingDummyData(startTime, endTime);
        if(afterCallBack)
            afterCallBack();
    }.bind(this);


    if(isShowLoading)
        MainController.getInstance().showLoadingWaitLayer();
    HttpManager.requestQuoteHistory(responseCallBack, productInfo.getId(), startTime, endTime, timeoutCallBack);
};

LineChartInfo.prototype.paddingDummyData = function(startTime, endTime, isForceTrue)
{
    var isForceTrue = isForceTrue == true ? true : false;
    //尝试补假数据
    var sampleNum = endTime - startTime + 1;
    var preData = this.getDataByTime(startTime - 1);
    var nextData = this.getDataByTime(endTime + 1);
    var latestData = this.getLatestData();
    var replaceData = preData || nextData || latestData;
    if(replaceData){
        for(var i = 0; i <= sampleNum; i++)
        {
            var tempPoint = this.getDataByTime(startTime + i);
            if(!tempPoint){
                var copyData = ALCommon.deepClone(replaceData);
                copyData.setXValue(startTime + i);
                copyData.setReal(isForceTrue);  //是否强制真实(...)
                this.pushData(copyData);
            }
        }
    }
};

/**
 * 采样点数据
 */
var SamplePointData = cc.Class.extend({
    _xValue:0,       //x轴
    _yValue:0,       //y轴
    _time:0,         //实际的行情时间戳
    _index:0,        //在数组中的位置
    _isReal:true,   //客户端自己填充的假数据
    _isNull:false,  //true 表示确实是服务器没有这个数据

    ctor:function(jsonData)
    {
        this._isReal = true;
        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData)
    {
        //this._xValue = ALCommon.getValueWithKey(jsonData, "time", this._xValue);
        this._yValue = ALCommon.getValueWithKey(jsonData, "p", this._yValue);
        this._time = ALCommon.getValueWithKey(jsonData, "t", this._time);   //实际的行情时间
        this._xValue = ALCommon.getValueWithKey(jsonData, "t", this._xValue);   //实际的行情时间   现在能保证这个对等了

        //客户端自己维护
        this._isReal = ALCommon.getValueWithKey(jsonData, "r", this._isReal);
        this._isNull = ALCommon.getValueWithKey(jsonData, "n", this._isNull);
    }
});

SamplePointData.prototype.getYValue = function()
{
    return this._yValue;
};

SamplePointData.prototype.getIndex = function()
{
    return this._index;
};

SamplePointData.prototype.getTime = function()
{
    return this._time;
};

SamplePointData.prototype.setIndex = function(value)
{
    this._index = value;
};

SamplePointData.prototype.getXValue = function()
{
    return this._xValue;
};

SamplePointData.prototype.isReal = function()
{
    return this._isReal;
};

SamplePointData.prototype.isUsefull = function()
{
    return this._isReal && !this._isNull && this._yValue >= 0;
};

SamplePointData.prototype.setReal = function(bool)
{
    this._isReal = bool;
};

SamplePointData.prototype.isNull = function()
{
    return this._isNull;
};

SamplePointData.prototype.setNull = function(bool)
{
    this._isNull = bool;
};

SamplePointData.prototype.setXValue = function(value)
{
    if(value instanceof String)
        this._xValue = parseInt(value);
    else
        this._xValue = value
};

SamplePointData.prototype.setYValue = function(value)
{
    if(value instanceof Object || value < 0)
    {
        //行情负数(可能由服务端异常导致) 通知绘制层处理(防止用户感知)
        if(value < 0)
            cc.eventManager.dispatchCustomEvent(NOTIFY_QUOTE_EXCEPTION);
        cc.log("异常值::",JSON.stringify(value));
        //抛出异常
        throw new Error("SamplePointData.setYValue value invalid");
    }
    if(value instanceof String)
        this._yValue = parseFloat(value);
    else
        this._yValue = value;
    //cc.log("this._yValue:: ", this._yValue);
};

/**
 * 格式化数据 为了存储
 */
SamplePointData.prototype.formatData = function(){
    var data =
    {
        "t":this._xValue,
        "p":this._yValue,
        "r":this._isReal
    };

    return data;
};

var KLineGroupInfo = cc.Class.extend({
    _productInfo:undefined,
    _kLineMap:undefined,

    ctor:function(productInfo)
    {
        this._productInfo = productInfo;
        this._kLineMap = {};
    },

    getLineInfoByType:function(type)
    {
        var lineInfo = this._kLineMap[type];
        if(!lineInfo && type){
            lineInfo = new KLineChartInfo(type, this._productInfo);
            this._kLineMap[type] = lineInfo;
        }
        return lineInfo;
    },

    getProductInfo:function()
    {
        return this._productInfo;
    }
});

var KLineChartInfo = cc.Class.extend({
    _type:0,
    _dataArray:undefined,
    _productInfo:undefined,
    //_dataLength:undefined,

    /**
     * type是类型 也是蜡烛间隔
     * @param type
     */
    ctor:function(type, productInfo) {
        this._originLength = 1000;
        this._extendLength = 500;
        this._dataArray = new Array(this._originLength + this._extendLength);
        this._type = type;
        this._productInfo = productInfo;

        //以当前时间的整数个type
        var curSecs = cs.getCurSecs();
        var markTime = curSecs - curSecs % type;
        var firstData = new CandleData();
        firstData.setReal(false);
        firstData.setBeginTime(markTime - this._originLength * type);
        firstData.setType(this._type);
        this._dataArray[0] = firstData;

        cc.log("初始化蜡烛列表L:: type:: ", this._type);
        cc.log("初始化第一个点: firstData beginTime:: ", TimeHelper.formatSecs(firstData.getBeginTime()));
        cc.log("this._dataArray[0] ", this._dataArray[0]);
    }
});

KLineChartInfo.prototype.getType = function()
{
    return this._type;
};

/***
 * @param {CandleData} candleData
 */
KLineChartInfo.prototype.pushData = function(candleData){
    var beginTime = candleData.getBeginTime();
    var index = this.getIndexByTime(beginTime);
    candleData.setType(this._type);
    //超出则移位重置
    if(index >= this._dataArray.length){
        this.reset();
        this.pushData(candleData)
    }else{
        this._dataArray[index] = candleData;
    }
};

KLineChartInfo.prototype.reset = function()
{
    //左移extendLength个数据
    var len = this._dataArray.length;
    var count = 0;
    var sequenceBeginTime = this.getSequenceBeginTime();
    for(var i = this._extendLength; i < len; i++){
        this._dataArray[count] = this._dataArray[i];
        count++;
    }
    if(!this._dataArray[0]){
        var firstData = new CandleData();
        firstData.setType(this._type);
        firstData.setBeginTime(sequenceBeginTime + this._extendLength * this._type);
        firstData.setReal(false);
    }
};

KLineChartInfo.prototype.getIndexByTime = function(time){
    var sequenceBeginTime = this.getSequenceBeginTime();
    return Math.floor((time - sequenceBeginTime) / this._type);
};

KLineChartInfo.prototype.getSequenceBeginTime = function(){
    return this._dataArray[0].getBeginTime();
};

KLineChartInfo.prototype.getProductInfo = function(){
    return this._productInfo;
};

KLineChartInfo.prototype.getDataArray = function(){
    return this._dataArray;
};

/**
 * 得到需要填充的段
 */
KLineChartInfo.prototype.getPaddingScopes = function(originStartSecs, originEndSecs)
{
    var sequenceBeginTime = this.getSequenceBeginTime();
    if(originStartSecs < sequenceBeginTime){
        return [];
    }
    var firstIndex = Math.floor((originStartSecs - sequenceBeginTime)/this._type);

    //遍历蜡烛序列
    var gap = this._type;
    var paddingScope = {};
    var paddingScopeArray = [];
    var len = this._dataArray.length;
    for(var i = firstIndex; i < len; i++){
        var data = this._dataArray[i];
        var nextData = this._dataArray[i+1];

        if(!data || !data.isReal() || (i != len - 1 && data.isImperfect())){
            var beginTime = data ? data.getBeginTime() : sequenceBeginTime + i * gap;
            //var endTime = beginTime + gap;
            if(data && data.isImperfect()){
                cc.log("data.isImperfect()::",data.isImperfect());
            }
            if(!paddingScope.startSecs && !paddingScope.endSecs)
            {
                paddingScope.startSecs = beginTime;
            }
            else if(paddingScope.startSecs && !paddingScope.endSecs && (nextData && nextData.isReal() || i == len - 1))
            {
                if(i == len - 1){
                    paddingScope.endSecs = originEndSecs;
                }else{
                    paddingScope.endSecs = beginTime;
                }
                paddingScopeArray.push(ALCommon.deepClone(paddingScope));
                paddingScope.startSecs = null;
                paddingScope.endSecs = null;
            }
        }
    }

    return paddingScopeArray;
};

/**
 * 请求最后一根蜡烛
 * @param [] callBack
 */
KLineChartInfo.prototype.paddingLatest = function(callBack)
{
    var successCallBack = function(data)
    {
        cc.log("latest::", JSON.stringify(data));
        var candleData = new CandleData(data);
        this.pushData(candleData);
        if(callBack)
            callBack();
    }.bind(this);
    HttpManager.requestLatestKline(successCallBack, this._productInfo.getId(), this._type);
};

KLineChartInfo.prototype.fixLatestData = function(pData)
{
    //cc.log("pData::", JSON.stringify(pData));
    var curTime = pData["t"];
    var index = this.getIndexByTime(curTime);
    var candle = this._dataArray[index];
    if(!candle){
        var beginTime = this.getSequenceBeginTime() + index * this._type;
        candle = this._dataArray[index] = new CandleData();
        candle.setImperfect(true);
        candle.setBeginTime(beginTime);
        var preCandle = this._dataArray[index - 1];
        if(preCandle){
            var preClose = preCandle.getCloseValue();
            candle.setHighValue(preClose);
            candle.setLowValue(preClose);
            candle.setOpenValue(preClose);
            candle.setCloseValue(preClose);
            //log
            cc.log("=======蜡烛补全完成===== type::", parseInt(this.getType()/60)+"分钟");
            preCandle.logSelf();
        }
        cc.log("fixLatestData:: new candle time::", beginTime);
    }
    if((candle.getBeginTime() + this._type) >= curTime){
        candle.fix(pData);
    }
};

KLineChartInfo.prototype.setPaddingScopeArray = function(paddingScopeArray, successCallBack,isShowLoading)
{
    cc.log("KLineChartInfo:: setPaddingScope  ",paddingScopeArray.length);
    //用来确认返回的数组
    var verifyArray = new Array(paddingScopeArray.length);
    for(var i = 0; i < paddingScopeArray.length; i++){
        var args = {};
        var tempScope = paddingScopeArray[i];
        args["startTime"] = tempScope.startSecs;
        args["endTime"] = tempScope.endSecs;
        args["index"] = i;

        //每段返回 都回调一下
        args["afterCallBack"] = function(){
            verifyArray[this.index] = true;
            cc.log("分段回调.. ", this.index);
        }.bind(args);

        this.fillUpScopeData(args);
    }

    if(isShowLoading)
        MainController.getInstance().showLoadingWaitLayer();
    //启动查询 一旦分段所有请求都已经返回 则告知上层
    if(successCallBack instanceof Function)
    {
        var maxLoopSecs = 10;
        var poll = new PollingHelper(function(poll){
            var hasPadded = true;
            for(var i = 0 ; i < verifyArray.length; i++){
                if(!verifyArray[i]){
                    hasPadded = false;
                    break;
                }
            }

            if(hasPadded)
            {
                poll.end();
                if(isShowLoading)
                    MainController.getInstance().hideLoadingWaitLayer();
                successCallBack();
            }
        }, 0, maxLoopSecs);
        //
        poll.start();
    }
};

/**
 * 填充一段(不对区间做分割)
 * @param args
 */
KLineChartInfo.prototype.fillUpScopeData = function(args)
{
    var startTime = args["startTime"];
    var endTime = args["endTime"];
    var afterCallBack = args["afterCallBack"];
    var isShowLoading = args["isShowLoading"];

    //防止补全超出当前时间
    var curSecs = cs.getCurSecs();
    if(endTime > curSecs){
        endTime = curSecs;
    }

    var productInfo = this.getProductInfo();
    cc.log("蜡烛图 请求数据::["+ TimeHelper.formatSecs(startTime, "HH:mm:ss") +" ~ " + TimeHelper.formatSecs(endTime, "HH:mm:ss") +"]");

    var responseCallBack = function(jsonData)
    {
        if(!cc.sys.isMobile) {
            cc.log("jsonData::", JSON.stringify(jsonData))
        };
        if(isShowLoading)
            MainController.getInstance().hideLoadingWaitLayer();

        var priceList = jsonData["pl"];

        //-------------空数据处理------------------
        if(!priceList){
            var logStr = "行情历史请求为空:" + "["+ TimeHelper.formatSecs(startTime, "HH:mm:ss") +" ~ " + TimeHelper.formatSecs(endTime, "HH:mm:ss") +"]";
            G_collectLog(logStr);
            cc.log(logStr);
            return;
        }

        //-------------空数组的处理----------------------
        //空数组也返回，这样不会导致长时间loading (但可能导致绘制报错)
        // 历史数返据返回空，表示服务端采集丢失，服务端也无法恢复，客户端填充的数据默认为真实的
        if(priceList && priceList.length == 0){
            //this.paddingDummyData(startTime, endTime, true);
            //TODO 伪造数据
            var logStr = "行情历史空数组:" + "["+ TimeHelper.formatSecs(startTime, "HH:mm:ss") +" ~ " + TimeHelper.formatSecs(endTime, "HH:mm:ss") +"]";
            cc.log(logStr);

            if(afterCallBack)
                afterCallBack();
            return;
        }

        cc.log("receive蜡烛图 请求数据::["+ TimeHelper.formatSecs(startTime, "HH:mm:ss") +" ~ " + TimeHelper.formatSecs(endTime, "HH:mm:ss") +"]");
        var indexCount = 0;
        var gap = this._type;
        var dataLen = priceList.length;
        for(var i = startTime; i <= endTime; i+= gap)
        {
            if(indexCount >= dataLen)
                break;
            var data = priceList[indexCount];
            var time = i;
            //做数据补齐
            if(time < data["time"])
            {
                var tempLen = parseInt((data["time"] - time)/gap);
                for(var t = 0; t < tempLen; t++){
                    var newData = ALCommon.deepClone(data);
                    newData["close"] = newData["open"];
                    newData["high"] = newData["low"];
                    newData["time"] = time + t * gap;
                    var tempData = new CandleData(newData);
                    this.pushData(tempData);
                }
                if(!cc.sys.isMobile)
                {
                    cc.log("time no date::", time , TimeHelper.formatSecs(time, "HH:mm:ss"));
                }
            }
            else
            {
                indexCount++;
            }

            var tempData = new CandleData(data);
            this.pushData(tempData);
        }

        if(afterCallBack)
            afterCallBack();

    }.bind(this);

    //超时
    var timeoutCallBack = function(){
        //this.paddingDummyData(startTime, endTime);
        if(afterCallBack)
            afterCallBack();
    }.bind(this);


    if(isShowLoading)
        MainController.getInstance().showLoadingWaitLayer();
    HttpManager.requestQuoteKHistory(responseCallBack, productInfo.getId(), this._type ,startTime, endTime, timeoutCallBack);
};



/**
 * 蜡烛图
 * @type {Function}
 */
var CandleData = cc.Class.extend({
    _highValue:undefined,
    _lowValue:undefined,
    _openValue:undefined,
    _closeValue:undefined,
    _type:0,
    _isReal:true,
    _beginTime:0,
    _isImperfect:false,

    ctor:function(jsonData)
    {
        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData)
    {
        this._highValue = ALCommon.getValueWithKey(jsonData, "high", this._highValue);
        this._lowValue = ALCommon.getValueWithKey(jsonData, "low", this._lowValue);
        this._openValue = ALCommon.getValueWithKey(jsonData, "open", this._openValue);
        this._closeValue = ALCommon.getValueWithKey(jsonData, "close", this._closeValue);
        this._beginTime = ALCommon.getValueWithKey(jsonData, "time", this._beginTime);
        this._isImperfect = ALCommon.getValueWithKey(jsonData, "ret", this._isImperfect);

        if(!this._closeValue && this._openValue){
            this._closeValue = this._openValue;
        }

        //由客户端维护
        this._type = ALCommon.getValueWithKey(jsonData, "type", this._type);
        this._isReel = ALCommon.getValueWithKey(jsonData, "isReal", this._isReel);
    }
});

CandleData.prototype.fix = function(pData){
    var curValue = pData["p"];
    //首次
    if(!this._closeValue){
        this._highValue = this._highValue || curValue;
        this._lowValue = this._highValue || curValue;
        this._openValue = this._openValue || curValue;
        this._closeValue = this._closeValue || curValue;
    }
    if(curValue > this._highValue){
        this._highValue = curValue;
    }else if(curValue < this._lowValue){
        this._lowValue = curValue;
    }
    this._closeValue = curValue;

    ////补完整了 这里不能保证每秒都能做修复 isImperfect还是一直保持好了 待历史请求补全
    //if(time >= this._beginTime + this._type){
    //    this._isImperfect = false;
    //}
};

CandleData.prototype.isImperfect = function(){
    return this._isImperfect;
};

CandleData.prototype.setImperfect = function(value){
    this._isImperfect = value;
};

CandleData.prototype.getHighValue = function(){
    return this._highValue;
};

CandleData.prototype.setHighValue = function(value){
    this._highValue = value;
};

CandleData.prototype.getLowValue = function(){
    return this._lowValue;
};

CandleData.prototype.setLowValue = function(value){
    this._lowValue = value;
};


CandleData.prototype.getOpenValue = function(){
    return this._openValue;
};

CandleData.prototype.setOpenValue = function(value){
    this._openValue = value;
};

CandleData.prototype.getCloseValue = function(){
    return this._closeValue;
};

CandleData.prototype.setCloseValue = function(value){
    this._closeValue = value;
};


CandleData.prototype.getBeginTime = function(){
    return this._beginTime;
};

CandleData.prototype.getEndTime = function(){
    return this._beginTime + this._type;
};

CandleData.prototype.setBeginTime = function(value){
    this._beginTime = value;
};

CandleData.prototype.getType = function(){
    return this._type;
};

CandleData.prototype.setType = function(value){
    this._type = value;
};

CandleData.prototype.isReal = function(){
    return this._isReal;
};

CandleData.prototype.setReal = function(value){
    this._isReal = value;
};

CandleData.prototype.logSelf = function(){
    cc.log("beginTime::", TimeHelper.formatSecs(this.getBeginTime()));
    cc.log("endTime::", TimeHelper.formatSecs(this.getEndTime()));
    cc.log("open::", this.getOpenValue());
    cc.log("close::", this.getCloseValue());
    cc.log("high::", this.getHighValue());
    cc.log("low::", this.getLowValue());
};