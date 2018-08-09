/**
 * 房间管理界面
 * Created by Administrator on 2017-03-29.
 */

var RoomManagementView = BaseLayer.extend({
    _normalMode: 1,                         //普通模式
    _deleteMode: 2,                         //删除模式
    _setManagerMode: 3,                     //设置管理员模式
    _mode:1,                                //默认普通模式
    _identity: 1001,                        //创建房间的身份
    _memberDataArray: undefined,           //数据成员数组
    _roomInfo: undefined,
    _controller:undefined,

    ctor: function (controller, simpleRoom) {
        this._super("RoomManagementView");
        this._controller = controller;

        this._memberDataArray = [];
        cc.log("RoomViewCreate");

        this.setContentSize(cc.winSize);
        //UI
        this.initUI();

        //点击事件
        this.initAllClickFunc();

        this.reset(simpleRoom);
    },

    initUI: function () {
        //从studio中取出相应的组件
        var rootLayer = this._rootLayer = ccs.loadWithVisibleSize(res.RoomManagement_json).node;
        this.addChild(rootLayer);

        var titlePanel = this._titlePanel = ccui.helper.seekWidgetByName(rootLayer, "titlePanel");
        var titleTextPanel = this._titleTextPanel = ccui.helper.seekWidgetByName(titlePanel, "titleTextPanel");
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");
        var cellPanel = this._cellPanel = ccui.helper.seekWidgetByName(rootLayer, "cellPanel");
        var btnPanel = this._btnPanel = ccui.helper.seekWidgetByName(rootLayer, "btnPanel");
        var deleteImage = this._deleteImage = ccui.helper.seekWidgetByName(rootLayer, "deleteImage");

        //邀请打勾图标（默认为非勾选状态）
        var invitePanelTouch = this._invitePanelTouch = ccui.helper.seekWidgetByName(cellPanel, "invitePanelTouch");
        var inviteBtnInvitePanel = this._inviteBtnInvitePanel = ccui.helper.seekWidgetByName(invitePanelTouch, "inviteBtnInvitePanel");
        var inviteBtnInviteSetOn = this._inviteBtnInviteSetOn = ccui.helper.seekWidgetByName(invitePanelTouch, "inviteBtnInviteSetOn");
        inviteBtnInvitePanel.setTouchEnabled(true);
        inviteBtnInviteSetOn.setVisible(false);

        //申请打勾图标（默认为勾选状态）
        var applyPanelTouch = this._applyPanelTouch = ccui.helper.seekWidgetByName(cellPanel, "applyPanelTouch");
        var applyBtnApplyPanel = this._applyBtnApplyPanel = ccui.helper.seekWidgetByName(applyPanelTouch, "applyBtnApplyPanel");
        var applyBtnApplySetOn = this._applyBtnApplySetOn = ccui.helper.seekWidgetByName(applyPanelTouch, "applyBtnApplySetOn");
        applyBtnApplyPanel.setTouchEnabled(true);

        var deleteBtn = this._deleteBtn = ccui.helper.seekWidgetByName(btnPanel, "deleteBtn");
        var confirmBtn = this._confirmBtn = ccui.helper.seekWidgetByName(btnPanel, "confirmBtn");
        var dissolveBtn = this._dissolveBtn = ccui.helper.seekWidgetByName(btnPanel, "dissolveBtn");
        var exitBtn = this._exitBtn = ccui.helper.seekWidgetByName(btnPanel, "exitBtn");
        var applyBtn = this._applyBtn = ccui.helper.seekWidgetByName(btnPanel, "applyBtn");

        deleteBtn.setVisible(false);
        confirmBtn.setVisible(false);
        dissolveBtn.setVisible(false);
        exitBtn.setVisible(false);
        applyBtn.setVisible(false);

        deleteImage.setTouchEnabled(true);

        //房间名称和修改按钮
        var roomNameText = this._roomNameText = cc.LabelTTF("",FONT_ARIAL_BOLD, 42);
        this._titleTextPanel.addChild(roomNameText);
        var roomNameEditBtn = this._roomNameEditBtn = new ccui.Button("icon_input_name.png","","", ccui.Widget.PLIST_TEXTURE);
        this._titleTextPanel.addChild(roomNameEditBtn);

        //房间简介
        var roomIntroCell = this._roomIntroCell = this.createRoomGBCell(LocalString.getString("ROOM_PROFILE"), "");
        this.addChild(roomIntroCell);
        roomIntroCell._arrowRight.setVisible(false);

        //设置管理员
        var roomSetManagerCell = this._roomSetManagerCell = this.createRoomGBCell(LocalString.getString("ROOM_SET_MANAGER"),"");
        this.addChild(roomSetManagerCell);
        roomSetManagerCell.setPositionY(-1000);

        //this.createEditBox();
    },

    reset:function(simpleRoomInfo)
    {
        this._roomNameEditBtn.setVisible(false);
        this._deleteBtn.setVisible(false);
        this._confirmBtn.setVisible(false);
        this._dissolveBtn.setVisible(false);
        this._exitBtn.setVisible(false);
        this._applyBtn.setVisible(false);
        this._roomSetManagerCell.setVisible(false);

        if(simpleRoomInfo){
            this._roomNameText.setString(simpleRoomInfo.getRoomName());
            this._roomNameText.setPos(centerInner(this._titleTextPanel), ANCHOR_CENTER);
            this._roomIntroCell.setPos(cc.p(cc.winSize.width * 0.5, cc.winSize.height - this._titlePanel.height - 12), ANCHOR_TOP);
            this._roomIntroCell._textContent.setString(simpleRoomInfo.getIntro());

            //准备重新请求
            var successCallBack = function(data){
                MainController.getInstance().hideLoadingWaitLayer();
                cc.log("refreshRoomManagerList:", JSON.stringify(data));
                var info = new RoomModel(data);
                this.refresh(info);
                MainController.popLayerFromRunningScene(RoomChooseCellView.instance);
            }.bind(this);
            HttpManager.requestQueryRoomDetailInfo(successCallBack,simpleRoomInfo.getRoomId());
            MainController.getInstance().showLoadingWaitLayer();
        }
    },

    refresh:function(roomInfo){
        this._roomInfo = roomInfo;
        this._memberDataArray = this._roomInfo.getRoomMemberDataArray();
        cc.log("inviteBtnInviteSetOn:",this._roomInfo.getInviteFlag());
        cc.log("applyBtnApplySetOn:",this._roomInfo.getAuthFlag());

        //创建一个存储选中ID的数组
        this._arrayCheckedId = {};
        //权限状态初始化
        this._inviteBtnInviteSetOn.setVisible(this._roomInfo.getInviteFlag());
        this._applyBtnApplySetOn.setVisible(this._roomInfo.getAuthFlag());

        //标题和修改按钮排版
        this._roomNameText.setString(this._roomInfo.getRoomName());
        this._roomNameText.setPos(centerInner(this._titleTextPanel), ANCHOR_CENTER);
        this._roomNameEditBtn.setPos(rightOutter(this._roomNameText), ANCHOR_LEFT);
        this._roomNameEditBtn.setPositionXAdd(5);

        //创建一个Cell数组
        var roomCellArray = this._roomCellArray = [];

        var roomIntroCell  = this._roomIntroCell;
        roomIntroCell.retain();
        roomIntroCell.removeFromParent();
        roomCellArray.push(roomIntroCell);

        //预设
        this._roomNameEditBtn.setVisible(false);
        this._dissolveBtn.setVisible(false);        //解散房间Btn
        this._exitBtn.setVisible(false);            //退出房间Btn
        this._cellPanel.setVisible(false);          //权限Cell
        this._deleteImage.setVisible(false);        //删除成员图片
        this._roomSetManagerCell.setVisible(false);
        this._inviteBtnInviteSetOn.setGray(true);

        //根据身份来显示不同的UI
        if(GB.ROOM_IDENTITY_HOUSER_HOLD == this._roomInfo.getRoomIdentity()){
            //权限Cell
            this._cellPanel.retain();
            this._cellPanel.removeFromParent();
            roomCellArray.push(this._cellPanel);
            this._cellPanel.setVisible(true);

            //设置管理员
            var roomSetManagerCell = this._roomSetManagerCell;
            roomSetManagerCell.retain();
            roomSetManagerCell.removeFromParent();
            roomSetManagerCell.setVisible(true);
            roomCellArray.push(roomSetManagerCell);

            this._roomNameEditBtn.setVisible(true);

            this._dissolveBtn.setVisible(true);
            this._deleteImage.setVisible(true);
            roomIntroCell._arrowRight.setVisible(true);
            this._inviteBtnInviteSetOn.setGray(false);
        }else if(GB.ROOM_IDENTITY_MANAGER == this._roomInfo.getRoomIdentity()){
            //权限Cell
            this._cellPanel.retain();
            this._cellPanel.removeFromParent();
            this._cellPanel.setVisible(true);
            roomCellArray.push(this._cellPanel);
            //邀请权限变灰
            this._inviteBtnInviteSetOn.setGray(true);
            //离开房间Btn
            this._exitBtn.setVisible(true);
            this._deleteImage.setVisible(true);
            roomIntroCell._arrowRight.setVisible(true);
        }else if(GB.ROOM_IDENTITY_MENBER == this._roomInfo.getRoomIdentity()){
            //成员看到的房间简介与管理员以及房主的不一致
            roomIntroCell._arrowRight.setVisible(false);
            roomIntroCell._textTitle.setVisible(false);
            roomIntroCell._textContent.setVisible(false);
            var Intro = new cc.LabelTTF(LocalString.getString("ROOM_CONFIRM_BACK_OUT"), "Arial", 24);
            Intro.setAnchorPoint(0,0.5);
            Intro.setColor(cc.color(143,162,176));
            roomIntroCell.addChild(Intro);
            Intro.setPos(cc.p(14,roomIntroCell.height/2),ANCHOR_LEFT);
            var str = this._roomInfo.getIntro();
            if(str.trim().length > 0){
                Intro.setString(str.trim());
            }
            else{
                Intro.setString(LocalString.getString("ROOM_PROFILE_NONE_TIPS"));
            }
            //离开房间Btn
            this._exitBtn.setVisible(true);
        }
        else if(GB.ROOM_IDENTITY_STRANGER == this._roomInfo.getRoomIdentity()){
            cc.log("cececeeeec");
            //成员看到的房间简介与管理员以及房主的不一致
            roomIntroCell._arrowRight.setVisible(false);
            roomIntroCell._textTitle.setVisible(false);
            roomIntroCell._textContent.setVisible(false);
            var Intro = new cc.LabelTTF(LocalString.getString("ROOM_CONFIRM_BACK_OUT"), "Arial", 24);
            Intro.setAnchorPoint(0,0.5);
            Intro.setColor(cc.color(143,162,176));
            roomIntroCell.addChild(Intro);
            Intro.setPos(cc.p(14,roomIntroCell.height/2),ANCHOR_LEFT);
            var str = this._roomInfo.getIntro();
            if(str.trim().length > 0){
                Intro.setString(str.trim());
            }
            else{
                Intro.setString(LocalString.getString("ROOM_PROFILE_NONE_TIPS"));
            }
            //申请房间Btn
            this._applyBtn.setVisible(true);
            if(this._roomInfo.hasApply()){
                this._applyBtn.setVisible(false);
            }
        }

        var groupArray = this._groupArray = [];
        var cellPanel = this._cellPanel = UICommon.createPanelAlignWidgetsWithPadding(10, cc.UI_ALIGNMENT_VERTICAL_CENTER, roomCellArray);
        cellPanel.setPos(cc.p(this.width/2, this.height - this._titlePanel.height), ANCHOR_TOP);
        groupArray.push(cellPanel);

        //初始化成员列表
        var roomMemberCellArray = this._roomeMemberCellArray = [];
        for(var i = 0; i < this._memberDataArray.length; i++){
            if(this._memberDataArray[i]!=null){
                var memberCell = new RoomMemberCellView(this._memberDataArray[i],this._normalMode);
                memberCell.addClickCallBack(this.getCheckedPlayerID.bind(this));
                roomMemberCellArray.push(memberCell);
            }
        }
        this._deleteImage.retain();
        this._deleteImage.removeFromParent();
        roomMemberCellArray.push(this._deleteImage);

        //组合排列
        var arrangeCanvas = this._arrangeCanvas = UICommon.arrangeAsMatrixByColumn(ccui.Layout, roomMemberCellArray,7,cc.size(25,0));
        groupArray.push(arrangeCanvas);
        this._arrangeCanvas.setAnchorPoint(0,1);
        this._deleteImage.setPosition(this._deleteImage.x,this._deleteImage.y);

        var groupPanel = this._groupPanel = UICommon.createPanelAlignWidgetsWithPadding(22, cc.UI_ALIGNMENT_VERTICAL_CENTER, groupArray);
        //如果groupPanel的高度大于顶部title与Btn的和的话
        if(groupPanel.height >= this.height - this._titlePanel.height - this._btnPanel.height){
            var array = [];
            array.push(groupPanel);
            this._btnPanel.retain();
            this._btnPanel.removeFromParent();
            array.push(this._btnPanel);

            var panel = this._groupPanel = UICommon.createPanelAlignWidgetsWithPadding(22, cc.UI_ALIGNMENT_VERTICAL_CENTER, array);
            var scrollView = this._scrollView = UICommon.createScrollViewWithContentPanel(panel,cc.size(panel.width,this.height - this._titlePanel.height - 10),ccui.ScrollView.DIR_VERTICAL);
            this.addChild(scrollView);
            scrollView.setPos(cc.p(this.width/2, this.height - this._titlePanel.height - 12), ANCHOR_TOP);
            this._scrollView.setSwallowTouches(false);
        }else{
            this.addChild(groupPanel);
            groupPanel.setPos(cc.p(this.width/2, this.height - this._titlePanel.height - 12), ANCHOR_TOP)
        }
    },

    initAllClickFunc: function(){
        //邀请权限和申请权限按键响应
        this.inviteAndApplyClickFunc();

        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        //房间名称
        this._roomNameEditBtn.addClickEventListener(function(sender)
        {
            this.roomNameCallBack();
        }.bind(this));

        //房间简介
        this._roomIntroCell.addClickEventListener(function(sender)
        {
            if(GB.ROOM_IDENTITY_MENBER == this._roomInfo.getRoomIdentity() || GB.ROOM_IDENTITY_STRANGER == this._roomInfo.getRoomIdentity()){
                //MainController.showAutoDisappearAlertByText(LocalString.getString("ROOM_INSUFFICIENT_PERMISSION"));
                return;
            }
            else
            {
                this.roomIntroCallBack();
            }
        }.bind(this));

        //根据身份来创建不同的点击响应
        this.createClickCallBackByIdentity();
    },

    //创建点击回调通过查看房间信息的人的身份
    createClickCallBackByIdentity:function()
    {
        //设置管理员
        this._roomSetManagerCell.addClickEventListener(function (sender) {
            if(this._roomInfo.getRoomIdentity()  != GB.ROOM_IDENTITY_HOUSER_HOLD){
                return;
            }
            this.roomSetManagerCallBack();
            cc.log("设置管理员");
        }.bind(this));

        //设置管理员确定按钮响应
        this._confirmBtn.addClickEventListener(function (sender) {
            if(this._roomInfo.getRoomIdentity()  != GB.ROOM_IDENTITY_HOUSER_HOLD){
                return;
            }
            var okLabel = new cc.LabelTTF(LocalString.getString("ROOM_CONFIRM_SET_MANAGER"), FONT_ARIAL_BOLD, 24);
            okLabel.setColor(cc.color(143,162,176));
            var layer = new ConfirmPopLayer(okLabel,cc.size(-50,116),this.generalPopUpSetManagerCallBackOK.bind(this),this.generalPopUpSetManagerCallBackCancel.bind(this));
            MainController.pushLayerToRunningScene(layer);
            cc.log("确定设置管理员");
        }.bind(this));

        this._dissolveBtn.addClickEventListener(function (sender) {
            if(this._roomInfo.getRoomIdentity()  != GB.ROOM_IDENTITY_HOUSER_HOLD){
                return;
            }
            var dissolveLabel = new cc.LabelTTF(LocalString.getString("ROOM_CONFIRM_DISMISS"), FONT_ARIAL_BOLD, 24);
            dissolveLabel.setColor(cc.color(143,162,176));
            var layer = new ConfirmPopLayer(dissolveLabel, cc.size(-50,116), this.generalPopUpDissolveCallBackOK.bind(this));
            MainController.pushLayerToRunningScene(layer);
            cc.log("解散房间");
        }.bind(this));

        this._deleteImage.addClickEventListener(function (sender) {
            this.roomDeleteMemberCallBack();
            cc.log("删除成员");
        }.bind(this));

        this._deleteBtn.addClickEventListener(function (sender) {
            //创建删除按钮响应的通用弹窗
            var deleteLabel = new cc.LabelTTF(LocalString.getString("ROOM_CONFIRM_KICK_OUT_MEMBER"), "Arial", 24);
            deleteLabel.setColor(cc.color(143,162,176));
            var layer = new ConfirmPopLayer(deleteLabel,cc.size(-50,116),this.generalPopUpDeleteCallBackOK.bind(this),this.generalPopUpDeleteCallBackCancel.bind(this));
            MainController.pushLayerToRunningScene(layer);
            cc.log("删除成员");
        }.bind(this));

        this._deleteImage.addClickEventListener(function (sender) {
            this.roomDeleteMemberCallBack();
            cc.log("删除成员");
        }.bind(this));

        this._exitBtn.addClickEventListener(function (sender) {
            var exitLabel = new cc.LabelTTF(LocalString.getString("ROOM_CONFIRM_BACK_OUT"), FONT_ARIAL_BOLD, 24);
            exitLabel.setColor(cc.color(143,162,176));
            var layer = new ConfirmPopLayer(exitLabel,cc.size(-50,116),this.generalPopUpExitRoomCallBackOK.bind(this));
            MainController.pushLayerToRunningScene(layer);
            cc.log("退出房间");
        }.bind(this));

        this._applyBtn.addClickEventListener(function (sender) {
            cc.log("申请房间");
            var successCallBack = function(data){
                cc.log("refreshApplyRoomListAAAAAAAA:", JSON.stringify(data));
                MainController.popLayerFromRunningScene(this);
                MainController.popLayerFromRunningScene(RoomFindView.instance);
                cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_CHOOSE_REFRESH);
            }.bind(this);
            HttpManager.requestApplyJoinRoom(successCallBack,this._roomInfo.getRoomId());
        }.bind(this));
    },

    //通用弹窗callBack(设置管理员)
    generalPopUpSetManagerCallBackOK: function(popLayer){
        MainController.popLayerFromRunningScene(popLayer);
        var arrayId = [];
        for(var i in this._arrayCheckedId){
            if(this._arrayCheckedId[i] == true){
                arrayId.push(i);
            }
        }
        var successCallBack = function(data){
            cc.log("delete:",JSON.stringify(data));
            for(var i = 0; i < this._memberDataArray.length; i++){
                var memberInfo = this._memberDataArray[i];
                if(this._arrayCheckedId[memberInfo.getId()] == true)
                {
                    this._memberDataArray[i].setRole(GB.ROOM_IDENTITY_MANAGER);
                }else if(this._arrayCheckedId[memberInfo.getId()] == false){
                    this._memberDataArray[i].setRole(GB.ROOM_IDENTITY_MENBER);
                }
            }
            this.refreshMember(this._normalMode);
            this._roomSetManagerCell.setTouchEnabled(true);
            //this._okPopup.setVisible(false);
            this._confirmBtn.setVisible(false);
            this._deleteImage.setVisible(true);
            this._dissolveBtn.setVisible(true);
            this._arrayCheckedId = {};
        }.bind(this);
        HttpManager.requestSetAdminUsers(successCallBack,this._roomInfo.getRoomId(),arrayId);
    },

    generalPopUpSetManagerCallBackCancel: function(popLayer){
        MainController.popLayerFromRunningScene(popLayer);
        this._arrayCheckedId = {};
        this.refreshMember(this._normalMode);
        this._roomSetManagerCell.setTouchEnabled(true);
        //this._okPopup.setVisible(false);
        this._confirmBtn.setVisible(false);
        this._deleteImage.setVisible(true);
        this._dissolveBtn.setVisible(true);
    },

    //通用弹窗callBack(退出房间)
    generalPopUpExitRoomCallBackOK: function(popLayer){
        MainController.popLayerFromRunningScene(popLayer);
        var successCallBack = function(data){
            cc.log("ExitRoom:",JSON.stringify(data));
            //this._exitPopup.setVisible(false);
            Player.getInstance().setRoomId(undefined);
            cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_STATE_CHANGE);
            MainController.popLayerFromRunningScene(this);
            MainController.popLayerFromRunningScene(RoomChooseView.instance);
            cc.eventManager.dispatchCustomEvent(NOTIFY_QUIT_ROOM);
        }.bind(this);
        HttpManager.requestQuitRoom(successCallBack,this._roomInfo.getRoomId());
    },

    //通用弹窗callBack(解散房间)
    generalPopUpDissolveCallBackOK: function(popLayer){
        MainController.popLayerFromRunningScene(popLayer);
        var curRoomId = this._roomInfo.getRoomId();
        var successCallBack = function(data){
            cc.log("ExitRoom:",JSON.stringify(data));
            MainController.getInstance().hideLoadingWaitLayer();
            //解散的房间
            if(this._roomInfo.getRoomId() == curRoomId){
                Player.getInstance().setRoomId(undefined);
            }
            cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_STATE_CHANGE);
            RoomModule.getInstance().popAllView();
            //MainController.popLayerFromRunningScene(this);
            //MainController.popLayerFromRunningScene(RoomChooseView.instance);
        }.bind(this);
        HttpManager.requestDismissRoom(successCallBack, this._roomInfo.getRoomId());
        MainController.getInstance().showLoadingWaitLayer();
    },

    //通用弹窗callBack(删除成员)
    generalPopUpDeleteCallBackOK: function(popLayer){
        MainController.popLayerFromRunningScene(popLayer);
        var arrayId = [];
        for(var i in this._arrayCheckedId){
            if(this._arrayCheckedId[i] == true){
                arrayId.push(i);
            }
        }
        var successCallBack = function(data){
            cc.log("delete:",JSON.stringify(data));
            for(var i = 0; i < this._memberDataArray.length; i++){
                var memberInfo = this._memberDataArray[i];
                if(this._arrayCheckedId[memberInfo.getId()] == true)
                {
                    this._memberDataArray[i] = null;
                }
            }
            if(this._roomInfo.getRoomIdentity() == GB.ROOM_IDENTITY_HOUSER_HOLD){
                this._dissolveBtn.setVisible(true);
            }else{
                this._exitBtn.setVisible(true);
            }
            this.refreshMember(this._normalMode);
            this._arrayCheckedId = {};
            this._deleteBtn.setVisible(false);
            this._deleteImage.setVisible(true);
        }.bind(this);
        HttpManager.requestDeleteUsers(successCallBack,this._roomInfo.getRoomId(),arrayId);
    },

    generalPopUpDeleteCallBackCancel: function(popLayer){
        MainController.popLayerFromRunningScene(popLayer);
        this._arrayCheckedId = {};
        this.refreshMember(this._normalMode);
        this._deleteBtn.setVisible(false);
        this._deleteImage.setVisible(true);
        if(this._identity == GB.ROOM_IDENTITY_MANAGER){
            this._exitBtn.setVisible(true);
        }else{
            this._dissolveBtn.setVisible(true);
        }
    },

    createEditBox: function(){
        //遮罩
        var mask = this._maskEditBox = new ccui.Layout();
        mask.setContentSize(cc.winSize);
        mask.setTouchEnabled(true);
        mask.setBackGroundColorEx(cc.BLACK);
        mask.setBackGroundColorOpacity(170);
        this.addChild(mask,1,10);
        mask.setVisible(false);

        var panelEditBox = this._panelEditBox = new ccui.Layout();
        panelEditBox.setContentSize(cc.winSize.width,92);
        panelEditBox.setPos(cc.p(3,this.height*0.6),ANCHOR_LEFT_BOTTOM);
        panelEditBox.setVisible(false);
        this.addChild(panelEditBox,1,10);

        var editBox = this._editBox = new cc.EditBox(cc.size(1160,92),new cc.Scale9Sprite("bg_common_bottom_frame.png"));
        editBox.setName("房间名称");
        //editBox.setDelegate(this);
        editBox.setMaxLength(7);
        editBox.setPlaceHolder(LocalString.getString("ROOM_PLEASE_INPUT_PROFILE"));
        editBox.setPlaceholderFont(FONT_ARIAL_BOLD,24);
        editBox.setFont(FONT_ARIAL_BOLD,24);
        editBox.setFontColor(cc.color(21,25,26));
        editBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);  //修改为不使用密文
        editBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        panelEditBox.addChild(editBox,1,10);
        editBox.setPos(cc.p(0,0),ANCHOR_LEFT_BOTTOM);
        editBox.setVisible(true);

        //创建确定按钮
        var btnConfirmEditBox = this._btnConfirmEditBox = new ccui.ImageView("btn_common_green_n.png",ccui.Widget.PLIST_TEXTURE);
        btnConfirmEditBox.setScale9Enabled(true);
        btnConfirmEditBox.setCapInsets(cc.rect(20,5,5,5));
        btnConfirmEditBox.setContentSize(cc.size(165,90));
        panelEditBox.addChild(btnConfirmEditBox,1,10);
        btnConfirmEditBox.setTouchEnabled(true);
        btnConfirmEditBox.setPos(cc.p(1165,panelEditBox.height/2),ANCHOR_LEFT);
        btnConfirmEditBox.setVisible(true);

        //创建确定按钮的标题
        var text = new ccui.Text(LocalString.getString("COMMON_OK"), FONT_ARIAL_BOLD, 30);
        btnConfirmEditBox.addChild(text);
        text.setPosition(btnConfirmEditBox.width/2, btnConfirmEditBox.height/2);
        text.setColor(cc.color(255,255,255));
    },

    //房间名字callback
    roomNameCallBack: function(){
        if(!this._editBox){
            this.createEditBox();
        }
        this._editBox.setName("房间名称");
        //editBox.setDelegate(this);
        this._editBox.setMaxLength(7);
        this._editBox.setPlaceHolder("请输入房间名称");
        this._maskEditBox.setVisible(true);
        this._panelEditBox.setVisible(true);
        this._editBox.touchDownAction(this._roomNameEditBtn,ccui.Widget.TOUCH_ENDED);

        this._btnConfirmEditBox.addClickEventListener(function(sender)
        {
            this._panelEditBox.setVisible(false);
            this._maskEditBox.setVisible(false);
            this.requestRoomName();

        }.bind(this));

        this._maskEditBox.addClickEventListener(function(sender)
        {
            this._panelEditBox.setVisible(false);
            this._maskEditBox.setVisible(false);
        }.bind(this));
    },

    //房间简介callback
    roomIntroCallBack: function(){
        if(!this._editBox){
            this.createEditBox();
        }
        this._editBox.setName(LocalString.getString("ROOM_PROFILE"));
        this._editBox.setString(this._roomInfo.getIntro());
        this._editBox.setMaxLength(30);
        this._editBox.setPlaceHolder(LocalString.getString("ROOM_PLEASE_INPUT_PROFILE"));
        this._maskEditBox.setVisible(true);
        this._panelEditBox.setVisible(true);
        this._editBox.touchDownAction(this._roomIntroCell,ccui.Widget.TOUCH_ENDED);

        this._btnConfirmEditBox.addClickEventListener(function(sender)
        {
            this._panelEditBox.setVisible(false);
            this._maskEditBox.setVisible(false);
            this.requestRoomIntro();
        }.bind(this));

        this._maskEditBox.addClickEventListener(function(sender)
        {
            this._panelEditBox.setVisible(false);
            this._maskEditBox.setVisible(false);
        }.bind(this));
    },

    //设置管理员callback
    roomSetManagerCallBack: function(){
        this._roomSetManagerCell.setTouchEnabled(false);
        this._confirmBtn.setVisible(true);
        this._dissolveBtn.setVisible(false);
        this._deleteImage.setVisible(false);
        this._deleteBtn.setVisible(false);
        this.refreshMember(this._setManagerMode);
    },

    //删除成员callback
    roomDeleteMemberCallBack: function(){
        this._confirmBtn.setVisible(false);
        this._dissolveBtn.setVisible(false);
        this._deleteImage.setVisible(true);
        this._deleteBtn.setVisible(true);
        this.refreshMember(this._deleteMode);
    },

    //获得点击选中的“管理员”或“被删除成员”并将其保存起来的回调
    getCheckedPlayerID: function(bool,playerId){
        if(bool){
            this._arrayCheckedId[playerId] = bool;

        }else{
            this._arrayCheckedId[playerId] = bool;
        }
        cc.log("this._arrayCheckedId:",playerId);
        cc.log("this._arrayCheckEdId:",JSON.stringify(this._arrayCheckedId));
    },

    //请求简介修改
    requestRoomIntro: function(){
        var roomId =  this._roomInfo.getRoomId();
        var profile =  this._editBox.getString().trim();
        var successCallBack = function(data){
            cc.log("roomProfile:",JSON.stringify(data));
            this._roomIntroCell._textContent.setString(profile);
            cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_PROFILE_UPDATE,  {"roomId":roomId, "profile":profile});
        }.bind(this);
        HttpManager.requestModifyIntro(successCallBack, roomId, profile);
    },

    //请求房间名字修改
    requestRoomName: function(){
        var roomName = this._editBox.getString().trim();
        var roomId = this._roomInfo.getRoomId();
        if(roomName.length == 0){
            return;
        }
        var successCallBack = function(data){
            cc.log("modify roomName:",roomName);
            this._roomNameText.setString(roomName);

            //重新排版“房间名字”和“修改按钮”
            var array = [];
            this._roomNameText.retain();
            this._roomNameText.removeFromParent();
            array.push(this._roomNameText);

            this._roomNameEditBtn.retain();
            this._roomNameEditBtn.removeFromParent();
            array.push(this._roomNameEditBtn);

            var groupPanel  = UICommon.createPanelAlignWidgetsWithPadding(12, cc.UI_ALIGNMENT_HORIZONTAL_CENTER, array);
            this._titleTextPanel.addChild(groupPanel);
            groupPanel.setPos(cc.p(this._titleTextPanel.width/2,this._titleTextPanel.height/2),ANCHOR_CENTER);

            cc.log("send NOTIFY_ROOM_NAME_CHANGE");
            cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_NAME_CHANGE, {"roomId":roomId, "roomName":roomName});
        }.bind(this);
        HttpManager.requestModifyName(successCallBack, roomId, roomName);
    },

    //刷新成员
    refreshMember: function(mode){
        cc.log("刷新");
        //刷新的时候将删除点击图片移动出来
        this._deleteImage.retain();
        this._deleteImage.removeFromParent();
        if(this._arrangeCanvas.getChildrenCount()>0){
            this._arrangeCanvas.removeFromParent();
        }

        this._roomeMemberCellArray = [];
        //根据身份来刷新删除列表
        if(this._deleteMode == mode){
            for(var i = 0; i < this._memberDataArray.length; i++){
                if(this._memberDataArray[i] != null){
                    var role = this._memberDataArray[i].getRole();
                    //如果是房主身份，删除时看不到自己
                    if(GB.ROOM_IDENTITY_HOUSER_HOLD != role&&this._roomInfo.getRoomIdentity() == GB.ROOM_IDENTITY_HOUSER_HOLD){
                        var memberCell = new RoomMemberCellView(this._memberDataArray[i],mode);
                        memberCell.setPosition(this.width/2, this.height/2);
                        memberCell.addClickCallBack(this.getCheckedPlayerID.bind(this));
                        this._roomeMemberCellArray.push(memberCell);
                    }
                    //如果是管理员身份，删除时看不到自己和房主
                    else if(GB.ROOM_IDENTITY_HOUSER_HOLD !=role&&this._roomInfo.getRoomIdentity() == GB.ROOM_IDENTITY_MANAGER && GB.ROOM_IDENTITY_MANAGER!= role){
                        var memberCell = new RoomMemberCellView(this._memberDataArray[i],mode);
                        memberCell.setPosition(this.width/2, this.height/2);
                        memberCell.addClickCallBack(this.getCheckedPlayerID.bind(this));
                        this._roomeMemberCellArray.push(memberCell);
                    }
                }
            }
        }
        else if(this._setManagerMode == mode){
            for(var i = 0; i < this._memberDataArray.length; i++){
                var role = this._memberDataArray[i].getRole();

                if(this._memberDataArray[i] != null){
                    //除房主以外
                    if(GB.ROOM_IDENTITY_HOUSER_HOLD != role&&this._roomInfo.getRoomIdentity() == GB.ROOM_IDENTITY_HOUSER_HOLD){
                        var memberCell = new RoomMemberCellView(this._memberDataArray[i],mode);
                        memberCell.setPosition(this.width/2, this.height/2);
                        memberCell.addClickCallBack(this.getCheckedPlayerID.bind(this));
                        if(GB.ROOM_IDENTITY_MANAGER == role){
                            this.getCheckedPlayerID(true,this._memberDataArray[i].getId());
                        }
                        this._roomeMemberCellArray.push(memberCell);
                    }
                }
            }
        }
        else if(this._normalMode == mode){
            for(var i = 0; i < this._memberDataArray.length; i++){
                if(this._memberDataArray[i] != null){
                    var memberCell = new RoomMemberCellView(this._memberDataArray[i],mode);
                    memberCell.setPosition(this.width/2, this.height/2);
                    memberCell.addClickCallBack(this.getCheckedPlayerID.bind(this));
                    this._roomeMemberCellArray.push(memberCell);
                }
            }
            this._deleteImage.setVisible(true);
        }
        this._roomeMemberCellArray.push(this._deleteImage);

        //组合排列
        this._arrangeCanvas = UICommon.arrangeAsMatrixByColumn(ccui.Layout,this._roomeMemberCellArray, 7, cc.size(25,0));
        this._deleteImage.setPosition(this._deleteImage.x,this._deleteImage.y);
        this._deleteImage.setVisible(false);

        var arrayPanel = [];
        this._cellPanel.retain();
        this._btnPanel.retain();
        this._cellPanel.removeFromParent();
        this._btnPanel.removeFromParent();
        arrayPanel.push(this._cellPanel);
        arrayPanel.push(this._arrangeCanvas);
        arrayPanel.push(this._btnPanel);
        if(this._scrollView != null && cc.sys.isObjectValid(this._scrollView)){
            this._scrollView.removeFromParent();
            this._scrollView = null;
        }

        var groupPanel = this._groupPanel = UICommon.createPanelAlignWidgetsWithPadding(22, cc.UI_ALIGNMENT_VERTICAL_CENTER, arrayPanel);
        groupPanel.setAnchorPoint(0,1);
        if(groupPanel.height >= this.height - this._titlePanel.height){
            var array = [];
            array.push(groupPanel);
            this._btnPanel.retain();
            this._btnPanel.removeFromParent();
            array.push(this._btnPanel);
            var Panel = UICommon.createPanelAlignWidgetsWithPadding(22, cc.UI_ALIGNMENT_VERTICAL_CENTER, array);

            var scrollView = this._scrollView = UICommon.createScrollViewWithContentPanel(Panel,cc.size(Panel.width,this.height - 112),ccui.ScrollView.DIR_VERTICAL);
            this.addChild(scrollView);
            scrollView.setPos(cc.p(this.width/2, this.height - this._titlePanel.height - 12), ANCHOR_TOP);
            this._scrollView.setSwallowTouches(false);
        }else{
            this.addChild(groupPanel);
            groupPanel.setPos(cc.p(this.width/2, this.height - this._titlePanel.height - 12), ANCHOR_TOP);
            this._btnPanel.retain();
            this._btnPanel.removeFromParent();
            this.addChild(this._btnPanel);
            this._btnPanel.setPosition(this.width/2,this._btnPanel.height + 10);
            //var pos = this._btnPanel.getPosAtAncestor(this,this.getAnchorPoint());
        }
    },

    /**
     *
     * @param strTextTitle               单条Cell 标题
     * @param arrowRightVisible          设置“右方向”图片是否可见
     * @param strTextContent             设置“单条内容”
     * @param callBack                   回调方法
     */
    createRoomGBCell: function(strTextTitle,strTextContent){
        var roomCell  = ccs.load(res.RoomManageGBCell_json).node;
        var bgImage  = ccui.helper.seekWidgetByName(roomCell, "bgImage");
        var textTitle = bgImage._textTitle = ccui.helper.seekWidgetByName(bgImage, "textTitle");
        var arrowRight  = bgImage._arrowRight = ccui.helper.seekWidgetByName(bgImage, "arrowRight");
        var textContent  = bgImage._textContent = ccui.helper.seekWidgetByName(bgImage, "textContent");

        textTitle.setString(strTextTitle);
        textContent.setString(strTextContent);

        bgImage.setTouchEnabled(true);
        // panel.setSwallowTouches(false);
        bgImage.retain();
        bgImage.removeFromParent();

        return bgImage;
    },

    //邀请权限和申请权限按键响应
    inviteAndApplyClickFunc: function(){
        this._inviteBtnInvitePanel.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            var successCallBack = function(data){
                cc.log("inviteBtnInvitePanel:",JSON.stringify(data));
                if(this._inviteBtnInviteSetOn.isVisible()){
                    this._inviteBtnInviteSetOn.setVisible(false);
                }else{
                    this._inviteBtnInviteSetOn.setVisible(true);
                }
                cc.log("inviteBtnInvitePanel:",this._inviteBtnInviteSetOn.isVisible());
            }.bind(this);
            HttpManager.requestModifyInviteAuthority(successCallBack,this._roomInfo.getRoomId(),!this._inviteBtnInviteSetOn.isVisible());
        }.bind(this));

        this._applyBtnApplyPanel.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            var successCallBack = function(data){
                cc.log("applyBtnApplyPanel:",JSON.stringify(data));
                if(this._applyBtnApplySetOn.isVisible()){
                    this._applyBtnApplySetOn.setVisible(false);
                }else{
                    this._applyBtnApplySetOn.setVisible(true);
                }
                cc.log("applyBtnApplyPanel:",this._applyBtnApplySetOn.isVisible());
            }.bind(this);
            HttpManager.requestModifyJoinAuthority(successCallBack,this._roomInfo.getRoomId(),!this._applyBtnApplySetOn.isVisible());
        }.bind(this));
    }
});

