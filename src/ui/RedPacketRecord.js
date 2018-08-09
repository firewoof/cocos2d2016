/**
 * Created by Administrator on 2016/12/20.
 */

var RedPacketCell = ccui.Layout.extend({
    _isGetMoney: true,
    _getMoney: "8.00",
    _time: "12:00:00",
    _moneySumDt: "99元",
    ctor: function(){
        this._super();
        this.initUI();
    },

    initUI: function(){
        //获取当前层，并获得他的其他组件
        var rootLayer = this._rootLayer = ccs.load(res.RedPacketCell_json).node;
        this.setContentSize(rootLayer.getContentSize());
        this.addChild(rootLayer);

        var panel1 = this._panel1 = ccui.helper.seekWidgetByName(rootLayer, "panel1");
        var dayLabel = this._dayLabel = ccui.helper.seekWidgetByName(panel1, "dayLabel");
        var timeLabel = this._timeLabel = ccui.helper.seekWidgetByName(panel1, "timeLabel");

        var panel2 = this._panel2 = ccui.helper.seekWidgetByName(rootLayer, "panel2");
        var moneySum = this._moneySum = ccui.helper.seekWidgetByName(panel2, "moneySum");

        var panel3 = this._panel3 = ccui.helper.seekWidgetByName(rootLayer, "panel3");
        var moneyOverLabel = this._moneyOverLabel = ccui.helper.seekWidgetByName(panel3, "moneyOverLabel");

        var moneyLabel = this._moneyLabel =  new cc.LabelTTF(this._getMoney, FONT_ARIAL_BOLD, 24);
        panel3.addChild(moneyLabel);
        moneyLabel.setColor(cc.color(217,73,47));
        moneyLabel.setPos(cc.p(panel3.width - 20, panel3.height/2 - 20),ANCHOR_RIGHT);

        var moneyCurrency = this._moneyCurrency = new cc.LabelTTF("元",FONT_ARIAL_BOLD, 16);
        panel3.addChild(moneyCurrency);
        moneyCurrency.setColor(cc.color(217,73,47));
        moneyCurrency.setPos(cc.p(panel3.width , panel3.height/2 - 22),ANCHOR_RIGHT);

        //今天、昨天、更久
        if(this._timestamp - 24*60*60 < 0){
            this._dayLabel.setString("今天");
        }
        else if(this._timestamp - 24*60*60 >= 0 && this._timestamp - 24*60*60*2 < 0){
            this._dayLabel.setString("昨天");
        }
        else if(this._timestamp - 24*60*60*2 >= 0) {
            this._dayLabel.setString("更久");
        }

        //设置时间
        this._timeLabel.setString(this._time);

        //设置红包总金额
        this._moneySum.setString(this._moneySumDt);

        //设置是否抢到钱，如果有，则现实金额，否则现实“抢光了”
        if(this._isGetMoney){
            this._moneyOverLabel.setVisible(false);
            this._moneyLabel.setVisible(true);
            this._moneyCurrency.setVisible(true);
        }
        else{
            this._moneyOverLabel.setVisible(true);
            this._moneyLabel.setVisible(false);
            this._moneyCurrency.setVisible(false);
        }
    }

})

