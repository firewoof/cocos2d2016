/**
 * Created by Jony on 2016/8/23.
 */

var UNION_PAY_TYPE_ZHIFU = 1; // 智付
var UNION_PAY_TYPE_OFFICIAL = 2; // 银联官方接口
var PAY_TYPE_IELPM = 3; // 易势支付:WEB方式支付
var PAY_TYPE_SWIFTPASS_WX = 4; // 浦发威富通:微信支付
var PAY_TYPE_GNETE = 5; // 网付通:WEB方式支付
var PAY_TYPE_APPLE_IAP = 6; // Apple IAP支付
var PAY_TYPE_ZN = 7; // 中南支付

var RechargeLayer = cc.Layer.extend({
    _payType:"",
    _amount:0,
    _minRechargeCount: 0,
    _maxRechargeCount: 0,
    _selectedNumBtn: undefined,
    _rechargeState: "UNPAY",


    ctor:function()
    {
        this._super();
        //UI
        this.initUI();
        //点击事件
        this.initAllClickFunc();

        this._minRechargeCount = ClientConfig.getInstance().getRechargeMinAmount();
        this._maxRechargeCount = ClientConfig.getInstance().getRechargeMaxAmount();
    },

    cleanup:function(){
        this.removeAllCustomListeners();
        this._rechargeResultListender = null;
        this._super();
    },

    initUI:function()
    {
        var layer = ccs.loadWithVisibleSize(res.RechargeLayer_json).node;
        // 加入到当前layer中。
        this.addChild(layer);
        // 按钮
        //
        var titlePanel = ccui.helper.seekWidgetByName(layer, "titlePanel");
        // 返回按钮
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");
        var rechargePanel = this._rechargePanel = ccui.helper.seekWidgetByName(layer, "rechargePanel");
        // 输入金额
        var inputMoneyEditBoxBg = ccui.helper.seekWidgetByName(rechargePanel, "inputMoneyEditBox");
        this._inputMoneyEditBox = new cc.EditBox(inputMoneyEditBoxBg.getContentSize(),new cc.Scale9Sprite("btn_common_white.png"));
        inputMoneyEditBoxBg.addChild(this._inputMoneyEditBox);
        this._inputMoneyEditBox.setPosition(centerInner(inputMoneyEditBoxBg));
        this._inputMoneyEditBox.setFontSize(24);
        this._inputMoneyEditBox.setFontColor(cs.BLACK);
        this._inputMoneyEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        this._inputMoneyEditBox.setPlaceHolder(LocalString.getString("PLEASE_INPUT_MONEY"));
        this._inputMoneyEditBox.setPlaceholderFontColor(cs.GRAY);
        this._inputMoneyEditBox.setPlaceholderFontSize(24);
        this._inputMoneyEditBox.setMaxLength(6);
        this._inputMoneyEditBox.setDelegate(this);

        var handPayPanel = this._handPayPanel = ccui.helper.seekWidgetByName(rechargePanel, "handPayPanel");
        var handPayPanelSelectedTag = this._handPayPanelSelectedTag = ccui.helper.seekWidgetByName(handPayPanel, "tag");
        var unionPayPanel = this._unionPayPanel = ccui.helper.seekWidgetByName(rechargePanel, "unionPayPanel");
        var unionPayPanelSelectedTag = this._unionPayPanelSelectedTag = ccui.helper.seekWidgetByName(unionPayPanel, "tag");
        if(isEducationVersion) {
            unionPayPanel.setVisible(false);
        }

        var appRechargeType = ClientConfig.getInstance().getAppRechargeType();
        var unionWidget = ccui.helper.seekWidgetByName(unionPayPanel, "union");
        unionWidget.setVisible(appRechargeType != PAY_TYPE_SWIFTPASS_WX);
        ccui.helper.seekWidgetByName(unionPayPanel, "weixin").setVisible(appRechargeType == PAY_TYPE_SWIFTPASS_WX);

        // 输入卡号
        var inputCardNoEditBoxBg = ccui.helper.seekWidgetByName(unionWidget, "inputCardNoEditBox");
        this._inputCardNoEditBox = new cc.EditBox(inputCardNoEditBoxBg.getContentSize(),new cc.Scale9Sprite("btn_common_white.png"));
        inputCardNoEditBoxBg.addChild(this._inputCardNoEditBox);
        if(appRechargeType == PAY_TYPE_ZN) {
            inputCardNoEditBoxBg.setVisible(true);            
            this._inputCardNoEditBox.setPosition(centerInner(inputCardNoEditBoxBg));
            this._inputCardNoEditBox.setFontSize(24);
            this._inputCardNoEditBox.setFontColor(cs.BLACK);
            this._inputCardNoEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
            this._inputCardNoEditBox.setPlaceHolder(LocalString.getString("PLEASE_INPUT_BANK_CARD"));
            this._inputCardNoEditBox.setPlaceholderFontColor(cs.GRAY);
            this._inputCardNoEditBox.setPlaceholderFontSize(24);
            this._inputCardNoEditBox.setMaxLength(30);
        }
        else {
            inputCardNoEditBoxBg.setVisible(false);
        }

        var confirmBtn = this._confirmBtn = ccui.helper.seekWidgetByName(rechargePanel, "confirmBtn");

        this.setAutoClick();

        //// 结果面板
        var resultPanel = this._resultPanel = ccui.helper.seekWidgetByName(layer, "resultPanel");
        var resultConfirmBtn = this._resultConfirmBtn = ccui.helper.seekWidgetByName(resultPanel, "confirmBtn");
        var resultStateTxt = this._resultStateTxt = ccui.helper.seekWidgetByName(resultPanel, "txt_result");
        var resultOrderNoTxt = this._resultOrderNoTxt = ccui.helper.seekWidgetByName(resultPanel, "txt_orderNo");
        var _resultOrderFailTxt = this._resultOrderFailTxt = ccui.helper.seekWidgetByName(resultPanel, "txt_orderFail");


        this._handPayPanel.setVisible(!ClientConfig.getInstance().getMask());
    },

    initAllClickFunc:function()
    {
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        // 选择数字
        var str = ClientConfig.getInstance().getRechargeAmountList();
        var arr = [];
        if(str != "") {
            arr = str.split(",");
        }

        for(var i = 0;i<arr.length;i++)
        {
            if(i==8) break;
            var k = arr[i];
            this["btn_"+i] = ccui.helper.seekWidgetByName(this._rechargePanel, "btn_"+ i);
            this["btn_"+i].setTitleText(MONEY_SIGN+k);
            this["btn_"+i].clickParam = k;
            this["btn_"+i].addTouchEventListener(function(sender, eventType)
            {
                switch (eventType)
                {
                    case ccui.Widget.TOUCH_BEGAN:

                        break;
                    case ccui.Widget.TOUCH_ENDED:
                        MainController.playBtnSoundEffect(sender);
                        this._inputMoneyEditBox.setString(sender.clickParam);

                        if(this._selectedNumBtn) {
                            this._selectedNumBtn.setBrightStyle(ccui.Widget.BRIGHT_STYLE_NORMAL);
                            this._selectedNumBtn.setTitleColor(cs.BLACK);
                        }
                        sender.setBrightStyle(ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT);
                        sender.setTitleColor(cc.color.WHITE);
                        this._selectedNumBtn = sender;
                        break;
                    case ccui.Widget.TOUCH_MOVED:
                        break;
                    case ccui.Widget.TOUCH_CANCELED:
                        cc.log("ccui.Widget.CANCELLED")
                        if(this._selectedNumBtn == sender) {
                            sender.setBrightStyle(ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT);
                            sender.setTitleColor(cc.color.WHITE);
                        }
                        else
                        {
                            sender.setBrightStyle(ccui.Widget.BRIGHT_STYLE_NORMAL);
                            sender.setTitleColor(cs.BLACK);
                        }
                        break;
                }
            }.bind(this));
        }
        if(arr.length<8)
        {
            for(var i = arr.length;i<8;i++)
            {
                this["btn_"+i] = ccui.helper.seekWidgetByName(this._rechargePanel, "btn_"+ i);
                this["btn_"+i].setVisible(false);
            }
        }

        // 人工充值
        this._handPayPanel.addClickEventListener(function(sender)
        {
            this.setPayPanelClicked("hand");
        }.bind(this));

        // 银联支付
        this._unionPayPanel.addClickEventListener(function(sender)
        {
            this.setPayPanelClicked("union");
        }.bind(this));

        // 点击确认按钮响应
        this._confirmBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect();

            var txtTip = "";
            var val = this._inputMoneyEditBox.getString().trim();
            var cardNo = this._inputCardNoEditBox.getString().trim();
            var appRechargeType = ClientConfig.getInstance().getAppRechargeType();
            if("" == val || isNaN(val))
            {
                txtTip = LocalString.getString("PLEASE_INPUT_MONEY");
            }
            else if(val< this._minRechargeCount || val >this._maxRechargeCount)
            {
                txtTip = (val< this._minRechargeCount)? cc.formatStr(LocalString.getString("RECHARGE_MIN_COUNT"), this._minRechargeCount) :
                    cc.formatStr(LocalString.getString("RECHARGE_MAX_COUNT"), this._maxRechargeCount);
            }
            else if(appRechargeType == PAY_TYPE_ZN && cardNo == "" && this._payType == "union") 
            {
                txtTip = LocalString.getString("PLEASE_INPUT_BANK_CARD");
            }
            else
            {
                this.startRecharge(val, cardNo);
            }

            if(txtTip != "")
            {
                MainController.showAutoDisappearAlertByText(txtTip);
            }

        }.bind(this));

        this._resultConfirmBtn.addClickEventListener(function(sender)
        {
            //this.showResultPanel(false);

            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        //
        this._rechargeResultListener = cc.eventManager.addCustomListener(NOTIFY_RECHARGE_RESULT, function(event){
           var data = event.getUserData();
           this.showResultPanel(true, data.state, data.amount);
        }.bind(this));
    },

    editBoxEditingDidBegin: function (editBox) {

        if(this._selectedNumBtn)
        {
            this._selectedNumBtn.setBrightStyle(ccui.Widget.BRIGHT_STYLE_NORMAL);
            this._selectedNumBtn.setTitleColor(cs.BLACK);
            this._selectedNumBtn = undefined;
        }
    },

    // 点击充值panel响应
    setPayPanelClicked: function( payType )
    {
        //MainController.playButtonSoundEffect();
        if(this._payType == payType) return;
        if(payType == "union")
        {
            this._handPayPanelSelectedTag.setVisible(false);
            this._unionPayPanelSelectedTag.setVisible(true);
            //this._handPayPanelSelectedTag.setBrightStyle(ccui.Widget.BRIGHT_STYLE_NORMAL);
            //this._unionPayPanelSelectedTag.setBrightStyle(ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT);
        }
        else
        {
            this._handPayPanelSelectedTag.setVisible(true);
            this._unionPayPanelSelectedTag.setVisible(false);
            //this._handPayPanelSelectedTag.setBrightStyle(ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT);
            //this._unionPayPanelSelectedTag.setBrightStyle(ccui.Widget.BRIGHT_STYLE_NORMAL);
        }

        this._payType = payType;
    },

    // 默认选择上次用户充值成功时的金额数以及支付方式
    setAutoClick: function()
    {
        var rechargeAmount = cc.sys.localStorage.getItem("rechargeAmount") || "";
        var rechargePayType = cc.sys.localStorage.getItem("rechargePayType") || "";
        if(rechargeAmount != "") {
            this._inputMoneyEditBox.setString(rechargeAmount);
        }
        // 默认选择银联支付方式
        if(rechargePayType == "") rechargePayType = "union";
        this.setPayPanelClicked(rechargePayType);
    },

    // 转入充值流程
    startRecharge: function(val, cardNo)
    {
        if(this._payType == "union")
        {
            // 获取报文xml，充值订单号
            var supportUnionPayType = JavascriptBridge.getInstance().getUnionPayType();
            if ("undefined" == typeof supportUnionPayType || supportUnionPayType == null) {
                supportUnionPayType = UNION_PAY_TYPE_OFFICIAL; // 默认用银联官方
            }

            var appRechargeType = ClientConfig.getInstance().getAppRechargeType();
            if(appRechargeType == UNION_PAY_TYPE_ZHIFU || appRechargeType == UNION_PAY_TYPE_OFFICIAL) {
                if(supportUnionPayType != appRechargeType)
                {
                    MainController.showAutoDisappearAlertByText("客户端不支持当前配置支付方式");
                    return;
                }
            }
            
            var payType = appRechargeType;
            var req = {
                auth: {amount: val,
                    payType: payType,
                    cardNo: cardNo
                }
            };
            new HttpRequest("accountRecharge", req, function(data){
                DataPool.curRechargeOrderNo = data.orderNo;
                // start智付sdk充值流程
                if(payType == UNION_PAY_TYPE_ZHIFU)
                {
                    JavascriptBridge.getInstance().startMerchantPay(data.xml, "00");
                }
                else if(payType == UNION_PAY_TYPE_OFFICIAL)
                {
                    JavascriptBridge.getInstance().startUnionPayOfficial(data.tn, "00");
                }
                else if(payType == PAY_TYPE_IELPM)
                {
                    var layer = new WebPayLayer(data.html);
                    MainController.pushLayerToRunningScene(layer);
                }
                else if(payType == PAY_TYPE_SWIFTPASS_WX)
                {
                    var layer = new WebPayLayer(data.html);
                    MainController.pushLayerToRunningScene(layer);
                }
                else if(payType == PAY_TYPE_GNETE)
                {
                    var layer = new WebPayLayer(data.html);
                    MainController.pushLayerToRunningScene(layer);
                }
                else if(payType == PAY_TYPE_APPLE_IAP) 
                {
                    JavascriptBridge.getInstance().appleIAPRequest(data.orderNo, data.productId);
                }
                else if(payType == PAY_TYPE_ZN)
                {
                    var layer = new WebPayLayer(data.html, null, "mcashier.95516.com");
                    MainController.pushLayerToRunningScene(layer);
                }
            });
        }
        else
        {
            var player = Player.getInstance();
            var curMoney = DataPool.isGuestLogin ? player.getTestCoin() : player.getBalance();
            var temp = DataPool.isGuestLogin? "模拟币" : "资金";
            if(curMoney >= 1000 && player.isGuest())
            {
                MainController.showAutoDisappearAlertByText("您的" + temp + "多于1000");
            }
            else {
                var req = {
                    auth: {amount: val,
                        payType:0
                    }
                };

                var url = DataPool.isGuestLogin ? "accountRechargeTestCoin" : "accountRecharge";
                new HttpRequest(url, req, function(data){

                    this.showResultPanel(true, "SUCCESS", data.amount);

                    player.initFromJson(data);

                    cc.sys.localStorage.setItem("rechargeAmount", data.amount);
                    cc.sys.localStorage.setItem("rechargePayType", "hand");
                }.bind(this));
            }
        }

    },

     showResultPanel: function(visible, state, amount)
     {
        this._resultPanel.setVisible(visible);
        this._rechargePanel.setVisible(!visible);

        if(visible)
        {
            this._resultOrderNoTxt.setVisible(false);
            this._resultOrderFailTxt.setVisible(state != "SUCCESS");

            if(state == "SUCCESS")
            {
                this._resultStateTxt.setString(cc.formatStr(LocalString.getString("RECHARGE_TIP_SUCCESS"), amount));
                this._resultStateTxt.setColor(cs.GREEN);

                if(DataPool.curRechargeOrderNo)
                {
                    this._resultOrderNoTxt.setString(cc.formatStr(LocalString.getString("RECHARGE_TIP_ORDER_NO"), DataPool.curRechargeOrderNo));
                    DataPool.curRechargeOrderNo = undefined;
                }
            }
            else
            {
                var str = LocalString.getString("RECHARGE_TIP_ERROR");
                this._resultStateTxt.setString(str);
                this._resultStateTxt.setColor(cs.RED);

                //this._resultOrderNoTxt.setString("如果在Wifi情况下无法充值，请尝试使用移动网络");
            }
        }
     }
}

);


