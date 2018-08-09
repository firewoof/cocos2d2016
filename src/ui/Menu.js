/**
 * Created by Administrator on 2016/12/13.
 */

GB.MENU_TYPE_RANK = 1001;
GB.MENU_TYPE_MAIL = 0;
GB.MENU_TYPE_MONEY_FLOW = 1002;             //1000+代表没有红点功能
GB.MENU_TYPE_CUSTOMER_SERVICE = 1;
GB.MENU_TYPE_SETTING = 1003;
GB.MENU_TYPE_SHOP = 1004;
GB.MENU_TYPE_SHARE = 1005;

var MenuUICell = ccui.Layout.extend({
    _imageName: undefined,     //图片名字
    _strTextName: undefined,   //文字
    _isEnabled: false,        //是否启用菜单中的元素，不启用则变黑

    ctor: function (featureInfo) {
        this._super();

        if(featureInfo){
            this._featureInfo = featureInfo;
            this.setContentSize(cc.size(0.2669*cc.winSize.width, 0.104* cc.winSize.height));
        }

        this.initUI();

        if(!isEducationVersion){
            this.addListener();
        }

        this.setCascadeOpacityAll();
    },

    cleanup:function()
    {
        this._super();
        this.removeAllCustomListeners();
    },

    initUI: function () {
        var textLabel = this._textLabel = new cc.LabelTTF(this._featureInfo.getFeatureName(), FONT_ARIAL_BOLD , 30);
        this.addChild(textLabel);
        textLabel.setPos(cc.p(this.width*0.3034,this.height/2),ANCHOR_LEFT);

        var sprite = this._sprite = new cc.Sprite("#"+this._featureInfo.getMenuImageSrc());
        this.addChild(sprite);
        sprite.setPos(cc.p(this.width*0.1067,this.height/2),ANCHOR_LEFT);

        var informationLabel = this._informationLabel =  new ccui.Text(this._featureInfo.getInformationNum(), FONT_ARIAL_BOLD, 28);
        this.addChild(informationLabel);
        informationLabel.setPos(cc.p(this.width*0.8989,this.height/2), ANCHOR_RIGHT);
        //informationLabel.setColor(cc.color(217,73,43));
        informationLabel.setColor(cc.color(255,255,255));

        var lineUp = this._lineUp = new cc.LayerColor(cc.color(67,71,83), 255.5, 1);
        this.addChild(lineUp);
        lineUp.setPos(cc.p(this.width,this.height - 0),ANCHOR_RIGHT);

        var lineDown = this._lineDown = new cc.LayerColor(cc.color(67,71,83), 255.5, 1);
        this.addChild(lineDown);
        lineDown.setPos(cc.p(this.width,0),ANCHOR_RIGHT);

        this.setEnabled(this._featureInfo.getIsEnabled());
        this.setTouchEnabled(this._featureInfo.getIsEnabled());

        if(this._featureInfo.getInformationNum() == 0){
            informationLabel.setVisible(false);
        }
    },

    addListener: function()
    {
        var self = this;

        //打开界面时候清除红点
        this._notifyLayerCloseListener = cc.eventManager.addCustomListener(NOTIFY_LAYER_CLOSE, function(event)
        {
            var layerName = event.getUserData();
            if(layerName == this._featureInfo.getAssociateLayerName() && this._featureInfo.getOpenClean() &&  Player.getInstance().getRedDotNumByType(this._featureInfo.getFeatureId()) > 0){
                self.requestClearRedDotMenu(this._featureInfo.getFeatureId());
            }
        }.bind(this));

        //清除红点
        this._notifyLayerOpenListener = cc.eventManager.addCustomListener(NOTIFY_LAYER_OPEN, function(event)
        {
            var layerName = event.getUserData();
            if(layerName == this._featureInfo.getAssociateLayerName()&&!this._featureInfo.getOpenClean() && Player.getInstance().getRedDotNumByType(this._featureInfo.getFeatureId()) > 0){
                self.requestClearRedDotMenu(this._featureInfo.getFeatureId());
            }
        }.bind(this));

        //红点刷新
        this._refreshRedDotListener = cc.eventManager.addCustomListener(NOTIFY_RED_DOT, function(event)
        {
            var type = event.getUserData();
            var curType = this._featureInfo.getFeatureId();
            if(curType == type || type == undefined){
                if(Player.getInstance().getRedDotNumByType(curType)>=100){
                    this.setInformation("99+");
                }else{
                    this.setInformation(Player.getInstance().getRedDotNumByType(curType));
                }
            }
        }.bind(this));
    },

    requestClearRedDotMenu: function(type){
        var successCallBack = function(data){
            cc.log("清除红点:", JSON.stringify(data));
            Player.getInstance().setRedDotNumByType(type,0);
            this.setInformation(Player.getInstance().getRedDotNumByType(type));
            cc.eventManager.dispatchCustomEvent(NOTIFY_RED_DOT);
        }.bind(this);
        HttpManager.requestClearRedDot(successCallBack, type);

    },

    setIsEnabled: function(isEnable){
        if(isEnable == false){
            this._sprite.setColor(cc.color(80, 83, 103));
            this._textLabel.setColor(cc.color(80, 83, 103));
        }else{
            this._sprite.setColor(cc.color.WHITE);
            this._label.setColor(cc.color.WHITE);
        }
    },

    setInformation: function(information){
        this._featureInfo.setInformationNum(information);
        this._informationLabel.setString(information);
        if(information ==0){
            this._informationLabel.setVisible(false);
        }else{
            this._informationLabel.setVisible(true);
        }
    },

    getId: function(){
        return this._featureInfo.getFeatureId();
    }
});