var UserInformationRecord = ccui.Layout.extend({

    ctor: function(redPacketInfo){
        this._super();
        if(redPacketInfo){
            //this._simplePlayer = redPacketInfo.getAvatarDt();
            this._time = redPacketInfo.getStrTimeDt();
            this._playerName = redPacketInfo.getUserNameDt();
            this._money = redPacketInfo.getMoneyLabelDt();
            this._timestamp = redPacketInfo.getTimestamp();
        }
        this.setContentSize(364, 52);

        this.initUI();
    },

    initUI: function(){

        //头像
        var userAvatar = this._userAvatar = new CircleAvatar();//this._simplePlayer
        this.addChild(userAvatar);
        userAvatar.setScale(0.4);
        userAvatar.setPos(cc.p(36, 20), ANCHOR_CENTER);

        //时间
        var timeLabel = this._timeLabel = new cc.LabelTTF(this._time, FONT_ARIAL_BOLD, 16);
        this.addChild(timeLabel);
        timeLabel.setColor(cc.color(143,162,176));
        timeLabel.setPos(cc.p(110, 7), ANCHOR_LEFT);

        //今天、昨天、更久
        if(this._timestamp - 24*60*60 < 0){
            var dayLabel = this._dayLabel = new cc.LabelTTF("今天", FONT_ARIAL_BOLD, 16);
        }
        else if(this._timestamp - 24*60*60 >= 0 && this._timestamp - 24*60*60*2 < 0){
            var dayLabel = this._dayLabel = new cc.LabelTTF("昨天", FONT_ARIAL_BOLD, 16);
        }
        else if(this._timestamp - 24*60*60*2 >= 0)
        {
            var dayLabel = this._dayLabel = new cc.LabelTTF("更久", FONT_ARIAL_BOLD, 16);
        }
        this.addChild(dayLabel);
        dayLabel.setColor(cc.color(143,162,176));
        dayLabel.setPos(cc.p(66, 7), ANCHOR_LEFT);

        //用户昵称、ID
        var userName = this._userName = new cc.LabelTTF( this._playerName, FONT_ARIAL_BOLD, 16);
        this.addChild(userName);
        userName.setColor(cc.color(21,25,26));
        userName.setPos(cc.p(66, 28), ANCHOR_LEFT);

        //在this上创建一条靠近底下边界的线
        var lineDown = this._lineDown = new cc.LayerColor(cc.color(143,162,176), 340, 1);
        this.addChild(lineDown);
        lineDown.setPos(cc.p(this.width/2, -10),ANCHOR_CENTER);

        //创建用户获得金额的ScrollView “moneyPanel”
        var moneyPanel = this._moneyPanel = new ccui.Layout();
        this.addChild(moneyPanel);
        //moneyPanel.setBackGroundColorEx(cc.GREEN);
        moneyPanel.setContentSize(200,24);
        moneyPanel.setPos(cc.p(364, 32), ANCHOR_RIGHT);

        var moneyLabel = this._moneyLabel =  new cc.LabelTTF(this._money, FONT_ARIAL_BOLD, 24);
        moneyPanel.addChild(moneyLabel);
        moneyLabel.setColor(cc.color(217,73,47));
        moneyLabel.setPos(cc.p(moneyPanel.width - 30, moneyPanel.height/2),ANCHOR_RIGHT);

        var moneyCurrency = this._moneyCurrency = new cc.LabelTTF("元",FONT_ARIAL_BOLD, 16);
        moneyPanel.addChild(moneyCurrency);
        moneyCurrency.setColor(cc.color(217,73,47));
        moneyCurrency.setPos(cc.p(moneyPanel.width - 10, moneyPanel.height/2 - 5),ANCHOR_RIGHT);

    }
})

/**
 * @haveGetMoney: bool
 * @type {Function}
 */
