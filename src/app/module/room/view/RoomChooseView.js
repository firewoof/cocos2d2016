/**
 * Created by Administrator on 2017/2/21.
 */
GB.ROOM_TYPE_SELF = 2001;
GB.ROOM_TYPE_OTHER = 2002;
GB.ROOM_IDENTITY_MENBER = 0;
GB.ROOM_IDENTITY_HOUSER_HOLD = 1;
GB.ROOM_IDENTITY_MANAGER = 2;
GB.ROOM_IDENTITY_STRANGER = 3;


//房间选择界面
var RoomChooseView = BaseLayer.extend({
    ctor: function (controller) {
        this._super("RoomChooseView");

        this._controller = controller;

        cc.log("进入房间界面");
        this.setContentSize(cc.winSize);

        this.initUI();

        this.initAllClickFunc();

        this.addListener();
    },

    addListener:function(){
        this._roomChooseRefreshListener =  cc.eventManager.addCustomListener(NOTIFY_ROOM_CHOOSE_REFRESH,  function(event){
            this.doRequest();
        }.bind(this))
    },

    initUI: function (){
        //从studio中取出相应的组件
        var rootLayer = this._rootLayer = ccs.loadWithVisibleSize(res.RoomChoose_json).node;
        this.addChild(rootLayer);
        //rootLayer.setPos(leftTopInner(this), ANCHOR_LEFT_TOP);

        var bgPanel = this._bgPanel = ccui.helper.seekWidgetByName(rootLayer, "bgPanel");
        var imageFind = this._imageFind = ccui.helper.seekWidgetByName(rootLayer, "imageFind");
        var imageApply = this._imageApply = ccui.helper.seekWidgetByName(rootLayer, "imageApply");
        var imageRedDot = this._imageRedDot = ccui.helper.seekWidgetByName(imageApply, "imageRedDot");
        var imageCreate = this._imageCreate = ccui.helper.seekWidgetByName(rootLayer, "imageCreate");
        var titlePanel = this._titlePanel = ccui.helper.seekWidgetByName(bgPanel, "titlePanel");
        var titleTxt = this._titleTxt = ccui.helper.seekWidgetByName(titlePanel, "titleTxt");
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");
        //var textICreateRoom = this._textICreateRoom = ccui.helper.seekWidgetByName(rootLayer, "textICreateRoom");
        //var textIAddInRoom = this._textIAddInRoom = ccui.helper.seekWidgetByName(rootLayer, "textIAddInRoom");
        var listPanel = this._listPanel = ccui.helper.seekWidgetByName(rootLayer, "listPanel");
        var confirmBtn = this._confirmBtn = ccui.helper.seekWidgetByName(rootLayer, "confirmBtn");
        var textNoHaveContent = this._textNoHaveContent = ccui.helper.seekWidgetByName(rootLayer, "textNoHaveContent");

        listPanel.setContentSize(listPanel.width,  cc.winSize.height - this._titlePanel.height - imageFind.height - 40);
        //listPanel.setBackGroundColorEx(cs.RED);

        backBtn.setTouchEnabled(true);
        imageFind.setTouchEnabled(true);
        imageApply.setTouchEnabled(true);
        imageCreate.setTouchEnabled(true);
        confirmBtn.setTouchEnabled(true);
        textNoHaveContent.setVisible(false);

        var isShowCreateBtn = Player.getInstance().getRoomInfo().isShowCreateBtn();
        imageCreate.setVisible(false);
        if(isShowCreateBtn){
            imageCreate.setVisible(true);
        }

        setTimeout(function(){
            this.doRequest();
        }.bind(this), 0.05 * 1000);
    },

    doRequest:function(){
        var successCallBack = function(data){
            MainController.getInstance().hideLoadingWaitLayer();
            cc.log("refreshRoomList:", JSON.stringify(data));
            this.refreshRoomList(data);
        }.bind(this);
        HttpManager.requestQueryRoomList(successCallBack);
        MainController.getInstance().showLoadingWaitLayer();
    },

    initAllClickFunc: function(){
        var self = this;
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        //查询
        this._imageFind.addClickEventListener(function(sender)
        {
            cc.log("查询房间");
            var roomFindView = new RoomFindView();
            MainController.pushLayerToRunningScene(roomFindView);
        }.bind(this));

        //申请列表
        this._imageApply.addClickEventListener(function(sender)
        {
            this._imageRedDot.setVisible(false);
            var roomApplyView = new RoomApplyView();
            MainController.pushLayerToRunningScene(roomApplyView);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        //创建房间
        this._imageCreate.addClickEventListener(function(sender)
        {
            cc.log("创建房间");
            RoomModule.getInstance()._controller.showCreate();
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        //返回大厅
        this._confirmBtn.addClickEventListener(function(sender)
        {
            var successCallBack = function(data){
                MainController.getInstance().hideLoadingWaitLayer();
                Player.getInstance().setRoomId(undefined);
                cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_STATE_CHANGE);
                MainController.popLayerFromRunningScene(this);
            }.bind(this);
            HttpManager.requestEnterHall(successCallBack);
            MainController.getInstance().showLoadingWaitLayer();
            cc.log("返回大厅");
        }.bind(this));
    },

    refreshRoomList: function(data){
        var createRooms = data["createRooms"];
        var joinRooms = data["joinRooms"];
        var isShowApplyRedDot = data["unHandleApplyNum"] > 0;

        this._groupPanelArray = [];
        this._createRoomsArray = [];
        this._joinRoomsArray = [];
        this._listPanel.removeAllChildren();
        //申请列表红点
        this._imageRedDot.setVisible(isShowApplyRedDot);

        var textICreateRoom = new ccui.Text("我创建的房间",  FONT_ARIAL_BOLD, 24);
        textICreateRoom.setColor(cc.color(143, 162,176));
        var textIAddInRoom = new ccui.Text("我加入的房间",  FONT_ARIAL_BOLD, 24);
        textIAddInRoom.setColor(cc.color(143, 162,176));
        //我创建的房间
        if(createRooms  &&  createRooms.length > 0){
            this._createRoomsArray.push(textICreateRoom);
            for(var i=0; i< createRooms.length; i++){
                var info = createRooms[i];
                var cellInfo = new RoomChooseCellModel(info);
                var cell = new RoomChooseCellView(cellInfo);
                this._createRoomsArray.push(cell);
            }
            var groupPanelOwnCreate = UICommon.createPanelAlignWidgetsWithPadding(10, cc.UI_ALIGNMENT_VERTICAL_LEFT, this._createRoomsArray);
            this._groupPanelArray.push(groupPanelOwnCreate);
        }

        //加入的房间
        if(joinRooms.length > 0){
            this._joinRoomsArray.push(textIAddInRoom);
            for(var i=0; i< joinRooms.length; i++){
                var info = joinRooms[i];
                var cellInfo = new RoomChooseCellModel(info);
                var cell = new RoomChooseCellView(cellInfo);
                this._joinRoomsArray.push(cell);
            }
            var groupPanelIAddInRoom = UICommon.createPanelAlignWidgetsWithPadding(10, cc.UI_ALIGNMENT_VERTICAL_LEFT, this._joinRoomsArray);
            this._groupPanelArray.push(groupPanelIAddInRoom);
        }

        if(this._groupPanelArray.length > 0){
            var groupPanel = UICommon.createPanelAlignWidgetsWithPadding(10, cc.UI_ALIGNMENT_VERTICAL_CENTER, this._groupPanelArray);
            if(groupPanel.height >= this._listPanel.height){
                //var array = [];
                //array.push(groupPanel);
                //var panel = UICommon.createPanelAlignWidgetsWithPadding(10, cc.UI_ALIGNMENT_VERTICAL_CENTER, array);
                var scrollView = this._scrollView = UICommon.createScrollViewWithContentPanel(groupPanel,cc.size(groupPanel.width,this._listPanel.height));
                scrollView.setScrollBarEnabled(false);
                this._listPanel.addChild(scrollView);
                scrollView.setPos(cc.p(this._listPanel.width/2, this._listPanel.height), ANCHOR_TOP);
                this._scrollView.setSwallowTouches(false);
            }else{
                this._listPanel.addChild(groupPanel);
                groupPanel.setPos(cc.p(this._listPanel.width/2, this._listPanel.height), ANCHOR_TOP)
            }
            this._textNoHaveContent.setVisible(false);
        }else{
            this._textNoHaveContent.setVisible(true);
        }
    }

});

var RoomChooseCellView = ccui.Layout.extend({
    _roomChooseInfo: undefined,

    ctor: function (roomChooseInfo) {
        this._super();
        this._roomChooseInfo = roomChooseInfo;
        this.initUI();

        this.initAllClickFunc();

        if(roomChooseInfo)
            this.refresh(roomChooseInfo);

        this.addListener();
    },

    cleanup:function()
    {
        this._super();
        this.removeAllCustomListeners();
    },

    addListener:function()
    {
        this._roomNameChangeListener  = cc.eventManager.addCustomListener(NOTIFY_ROOM_NAME_CHANGE, function(event){
            var userData  = event.getUserData();
            var roomId = userData["roomId"];
            var roomName = userData["roomName"];
            if(this._roomChooseInfo && roomId == this._roomChooseInfo.getRoomId()){
                this._roomChooseInfo.setRoomName(roomName);
                this._textRoomName.setString(this._roomChooseInfo.getRoomName());
            }
        }.bind(this));

        this._roomProfileChangeListener  = cc.eventManager.addCustomListener(NOTIFY_ROOM_PROFILE_UPDATE, function(event){
            var userData  = event.getUserData();
            var roomId = userData["roomId"];
            var profile = userData["profile"];
            if(this._roomChooseInfo && roomId == this._roomChooseInfo.getRoomId()){
                this._roomChooseInfo.setIntro(profile);
                this._textIntro.setString(this._roomChooseInfo.getIntro());
            }
        }.bind(this));
    },

    initUI: function () {
        //从studio中取出相应的组件
        var rootLayer = this._rootLayer = ccs.load(res.RoomChooseCell_json).node;
        this.setContentSize(rootLayer.getContentSize());

        var panelRoomCell = this._panelRoomCell = ccui.helper.seekWidgetByName(rootLayer, "panelRoomCell");
        panelRoomCell.retain();
        panelRoomCell.removeFromParent();
        this.addChild(panelRoomCell);

        var panelBg = this._panelBg = ccui.helper.seekWidgetByName(panelRoomCell, "panelBg");
        var imageBg = this._imageBg = ccui.helper.seekWidgetByName(panelRoomCell, "imageBg");
        var imageBgInto = this._imageBgInto = ccui.helper.seekWidgetByName(panelRoomCell, "imageBgInto");
        var centerPanel = this._centerPanel = ccui.helper.seekWidgetByName(panelRoomCell, "centerPanel");
        var tradingHallPanel = this._tradingHallPanel = ccui.helper.seekWidgetByName(panelRoomCell, "tradingHallPanel");

        var btnConfirm = this._btnConfirm = ccui.helper.seekWidgetByName(panelRoomCell, "btnConfirm");
        var btnApply = this._btnApply = ccui.helper.seekWidgetByName(panelRoomCell, "btnApply");

        var panelHouseOwnerName = this._panelHouseOwnerName = ccui.helper.seekWidgetByName(panelRoomCell, "panelHouseOwnerName");
        var panelRoomMemberNumber = this._panelRoomMemberNumber = ccui.helper.seekWidgetByName(panelRoomCell, "panelRoomMemberNumber");
        var panelMoneyVolume = this._panelMoneyVolume = ccui.helper.seekWidgetByName(panelRoomCell, "panelMoneyVolume");
        var imageShare = this._imageShare = ccui.helper.seekWidgetByName(panelRoomCell, "imageShare");
        var textRoomName = this._textRoomName = ccui.helper.seekWidgetByName(panelRoomCell, "textRoomName");
        var textIntro = this._textIntro = ccui.helper.seekWidgetByName(panelRoomCell, "textIntro");

        var textHouseOwnerName = this._textHouseOwnerName = ccui.helper.seekWidgetByName(panelHouseOwnerName, "textHouseOwnerName");
        var textCurMemberNumber = this._textCurMemberNumber = ccui.helper.seekWidgetByName(panelRoomMemberNumber, "textCurMemberNumber");
        //var textSumMemberNumber = this._textSumMemberNumber = ccui.helper.seekWidgetByName(panelRoomMemberNumber, "textSumMemberNumber");
        var textMoneyVolume = this._textMoneyVolume = ccui.helper.seekWidgetByName(panelMoneyVolume, "textMoneyVolume");
        var ImageHouseIdentity = this._ImageHouseIdentity = ccui.helper.seekWidgetByName(panelHouseOwnerName, "ImageHouseIdentity");


        var avatar = this._avatar = new CircleAvatar(this._roomChooseInfo.getSimplePlayer());
        panelRoomCell.addChild(avatar);
        avatar.setScale(0.88);
        avatar.setSwallowTouches(true);
        avatar.setPos(cc.p(15, this.height/2),ANCHOR_LEFT);

        imageShare.setTouchEnabled(true);
        btnConfirm.setTouchEnabled(true);
        panelRoomCell.setTouchEnabled(true);
    },

    initAllClickFunc: function(){
        var self = this;

        this._imageShare.addClickEventListener(function(sender)
        {
            //this._clickCallBack();
            RoomModule.getInstance()._controller.showShare(this._roomChooseInfo.getRoomId());
        }.bind(this));

        //进入/申请按钮
        this._btnConfirm.addClickEventListener(function(sender)
        {
            //进入交易大厅
            if(this._roomChooseInfo.getRoomId() < 0){
                var  successCallBack  = function(data){
                    MainController.getInstance().hideLoadingWaitLayer();
                    Player.getInstance().setRoomId(null);
                    cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_STATE_CHANGE);
                    RoomModule.getInstance().popAllView();
                };
                HttpManager.requestEnterHall(successCallBack);
                MainController.getInstance().showLoadingWaitLayer();
            }
            else if(Player.getInstance().getRoomId() == this._roomChooseInfo.getRoomId())
            {
                RoomModule.getInstance().popAllView();
                cc.log("removeParents");
            }else{
                var successCallBack = function(data){
                    MainController.getInstance().hideLoadingWaitLayer();
                    cc.log("refreshEnterRoom:", JSON.stringify(data));
                    Player.getInstance().setRoomId(this._roomChooseInfo.getRoomId());
                    cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_STATE_CHANGE);
                    RoomModule.getInstance().popAllView();
                }.bind(this);
                HttpManager.requestEnterRoom(successCallBack,this._roomChooseInfo.getRoomId());
                MainController.getInstance().showLoadingWaitLayer();
            }
        }.bind(this));

        this._panelRoomCell.addClickEventListener(function(sender)
        {
            this.enterRoom();
        }.bind(this));

        this._btnApply.addClickEventListener(function(sender)
        {
            var successCallBack = function(data){
                cc.log("refreshApplyRoomListAAAAAAAA:", JSON.stringify(data));
                this._btnApply.setGray(true);
                this._btnApply.setTitleText("已申请");
                this._roomChooseInfo.setHasApply(true);
                this.refresh();
                //如果房间是不需要管理员同意的，则直接进入到房间界面
                cc.log("data.isMember:",JSON.stringify(data["isMember"]));
                cc.log("this._roomChooseInfo.getRoomId():",JSON.stringify(this._roomChooseInfo.getRoomId()));
                if(data["isMember"]){
                    Player.getInstance().setRoomId(this._roomChooseInfo.getRoomId());
                    cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_STATE_CHANGE);
                    MainController.popLayerFromRunningScene(RoomFindView.instance);
                    MainController.popLayerFromRunningScene(RoomChooseView.instance);
                    MainController.popLayerFromRunningScene(RoomManagementView.instance);
                    MainController.showAutoDisappearAlertByText("你已成功加入该房间！");
                }
            }.bind(this);
            HttpManager.requestApplyJoinRoom(successCallBack,this._roomChooseInfo.getRoomId());
        }.bind(this));
    },

    enterRoom:function()
    {
        if(this._roomChooseInfo.getRoomId() > 0){
            RoomModule.getInstance()._controller.showManager(this._roomChooseInfo);
        }
    },

    setTouchEnabled:function(bool)
    {
        this._panelRoomCell.setTouchEnabled(bool);
    },

    refresh: function(info){
        this._roomChooseInfo = info || this._roomChooseInfo;
        //预设值
        this._btnConfirm.setVisible(false);
        this._btnApply.setVisible(false);
        this._imageBg.setVisible(true);
        this._imageBgInto.setVisible(false);
        this._panelHouseOwnerName.setVisible(false);

        var player = this._roomChooseInfo.getSimplePlayer();
        //没有房主
        if(player){
            //头像
            this._avatar.refresh(player);
            this._avatar.setDetailEnabled(true);
            //房间简介
            this._panelHouseOwnerName.setVisible(true);
        }else{
            this._avatar.setAvatarSrc(null);
            this._avatar.setDetailEnabled(false);
        }

        this._centerPanel.setVisible(true);
        this._tradingHallPanel.setVisible(false);
        if(this._roomChooseInfo.getRoomId() < 0 ){
            this._centerPanel.setVisible(false);
            this._tradingHallPanel.setVisible(true);
            this._btnConfirm.setVisible(true);
            return;
        }

        if(player){
            this._textHouseOwnerName.setString(player.getNickName());
        }
        this._textRoomName.setString(this._roomChooseInfo.getRoomName());
        this._textMoneyVolume.setString(MONEY_SIGN+this._roomChooseInfo.getMonthTradeAmount());
        this._textCurMemberNumber.setString(this._roomChooseInfo.getMemberNum() +"/"+this._roomChooseInfo.getMaxNum());
        //this._textSumMemberNumber.setString();
        this._textIntro.setString(this._roomChooseInfo.getIntro());
        this._imageShare.setVisible(this._roomChooseInfo.getCanShare());
        this._parents = this._roomChooseInfo.getParentNode();

        //房间是否申请过
        if(this._roomChooseInfo.getHasApply()){
            this._btnApply.setGray(true);
            this._btnApply.setTitleText("已申请");
        }else{
            this._btnApply.setGray(false);
            this._btnApply.setTitleText("申请");
        }

        //是否是该房间的成员
        if(this._roomChooseInfo.getIsMember()){
            this._btnConfirm.setVisible(true);
        }
        else
        {
            this._btnApply.setVisible(true);
        }

        if(Player.getInstance().getRoomId() == this._roomChooseInfo.getRoomId()){
            cc.log("roomId:",Player.getInstance().getRoomId());
            this._imageBg.setVisible(false);
            this._imageBgInto.setVisible(true);
            //this._btnConfirm.setGray(true);
        }
    }

});