var Menu = cc.Layer.extend({
    _logBtnClickTimes: 0,
    _idLoginBtnClickTimes: 0,
    _actionStateOpen: false,
    _num1:0,
    _num2:0,
    _num3:0,
    ctor: function () {
        this._super();
        this.setContentSize(cc.winSize);

        this.testInfo();

        this.initUI();

        this.addListener();

        this.winCloseClick();

        this.initAllButtonClick();

        this.setCascadeOpacityAll();
    },

    cleanup:function()
    {
        this._super();
        this.removeAllCustomListeners();
    },

    testInfo: function(){
        var featureIdArray = [GB.MENU_TYPE_RANK, GB.MENU_TYPE_MAIL,GB.MENU_TYPE_MONEY_FLOW, GB.MENU_TYPE_CUSTOMER_SERVICE, GB.MENU_TYPE_SETTING, GB.MENU_TYPE_SHOP, GB.MENU_TYPE_SHARE];
        var featureArray =  this._featureArray = [];
        var dataMap = this._dataMap = {};

        var arrayFeatureName = this._arrayFeatureName = [];
        arrayFeatureName.push("排行榜");
        arrayFeatureName.push("邮件");
        arrayFeatureName.push("资金流水");
        arrayFeatureName.push("联系客服");
        arrayFeatureName.push("设置");
        arrayFeatureName.push("商城");
        arrayFeatureName.push("分享");

        var layerNameArray = [null, "MailLayer",null, "UserFeedbackLayer",null,null,null];

        var arrayFeatureImageSrc = this._arrayFeatureImageSrc = [];
        arrayFeatureImageSrc.push("icon_menu_top.png");
        arrayFeatureImageSrc.push("icon_menu_message.png");
        arrayFeatureImageSrc.push("icon_menu_icon_transaction_flow.png");
        arrayFeatureImageSrc.push("icon_menu_manual_work.png");
        arrayFeatureImageSrc.push("icon_menu_set.png");
        arrayFeatureImageSrc.push("icon_menu_shop.png");
        arrayFeatureImageSrc.push("icon_menu_share.png");

        for(var i = 0 ; i < featureIdArray.length ; i++){
            var featureInfo = new FeatureInfo();
            featureInfo.setFeatureId(featureIdArray[i]);
            featureInfo.setFeatureName(arrayFeatureName[i]);
            featureInfo.setIsEnabled(true);
            featureInfo.setMenuImageSrc(arrayFeatureImageSrc[i]);
            featureInfo.setInformationNum(0);
            featureInfo.setOpenClean(false);
            featureInfo.setAssociateLayerName(layerNameArray[i]);
            featureArray.push(featureInfo);
        }
        featureArray[1].setOpenClean(true);

        dataMap[GB.MENU_TYPE_RANK] =  featureArray[0];
        dataMap[GB.MENU_TYPE_MAIL] =  featureArray[1];
        dataMap[GB.MENU_TYPE_MONEY_FLOW] =  featureArray[2];
        dataMap[GB.MENU_TYPE_CUSTOMER_SERVICE] =  featureArray[3];
        dataMap[GB.MENU_TYPE_SETTING] =  featureArray[4];
        dataMap[GB.MENU_TYPE_SHOP] =  featureArray[5];
        dataMap[GB.MENU_TYPE_SHARE] =  featureArray[6];
    },

    initUI: function () {
        var rootLayer = this._rootLayer = ccs.load(res.MenuAllCell_json).node;
        rootLayer.setContentSize(rootLayer.width, cc.winSize.height);
        ccui.helper.doLayout(rootLayer);
        this.addChild(rootLayer);
        rootLayer.setPos(leftTopInner(this), ANCHOR_LEFT_TOP);
        rootLayer.setTouchEventEnabled(true);

        var bgPanel = this._bgPanel = ccui.helper.seekWidgetByName(rootLayer, "bgPanel");
        var closeBtn = this._closeBtn = ccui.helper.seekWidgetByName(rootLayer, "closeBtn");
        var closeArrow = this._closeArrow = ccui.helper.seekWidgetByName(rootLayer, "closeArrow");
        var menuPanel = this._menuPanel = ccui.helper.seekWidgetByName(rootLayer, "menuPanel");

        var menuArrProduct = this._menuArrProduct = [];
        var menuArrProductMap = this._menuArrProductMap = {};

        if(!isEducationVersion){
            var featureIdArrayKey = [GB.MENU_TYPE_RANK, GB.MENU_TYPE_MAIL, GB.MENU_TYPE_MONEY_FLOW, GB.MENU_TYPE_CUSTOMER_SERVICE,  GB.MENU_TYPE_SHARE, GB.MENU_TYPE_SETTING];
        }else if(isEducationVersion){
            var featureIdArrayKey = [GB.MENU_TYPE_SHOP, GB.MENU_TYPE_SETTING];
        }

        //创建对象
        for (var i = 0; i < featureIdArrayKey.length; i++) {
            var functionObj = this._dataMap[featureIdArrayKey[i]];
            var cell = new MenuUICell(functionObj);
            cell.setTouchEnabled(true);
            menuArrProduct.push(cell);
            menuArrProductMap[featureIdArrayKey[i]] = cell;
        }

        //this._rankCell = this._menuArrProduct[0];
        //this._mailCell = this._menuArrProduct[1];
        //this._moneyFlow = this._menuArrProduct[2];
        //this._customerServices =this._menuArrProduct[3];
        //this._setMenu = this._menuArrProduct[4];

        //将其加入到panel面板上
        var panel = UICommon.createPanelAlignWidgetsWithPadding(0, cc.UI_ALIGNMENT_VERTICAL_LEFT, menuArrProduct);
        if(panel.height > ( cc.winSize.height - 30)){
            panel =  UICommon.createScrollViewWithContentPanel(panel,cc.size(panel.width, rootLayer.height - 160));
        }
        bgPanel.addChild(panel);
        panel.setPos(cc.p(bgPanel.width/2, cc.winSize.height - 78), ANCHOR_TOP);

        var logBtn = this._logBtn = new ccui.Layout();
        logBtn.setTouchEnabled(true);
        logBtn.setContentSize(cc.size(120, 100));
        rootLayer.addChild(logBtn);
        logBtn.setPos(rightBottomInner(rootLayer), ANCHOR_RIGHT_BOTTOM);

        if(isTestServer || cc.sys.platform == cc.sys.WIN32)
        {
            var logBtn = this._logBtn = new ccui.Layout();
            logBtn.setTouchEnabled(true);
            logBtn.setContentSize(cc.size(120, 100));
            rootLayer.addChild(logBtn);
            logBtn.setPos(rightBottomInner(rootLayer), ANCHOR_RIGHT_BOTTOM);

            var idLoginBtn = this._idLoginBtn = new ccui.Layout();
            idLoginBtn.setTouchEnabled(true);
            idLoginBtn.setContentSize(cc.size(120, 100));
            rootLayer.addChild(idLoginBtn);
            idLoginBtn.setPos(leftBottomInner(rootLayer), ANCHOR_LEFT_BOTTOM);
        }

        this.setClose();

        this.refreshCellColor();

    },

    winCloseClick: function(){
        var blankTouchPanel = this._blankTouchPanel = new ccui.Layout();
        blankTouchPanel.setContentSize(cc.winSize.width - this._bgPanel.width, cc.winSize.height);
        this.addChild(blankTouchPanel);
        blankTouchPanel.setPos(rightTopInner(this), ANCHOR_RIGHT_TOP);
        blankTouchPanel.setTouchEnabled(true);
        blankTouchPanel.setSwallowTouches(false);
        blankTouchPanel.addClickEventListener(function(){
            this.doCloseAction();
        }.bind(this));
    },

    doCloseAction: function () {
        if(isEducationVersion){
            this.setClose();
        }
        else{
            this._actionStateOpen = false;
            cc.log("doCloseAction");
            //this._bgPanel.runAction( new cc.ScaleTo(0.35, 0, 1).easing(cc.easeBackOut()));
            this._bgPanel.runAction(new cc.FadeOut(0.15));
            this._menuPanel.runAction(new cc.Sequence(
                new cc.ScaleTo(0.35, 0, 1).easing(cc.easeBackOut()),
                new cc.CallFunc(function(){
                    this.setVisible(false);
                }.bind(this))
            ));

            this._closeArrow.runAction(new cc.RotateTo(0.1, 90));
        }
    },

    doOpenAction: function () {
        if(isEducationVersion){
            this.setOpen();
        }
        else{
            this._actionStateOpen = true;
            cc.log("doOpenActionMenu");
            //this._bgPanel.runAction(new cc.ScaleTo(0.35, 1, 1).easing(cc.easeBackIn()));
            this._bgPanel.setOpacity(0);
            this._bgPanel.runAction(new cc.Sequence(
                new cc.DelayTime(0.35),
                new cc.FadeIn(0.2)
            ));
            this._menuPanel.runAction(new cc.Sequence(
                new cc.CallFunc(function(){
                    this.setVisible(true);
                }.bind(this)),
                new cc.ScaleTo(0.35, 1, 1).easing(cc.easeBackIn())
            ));
            this._closeArrow.runAction(new cc.RotateTo(0.1, 0));
        }

    },

    setClose:function()
    {
        //this._bgPanel.setScale(0,1);
        this._bgPanel.setOpacity(0);
        this._menuPanel.setScale(0, 1);
        this._closeArrow.setRotation(90);
        this.setVisible(false);
    },

    setOpen: function(){
        this._bgPanel.setOpacity(255);
        this._menuPanel.setScale(1, 1);
        this._closeArrow.setRotation(0);
        this.setVisible(true);
    },

    refreshCellColor:function()
    {
        if(!isEducationVersion){
            var color = Player.getInstance().getOnline() ? cc.color.WHITE : cc.color(80, 83, 103);
            var cellArray = [this._menuArrProductMap[GB.MENU_TYPE_MAIL],this._menuArrProductMap[GB.MENU_TYPE_MONEY_FLOW],this._menuArrProductMap[GB.MENU_TYPE_CUSTOMER_SERVICE]];
            for(var i = 0; i < cellArray.length; i++)
            {
                var children = cellArray[i].getChildren();
                for(var k = 0; k < children.length; k++) {
                    var child = children[k];
                    if(child instanceof cc.Sprite){
                        child.setColor(color);
                    }
                    if(child instanceof cc.LabelTTF){
                        cc.log("child::", child);
                        child.setColor(color);
                    }
                }
            }
        }
    },

    addListener: function()
    {
        var self = this;
        //刷新登录状态
        this._refreshCellColorListener = cc.eventManager.addCustomListener(NOTIFY_REFRESH_LOGIN_STATE, function(event)
        {
            this.refreshCellColor();
        }.bind(this));

        //this._perOneSecondListener = cc.eventManager.addCustomListener(NOTIFY_PER_ONE_SECOND, function()
        //{
        //    if(this.getNumberOfRunningActions() == 0){
        //        cc.log("xxx");
        //        if(this._actionStateOpen){
        //            self.setOpen();
        //        }
        //        else if(!this._actionStateOpen){
        //            self.setClose();
        //        }
        //    }
        //
        //    var cusSecs = cs.getCurSecs();
        //    if(cusSecs % 2 == 0 && self._num3 == self._num2){
        //        if(this._actionStateOpen){
        //            this.doCloseAction();
        //            cc.log("close:",self._num2);
        //            cc.log("close:",self._num3);
        //        }else{
        //            this.doOpenAction();
        //            cc.log("open:",self._num2);
        //            cc.log("open:",self._num3);
        //        }
        //    }else if(self._num3 != self._num2){
        //        MainController.forceEndGame();
        //    }
        //}.bind(this));
    },

    initAllButtonClick: function () {
        if(!isEducationVersion){
            //this._bgPanel.addClickEventListener(function()
            //{
            //    this.doCloseAction();
            //}.bind(this));

            //排行榜
            this._menuArrProductMap[GB.MENU_TYPE_RANK].addClickEventListener(function (sender) {
                MainController.playButtonSoundEffect(sender);
                MainController.getInstance().showLoadingWaitLayer();
                HttpManager.sendRequest("weekWinList", {}, function (data) {
                    MainController.getInstance().hideLoadingWaitLayer();
                    MainController.getInstance().showRankLayer(data);
                    this.doCloseAction();
                }.bind(this));
            }.bind(this));

            //邮件
            this._menuArrProductMap[GB.MENU_TYPE_MAIL].addClickEventListener(function (sender) {
                MainController.playButtonSoundEffect(sender);
                if (!Player.getInstance().getOnline()) {
                    MainController.getInstance().showLoginLayer();
                } else {
                    MainController.getInstance().showMailLayer();
                }
                this.doCloseAction();
            }.bind(this));

            //联系客服
            this._menuArrProductMap[GB.MENU_TYPE_CUSTOMER_SERVICE].addClickEventListener(function (sender) {
                MainController.playButtonSoundEffect(sender);
                if (!Player.getInstance().getOnline()) {
                    MainController.getInstance().showLoginLayer();
                } else {
                    MainController.getInstance().showCustomerServiceLayer();
                }
                this.doCloseAction();
            }.bind(this));

            //交易流水
            this._menuArrProductMap[GB.MENU_TYPE_MONEY_FLOW].addClickEventListener(function (sender) {
                MainController.playButtonSoundEffect(sender);
                if (!Player.getInstance().getOnline()) {
                    MainController.getInstance().showLoginLayer();
                } else {
                    MainController.getInstance().showMoneyFlowLayer();
                }
                this.doCloseAction();
            }.bind(this));

            //设置
            this._menuArrProductMap[GB.MENU_TYPE_SETTING].addClickEventListener(function (sender) {
                MainController.playButtonSoundEffect(sender);
                MainController.getInstance().showSettingLayer();
                this.doCloseAction();
            }.bind(this));

            //分享
            this._menuArrProductMap[GB.MENU_TYPE_SHARE].addClickEventListener(function (sender) {
                MainController.playButtonSoundEffect(sender);
                MainController.getInstance().showShareLayer();
                this.doCloseAction();
            }.bind(this));
        }else if(isEducationVersion){
            //设置
            this._menuArrProductMap[GB.MENU_TYPE_SETTING].addClickEventListener(function (sender) {
                MainController.playButtonSoundEffect(sender);
                MainController.getInstance().showSettingLayer();
                this.doCloseAction();
            }.bind(this));
            // 商城
            this._menuArrProductMap[GB.MENU_TYPE_SHOP].addClickEventListener(function (sender) {
                MainController.playButtonSoundEffect(sender);
                MainController.getInstance().showShopLayer();
                this.doCloseAction();
            }.bind(this));
        }

        this._closeBtn.addClickEventListener(function (sender) {
            MainController.playButtonSoundEffect(sender);
            this.doCloseAction();
        }.bind(this));


        if(isTestServer || cc.sys.platform == cc.sys.WIN32){
            this._logBtn.addClickEventListener(function(sender) {
                this._logBtnClickTimes += 1;
                if(this._logBtnClickTimes < 6) return;

                var layer = new ClientLogLayer();
                MainController.pushLayerToRunningScene(layer);

                this._logBtnClickTimes = 0;
            }.bind(this));
            
            this._idLoginBtn.addClickEventListener(function(sender) {
                this._idLoginBtnClickTimes += 1;
                if(this._idLoginBtnClickTimes < 6){
                    return;
                }

                var idEditBox = new cc.EditBox(cc.size(600,82),new cc.Scale9Sprite("bg_common_bar.png"));
                idEditBox.setFontSize(24);
                idEditBox.setFontColor(cs.BLACK);
                idEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
                idEditBox.setPlaceHolder("输入唯一ID登录");
                idEditBox.setPlaceholderFontColor(cs.GRAY);
                idEditBox.setPlaceholderFontSize(24);

                var layer = new PopLayerWithOKButton(idEditBox, null, function(){
                    var id = this._id = idEditBox.getString().trim();
                    if(id != ""){
                        DataPool.showId = id;
                        DataPool.hasLogin = false;
                        cc.sys.localStorage.removeItem("aesKey");
                        cc.sys.localStorage.removeItem("accessToken");

                        ProxyClientLoginer.startup();
                    }
                }.bind(this));
                layer.getOkButton().setTitleText("登录");

                MainController.pushLayerToRunningScene(layer);

                this._idLoginBtnClickTimes = 0;
            }.bind(this));
        }
    }
});


