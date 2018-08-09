/**
 * Created by Administrator on 2016/12/20.
 */


var RedPacket = BaseLayer.extend({

    ctor: function(haveMoney, redPacketSumMoney){
        this._super();
        this._haveMoney = haveMoney;
        this._redPacketSumMoney = redPacketSumMoney;

        //设置点击退出层
        var touchPanel = new ccui.Layout();
        touchPanel.setContentSize(cc.winSize);
        this.addChild(touchPanel);
        touchPanel.setTouchEnabled(true);
        touchPanel.addClickEventListener(function(){
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        //设置关闭提示按钮
        var sprite = this._sprite = new cc.Sprite("#" + "btn_close.png");
        this.addChild(sprite);
        sprite.setPos(cc.p(cc.winSize.width/2, 90), ANCHOR_CENTER);

        this.initUIHaveMoney();

        this.initAllButtonClick();
    },

    initUIHaveMoney: function(){
        //创建红包层
        var rootLayer = this._rootLayer = ccs.load(res.RedPacket_json).node;
        this.addChild(rootLayer);
        rootLayer.setPos(cc.p(cc.winSize.width/2, cc.winSize.height/2 + 20),ANCHOR_CENTER);

        //红包背景
        var redPacketBg = this._redPacketBg = ccui.helper.seekWidgetByName(rootLayer, "redPacketBg");
        var rotate = this._rotate = ccui.helper.seekWidgetByName(rootLayer, "rotate");

        //没有钱的UI
        var noMoneyPanel = this._noMoneyPanel = ccui.helper.seekWidgetByName(rootLayer, "noMoneyPanel");
        noMoneyPanel.setVisible(true);
        var labelUp = this._labelUp = ccui.helper.seekWidgetByName(noMoneyPanel, "labelUp");
        var labelPanel = this._labelPanel = ccui.helper.seekWidgetByName(noMoneyPanel, "labelPanel");
        var labelDown = this._labelDown = ccui.helper.seekWidgetByName(noMoneyPanel, "labelPanel");
        labelPanel.setTouchEnabled(true);
        noMoneyPanel.setTouchEnabled(true);

        //var str = "<b t=1 u=1 c=FAED40>查看大家手气</b>";//<i n=icon_money s=1.5/>";
        //var newLabelDown = UIString.scriptToRichTextEx(str, labelDown.width, "Arial", 24, cc.BLACK, function(rt, el) {
        //    //cc.log("RichTextEx内部Button");
        //});
        //UICommon.replaceWidget(labelDown, newLabelDown);
        //newLabelDown.setPos(centerInner(labelDown.getParent()), ANCHOR_CENTER);
        //this._labelDown = newLabelDown;

        //有钱的UI
        var haveMoneyPanel = this._haveMoneyPanel = ccui.helper.seekWidgetByName(rootLayer, "haveMoneyPanel");
        haveMoneyPanel.setVisible(true);
        var moneyPanel = this._moneyPanel =  ccui.helper.seekWidgetByName(haveMoneyPanel, "moneyPanel");
        var openButton = this._openButton = ccui.helper.seekWidgetByName(haveMoneyPanel, "openButton");
        openButton.setTouchEnabled(true);
        haveMoneyPanel.setTouchEnabled(true);

        var moneyLabel = this._moneyLabel = ccui.helper.seekWidgetByName(haveMoneyPanel, "moneyLabel");
        var money = this._money =  new cc.LabelTTF(this._redPacketSumMoney, FONT_ARIAL_BOLD, 80);
        moneyPanel.addChild(money);
        money.setColor(cc.color(250,237,64));
        money.setPos(cc.p(moneyPanel.width/2,moneyPanel.height/2),ANCHOR_CENTER);

        var moneyCurrency = this._moneyCurrency = new cc.LabelTTF("元",FONT_ARIAL_BOLD, 24 );
        moneyPanel.addChild(moneyCurrency);
        moneyCurrency.setColor(cc.color(250,237,64));
        moneyCurrency.setPos(cc.p(moneyPanel.width/2,moneyPanel.height/2 - 15),ANCHOR_RIGHT);

        moneyPanel.arrangeChildrenCenter(1, [money, moneyCurrency]);
        this.setMoneyAligning(money, moneyCurrency, moneyPanel);

        //取当前层存储动画的animation
        var shark = this._shark = ccs.load(res.RedPacket_json).action;
        rootLayer.runAction(shark);
        //shark.play("animation0",false);

        if(this._haveMoney) {
            noMoneyPanel.setVisible(false);
            rotate.setVisible(true);
        }
        else{
            haveMoneyPanel.setVisible(false);
            rotate.setVisible(false);
        }

    },

    initAllButtonClick: function(){
        //打开红包获得人民币！
        this._openButton.addClickEventListener(function(sender){
            MainController.playButtonSoundEffect(sender);
            cc.log("sender::", sender);
            this._shark.play("animation1",false);
            cc.log("sende2222r::", sender);

            //动画播放晚后切换场景
            var delayTime = new cc.DelayTime(0.5);
            this.runAction(cc.Sequence(delayTime, cc.CallFunc(function () {
                var layer = new RedPacketRecord(1);
                MainController.popLayerFromRunningScene(this);
                MainController.pushLayerToRunningScene(layer);
            }.bind(this))));
            ////将金钱和货币紧靠
            //this._money.setString(Math.floor(Math.random() * 1000+1)) ;
            //this._moneyPanel.arrangeChildrenCenter(1, [this._money, this._moneyCurrency]);
            //
            ////重新设置金钱和货币坐标
            //this.setMoneyAligning(this._money, this._moneyCurrency, this._moneyPanel);

        }.bind(this));

        //打开红包领取纪录，看看谁是运气王
        this._labelPanel.addClickEventListener(function(sender){
            MainController.playButtonSoundEffect(sender);

            cc.log("RedPacketRecord");

            var haveMoney = false;
            var layer = new RedPacketRecord(haveMoney);
            MainController.popLayerFromRunningScene(this);
            MainController.pushLayerToRunningScene(layer);
        }.bind(this));
    },

    /**
     *
     * @param money
     * @param currency
     * @param node
     */
    setMoneyAligning: function(money, currency, node){
        //备份金钱和货币的原来坐标
        var moneyPosBack = money.getPosition();
        var currencyPosBack = currency.getPosition();

        cc.log("currency.x::", currencyPosBack.x);

        //将金钱设置到moneyPanel容器中心，并通过备份坐标获取偏移量
        money.setPos(cc.p(node.width/2, node.height/2), ANCHOR_CENTER);
        var posExcursion = cc.p(moneyPosBack.x - money.getPositionX(),moneyPosBack.y - money.getPositionY());

        //设置货币坐标
        currency.setPosition(currencyPosBack.x - posExcursion.x, currencyPosBack.y - posExcursion.y);

        cc.log("currency.x::", currency.getPositionX());

    }

})
