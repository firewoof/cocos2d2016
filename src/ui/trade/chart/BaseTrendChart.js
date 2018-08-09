/**
 * Created by Administrator on 2016/8/22.
 * 交易k线画布基础类
 * @type {Function}
 */
G_TEST_NO_WEAVE_QUOTE = false; //测试无行情波动

var BaseTrendChart = cc.Layer.extend({
    _vertices : undefined,
    _lineData:undefined,
    _interval:0,
    _interval_1_10:0,
    _drawNode: undefined,
    _sampleScale: 1.0,              //采样缩放因子
    _scaleYValueTexts: undefined,   //y轴的刻度
    _scaleXValueTexts: undefined,   //x轴的刻度
    _scaleYDrawNodes: undefined,
    _tradeDeadLine: 0,              //交易截止时间
    _tradeResultLine: 0,            //结算截止时间
    _deadClockText: undefined,      //截止倒计时text
    _deadLineTime: 0,               //交易截止点
    _settlementTime: 0,             //交易结算点
    _hasBet: false,                 //(本轮是否有投注)
    _fillColor: undefined,          //线图填充色
    _betViewArray:undefined,        //投注views
    _isAllowBet: true,             //是否允许投注
    _lastLineSegmentsPos:undefined,     //最新一条线的绘制点
    _lastLineDrawBeginTime:undefined,   //最新一条线绘制的起始时间
    _lastLineDrawNode:undefined,        //最后一条线的drawNode
    _FILL_COLOR_GREEN:cc.color(46, 171 , 67, 70),
    _FILL_COLOR_RED:cc.color(217, 73, 47, 70),
    _FILL_COLOR_GRAY:cc.color(100, 114, 140, 70),

    //枚举
    _SUB_CLASS_TYPE_FIXED:1,        //固定结算模式
    _SUB_CLASS_TYPE_FLOW:2,         //流式结算模式


    /**
     * @param tradingHall 大厅主界面
     */
    ctor:function(tradingHall)
    {
        this._super();
        this._tradingHall = tradingHall;
        var size = tradingHall._trendPanel.getContentSize();
        this.setContentSize(size);

        cc.log("size", JSON.stringify(size));

        this._fillColor = this._FILL_COLOR_GRAY; //green //red //yellow cc.color(147, 139, 138, 30)
        this._scaleYDrawNodes = [];
        this._scaleYValueTexts = [];
        this._scaleXValueTexts = [];
        this._betViewArray = [];
        //this._fetchAvatarArray = [];
        this._maxSampleNum = 450;   //固定值 不要轻易更改（5分钟，15分钟， 30分钟）可以用步长1,2,4来重复利用
        this._intervalScale = 0;
        this._isAllowDrawDynamicChart = true;
        this._isAllowScrollTrade = true;
        this._fillUpCounter = 8;            //起始需要慢慢补齐0-7八段数据
        this._formulas = {};                //数据<-->位置公式
        this._isStopped = true;
        this._lastQuoteUpdateTime = cs.getCurTime();

        //时间
        this._vertices = new Array(450);    //绘制的点不会超过这个数
        this._lineData = tradingHall._lineData;

        this._isShowStaticChart = false;    //是否显示的是静态图

        //n个缩略图
        this._chartFragmentArray = [];
    },

    addListeners:function()
    {
        //下单
        this._doBetEstimateRiseListener = cc.eventManager.addCustomListener(NOTIFY_DO_BET, function(event)
        {
            var betData = event.getUserData();
            if(betData != undefined){
                this.doBet(betData);
            }
        }.bind(this));
        //
        //行情异常
        this._quoteExceptionListener = cc.eventManager.addCustomListener(NOTIFY_QUOTE_EXCEPTION, function(event)
        {
            //停止绘制
            this.stop();
            G_collectLog(Player.getInstance().getCurProductInfo().getName() + "---行情异常, 停止绘制");
        }.bind(this));

        this._perOneSecondListener = cc.eventManager.addCustomListener(NOTIFY_PER_ONE_SECOND, function()
        {
            //每秒调用本类函数
            //cc.log("this._isStopped:", this._isStopped);
            if(!this._isStopped && this.perOneSecondFunc){
                this.perOneSecondFunc();
            }
        }.bind(this));

        this._queoteUpdateListener = cc.eventManager.addCustomListener(NOTIFY_QUOTE_UPDATE, function(event)
        {
            var userData = event.getUserData();
            var productId = userData["productId"];
            var quoteDataList = userData["quoteDataList"];
            var diff = userData["diff"];    //diff 大于1表示需要补数据
            var curProductInfo = Player.getInstance().getCurProductInfo();
            var curTime = cs.getCurTime();

            //推送过程中有遗漏大量数据 要重新扫描启动(可能从后台回到前台)
            if(diff >= GB.QuoteFragmentNum * 60 && !this._isStopped && curProductInfo.getId() == productId){
                if(this._tradingHall.getChartType() == GB.CHART_TYPE_CANDLE){
                    var sampleData = new SamplePointData(quoteDataList[0]);
                    Player.getInstance().getLineDataById(productId).pushData(sampleData);
                }else
                {
                    this.stop(true);
                    this._tradingHall.tradeStart(curProductInfo);
                    if(isTestServer && !cc.sys.isMobile){
                        MainController.showAutoDisappearAlertByText("quote push 重新启动k线区，Diff::"+ diff);
                    }
                }
            }

            if(productId && !this._isStopped && curProductInfo.getId() == productId)
            {
                //防止异常 数据包频率过快（小于0.5秒则忽略，等下次刷新）
                if(this._lastQuoteUpdateTime > 0 && (curTime - this._lastQuoteUpdateTime) < 500) {
                    cc.log("行情推送间隔小于0.5秒...本次不做刷新");
                    if (isTestServer) {
                        MainController.showAutoDisappearAlertByText("行情推送间隔小于0.5秒...本次不做刷新");
                    }
                    return;
                }
                //补最后一根蜡烛
                var klineType = this._tradingHall.getCurKlineType();
                if(this._tradingHall.getChartType() == GB.CHART_TYPE_CANDLE && klineType){
                    var klineData = Player.getInstance().getKlineData(productId, klineType);
                    var data = quoteDataList[0];
                    klineData.fixLatestData(data);
                }
                this._lastQuoteUpdateTime = cs.getCurTime();
                //立即刷新k线 这样能立即将行情表现出来
                this.refresh();

                //行情刷新后的调用
                if(this.afterGenerate)
                    this.afterGenerate();
            }
        }.bind(this));

        //刷新登录状态
        this._loginStateListener = cc.eventManager.addCustomListener(NOTIFY_REFRESH_LOGIN_STATE, function(event)
        {
            //重置我的交易面板
            this._selfBetPanel.reset();
            this._touchSelfBetPanel.reset();
            if(Player.getInstance().isLimited())
            {
                this._settleLine.reset();
            }
        }.bind(this));
    },

    cleanup:function()
    {
        cc.audioEngine.stopAllEffects();

        //调用一次图片清理
        cc.textureCache.removeUnusedTextures();
        //
        this.removeAllCustomListeners();

        this._super();
    },

    isStopped:function()
    {
        return this._isStopped;
    },

    initUI:function()
    {
        var size = this.getContentSize();

        //动作元素面板(包括截止时钟，线等等)
        var actionPanel = this._actionPanel = new ccui.Widget();
        this.addChild(actionPanel, 2);

        //k线/蜡烛面板
        var kLinePanel = this._kLinePanel = new ccui.Widget();
        this.addChild(kLinePanel);

        //分时图
        var linePanel = this._linePanel = new ccui.Widget();
        this.addChild(linePanel);

        //刻度线面板
        var scalePanel = this._sclalePanel = new ccui.Layout();
        scalePanel.setContentSize(size);
        this.addChild(scalePanel, 3);

        //左侧人物的下单点面板
        var fetchPanel = this._fetchPanel = new TrendSubFetchPanel(size);
        fetchPanel.setFormulas(this._formulas);
        this.addChild(fetchPanel, 3);

        //自己的下单面板(一般玩法)
        var selfBetPanel = this._selfBetPanel = new TrendSubSelfBetPanel(size);
        selfBetPanel.setFormulas(this._formulas);
        this.addChild(selfBetPanel, 3);

        //自己的下单点(触碰玩法)
        var touchSelfBetPanel = this._touchSelfBetPanel = new TouchSelfBetPanel(size);
        touchSelfBetPanel.setFormulas(this._formulas);
        this.addChild(touchSelfBetPanel, 3);

        //触碰模式面板
        var touchLinePanel = this._touchLinePanel = new TouchLinePanel(size);
        touchLinePanel.setFormulas(this._formulas);
        this.addChild(touchLinePanel, 3);

        ////历史订单面板
        //var historyPanel = this._historyPanel = new HistoryBetPanel(size);
        //this.addChild(historyPanel, 3);
        //historyPanel.setVisible(false);

        var cursorPanel = this._cursorPanel = new ccui.Layout();
        this.addChild(cursorPanel, 3);

        //y轴个刻度线数值和虚线
        for(var i = 0; i < 4; i++)
        {
            var posY = size.height * (i+1) * 0.2;
            var scaleValueText = new ccui.Text("00", FONT_ARIAL_BOLD, 22);
            scalePanel.addChild(scaleValueText);
            scaleValueText.setColor(cc.color(117, 120, 135));
            scaleValueText.setAnchorPoint(ANCHOR_RIGHT_BOTTOM);
            scaleValueText.setPosition(cc.p(size.width - 5, posY));
            this._scaleYValueTexts.push(scaleValueText);

            var dottedLine = new cc.Sprite("common_the_dotted_line.png");
            dottedLine.setOpacity(205);
            dottedLine.setAnchorPoint(ANCHOR_RIGHT);
            scalePanel.addChild(dottedLine);
            dottedLine.setPositionX((size.width));
            dottedLine.setPositionY(posY);
            this._scaleYDrawNodes.push(dottedLine);
        }

        //最多预留n个x轴刻度
        for(var i = 0; i < 6; i++)
        {
            var scaleValueText = new ccui.Text("00", FONT_ARIAL_BOLD, 22);
            actionPanel.addChild(scaleValueText);
            scaleValueText.setColor(cc.color(117, 120, 135));
            //scaleValueText.setAnchorPoint(ANCHOR_BOTTOM);
            scaleValueText.setPos(cc.p(-100, 10), ANCHOR_BOTTOM);
            this._scaleXValueTexts.push(scaleValueText);
        }

        //最多n条线 以纹理来画
        var maxSegmentNum = this._maxSampleNum - 1;
        var srcName = "line.png";
        var lineArray = this._lineArray = [];
        for(var i = 0; i < maxSegmentNum; i++){
            var line = new cc.Sprite(srcName);
            linePanel.addChild(line);
            line.setVisible(false);
            line.setAnchorPoint(ANCHOR_LEFT);
            lineArray.push(line);
        }

        //最多n个蜡烛
        var candleArray = this._candleArray = [];
        for(var i = 0; i < 120; i++){
            var candle = new CandleWidget();
            candle.setVisible(false);
            kLinePanel.addChild(candle);
            candleArray.push(candle);
        }

        //游标
        var cursorWidget = this._cursorWieget = new ccui.Widget();
        cursorWidget.setContentSize(150, 43);
        cursorWidget.setAnchorPoint(ANCHOR_RIGHT);
        cursorPanel.addChild(cursorWidget);
        cursorWidget.setPositionX(this.width);

        var cursorBgTouch = cc.Scale9Sprite("common_current_price_bg.png");
        cursorBgTouch.setInsetRight(11);
        cursorBgTouch.setInsetLeft(25);
        cursorBgTouch.setInsetBottom(0);
        cursorBgTouch.setInsetTop(0);
        cursorBgTouch.setContentSize(cursorWidget.getContentSize());
        cursorWidget.addChild(cursorBgTouch);
        cursorBgTouch.setPos(rightInner(cursorWidget), ANCHOR_RIGHT);
        cursorWidget._cursorBgTouch = cursorBgTouch;

        var cursorBgNormal = cc.Scale9Sprite("common_target_profit_bg.png");
        cursorBgNormal.setInsetRight(11);
        cursorBgNormal.setInsetLeft(25);
        cursorBgNormal.setInsetBottom(0);
        cursorBgNormal.setInsetTop(0);
        cursorBgNormal.setContentSize(cursorWidget.getContentSize());
        cursorWidget.addChild(cursorBgNormal);
        cursorBgNormal.setPos(rightInner(cursorWidget), ANCHOR_RIGHT);
        cursorWidget._cursorBgNormal = cursorBgNormal;
        cursorBgNormal.setVisible(false);

        //游标线
        var cursorLine = this._cursorLine = new cc.Sprite("common_the_line_price.png");//new cc.LayerColor(cc.color(171, 171, 171));
        //cursorLine.setContentSize(size.width, 2);
        cursorLine.setAnchorPoint(ANCHOR_RIGHT);
        cursorWidget.addChild(cursorLine);
        cursorLine.setPos(leftInner(cursorWidget), ANCHOR_RIGHT);
        cursorLine.setPositionXAdd(2);

        //游标值text
        var cursorText = this._cursorText = new ccui.Text("00", FONT_ARIAL_BOLD, 30);
        cursorWidget.addChild(cursorText);
        cursorText.setPosition(cc.p((cursorWidget.width - 10 )/ 2 + 10, cursorWidget.height * 0.5));

        //行情末端闪烁点
        var flashPointView = this._flashPointView = new cc.Sprite("#animation_point.png");
        cursorPanel.addChild(flashPointView, 9);
        flashPointView.setPositionX(-100);

        var flashAniSprite = new cc.Sprite("#animation_flash.png");
        flashPointView.addChild(flashAniSprite);
        flashAniSprite.runAction(new cc.RepeatForever(new cc.Sequence(
            new cc.FadeIn(0.45),
            new cc.FadeOut(0.45)
        )));
        flashAniSprite.setPos(centerInner(flashPointView));

        //趋势线
        var drawNode = this._drawNode = new cc.DrawNode();
        linePanel.addChild(drawNode);

        //休市面板
        var tradeUnablePanel = this._tradeUnablePanel = ccui.Layout();
        tradeUnablePanel.setContentSize(this.getContentSize());
        this.addChild(tradeUnablePanel);
        tradeUnablePanel.setVisible(false);

        var tipText = new ccui.Text("   交易暂停中  ", FONT_ARIAL_BOLD, 50);
        tipText.setColor(cc.color(217, 73, 47, 70));
        tradeUnablePanel.addChild(tipText);
        tipText.setPos(centerInner(tradeUnablePanel));
    },

    perOneSecondFunc:function()
    {

    },

    /**
     * @returns {ProductInfo}
     */
    getProductInfo:function()
    {
        return this._tradingHall._productInfo;
    },

    isSimulateTrade:function()
    {
        return this._tradingHall._isSimulateTrade;
    },

    refreshKLineChart:function(args)
    {
        var klineData = args["klineData"];                      //数据队列
        var startTime = args["startTime"];
        var endTime = args["endTime"];                        //
        var timeScale = args["timeScale"];                      //当前画布x轴方向数据[start-end]所表达的总时间尺度
        var contentSize = args["contentSize"];
        args["formulas"] = this._formulas;
        args["contentSize"] = this.getContentSize();

        //得到绘制数据
        DrawLineHelper.getDrawKLineData(args);

        //蜡烛图
        this.igniteCandles(args);

        var productInfo = klineData.getProductInfo();
        //===========x轴方向的刻度值============
        this.refreshXScales();

        //===========y轴刻度线数值=============
        this.refreshYScales(productInfo.getPrecise());

        //===========刷新自己下单的位置========
        this.refreshSelfBetsPos();

        //k线刷完后还有其他自定义的刷新
        if(this.refreshOther)
            this.refreshOther();
    },

    /**
     * 刷新走势线
     * 谨记这里的原则，所有参数不跟玩法相关，保持绘制的独立性 不耦合
     */
    refreshLineChart:function(args)
    {
        var lineData = args["lineData"];                      //数据队列
        var startIndex = args["startIndex"];
        var endIndex = args["endIndex"];                        //
        var stride = args["stride"];                            //采集步长
        var timeScale = args["timeScale"];                      //当前画布x轴方向数据[start-end]所表达的总时间尺度
        var importantTimeArray = args["importantTimeArray"];    //重要的时间点(这些点的绘制不容忽略)
        var contentSize = args["contentSize"];
        var isShowSolid = args["isShowSolid"];
        args["formulas"] = this._formulas;
        args["contentSize"] = this.getContentSize();
        args["vertices"] = this._vertices;

        var fillColor = this._fillColor;
        var drawNode = this._drawNode;
        if(drawNode){
            drawNode.removeFromParent();    //每次都需要移除重建，否则在某些android机上drawNode会消失
            this._drawNode = null;
        }
        drawNode = this._drawNode = new cc.DrawNode();
        this.addChild(drawNode, -1);
        //clear
        if(this._isAllowDrawDynamicChart)
            drawNode.clear();

        //得到绘制数据
        DrawLineHelper.getDrawLineData(args);

        var vertices = args["vertices"];
        var verticesCount = args["verticesCount"];

        ////记住画的最后一个点
        this._lastDrawPoint = vertices[verticesCount - 1];

        if(isShowSolid){
            var poygonY = 0;   //k线填充，底部需要留适当空白 note：最新版不留了,设为0
            var color = cc.color(0, 0, 0, 0);
            var fourVertices = new Array(4);
            //polygon填充， 拆分n个四边形
            for(var i = 1; i < verticesCount; i++)
            {
                var secondPoint = vertices[i - 1];
                var thirdPoint = vertices[i];
                if(!secondPoint.y || !thirdPoint.y)
                    return;
                fourVertices[0] = cc.p(secondPoint.x, poygonY);
                fourVertices[1] = secondPoint;
                fourVertices[2] = cc.p(thirdPoint.x, thirdPoint.y);
                fourVertices[3] = cc.p(thirdPoint.x, poygonY);

                drawNode.drawPoly(fourVertices, fillColor, 1, color);
            }
        }

        //外框线
        var lineArray = this._lineArray;
        var len = lineArray.length;
        for(var i = 0; i < len; i++) {
            var fromPos = vertices[i];
            var toPos = vertices[i+1];
            var line = lineArray[i];
            if((i + 2) > verticesCount || !fromPos || !toPos)
            {
                line.setVisible(false);
                continue;
            }
            line.setVisible(true);
            line.lineTo(fromPos, toPos);
        }


        var productInfo = lineData.getProductInfo();
        //===========x轴方向的刻度值============
        this.refreshXScales(lineData);

        //===========y轴刻度线数值=============
        this.refreshYScales(productInfo.getPrecise());

        //===========刷新自己下单的位置========
        this.refreshSelfBetsPos(lineData);

        //k线刷完后还有其他自定义的刷新
        if(this.refreshOther)
            this.refreshOther();
    },

    /**
     * 点亮蜡烛
     * @param args
     */
    igniteCandles:function(args)
    {
        //var candleDuration = args["candleDuration"];
        var klineData = args["klineData"];
        var startTime = args["startTime"];
        var endTime = args["endTime"];
        var formulas = args["formulas"];
        var dataArray = klineData.getDataArray();

        var startIndex = klineData.getIndexByTime(startTime);
        var endIndex = klineData.getIndexByTime(endTime);
        var candleArray = this._candleArray;
        var len = candleArray.length;
        var num = endIndex - startIndex + 1;
        var candleWidth = formulas.getXPosByValue(klineData.getType()) - formulas.getXPosByValue(0) - 2;
        var isPreBullish = false;
        for(var i = 0; i < len; i++)
        {
            var candle = candleArray[i];
            if(!candle)
                break;
            var data = dataArray[startIndex + i];
            if(i < num && data && data.isReal()){
                //if(endIndex == startIndex + i){
                //    cc.log("data::", data);
                //    cc.log("index::", startIndex + i);
                //    cc.log("data.getOpenValue()::", data.getOpenValue());
                //    cc.log("data.getCloseValue()::", data.getCloseValue());
                //}
                candle.setVisible(true);
                isPreBullish = candle.refresh(data, formulas, candleWidth, isPreBullish)
            }else{
                candle.setVisible(false);
            }
        }
    },

  /**
     * 刷新y轴的刻度线
     * @param {Number} precise(最小精度的小数位数)
     */
    refreshYScales:function(precise)
    {
        var size = this.getContentSize();
        for(var i = 0; i < this._scaleYDrawNodes.length; i++)
        {
            var text = this._scaleYValueTexts[i];
            var drawNode = this._scaleYDrawNodes[i];
            var posY = 0.2 * (i + 1) * size.height;
            //刻度对应的YValue值
            var scaleYValue = this._formulas.getYValueByPos(posY).toFixedCs(precise);
            text.setString(scaleYValue);
            //posY代表的刻度也需要适当调整,确保刻度精确对应整数个精度值
            posY = this._formulas.getYPosByValue(scaleYValue);
            drawNode.setPositionY(posY);
            text.setPositionY(posY);
        }
    },

    /**
     * 刷新自己下单点的
     */
    refreshSelfBetsPos:function()
    {
        this._selfBetPanel.refresh();
        this._touchSelfBetPanel.refresh();
        this._touchLinePanel.refresh();
    }
});

