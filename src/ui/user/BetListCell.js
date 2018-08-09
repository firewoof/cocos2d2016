/**
 * Created by Jony on 2016/8/16.
 */
/*
* 用户详情面板持仓记录cell
* */
var BetListCell = ccui.Layout.extend({
    _betInfo:undefined,
    _isStopListener:false,

    ctor:function(betInfo)
    {
        this._super();
        this.setContentSize(cc.size(974,30));
        this._interval = 0;
        this._betInfo = betInfo;
        this._betInfo.isSettled = (betInfo.flowStatus == 1);

        this.initUI();

        //还未结算时 需要计时
        this.refresh();

        //未结算 立即刷新倒计时
        if(!this._betInfo.isSettled)
        {
            this.refreshCounter();
        }

        this.addListener();
    },

    addListener:function()
    {
        this._perOneSecondListener = cc.eventManager.addCustomListener(NOTIFY_PER_ONE_SECOND, function()
        {
            //cc.log("=====================================refreshCounter");
            //还没结算的
            if(!this._betInfo.isSettled && !this._isStopListener)
            {
                //cc.log("refreshCounter");
                this.refreshCounter();
            }
        }.bind(this));
    },

    cleanup:function()
    {
        this.removeAllCustomListeners();
        this._perOneSecondListener = null;
        this._super();
    },

    initUI:function( )
    {
        var txtArray = [];
        // 下注时间
        this._betTimeText = txtArray[0] = new ccui.Text("00:00:00 ", FONT_ARIAL_BOLD, 30);
        this._betTimeText.setColor(cs.GRAY);
        //type name
        this._productNameText = txtArray[1] = new ccui.Text("产品/名称(触碰)", FONT_ARIAL_BOLD, 30);
        this._productNameText.setColor(cs.GRAY);
        //投注额
        this._betAmountText = txtArray[2] = new ccui.Text(MONEY_SIGN +"00000.00", FONT_ARIAL_BOLD, 30);
        this._betAmountText.setColor(cs.RED);
        //betAmountText.setAnchorPoint(1, 0.5);
        // direction
        this._directionTxt = txtArray[3] = new ccui.Text("看涨到期", FONT_ARIAL_BOLD, 30);
        this._directionTxt.setColor(cs.GRAY);
        //收益/
        this._resultText = txtArray[4] = new ccui.Text(MONEY_SIGN + "00000.00", FONT_ARIAL_BOLD, 30);
        this._resultText.setColor(cs.RED);
        // 倒计时
        if(!this._betInfo.isSettled)
        {
            //
            this._clockIcon = txtArray[5] = new cc.Sprite("#icon_clock.png");
            //
            this._countDownText = txtArray[6] = new ccui.Text("00:00:00", FONT_ARIAL_BOLD, 30);
            this._countDownText.setColor(cs.BLACK);
        }

        var panel = UICommon.createPanelAlignWidgetsWithPadding(12, cc.UI_ALIGNMENT_HORIZONTAL_CENTER, txtArray);
        this.addChild(panel);
        panel.setPos(cc.p(0, this.height), ANCHOR_LEFT);
    },

    doRequest:function()
    {
        var betInfo = this._betInfo;
        var requestData = {
            "auth":{
                "pid": betInfo.pid,
                "orderIds":betInfo.orderId+""
            }
        };

        var responseCallBack = function(jsonData) {
            //
            var countList = jsonData["countList"];
            if(countList.length == 0)
            {
                cc.log("========================结算返回为空=停止update====");
                this._isStopListener = true;
                //cc.eventManager.removeListener(this._perOneSecondListener);
                return;
            }
            var betData = countList[0];
            var orderId = betData["orderId"];

            this._betInfo.result = betData["result"];
            this._betInfo.countMoney = betData["countMoney"];
            this._betInfo.isSettled = true;

            //cc.log("result:: ", result);
            this.refreshResult();

            this._clockIcon.setVisible(false);
            this._countDownText.setVisible(false);
        }.bind(this);

        var urlKey = "tradeQuery";
        new HttpRequest(urlKey, requestData, responseCallBack);
    },

    refresh:function(betInfo)
    {
        var betInfo = this._betInfo;

        this._betTimeText.setString(TimeHelper.formatSecs(betInfo.tradeTime, "HH:mm:ss"));
        this._productNameText.setString(betInfo.pname);
        this._betAmountText.setString(MONEY_SIGN + betInfo.money.toFixed(2));

        this.refreshResult(betInfo);
    },

    refreshResult:function()
    {
        var betInfo = this._betInfo;
        //
        var directionTxt = (betInfo.direction>0) ? LocalString.getString("BULLISH"):LocalString.getString("BEARISH");
        if(betInfo.isSettled) directionTxt = directionTxt + ((betInfo.result == 2)?LocalString.getString("TRADE_EQUAL"):LocalString.getString("PROFIT"));

        this._directionTxt.setString(directionTxt);

        var resultTxt;
        if(!this._betInfo.isSettled)
        {
            resultTxt = MONEY_SIGN + betInfo.money.toFixed(2);
        }
        else
        {
            resultTxt = MONEY_SIGN + betInfo.countMoney.toFixed(2);
        }
        this._resultText.setString(resultTxt);
    },

    refreshCounter:function()
    {
        var betInfo = this._betInfo;
        var isSettled = betInfo.isSettled;    //是否结算
        var resultTime = betInfo.countTime;
        var currentTime = cs.getCurSecs();
        if(!isSettled && currentTime > resultTime)
        {
            this._countDownText.setString(LocalString.getString("BET_LIST_SETTLED_ING"));
            //TODO
            this.runAction(new cc.Sequence(new cc.DelayTime(2.0), cc.callFunc(function() {
                this.doRequest();
            }.bind(this))));
            return;
        }

        if(!isSettled)
        {
            //倒计时
            var cd = resultTime - currentTime;
            if(cd <= 0)
                cd = 0;
            this._countDownText.setString(ALCommon.formatTime(cd));
        }
    }
});
