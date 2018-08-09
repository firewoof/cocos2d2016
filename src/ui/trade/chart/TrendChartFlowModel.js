/**
 * 流式交易
 * Created by 玲英 on 2016/8/22.
 */
var TrendChartFlowModel = BaseTrendChart.extend({

    ctor:function(tradingHall)
    {
        this._super(tradingHall);
        cc.log("creat 流式交易");

        //初始化整体UI
        this.initUI();

        //添加监听
        this.addListeners();

        //设置时间尺度（默认为4分钟（单位））
        this.setTimeScaleUnits(this._timeScaleUnits || 4.0);

        //
        this.stop();
    },

    /**
     * 开始绘制行情
     */
    start:function()
    {
        cc.log("k线 start");
        this._isStopped = false;
        this._isAllowDrawDynamicChart = true;
        this._productInfo = Player.getInstance().getCurProductInfo();

        //检查产品可用
        var isOpen = this.checkProductEnable();
        if(!isOpen){
            return false;
        }

        //重置到 动态k线绘制的状态
        this.doSomeBeforeCurrent();

        //历史订单界面
        var beSelectedInfo = TradingHallLayer.instance.getBeSelectedBetInfo();
        if(beSelectedInfo){
            this.showBetHistory(beSelectedInfo);
        }

        //重置k  抓取面板
        this._fetchPanel.reset();

        //游标线
        this.refreshCursorLine();

        //刷新所有
        this.refresh();

        //
        this.afterGenerate();
    },

    refreshCursorLine:function()
    {
        var productInfo = Player.getInstance().getCurProductInfo();
        if(productInfo.isTouchOption()){
            UICommon.setSpriteWithDefaultTextureName(this._cursorLine, "common_the_line_price.png");
        }else{
            UICommon.setSpriteWithDefaultTextureName(this._cursorLine, "common_the_line_price_2.png");
        }
    },

    /**
     * 停止绘制
     */
    stop:function(isClear)
    {
        cc.log("k线 stop");
        this._isStopped = true;
        this._isAllowDrawDynamicChart = false;

        if(isClear){
            //清掉k线
            this._drawNode.clear();
            this._kLinePanel.setVisible(false);
            this._linePanel.setVisible(false);
            //重置
            if(this._fetchPanel)
                this._fetchPanel.reset();
        }

        this._settleLine.setPositionX(-1000);
        //一些必要到隐藏
        this._cursorPanel.setVisible(false);
        this._touchLinePanel.setVisible(false);
        this._selfBetPanel.setVisible(false);
        this._touchSelfBetPanel.setVisible(false);
        this._fetchPanel.setVisible(false);
    },

    setTimeScaleUnits:function(timeScaleUnits)
    {
        this._timeScaleUnits = timeScaleUnits;
        var flowPercent = this._flowPercent = 3.7/5;             //数据在整个画布横向中占比
        this._formulas.timeScale = this._timeScale = this._timeScaleUnits / flowPercent; //场景所能表达的最大时间尺度数据(右侧需要留一部分)
        this._dataTimeScale = this._timeScaleUnits;          //实际数据最大显示尺度
    },

    getTimeScaleUnits:function()
    {
      return this._timeScaleUnits;
    },

    reSize:function(size)
    {
        this.setContentSize(size);
        //this._actionPanel.setContentSize(size);
        this._touchLinePanel.setContentSize(size);
        this.refresh();
        //多调一次
        this.afterGenerate();
    },

    /**
     * 重置
     * @param tradingHall
     * @param betArray
     * @param paddingScope
     */
    reset:function()
    {
        this._checkOpenGap = 5;
        //默认步长
        this._stride = 1;
        this._lineData = Player.getInstance().getCurLineData();

        //------先隐藏一部分东西
        if(this._selfBetPanel){
            this._selfBetPanel.setVisible(false);
        }

        if(this._touchSelfBetPanel){
            this._touchSelfBetPanel.setVisible(false);
        }

        if(this._fetchPanel){
            this._fetchPanel.setVisible(false);
        }

        //不可见
        this._settleLine.setPositionX(-1000);
    },

    addListeners:function()
    {
        this._super();

        this._showDynamicQuoteListener = cc.eventManager.addCustomListener(NOTIFY_SHOW_DYNAMIC_QUOTE, function(event)
        {
            cc.log("显示当前行情 NOTIFY_SHOW_DYNAMIC_QUOTE receive");
            this.doSomeBeforeCurrent();

            this.refresh();
        }.bind(this));

        //用户下单
        this._newOrderListener = cc.eventManager.addCustomListener(NOTIFY_NEW_ORDER, function(event)
        {
            this.bindNextBetInfo(true);
        }.bind(this));
    },

    initUI:function()
    {
        this._super();

        this._settleLine = this.generateSettleLine();
    },

    /**
     * 每秒调用--由父类调
     */
    perOneSecondFunc:function()
    {
        this._super();

        //切换可能会导致产品数据清理掉
        var curProductInfo = Player.getInstance().getCurProductInfo();
        if(!curProductInfo){
            cc.log("curProductInfo is null");
            return;
        }

        var curSecs = cs.getCurSecs();
        //判断是否开放
        if(curSecs % this._checkOpenGap == 0){
            this.checkProductEnable();
        }

        //保证行情不及时 结算倒计时依然能正常倒计
        if(curProductInfo.getTradeSettleGap() > 0)
        {
            this._settleLine.refreshWithBetInfo(null, null, curSecs);
        }
    },

    /**
     * 返回 数据与位置的转换公式集合
     * @returns {TrendSubFetchPanel._formulas|*|BaseTrendChart._formulas}
     */
    getFormulas:function() {
        return this._formulas;
    },

    /**
     * 检查产品是否在交易时间段内 否则显示休市中
     */
    checkProductEnable:function()
    {
        var productInfo = Player.getInstance().getCurProductInfo();
        var isOpen = productInfo.isOpen();
        //cc.log("this.getProductInfo().isOpen()::", isOpen);
        if(isOpen)
        {
            //由休市转成不休市
            if(this._isTradeRest) {
                cc.log("由休市-->不休市");
                this.tradeRestSettings(false);
                //关掉休市提示
                TradingHallLayer.instance.openRestLayer(false);
            }
            this._tradeUnablePanel.setVisible(false);
            this._isTradeRest = false;  //休市

            //找到下一个
            var nextRestTime = productInfo.getNextRestTime();
            if(!nextRestTime){
                cc.log("今天没有下一个休市时间了....");
                return;
            }
            //cc.log("下一次休市时间：", TimeHelper.formatSecs(nextRestTime));
            var curSecs = cs.getCurSecs();
            //产品休市前提示()
            var noMoreTradeTimeTip = productInfo.getNoMoreTradeTimeTip();
            var diff = (nextRestTime - curSecs);
            //cc.log("noMoreTradeTimeTip::",  noMoreTradeTimeTip);
            //cc.log("nextRestTime - curSecs::",  nextRestTime - curSecs);
            if(diff > 0 && diff < noMoreTradeTimeTip){
                if(MainController.getInstance().bulletinPanel == null){
                    this.showBeforeNoMoreTradeTip(diff);
                }
            }
        }else{
            //由不休市转休市
            if(!this._isTradeRest) {
                cc.log("由不休市-->休市");
                this.tradeRestSettings(true);
                //打开一次休市提示
                TradingHallLayer.instance.openRestLayer(true);
            }
            this._tradeUnablePanel.setVisible(true);
            this._isTradeRest = true;
        }

        return isOpen;
    },

    /**
     * 休市前几分钟的提示
     */
    showBeforeNoMoreTradeTip:function(restTime)
    {
        var str = "";
        var productInfo = this.getProductInfo();
        if(restTime >= 30){
            str = "<l> 请注意，%s分钟后，[%s]将暂停交易！</l>";
            str = cc.formatStr(str, Math.ceil(restTime/60).toFixed(0), productInfo.getName());
        }else{
            str = "<l> 请注意，[%s]即将暂停交易，请尝试切换到其他品种进行交易！</l>";
            str = cc.formatStr(str, productInfo.getName());
        }
        MainController.getInstance().showScrollBulletin(str);
    },

    /**
     * refresh 由每秒请求逻辑回调
     * @param
     */
    refresh:function()
    {
        if(this._isStopped)
            return;

        //显示最新动态
        if(!this._isShowStaticChart)
        {
            var chartType = this._tradingHall.getChartType();
            if(chartType == GB.CHART_TYPE_SOLID || chartType == GB.CHART_TYPE_LINE){
                this.refreshDynamicLineChart();
            }else{
                this.refreshDynamicKlineChart();
            }
        }
    },

    refreshDynamicKlineChart:function()
    {
        var args = {};
        var curSecs = cs.getCurSecs();
        var candleDuration = this._tradingHall.getCurKlineType();
        args["klineData"] = Player.getInstance().getKlineData(this._productInfo.getId(), candleDuration);
        args["startTime"] = Math.floor(curSecs - this._timeScaleUnits - curSecs%candleDuration);
        args["endTime"] = cs.getCurSecs();
        args["timeScale"] = this._timeScale;
        this.refreshKLineChart(args);
    },

    /**
     * 休市需要隐藏的东西
     * @param bool
     */
    tradeRestSettings:function(isRest)
    {
        //不休时
        if(!isRest){
            this.doSomeBeforeCurrent();
        }

        if(isRest){
            this._actionPanel.setVisible(false);
            this._cursorPanel.setVisible(false);
            this._fetchPanel.setVisible(false);
            this._selfBetPanel.setVisible(false);
            this._kLinePanel.setVisible(false);
            this._linePanel.setVisible(false);
            this._touchLinePanel.setVisible(false);
            this._touchSelfBetPanel.setVisible(false);

            //强制下单不可用
            cc.log("强制下单不可用。。。");
            this._tradingHall.setBetEnabled(false, true);
            this._drawNode.clear();

            var len = this._lineArray.length;
            for(var i = 0; i < len; i++){
                var line = this._lineArray[i];
                line.setVisible(false);
            }
        }
        cc.log("tradeRestSettings");
    },

    setByChartType:function(chartType)
    {
        if(chartType == GB.CHART_TYPE_CANDLE){
            this._linePanel.setVisible(false);
            this._kLinePanel.setVisible(true);
            this._flashPointView.setVisible(false);
        }else{
            this._flashPointView.setVisible(true);
            this._linePanel.setVisible(true);
            this._kLinePanel.setVisible(false);
        }
    },

    /**
     * @param timeScaleUnits 一屏表达的宽度
     * @returns {number}
     */
    getStride:function()
    {
        var stride = Math.ceil(this._timeScaleUnits / this._maxSampleNum) || 1;
        return stride;
    },

    /**
     * 获取不可忽略点
     * @returns {number}
     */
    getImportantDots:function(productInfo, startTime, stride)
    {
        var lineData = Player.getInstance().getLineDataById(productInfo.getId());
        //当前的下单点
        var importantTimeArray = [];
        var isTouchOption = productInfo.isTouchOption();
        var betArray = [];
        if(isTouchOption){
            this._touchSelfBetPanel.reset();
            betArray = this._touchSelfBetPanel.getBetArray()
        }else{
            this._selfBetPanel.reset();
            betArray = this._selfBetPanel.getBetArray()
        }
        for(var i = 0; i < betArray.length; i++)
        {
            var betInfo = betArray[i];
            var betTime = betInfo.getBetTime();
            var data = lineData.getDataByTime(betTime);
            //刚好在采集步长上 或者数据有了
            if(betTime % stride == 0 || (data && data.isReal())){
                continue;
            }else{
                importantTimeArray.push(betTime);
            }
        }

        //抓取用户的下单点
        var fetchBetArray = Player.getInstance().getCurProductInfo().getFetchBetArray();
        for(var i = 0; i < fetchBetArray.length; i++)
        {
            var betInfo = fetchBetArray[i];
            if(!betInfo)
                continue;
            //刚好在采集步长上 或者数据有了
            if(betTime > startTime && betTime % stride == 0 || (data && data.isReal())){
                continue;
            }else{
                importantTimeArray.push(betTime);
            }
        }
    },

    /**
     * 刷动态局
     */
    refreshDynamicLineChart:function()
    {
        if(this._isTradeRest){
            return;
        }

        if(!this._isAllowDrawDynamicChart)
        {
            cc.log(" not be allowed to drawChart");
            return false;
        }

        //==============计算采集初始值===============
//        var flowPercent = 4/5;//流式数据在整个场景尺度中占比
        var timeScale = this._timeScale;
        var flowPercent = this._flowPercent;
        var stride = this.getStride();
        var dataStartTime = this._lineData.getDataArray()[0].getXValue();       //数据源的第一个
        var dataLatestTime = this._lineData.getLatestData().getXValue();        //数据源的最后一个
        var startTime = dataLatestTime - timeScale * flowPercent;
        if(startTime < dataStartTime){
            startTime = dataStartTime;
        }
        startTime = startTime - startTime % stride;

        var latestData = this._lineData.getLatestData();
        var startIndex = this._lineData.getIndexByTime(startTime);
        var endIndex = this._lineData.getIndexByTime(latestData.getXValue());
        //按订单结算，踩点逻辑 确保踩点能整除步长 这样可以保证k线样式一致
        //startIndex = startIndex + startIndex % stride;

        if(startIndex >= endIndex)
            return;

        //当前的下单点
        var importantTimeArray = [];
        var betArray = this._selfBetPanel.getBetArray();
        var touchBetArray = this._touchSelfBetPanel.getBetArray();
        var betArray = betArray.concat(touchBetArray);
        //cc.log("自己下的单::", betArray.length);
        for(var i = 0; i < betArray.length; i++)
        {
            var betInfo = betArray[i];
            importantTimeArray.push(betInfo.getBetTime());
        }

        //抓取用户的下单点
        var fetchBetArray = Player.getInstance().getCurProductInfo().getFetchBetArray();
        for(var i = 0; i < fetchBetArray.length; i++)
        {
            var betInfo = fetchBetArray[i];
            if(!betInfo)
                continue;
            var tradeTime = betInfo.getTradeBeginTime();
            if(tradeTime > startTime)
            {
                importantTimeArray.push(tradeTime);
            }
        }

        var args = {};
        args["lineData"] = this._lineData;
        args["startIndex"] = startIndex;
        args["endIndex"] = endIndex;
        args["stride"] = stride;
        args["timeScale"] = timeScale;
        args["importantTimeArray"] = importantTimeArray;
        args["minWaveRange"] = this._lineData.getProductInfo().getMinWaveRange();
        args["isShowSolid"] = this._tradingHall.getChartType() == GB.CHART_TYPE_SOLID;

        //队列末端的那个点，无视步长都应该显示出来，这里放进importantTimeArray中
        var lastData = this._lineData.getLatestData();
        importantTimeArray.push(lastData.getXValue());

        //刷新K线
        this.refreshLineChart(args);
        //记录最后一个绘制到点
        this._lastDrawData = lastData;
    },

    refreshCursor:function()
    {
        if(!this._formulas.getYPosByValue){
            this._cursorWieget.setPositionY(-1000);
            return;
        }
        var lastData = this._lineData.getLatestData();
        //游标
        var curPriceStr = lastData.getYValue().toFixedCs(this.getProductInfo().getPrecise());
        this._cursorWieget.setPositionY(this._formulas.getYPosByValue(lastData.getYValue()));
        this._cursorText.setString(curPriceStr);
        //闪烁点
        var pos = cc.p(this._formulas.getXPosByValue(lastData.getXValue()),this._formulas.getYPosByValue(lastData.getYValue()));
        this._flashPointView.setPosition(pos);
    },

    /**
     * 刷新历史下单静态线
     */
    showBetHistory:function(betInfo)
    {
        //if(betInfo.isSettled()){
        //    this.doSomeBeforeHistory();
        //}
        //this._historyPanel.refreshByBetInfo(betInfo);
        //this._historyPanel.setVisible(true);
    },

    /**
     * 刷新x轴刻度
     */
    refreshXScales:function()
    {
        //整版尺度除以4
        var scaleGap = this._dataTimeScale / 4;
        var curSecs = cs.getCurSecs();
        var date = cs.getDate();
        date.setMilliseconds(0);
        if(this._dataTimeScale > 60){
            date.setSeconds(0);
        }else{
            date.setSeconds(date.getSeconds() - date.getSeconds() % scaleGap + scaleGap);
        }
        var scaleLatestTime = parseInt(date.getTime()/1000);
        for(var i = 0; i < 6; i++)
        {
            var scaleText = this._scaleXValueTexts[i];
            var time = scaleLatestTime - i * scaleGap;
            var formatStr = "";
            if((curSecs - time) > 3600 *24){
                formatStr = TimeHelper.formatSecs(time, "MM/dd HH:mm")
            }else{
                formatStr = TimeHelper.formatSecs(time, "HH:mm:ss");
            }
            scaleText.setString(formatStr);
            var xPos = this._formulas.getXPosByValue(time);
            scaleText.setPositionX(xPos);
            //cc.log("this.getXPosByValue(time)::",this.getXPosByValue(time));
            //太靠左/超过当前时间就索性不要看见了
            if(time > curSecs || (xPos - scaleText.width * 0.5 ) < 0){
                scaleText.setPositionX(-1000);
            }

            //如果右侧与结算标线重合 隐藏
            if(this._settleLine.getPositionX() > 0 && (xPos + scaleText.width * 0.8) > (this._settleLine.getPositionX() - 25))
                scaleText.setPositionX(-1000)

        }
    },

    /**
     * 父类会调用
     * 这里的调用稳定跟随行情，行情到来之后才会刷新
     * 防止下单操作调用refresh(),造成多余操作
     */
    afterGenerate:function(){
        if(this._isStopped)
            return;

        this.refreshCursor();

        //更新抓取用户面板
        this._fetchPanel.refresh();

        ////历史面板
        //this._historyPanel.refresh(this._formulas);

        //结算线绑定订单
        this.bindNextBetInfo();
    },

    /**
     * 结算时钟绑定最近要结算的单
     */
    bindNextBetInfo:function(isForce)
    {
        this._settleLine.setPositionX(-100);
        //找到还未过期的单
        var curProductInfo = Player.getInstance().getCurProductInfo();
        if(curProductInfo.isTouchOption()){
            return;
        }

        //已绑定
        var betInfo = null;
        var curBetInfo = this._settleLine._betInfo;
        var curSecs = cs.getCurSecs();
        if(!isForce && curBetInfo && curBetInfo.getProductId() == curProductInfo.getId() && curBetInfo.getTradeSettleTime() >= curSecs ){
            betInfo = curBetInfo;
        }else{
            betInfo = this._selfBetPanel.getLatestToBeSettledOrder();
        }
        if(betInfo && betInfo.getTradeSettleTime() > 0){
            this._settleLine.refreshWithBetInfo(betInfo, this._formulas.getXPosByValue(betInfo.getTradeSettleTime()), cs.getCurSecs());
        }else{
            this._settleLine.refreshWithBetInfo(betInfo);
        }

    },

    /**
     * 下注
     * @param {Boolean} isBullish  是否看涨
     * @param {Number} betAmount 下单金额
     */
    doBet:function(betData)
    {
        var isBullish = betData["isBullish"];
        var betAmount = betData["betAmount"];
        var tradeCount = betData["tradeCount"];
        var feeRate = betData["feeRate"];
        var touchOffset = betData["touchOffset"];
        var duration = betData["duration"];

        ////如果连不上，下单的时候 触发重连
        //var sm = SocketManager.getInstance();
        //if(!sm.isConnectSuccess() && !sm.isWaitingConnect()) {
        //    MainController.getInstance().connectToServer();
        //    //MainController.getInstance().showAutoDisappearAlertByText("");
        //    return;
        //}

        //没有处于k线绘制状态，则不能下单
        if(this._isStopped) {
            MainController.showAutoDisappearAlertByText("数据玩命加载中,请稍后再试...");
            return;
        }
        //末端行情
        var latestData = this._lineData.getLatestData();
        var betTime = latestData.getXValue();
        var curSecs = cs.getCurSecs();

        //落后超过n秒则提示不能下单
        if(betTime < (curSecs - 3)){
            MainController.showAutoDisappearAlertByText("数据加载中,请稍后再试...");
            if(isTestServer){
                MainController.showAlertByText("测试服log：本地最新行情落后太多,请确认行情推送是否正常，diff:"+(curSecs - betTime))
            }
            return;
        }

        //绘制k线末端(以看见的末端点为准)
        if(this._lastDrawData){
            cc.log("绘制落后于数据....");
            betTime = this._lastDrawData.getXValue();
        }

        //余额是否够
        if(!GB.isSimulateTrade && Player.getInstance().getBalance() < betAmount){
            MainController.getInstance().showGoToRechargeLayer();
            return;
        }

        var isSimulateTrade = GB.isSimulateTrade;
        var responseCallBack = function(jsonData)
        {
            var orderId = jsonData["orderId"];  //订单号
            var countTime = jsonData["countTime"];  //下单的服务器交易局Id
            var totalLoseRate = jsonData["totalLoseRate"];  //下单时的赔率
            var clientTimePrice = jsonData["clientTimePrice"];

            //投注data
            var betInfo = new BetInfo(jsonData);
            betInfo.setSimulateTrade(isSimulateTrade);

            //保存到Player上
            if(isSimulateTrade){
                Player.getInstance().getCurDaySmBetArray().unshift(betInfo);
            }else{
                Player.getInstance().getCurDayBetArray().unshift(betInfo);
            }
            //防止杀进程本地订单数据不能保存 立即保存一次
            Player.getInstance().saveBetData(isSimulateTrade);

            //play sound
            MainController.playEffect("bet.mp3");

            //通知订单面板新增下单
            cc.eventManager.dispatchCustomEvent(NOTIFY_NEW_ORDER, betInfo);

            //立即刷新走势线 和 下单点等
            this.refresh();

            //刷新自己的下单面板
            this._selfBetPanel.refresh();

            //---log----
            cc.log("下单服务时间::", TimeHelper.formatSecs(betTime));
            cc.log("预计结算时间::", TimeHelper.formatSecs(countTime, "HH:mm:ss"));

            //辅助检查
            //if(isTestServer && clientTimePrice && clientTimePrice != price){
            //    cc.log("双端行情不一致,serverPrice:"+ clientTimePrice + "  localPrice:" + price );
            //    MainController.showConfirmByText("双端行情不一致,serverPrice:"+ clientTimePrice + "  localPrice:" + price );
            //}
        }.bind(this);

        //请求前带上当前时间,价格,看涨/跌
        var betTime = latestData.getXValue();
        var price = latestData.getYValue(); //最新行情
        var direction = isBullish ? 1 : 0;   //下单方向,1:涨，0：跌
        var productInfo = this.getProductInfo();

        cc.log("下单本机时间::", TimeHelper.formatSecs(cs.getCurSecs()));
        //请求下单
        HttpManager.requestDoBet(
            responseCallBack,
            isSimulateTrade,
            productInfo.getId(),
            betTime,                //下单时间
            betAmount,              //下单金额
            direction,              //下单方向
            price,                  //下单价位
            tradeCount,             //下单 n手
            feeRate,                //管理费费率
            touchOffset,            //触碰式偏移
            duration                //结算间隔
        );
    },

    /**
     * 根据下单 生成结算线
     * @param {*}  [bgPanel]
     */
    generateSettleLine:function()
    {
        if(this._settleLine)
            return this._settleLine;

        //交易结算点
        var settlementView = new cc.Sprite("#icon_common_end.png");
        //时针分针
        var secondHandSprite = new cc.Sprite("#icon_common_end_1.png");
        secondHandSprite.setAnchorPoint(ANCHOR_LEFT);
        settlementView.addChild(secondHandSprite);
        secondHandSprite.setPosition(centerInner(settlementView));

        //结算红线
        var settlementLine = new cc.Sprite("#common_k_line.png");
        settlementLine.setScaleY(880 / settlementLine.height);
        settlementLine.setColor(cs.RED);
        settlementView.addChild(settlementLine);
        settlementLine.setPos(topInner(settlementView), ANCHOR_BOTTOM);

        //结算时间
        var settleText = new ccui.Text(" ", FONT_ARIAL_BOLD, 22);
        settleText.setColor(cc.color(225, 210, 49));

        var clockView = new ccui.Layout();
        clockView.setAnchorPoint(ANCHOR_BOTTOM);
        clockView.setContentSize(settlementView.getContentSize());

        var groupPanel = UICommon.createPanelAlignWidgetsWithPadding(5, cc.UI_ALIGNMENT_VERTICAL_CENTER, settlementView, settleText);
        clockView.addChild(groupPanel);
        groupPanel.setPos(bottomInner(clockView), ANCHOR_BOTTOM);

        var linkLine = new cc.LayerColor();
        linkLine.setIgnoreAnchorPointForPosition(false);
        linkLine.setAnchorPoint(ANCHOR_RIGHT);
        clockView.addChild(linkLine);
        linkLine.setContentSize(0, 2);
        linkLine.setPos(centerInner(clockView), ANCHOR_RIGHT);

        this._actionPanel.addChild(clockView);
        secondHandSprite.runAction(new cc.RepeatForever(
            new cc.RotateBy(3.0, 360)
        ));

        //尽量跟x轴刻度统一高度
        clockView.setPositionYAdd(5);
        clockView.setPositionX(-1000);

        //附带引用
        clockView._settleText = settleText;

        //betInfo xPos都可能为空，当只需要刷curSecs时
        var self = this;
        clockView.refreshWithBetInfo = function(betInfo, xPos, curSecs)
        {
            var betInfo = this._betInfo = betInfo || this._betInfo;
            if(xPos){
                xPos = Math.min(self.width - clockView.width * 0.5, xPos);
                this.setPositionX(xPos);
            }
            var counterStr = "";
            //判断显示倒计时 还是 结算时间
            if(betInfo) {
                if(curSecs != undefined)
                {
                    var counter = betInfo.getTradeSettleTime() - curSecs;
                    counterStr = counter <= 0 ? "结算中.." : counter + "s";
                }else{
                    counterStr = TimeHelper.formatSecs(betInfo.getTradeSettleTime(), "HH:mm:ss");
                }

                var settleTime = betInfo.getTradeSettleTime();
                if(settleTime > 0){
                    //最大边界
                    var maxSettleTime = self._formulas.getXValueByPos(self.width - clockView.width * 0.5);
                    //实际的
                    var tradeSettleGap = Math.min(settleTime, maxSettleTime) - betInfo.getTradeBeginTime();
                    var lineWidth = tradeSettleGap / self._timeScale * self.width;
                    var color = betInfo.isBullish() ? cs.RED : cs.GREEN;
                    linkLine.setColor(color);
                    lineWidth -= 8;//betView的一半大小
                    linkLine.setContentSize(lineWidth, 1.2);

                    //计算下单点 在当前界面的高度
                    var lineData = Player.getInstance().getLineDataById(betInfo.getProductId());
                    var betSampleData = lineData.getDataByTime(betInfo.getTradeBeginTime());
                    if(betSampleData){
                        var posY = self._formulas.getYPosByValue(betSampleData.getYValue());
                        var diff = this.getPosAtAncestor(self, ANCHOR_BOTTOM).y;
                        linkLine.setPositionY(posY - diff);
                    }else{
                        var posY = self._formulas.getYPosByValue(betInfo.getBetQuotePrice());
                        linkLine.setPositionY(posY);
                    }
                }
            }
            this._settleText.setString(counterStr);
        };

        clockView.reset = function(){
            this._betInfo = null;
            this.setPositionX(-1000);
        };

        this._settleLine = clockView;
        return this._settleLine;
    },

    /**
     * 显示历史行情前需要做的
     */
    doSomeBeforeHistory:function(){
        this._isAllowDrawDynamicChart = false;  //这个控制refreshDynimic的执行
        this._isShowStaticChart = true;         //这个控制refresh()的执行
        //this._lastLineDrawNode.clear();
        this._drawNode.clear();       //主k线

        this._actionPanel.setVisible(false);    //
        this._cursorPanel.setVisible(false);    //游标
        //this._flashPointView.setVisible(false); //行情末端闪烁点
        this._fetchPanel.setVisible(false);
        this._selfBetPanel.setVisible(false);
        //this._historyPanel.setVisible(true);
        this._sclalePanel.setVisible(false);
        this._touchLinePanel.setVisible(false);
        this._touchSelfBetPanel.setVisible(false);
        this._kLinePanel.setVisible(false);
        this._linePanel.setVisible(false);

        //移出屏幕外
        this._cursorWieget.setPositionY(-1000);
        //this._flashPointView.setPositionY(-1000);

        //涨跌条
        this._tradingHall._trendSlideBar.setVisible(false);

        //禁用下单按钮
        this._tradingHall.setBetEnabled(true);
        this._tradingHall._worldChannel.setVisible(false);

        //投注点全部消除
        for (var i = this._betViewArray.length - 1; i >= 0; i--) {
            var betView = this._betViewArray[i];
            betView.removeFromParent();
        }
        this._betViewArray = [];
    },

    /**
     * 显示当前行情前需要做的
     */
    doSomeBeforeCurrent:function(){
        var curProductInfo = Player.getInstance().getCurProductInfo();
        if(!curProductInfo.isOpen()){
            return;
        }
        this._isAllowDrawDynamicChart = true;
        this._isShowStaticChart = false;
        this._cursorPanel.setVisible(true);
        this._actionPanel.setVisible(true);
        //this._flashPointView.setVisible(true);
        this._fetchPanel.setVisible(true);
        this._selfBetPanel.setVisible(true);
        this._touchSelfBetPanel.setVisible(true);
        this._sclalePanel.setVisible(true);
        this._kLinePanel.setVisible(true);

        if(curProductInfo.isTouchOption()){
            this._selfBetPanel.setVisible(false);
            this._touchSelfBetPanel.setVisible(true);
            this._touchLinePanel.setVisible(true);
            //this._touchLinePanel.reset(); //touchSelfBet已做了这件事
            this._touchSelfBetPanel.reset();
        }else{
            this._selfBetPanel.setVisible(true);
            this._touchSelfBetPanel.setVisible(false);
            this._touchLinePanel.setVisible(false);
            this._selfBetPanel.reset();
        }

        //涨跌条
        this._tradingHall._trendSlideBar.setVisible(true);
        this._tradingHall.setBetEnabled(true);
        this._tradingHall._worldChannel.setVisible(true);

        //this._historyPanel.reset();
        //this._historyPanel.setVisible(false);

        this.setByChartType(this._tradingHall.getChartType());
    }
});