var RedPacketRecord = BaseLayer.extend({

    ctor: function(type){
        this._super();
        this._type = type;
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

        if(this._type == 1) {
            this.initUI();
        }
        else if(this._type == 2){
            this.initUITwo();
        }
        else if(this._type == 3){
            this.initUIThree();
        }
    },

    initUI: function(){
        var rootLayer = this._rootLayer = ccs.load(res.RedPacketRecord_json).node;
        this.addChild(rootLayer);
        rootLayer.setPos(cc.p(cc.winSize.width/2, cc.winSize.height/2 + 20),ANCHOR_CENTER);

        //红包背景
        var Bg = this._Bg = ccui.helper.seekWidgetByName(rootLayer, "Bg");

        //没有金钱的时候的UI
        var noGetMoneyPanel = this._noGetMoneyPanel = ccui.helper.seekWidgetByName(rootLayer, "noGetMoneyPanel");

        //获得金钱时UI容器
        var getMoneyPanel = this._getMoneyPanel = ccui.helper.seekWidgetByName(rootLayer, "getMoneyPanel");
        var moneyPanel = this._moneyPanel = ccui.helper.seekWidgetByName(getMoneyPanel, "moneyPanel");
        var moneyLabel = this._moneyLabel = ccui.helper.seekWidgetByName(getMoneyPanel, "moneyLabel");

        //红包总纪录容器
        var redSumPanel = this._RedSumPanel = ccui.helper.seekWidgetByName(rootLayer, "redSumPanel");
        var textRedPacketSum = this._textRedPacketSum = ccui.helper.seekWidgetByName(redSumPanel, "textRedPacketSum");

        //先显示所有层
        noGetMoneyPanel.setVisible(true);
        redSumPanel.setVisible(true);
        getMoneyPanel.setVisible(true);

        //根据类型将其他红包层设置为不可见
        noGetMoneyPanel.setVisible(false);
        redSumPanel.setVisible(false);

        //最上层“100元”的两个标签 “100”+“元”
        var money = this._money =  new cc.LabelTTF("100.00", FONT_ARIAL_BOLD, 40);
        moneyPanel.addChild(money);
        money.setColor(cc.color(250,237,64));
        money.setPos(cc.p(moneyPanel.width/2, moneyPanel.height/2),ANCHOR_CENTER);

        var moneyCurrency = this._moneyCurrency = new cc.LabelTTF("元",FONT_ARIAL_BOLD, 16);
        moneyPanel.addChild(moneyCurrency);
        moneyCurrency.setColor(cc.color(250,237,64));
        moneyCurrency.setPos(cc.p(moneyPanel.width/2, moneyPanel.height/2 - 5),ANCHOR_RIGHT);

        //将“100”和“元”组合起来
        moneyPanel.arrangeChildrenCenter(1, [money, moneyCurrency]);
        this.setMoneyAligning(money, moneyCurrency, moneyPanel);

        //创建其他用户的红包纪录信息数组
        var userInformationArray = this._userInformationArray = [];

        //存测试数据
        for(var i = 0; i < 8 ; i++){
            var redPacketInfo = new RedPacketInfo();
            //redPacketInfo.setAvatarDt();
            redPacketInfo.setMoneyLabelDt("200.00");
            redPacketInfo.setStrTimeDt("09:41:20");
            redPacketInfo.setUserNameDt("黄大帅");
            redPacketInfo.setTimestamp("今天");
            userInformationArray.push(redPacketInfo);
        }

        //创建排列数组
        var arrangeArray = [];

        //创建用户获得红包的组件
        for(var i = 0; i < userInformationArray.length; i++)
        {
            var test = new UserInformationRecord(userInformationArray[i]);
            //this.addChild(test);
            arrangeArray.push(test);
            //test.setPos(cc.p(cc.winSize.width/2,343), ANCHOR_CENTER);
        };

        //将其加入到panel面板上
        var panel = UICommon.createPanelAlignWidgetsWithPadding(10, cc.UI_ALIGNMENT_VERTICAL_LEFT, arrangeArray);
        //this.addChild(panel);
        //若panel长度超过规定的长度 则放进ScrollView中排列
        if(panel.height > (rootLayer.height - 150)){
            panel =  UICommon.createScrollViewWithContentPanel(panel,cc.size(panel.width, rootLayer.height - 160));
        }
        panel.setPos(cc.p(cc.winSize.width / 2, 495), ANCHOR_TOP);
        this.addChild(panel);

        this.reset();

    },

    initUITwo: function(){
        var rootLayer = this._rootLayer = ccs.load(res.RedPacketRecord_json).node;
        this.addChild(rootLayer);
        rootLayer.setPos(cc.p(cc.winSize.width/2, cc.winSize.height/2 + 20),ANCHOR_CENTER);

        //红包背景
        var Bg = this._Bg = ccui.helper.seekWidgetByName(rootLayer, "Bg");

        //没有金钱的时候的UI容器
        var noGetMoneyPanel = this._noGetMoneyPanel = ccui.helper.seekWidgetByName(rootLayer, "noGetMoneyPanel");

        //获得金钱时UI容器
        var getMoneyPanel = this._getMoneyPanel = ccui.helper.seekWidgetByName(rootLayer, "getMoneyPanel");
        var moneyPanel = this._moneyPanel = ccui.helper.seekWidgetByName(rootLayer, "moneyPanel");
        var moneyLabel = this._moneyLabel = ccui.helper.seekWidgetByName(rootLayer, "moneyLabel");

        //红包总纪录容器
        var redSumPanel = this._RedSumPanel = ccui.helper.seekWidgetByName(rootLayer, "redSumPanel");
        var textRedPacketSum = this._textRedPacketSum = ccui.helper.seekWidgetByName(redSumPanel, "textRedPacketSum");

        //先显示所有层
        noGetMoneyPanel.setVisible(true);
        redSumPanel.setVisible(true);
        getMoneyPanel.setVisible(true);

        //根据类型将其他红包层设置为不可见
        noGetMoneyPanel.setVisible(false);
        getMoneyPanel.setVisible(false);

        //测试数据
        var arrangeArray = [];
        for(var i = 0; i < 5; i++)
        {
            var redPacketCell = new RedPacketCell();
            //this.addChild(test);
            arrangeArray.push(redPacketCell);
            //test.setPos(cc.p(cc.winSize.width/2,343), ANCHOR_CENTER);
        };

        //将其加入到panel面板上
        var panel = UICommon.createPanelAlignWidgetsWithPadding(0, cc.UI_ALIGNMENT_VERTICAL_LEFT, arrangeArray);

        //若panel长度超过规定的长度 则放进ScrollView中排列
        if(panel.height > (rootLayer.height - 150)){
            panel =  UICommon.createScrollViewWithContentPanel(panel,cc.size(panel.width, rootLayer.height - 160));
        }
        this.addChild(panel);
        panel.setPos(cc.p(cc.winSize.width / 2, 515), ANCHOR_TOP);
    },

    initUIThree: function(){
        var rootLayer = this._rootLayer = ccs.load(res.RedPacketRecord_json).node;
        this.addChild(rootLayer);
        rootLayer.setPos(cc.p(cc.winSize.width/2, cc.winSize.height/2 + 20),ANCHOR_CENTER);

        //红包背景
        var Bg = this._Bg = ccui.helper.seekWidgetByName(rootLayer, "Bg");

        //没有金钱的时候的UI容器
        var noGetMoneyPanel = this._noGetMoneyPanel = ccui.helper.seekWidgetByName(rootLayer, "noGetMoneyPanel");

        //获得金钱时UI容器
        var getMoneyPanel = this._getMoneyPanel = ccui.helper.seekWidgetByName(rootLayer, "getMoneyPanel");
        var moneyPanel = this._moneyPanel = ccui.helper.seekWidgetByName(rootLayer, "moneyPanel");
        var moneyLabel = this._moneyLabel = ccui.helper.seekWidgetByName(rootLayer, "moneyLabel");

        //红包总纪录容器
        var redSumPanel = this._RedSumPanel = ccui.helper.seekWidgetByName(rootLayer, "redSumPanel");
        var textRedPacketSum = this._textRedPacketSum = ccui.helper.seekWidgetByName(redSumPanel, "textRedPacketSum");

        //先显示所有层
        noGetMoneyPanel.setVisible(true);
        redSumPanel.setVisible(true);
        getMoneyPanel.setVisible(true);

        //根据类型将其他红包层设置为不可见
        redSumPanel.setVisible(false);
        getMoneyPanel.setVisible(false);

        //创建其他用户的红包纪录信息数组
        var userInformationArray = this._userInformationArray = [];

        //存测试数据
        for(var i = 0; i < 8 ; i++){
            var redPacketInfo = new RedPacketInfo();
            //redPacketInfo.setAvatarDt();
            redPacketInfo.setMoneyLabelDt("200.00");
            redPacketInfo.setStrTimeDt("09:41:20");
            redPacketInfo.setUserNameDt("黄大帅");
            redPacketInfo.setTimestamp("今天");
            userInformationArray.push(redPacketInfo);
        }

        //创建排列数组
        var arrangeArray = [];

        //创建用户获得红包的组件
        for(var i = 0; i < userInformationArray.length; i++)
        {
            var test = new UserInformationRecord(userInformationArray[i]);
            //this.addChild(test);
            arrangeArray.push(test);
            //test.setPos(cc.p(cc.winSize.width/2,343), ANCHOR_CENTER);
        };

        //将其加入到panel面板上
        var panel = UICommon.createPanelAlignWidgetsWithPadding(10, cc.UI_ALIGNMENT_VERTICAL_LEFT, arrangeArray);
        //this.addChild(panel);
        //若panel长度超过规定的长度 则放进ScrollView中排列
        if(panel.height > (rootLayer.height - 150)){
            panel =  UICommon.createScrollViewWithContentPanel(panel,cc.size(panel.width, rootLayer.height - 160));
        }
        panel.setPos(cc.p(cc.winSize.width / 2, 495), ANCHOR_TOP);
        this.addChild(panel);
    },

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

    },
})