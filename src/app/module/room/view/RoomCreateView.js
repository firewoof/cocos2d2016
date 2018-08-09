/**
 * Created by Administrator on 2017/2/21.
 */
var RoomCreateView = BaseLayer.extend({
    ctor: function (controller) {
        this._super("RoomCreateView");

        this._controller = controller;

        this.setContentSize(cc.winSize);

        this.initUI();

        this.initAllClickFunc();
    },

    initUI: function () {
        //从studio中取出相应的组件
        var rootLayer = this._rootLayer = ccs.loadWithVisibleSize(res.RoomCreate_json).node;
        //ccui.helper.doLayout(rootLayer);
        this.addChild(rootLayer);

        var bgPanel = this._bgPanel = ccui.helper.seekWidgetByName(rootLayer, "bgPanel");
        var titlePanel = this._titlePanel = ccui.helper.seekWidgetByName(bgPanel, "titlePanel");
        var titleTxt = this._titleTxt = ccui.helper.seekWidgetByName(titlePanel, "titleTxt");
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");

        var confirmBtn = this._confirmBtn = ccui.helper.seekWidgetByName(bgPanel, "confirmBtn");

        var accordPanel = this._accordPanel = ccui.helper.seekWidgetByName(bgPanel,"accordPanel");
        var accordBtn = this._accordBtn = ccui.helper.seekWidgetByName(bgPanel,"accordBtn");

        cc.loader.loadJson("res/arts/RoomConfig.json",function(err, jsonData){
            this._configMap = jsonData;
        }.bind(this));

        backBtn.setTouchEnabled(true);
        confirmBtn.setTouchEnabled(true);
        accordBtn.setTouchEnabled(true);

        //房间名字editBox
        var roomNameEditBox = this.createEditBox("请输入房间名字");
        this.addChild(roomNameEditBox);
        roomNameEditBox.setPos(cc.p(this.width/2,this.height - titlePanel.height - 10),ANCHOR_TOP);
    },

    createEditBox: function(editBoxName){
        var editBox = this._editBox = new cc.EditBox(cc.size(1100,92),new cc.Scale9Sprite("bg_common_bottom_frame.png"));
        editBox.setName(editBoxName);
        //editBox.setPos(cc.p(3,450),ANCHOR_LEFT_BOTTOM);
        //editBox.setDelegate(this);
        editBox.setMaxLength(7);
        editBox.setPlaceHolder(editBoxName);
        editBox.setPlaceholderFont(FONT_ARIAL_BOLD,24);
        editBox.setFont(FONT_ARIAL_BOLD,24);
        editBox.setFontColor(cc.color(21,25,26));
        editBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);  //修改为不使用密文
        editBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        return editBox;
    },

    confirmBtnCallBack: function(){
        var editString  = this._editBox.getString().trim();
        if(editString.length == 0){
            MainController.showAutoDisappearAlertByText("房间名称不能为空");
            return;
        }
        var successCallBack = function(createRoomData){
            cc.log("refreshCreateRoomListAAAAAAAA:", JSON.stringify(createRoomData));
            //这里是创建完成，然后直接进入到房间界面
            var successCallBack = function(data){
                MainController.getInstance().hideLoadingWaitLayer();
                cc.log("refreshEnterRoom:", JSON.stringify(data));
                Player.getInstance().setRoomId(createRoomData["id"]);
                cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_STATE_CHANGE);
                MainController.popLayerFromRunningScene(this);
            }.bind(this);
            HttpManager.requestEnterRoom(successCallBack,createRoomData["id"]);
            MainController.getInstance().showLoadingWaitLayer();
        }.bind(this);
        HttpManager.requestCreateRoom(successCallBack, editString);
    },

    initAllClickFunc: function(){
        var self = this;
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            var roomChoose = new RoomChooseView();
            MainController.pushLayerToRunningScene(roomChoose);
            MainController.popLayerFromRunningScene(self);
        }.bind(this));

        //确认
        this._confirmBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            this.confirmBtnCallBack();
        }.bind(this));

        this._accordBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            MainController.getInstance().showUserAgreementLayer(this._configMap);
        }.bind(this));
    }
})