var CandleWidget = ccui.Widget.extend({

    ctor:function()
    {
        this._super();
        this._linePixes = 1;
        if(!cc.sys.isMobile){
            this._linePixes = 2;
        }

        this.initUI();
    },

    initUI:function()
    {
        //红色蜡芯
        var redLine = this._redLine = new cc.LayerColor();
        redLine.setIgnoreAnchorPointForPosition(false);
        redLine.setContentSize(this._linePixes, 0);
        redLine.setAnchorPoint(ANCHOR_BOTTOM);
        redLine.setColor(cs.RED);
        this.addChild(redLine);

        //绿色蜡芯
        var greenLine = this._greenLine = new cc.LayerColor();
        greenLine.setIgnoreAnchorPointForPosition(false);
        greenLine.setContentSize(this._linePixes, 0);
        greenLine.setAnchorPoint(ANCHOR_BOTTOM);
        greenLine.setColor(cs.GREEN);
        this.addChild(greenLine);

        //红色蜡柱
        var redPanel = this._redPanel = new cc.Scale9Sprite("icon_k_line_candle_red.png");
        redPanel.setAnchorPoint(ANCHOR_LEFT_BOTTOM);
        this.addChild(redPanel);

        //绿色蜡柱
        var greenPanel = this._greenPanel = new cc.Scale9Sprite("icon_k_line_candle_green.png");
        greenPanel.setAnchorPoint(ANCHOR_LEFT_BOTTOM);
        this.addChild(greenPanel);

        //白色蜡烛
        var whitePanel = this._whitePanel = new ccui.Layout();
        whitePanel.setBackGroundColorEx(cs.GREEN);
        whitePanel.setAnchorPoint(ANCHOR_LEFT);
        this.addChild(whitePanel);
    },

    refresh:function(candleInfo, formulas, candleWidth, isPreBullish)
    {
        //蜡柱
        var lowValue = candleInfo.getLowValue();
        var highValue = candleInfo.getHighValue();
        var beginTime = candleInfo.getBeginTime();
        var openValue = candleInfo.getOpenValue();
        var closeValue = candleInfo.getCloseValue();
        var type = candleInfo.getType();

        //留几个素空格
        var candleWidth = candleWidth || formulas.getXPosByValue(type) - formulas.getXPosByValue(0) - 2;

        this._whitePanel.setContentSize(candleWidth, this._linePixes);

        var isBullish = closeValue == openValue ? isPreBullish : closeValue > openValue;
        if(closeValue != openValue){
            this._whitePanel.setVisible(false);
            var candleStandard = this.getCandleStandard(isBullish);
            var candleHeight = Math.abs(formulas.getYPosByValue(openValue) - formulas.getYPosByValue(closeValue));
            candleHeight = Math.max(this._linePixes, candleHeight);
            candleStandard.setContentSize(candleWidth, candleHeight);
        }else{
            this._greenLine.setVisible(false);
            this._redLine.setVisible(false);
            this._greenPanel.setVisible(false);
            this._redPanel.setVisible(false);
            this._whitePanel.setVisible(true);
        }

        if(isBullish){
            this._whitePanel.setBackGroundColorEx(cs.RED);
        }else{
            this._whitePanel.setBackGroundColorEx(cs.GREEN);
        }

        //蜡芯
        var heartHeight = formulas.getYPosByValue(highValue) - formulas.getYPosByValue(lowValue);
        var candleWick = this.getCandleWick(isBullish);
        candleWick.setContentSize(this._linePixes, heartHeight);
        //计算蜡芯位置
        var linePosY = 0;
        if(isBullish){
            linePosY = formulas.getYPosByValue(lowValue) - formulas.getYPosByValue(openValue);
        }else{
            linePosY = formulas.getYPosByValue(lowValue) - formulas.getYPosByValue(closeValue);
        }
        candleWick.setPosition(candleWidth * 0.5, linePosY);

        var pos = null;
        if(isBullish){
            pos = cc.p(formulas.getXPosByValue(beginTime), formulas.getYPosByValue(openValue));
        }else{
            pos = cc.p(formulas.getXPosByValue(beginTime), formulas.getYPosByValue(closeValue));
        }
        this.setPosition(pos);

        return isBullish;
    },

    /**
     * 蜡烛
     * @param isBullish
     */
    getCandleStandard:function(isBullish)
    {
        var colorPanel = this._redPanel;
        this._redPanel.setVisible(true);
        this._greenPanel.setVisible(false);
        if(!isBullish){
            colorPanel = this._greenPanel;
            this._redPanel.setVisible(false);
            this._greenPanel.setVisible(true);
        }
        return colorPanel;
    },

    /**
     * 蜡芯
     * @param isBullish
     */
    getCandleWick:function(isBullish)
    {
        var colorLine = this._redLine;
        this._redLine.setVisible(true);
        this._greenLine.setVisible(false);
        if(!isBullish){
            colorLine = this._greenLine;
            this._redLine.setVisible(false);
            this._greenLine.setVisible(true);
        }
        return colorLine;
    }
});