//成员cell
var RoomMemberCellView = ccui.Layout.extend({
    _simplePlayer: undefined,          //用户数据
    //_id: "名字最长七个字",            //用户ID
    _normalMode: 1,                    //普通模式
    _deleteMode: 2,                    //删除模式
    _setManagerMODE: 3,                //设置管理员模式
    _mode:1,                           //默认普通模式
    _deleteEnabled: false,            //能否删除
    _setManagerEnabled: false,        //能否设置成管理员
    _identity: 1,                   //创建房间的身份
    ctor: function (simplePlayer,mode) {
        this._super();
        this._simplePlayer = simplePlayer;
        this._mode = mode;
        this._identity = simplePlayer.getRole();
        cc.log("identity:", this._identity);
        this.setContentSize(cc.size(128, 115));

        this.initUI();

        this.initAllClickFunc();
    },

    initUI: function () {
        var avatar = this._avatar = new CircleAvatar(this._simplePlayer);
        this.addChild(avatar);
        avatar.setPosition(this.width/2, this.height * 0.573);
        avatar.setScale(0.88);

        var closeBtnBg = this._closeBtnBg = new ccui.ImageView("btn_common_bg.png",ccui.Widget.LOCAL_TEXTURE);
        this.addChild(closeBtnBg);
        closeBtnBg.setTouchEnabled(true);
        closeBtnBg.setSwallowTouches(false);
        closeBtnBg.setPosition(this.width/2, this.height * 0.573);

        var closeBtnN = this._closeBtnN = this.createClickImage("btn_delete_n.png",ccui.Widget.PLIST_TEXTURE);
        var closeBtnS = this._closeBtnS = this.createClickImage("btn_delete_s.png",ccui.Widget.PLIST_TEXTURE);
        var confirmN = this._confirmN = this.createClickImage("btn_confirm_n.png",ccui.Widget.PLIST_TEXTURE);
        var confirmS = this._confirmS = this.createClickImage("btn_confirm_s.png",ccui.Widget.PLIST_TEXTURE);

        if(this._identity == GB.ROOM_IDENTITY_HOUSER_HOLD){
            var identityImage = new ccui.ImageView("icon_house_owner.png",ccui.Widget.PLIST_TEXTURE);
            identityImage.setPos(cc.p(0,0),ANCHOR_LEFT_BOTTOM);
        }
        else if(this._identity == GB.ROOM_IDENTITY_MENBER){
            var identityImage = new ccui.ImageView("icon_member.png",ccui.Widget.PLIST_TEXTURE);
            identityImage.setPos(cc.p(0,0),ANCHOR_LEFT_BOTTOM);
        }
        else if(this._identity == GB.ROOM_IDENTITY_MANAGER){
            var identityImage = new ccui.ImageView("icon_administrators.png",ccui.Widget.PLIST_TEXTURE);
            identityImage.setPos(cc.p(0,0),ANCHOR_LEFT_BOTTOM);
            this._setManagerEnabled = true;
        }

        var array = [];
        array.push(identityImage);

        var id = new ccui.Text(this._simplePlayer.getNickName(), FONT_ARIAL_BOLD, 16);
        array.push(id);
        id.setAnchorPoint(0,0);
        id.setColor(cc.color(117,120,135));

        var groupPanel = UICommon.createPanelAlignWidgetsWithPadding(5, cc.UI_ALIGNMENT_HORIZONTAL_CENTER, array);
        this.addChild(groupPanel);
        groupPanel.setPos(cc.p(this.width/2,0),ANCHOR_BOTTOM);

        //通过不同MODE来显示不同的表现
        if(this._mode == this._normalMode){
            closeBtnBg.setVisible(false);
        }else if(this._mode == this._deleteMode){
            avatar.setDetailEnabled(false);
            confirmN.setVisible(false);
            confirmS.setVisible(false);
            closeBtnS.setVisible(false);
        }else if(this._mode == this._setManagerMODE){
            avatar.setDetailEnabled(false);
            closeBtnN.setVisible(false);
            closeBtnS.setVisible(false);
            //如果设置管理员但身份并不是管理员身份
            if(this._identity != GB.ROOM_IDENTITY_MANAGER){
                confirmS.setVisible(false);
            }
        }
    },

    initAllClickFunc: function(){
        var self = this;
        if(this._mode == this._normalMode){
            this._avatar.setDetailEnabled(true);
        }else if(this._mode == this._deleteMode){
            this._closeBtnBg.addClickEventListener(function(sender){
                if(self._deleteEnabled){
                    self._closeBtnN.setVisible(true);
                    self._closeBtnS.setVisible(false);
                    self._deleteEnabled = false;
                    self._clickCallBack(self._deleteEnabled,this._simplePlayer.getId());
                }
                else{
                    self._closeBtnN.setVisible(false);
                    self._closeBtnS.setVisible(true);
                    self._deleteEnabled = true;
                    self._clickCallBack(self._deleteEnabled,this._simplePlayer.getId());
                }
            }.bind(this));
        }else if(this._mode == this._setManagerMODE){
            this._closeBtnBg.addClickEventListener(function(sender){
                if(self._setManagerEnabled){
                    self._confirmN.setVisible(true);
                    self._confirmS.setVisible(false);
                    self._setManagerEnabled = false;
                    self._clickCallBack(self._setManagerEnabled,this._simplePlayer.getId());
                }
                else{
                    self._confirmN.setVisible(false);
                    self._confirmS.setVisible(true);
                    self._setManagerEnabled = true;
                    self._clickCallBack(self._setManagerEnabled,this._simplePlayer.getId());
                }
            }.bind(this));
        }

    },

    addClickCallBack: function(callBack){
        this._clickCallBack = callBack;
    },

    createClickImage: function(fileName,txtType){
        var clickImage = new ccui.ImageView(fileName,txtType);
        this._closeBtnBg.addChild(clickImage);
        clickImage.setPosition(centerInner(this._closeBtnBg));
        return clickImage;
    },

    getDeleteEnabled: function(){
        return this._deleteEnabled;
    },

    getManagerEnabled: function(){
        return this._setManagerEnabled;
    },

    getPlayerID: function(){
        return this._simplePlayer.getId();
    }
});

RoomManagementView.getInstance = function()
{
    RoomManagementView._instance = new cc.Ex
}