//分享界面
var RoomShareView = BaseLayer.extend({
    ctor: function (controller) {
        this._super("RoomShareView");

        this.setFullScreenOpaque(false);
        this.setOpacity(170);
        this._controller = controller;

        this.initUI();

        this.initAllClickFunc();

        //this.setVisible(false);
    },

    initUI: function () {
        //遮罩
        var mask = this._mask = new ccui.Layout();
        mask.setContentSize(cc.winSize);
        mask.setTouchEnabled(true);
        //mask.setBackGroundColorEx(cc.BLACK);
        //mask.setBackGroundColorOpacity(170);
        this.addChild(mask);
        //mask.setVisible(false);

        //从studio中取出相应的组件
        var shareLayer = this._shareLayer = ccs.loadWithVisibleSize(res.RoomShare_json).node;
        this.addChild(shareLayer);
        //shareLayer.setPos(centerInner(this),ANCHOR_CENTER);

        var imageBg = this._imageBg = ccui.helper.seekWidgetByName(shareLayer, "imageBg");
        var panelQQ = this._panelQQ = ccui.helper.seekWidgetByName(shareLayer, "panelQQ");
        var panelWB = this._panelWB = ccui.helper.seekWidgetByName(shareLayer, "panelWB");
        var panelQQSpace = this._panelQQSpace = ccui.helper.seekWidgetByName(shareLayer, "panelQQSpace");
        var panelFriendPen = this._panelFriendPen = ccui.helper.seekWidgetByName(shareLayer, "panelFriendPen");
        var panelWX = this._panelWX = ccui.helper.seekWidgetByName(shareLayer, "panelWX");

        imageBg.setTouchEnabled(true);
        panelQQ.setTouchEnabled(true);
        panelWB.setTouchEnabled(true);
        panelQQSpace.setTouchEnabled(true);
        panelFriendPen.setTouchEnabled(true);
        panelWX.setTouchEnabled(true);

        panelWB.setGray(true);

        imageBg.setScaleY(0);
    },

    initAllClickFunc: function(){
        this._panelWX.addClickEventListener(function(sender)
        {
            var successCallBack = function(data){
                cc.log("refreshShare:", JSON.stringify(data));
                this.hide();
                var shareData = {
                    platform: "Wechat",
                    title: "Wechat" +"title",
                    titleUrl: "http://www.irongyuan.com",
                    text: "Wechat" + "text",//新浪微博需要将titleUrl拼接到这里
                    imageUrl: "http://f1.sharesdk.cn/imgs/2014/02/26/owWpLZo_638x960.jpg"
                };
                JavascriptBridge.getInstance().ShareSDKShowShare(shareData);
            }.bind(this);
            HttpManager.requestRoomShare(successCallBack,this._roomId);
        }.bind(this));

        this._panelQQ.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            var successCallBack = function(data){
                cc.log("refreshShare:", JSON.stringify(data));
                this.hide();
                var shareData = {
                    platform: "QQ",
                    title: "QQ" +"title",
                    titleUrl: "http://www.irongyuan.com",
                    text: "QQ" + "text",//新浪微博需要将titleUrl拼接到这里
                    imageUrl: "http://f1.sharesdk.cn/imgs/2014/02/26/owWpLZo_638x960.jpg"
                };
                JavascriptBridge.getInstance().ShareSDKShowShare(shareData);
            }.bind(this);
            HttpManager.requestRoomShare(successCallBack,this._roomId);
        }.bind(this));

        this._panelWB.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            var successCallBack = function(data){
                cc.log("refreshShare:", JSON.stringify(data));
                this.hide();
                var shareData = {
                    platform: "SinaWeibo",
                    title: "SinaWeibo" +"title",
                    titleUrl: "http://www.irongyuan.com",
                    text: "SinaWeibo" + "text",//新浪微博需要将titleUrl拼接到这里
                    imageUrl: "http://f1.sharesdk.cn/imgs/2014/02/26/owWpLZo_638x960.jpg"
                };
                JavascriptBridge.getInstance().ShareSDKShowShare(shareData);
            }.bind(this);
            HttpManager.requestRoomShare(successCallBack,this._roomId);
        }.bind(this));

        this._panelQQSpace.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            var successCallBack = function(data){
                cc.log("refreshShare:", JSON.stringify(data));
                this.hide();
                var shareData = {
                    platform: "QZone",
                    title: "QZone" +"title",
                    titleUrl: "http://www.irongyuan.com",
                    text: "QZone" + "text",//新浪微博需要将titleUrl拼接到这里
                    imageUrl: "http://f1.sharesdk.cn/imgs/2014/02/26/owWpLZo_638x960.jpg"
                };
                JavascriptBridge.getInstance().ShareSDKShowShare(shareData);
            }.bind(this);
            HttpManager.requestRoomShare(successCallBack,this._roomId);

        }.bind(this));

        this._panelFriendPen.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            var successCallBack = function(data){
                cc.log("refreshShare:", JSON.stringify(data));
                this.hide();
                var shareData = {
                    platform: "WechatMoments",
                    title: "WechatMoments" +"title",
                    titleUrl: "http://www.irongyuan.com",
                    text: "WechatMoments" + "text",//新浪微博需要将titleUrl拼接到这里
                    imageUrl: "http://f1.sharesdk.cn/imgs/2014/02/26/owWpLZo_638x960.jpg"
                };
                JavascriptBridge.getInstance().ShareSDKShowShare(shareData);
            }.bind(this);
            HttpManager.requestRoomShare(successCallBack,this._roomId);

        }.bind(this));

        //遮罩
        this._mask.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            cc.log("遮罩");
            this.hide();
        }.bind(this));
    },

    setRoomId: function(roomId){
      this._roomId = roomId;
    },

    show: function(){
        cc.log("doOpenAction;;");
        if(this._imageBg.getNumberOfRunningActions() > 0 || this.getNumberOfRunningActions() > 0){
            return;
        }
        this._imageBg.runAction(new cc.Sequence(
            new cc.ScaleTo(0.15, 1, 1)
        ));
        this.runAction(new cc.Sequence(
            new cc.Show(),
            new cc.FadeTo(0.15,170)
        ));
    },

    hide: function(){
        cc.log("doCloseAction;;");
        if(this._imageBg.getNumberOfRunningActions() > 0 || this.getNumberOfRunningActions() > 0){
            return;
        }
        this._imageBg.runAction(new cc.Sequence(
            new cc.ScaleTo(0.15, 1, 0)
        ));
        this.runAction(new cc.Sequence(
            new cc.FadeOut(0.15),
            new cc.Hide()
        ));
    }
});