// 智付SDk返回Cocos2dxActivity回调，在java调用
function G_rechargeResultCallback(tradeState)
{
    var callback = function(){
        if(tradeState == "SUCCESS")
        {
            new HttpRequest("rechargeQuery", {auth: {orderNo: DataPool.curRechargeOrderNo}}, function(data){
                if(data.is_trade_success) {
                    cc.eventManager.dispatchCustomEvent(NOTIFY_RECHARGE_RESULT, {state: tradeState, amount: data.amount});

                    cc.sys.localStorage.setItem("rechargeAmount", data.amount);
                    cc.sys.localStorage.setItem("rechargePayType", "union");

                    Player.getInstance().initFromJson(data);
                }
                else {
                     cc.eventManager.dispatchCustomEvent(NOTIFY_RECHARGE_RESULT, {state: "FAIL"});
                }
            });
        }
        else
        {
            cc.eventManager.dispatchCustomEvent(NOTIFY_RECHARGE_RESULT, {state: tradeState});
        }
    }
    //TODO
    cc.director.getRunningScene().runAction(new cc.Sequence(new cc.DelayTime(0.04), cc.callFunc(function() {
        callback();
    })));
}

// 处理Apple IAP Receipt
function G_handleAppleIapReceipt(receipt, orderNo)
{
    var md5 = Crypto.MD5(receipt);
    var receiptKey = "apple_iap_receipt_" + md5;
    var orderNoKey = "apple_iap_order_" + md5;
    if(orderNo == "") {
        orderNo = cc.sys.localStorage.getItem(orderNoKey);
        if(orderNo == null || orderNo == "") {
            return;
        }
    }
    else {
        cc.sys.localStorage.setItem(orderNoKey, orderNo);
    }

    cc.log("G_handleAppleIapReceipt, md5=" + md5 + ", orderNo=" + orderNo);

    if(cc.sys.localStorage.getItem(receiptKey) != null) {
        cc.log("G_handleAppleIapReceipt return true, md5=" + md5);
        return true;
    };

    var req = {
                orderNo:orderNo, receipt: receipt.replace(/\+/g, "%2B")
            };
    new HttpRequest("appleIapPayResult", req, function(data){
        if(data.is_trade_success) {
            // 更新状态, SKPaymentTransaction下次再调用的时候会再次调用G_handleAppleIapReceipt, 此时直接读取receiptKey的状态并return true
            cc.sys.localStorage.setItem(receiptKey, true);
            G_rechargeResultCallback("SUCCESS");
        }
    });

    cc.log("G_handleAppleIapReceipt return false");

    return false;
}