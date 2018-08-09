/**
 * Created by Administrator on 2017/2/22.
 */

GB.ROOM_APPLY_USER = 3001;
GB.ROOM_APPLY_MANAGER = 3002;
GB.ROOM_APPLY_INVITE = 3003;

/**
 * 房间申请界面
 */
var RoomApplyView = BaseLayer.extend({
    ctor: function (controller) {
        this._super("RoomApplyView");

        this._controller = controller;
        this._cellInfoArray = [];

        this.setContentSize(cc.winSize);

        this.initUI();

        this.initAllClickFunc();

        this.requestApplyList();
    },

    initUI: function () {
        //从studio中取出相应的组件
        var rootLayer = this._rootLayer = ccs.loadWithVisibleSize(res.RoomApply_json).node;
        //ccui.helper.doLayout(rootLayer);
        this.addChild(rootLayer);

        var bgPanel = this._bgPanel = ccui.helper.seekWidgetByName(rootLayer, "bgPanel");
        var titlePanel = this._titlePanel = ccui.helper.seekWidgetByName(bgPanel, "titlePanel");
        var titleTxt = this._titleTxt = ccui.helper.seekWidgetByName(titlePanel, "titleTxt");
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");
        var panelSize = this._panelSize = ccui.helper.seekWidgetByName(bgPanel, "panelSize");
        var textNoHaveContent = this._textNoHaveContent = ccui.helper.seekWidgetByName(rootLayer,"textNoHaveContent");
        backBtn.setTouchEnabled(true);
        this.createTabView();

    },

    createTabView:function()
    {
        var self = this;
        var delegate = cc.Class.extend({
            ctor: function() {

            },
            scrollViewDidScroll:function (view) {
            },
            scrollViewDidZoom:function (view) {
            },

            tableCellTouched:function (table, cell) {
                cc.log("cell touched at index: " + cell.getIdx());
            },

            tableCellSizeForIndex:function (table, idx) {
                return cc.size(1105, 130);
            },

            tableCellAtIndex:function (table, idx) {
                cc.log("idx", idx);
                try{
                    var cell = table.dequeueCell();
                    var info = self._cellInfoArray[idx];
                    if (cell == null) {
                        cell = new cc.TableViewCell();
                        var roomCell = new RoomApplyCellView(info);
                        roomCell.addClickCallBack(self.refreshApplyList.bind(self));
                        cell.addChild(roomCell);
                        cell._content = roomCell;
                        cell._content.setIndex(idx);
                    }
                    else {
                        cell._content.setIndex(idx);
                        cell._content.refresh(info);
                    }
                }catch(e){
                    cc.log(e.stack);
                }
                return cell;
            },

            numberOfCellsInTableView:function (table) {
                return self._cellInfoArray.length;
            }
        });

        var xal = new delegate();
        var tableView = this._tableView = new cc.TableView(xal, self._panelSize.getContentSize());
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.setDelegate(xal);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);

        self._panelSize.addChild(tableView);
        tableView.setPos(topInner(self._panelSize), ANCHOR_TOP);
    },

    refreshApplyList: function(index){
        cc.log("this._cellInfoArray.length",this._cellInfoArray.length);
        cc.log("this._textNoHaveContent.isVisible",this._textNoHaveContent.isVisible());
        if(this._cellInfoArray.length <= 1){
            this._textNoHaveContent.setVisible(true);
        }
        this._cellInfoArray.splice(index,1);
        this._tableView.reloadData();
    },

    requestApplyList: function(){
        var self = this;
        var successCallBack = function(data){
            cc.log("refreshApplyRoomList:", JSON.stringify(data));
            MainController.getInstance().hideLoadingWaitLayer();
            self._cellInfoArray = [];
            if(data.length > 0){
                for(var i=0; i< data.length; i++){
                    var info = data[i];
                    var cellInfo = new RoomApplyCellModel(info);
                    this._cellInfoArray.push(cellInfo);
                    this._textNoHaveContent.setVisible(false);
                    cc.log("infoXXXXXXXXXXXXXXXXXsadasdada:::",JSON.stringify(cellInfo));
                }
            }else{
                this._textNoHaveContent.setVisible(true);
            }
            self._tableView.reloadData()
        }.bind(this);
        HttpManager.requestQueryJoinApplyList(successCallBack);
        MainController.getInstance().showLoadingWaitLayer();
    },

    initAllClickFunc: function(){
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            var roomChoose = new RoomChooseView();
            MainController.pushLayerToRunningScene(roomChoose);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));
    }
});


var RoomApplyCellView = ccui.Layout.extend({
    _roomApplyCellModel: undefined,
    _cellIdx:0,
    ctor: function (roomApplyCellModel) {
        this._super();
        this._roomApplyCellModel = roomApplyCellModel;

        this.initUI();

        this.initAllClickFunc();
    },

    initUI: function () {
        //从studio中取出相应的组件
        var rootLayer = this._rootLayer = ccs.load(res.RoomApplyCell_json).node;
        //ccui.helper.doLayout(rootLayer);
        this.addChild(rootLayer);
        this.setContentSize(rootLayer.getContentSize());

        var imageBg = this._imageBg = ccui.helper.seekWidgetByName(rootLayer, "imageBg");
        var btnConfirm = this._btnConfirm = ccui.helper.seekWidgetByName(imageBg, "btnConfirm");

        var imageCancel = this._imageCancel = ccui.helper.seekWidgetByName(imageBg, "imageCancel");
        var textMemberName = this._textMemberName = ccui.helper.seekWidgetByName(imageBg, "textMemberName");
        var textIApply = this._textIApply = ccui.helper.seekWidgetByName(imageBg, "textIApply");

        var player = this._roomApplyCellModel.getSimplePlayer();
        if(player){
            textMemberName.setString(player.getNickName());
        }

        textIApply.setString("申请加入"+ this._roomApplyCellModel.getRoomName() + "的房间");

        imageCancel.setTouchEnabled(true);
        btnConfirm.setTouchEnabled(true);

        var avatar = this._avatar = new CircleAvatar(this._roomApplyCellModel.getSimplePlayer());
        rootLayer.addChild(avatar);
        avatar.setPos(cc.p(15, this.height/2),ANCHOR_LEFT);
        avatar.setScale(0.88);

    },

    initAllClickFunc: function(){
        var self = this;
        this._imageCancel.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            var successCallBack = function(data){
                cc.log("refreshCancelAAAAAAAA:", JSON.stringify(data));
                MainController.getInstance().hideLoadingWaitLayer();
                self._clickCallBack(self._cellIdx);
            }.bind(this);
            HttpManager.requestRejectJoinRoom(successCallBack,self._roomApplyCellModel.getRoomId(),self._roomApplyCellModel.getSimplePlayer().getId());
            MainController.getInstance().showLoadingWaitLayer();
            cc.log("Cancel");
        }.bind(this));

        this._btnConfirm.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            var successCallBack = function(data){
                cc.log("refreshConfirmAAAAAAAA:", JSON.stringify(data));
                MainController.getInstance().hideLoadingWaitLayer();
                self._clickCallBack(self._cellIdx);
            }.bind(this);
            HttpManager.requestApproveJoinRoom(successCallBack,self._roomApplyCellModel.getRoomId(),self._roomApplyCellModel.getSimplePlayer().getId());
            MainController.getInstance().showLoadingWaitLayer();
            cc.log("Confirm");
        }.bind(this));
    },

    setIndex: function(index){
      this._cellIdx = index;
    },

    addClickCallBack: function(callBack){
        this._clickCallBack = callBack;
    },

    refresh: function(info){
        this._roomApplyCellModel = info;
        cc.log("infoXXXXXXXXXXXX",JSON.stringify(info));
        var player = this._roomApplyCellModel.getSimplePlayer();
        if(player){
            this._textMemberName.setString(player.getNickName());
        }
        this._textIApply.setString("申请加入"+ this._roomApplyCellModel.getRoomName() + "的房间");
        this._avatar.refresh(this._roomApplyCellModel.getSimplePlayer());
    }
});


var RoomApplicantHintGather = cc.Layer.extend({
    _userApplicantMode: 3001,                       //玩家申请消息反馈
    _managerApplicantMode: 3002,                    //房间管理者收到的申请提示
    _roomApplicantMode: 3003,                       //房间管理者发出的邀请提示
    _mode:3001,
    _roomName:"名字最长七个字",
    _roomId:1001,
    _invitationId:2001,
    _isApproved:false,
    _applyAgree:true,
    _applyRefuse:false,
    ctor: function () {
        this._super();
        this._applicantDataArray = [];
        cc.log("初始化消息单条CELL");
        this.initUI();
        this.initAllClickCallBack();
        this.addListener();
    },

    cleanup:function()
    {
        this._super();
        this.removeAllCustomListeners();
    },

    initUI: function(){
        var rootLayer = this._rootLayer = ccs.load(res.RoomApplyHintCell_json).node;
        //ccui.helper.doLayout(rootLayer);
        this.addChild(rootLayer);
        this.setContentSize(rootLayer.getContentSize());

        var panelApplyHint = this._panelApplyHint= ccui.helper.seekWidgetByName(rootLayer, "panelApplyHint");
        var imageHall = this._imageHall = ccui.helper.seekWidgetByName(panelApplyHint, "imageHall");
        var imageClose = this._imageClose = ccui.helper.seekWidgetByName(panelApplyHint, "imageClose");
        var btnConfirm = this._btnConfirm = ccui.helper.seekWidgetByName(imageHall, "btnConfirm");
        var textConfirm = this._textConfirm = ccui.helper.seekWidgetByName(btnConfirm, "textConfirm");

        btnConfirm.setTouchEnabled(true);
        imageClose.setTouchEnabled(true);

        this.createManagerApplicant();
        this.createRoomApplicant();
        this.createUserApplicantPanel();
        this.setVisible(false);
    },

    //用户申请信息反馈
    createUserApplicantPanel: function(){
        var userApplicantPanel = this._userApplicantPanel = new cc.Layer();
        this.addChild(userApplicantPanel);
        userApplicantPanel.setContentSize(this._rootLayer.getContentSize());

        var player = Player.getInstance();
        var panel = userApplicantPanel;
        var arrayLabel = [];
        //是否同意邀请提示
        if(this._isApproved == this._applyAgree){
            var label = panel._label = new cc.LabelTTF("您已成功加入",FONT_ARIAL_BOLD, 24);
            this._textConfirm.setString("马上进入");
        }else if(this._isApproved == this._applyRefuse){
            var label = panel._label = new cc.LabelTTF("您被拒绝加入",FONT_ARIAL_BOLD, 24);
            this._textConfirm.setString("重新申请");
        }
        label.setAnchorPoint(0,0.5);
        label.setColor(cc.color(21,25,26));
        panel.addChild(label);
        label.setPosition(panel.width*0.13,panel.height/2);

        var roomName = panel._roomName =new cc.LabelTTF("房间名字七个字", FONT_ARIAL_BOLD, 24);
        roomName.setAnchorPoint(0,0.5);
        roomName.setColor(cc.color(217,73,47));
        panel.addChild(roomName);
        roomName.setPosition(label.x + label.width,panel.height/2);

        var avatar = panel._avatar = new CircleAvatar(player);
        panel.addChild(avatar);
        avatar.setScale(0.80);
        avatar.setPos(cc.p(15, panel.height/2),ANCHOR_LEFT);

        userApplicantPanel.setVisible(false);
    },

    //刷新用户申请反馈cell
    refreshUserApplicant: function(data){
        this._userApplicantPanel.setVisible(true);
        this._managerApplicantPanel.setVisible(false);
        this._roomApplicantPanel.setVisible(false);

        var panel = this._userApplicantPanel;
        panel.setVisible(true);
        var model = panel._model = new RoomApplyCellModel(data);

        this._isApproved  = model.getIsApproved();
        var player = Player.getInstance();

        if(model.getIsApproved()){
            this._textConfirm.setString("马上进入");
            panel._label.setString("你已成功加入");
        }else if(!model.getIsApproved()){
            this._textConfirm.setString("重新申请");
            panel._label.setString("你被拒绝加入");
        }
        panel._roomName.setString(model.getRoomName());
        panel._avatar.refresh(player);
        panel._label.setPosition(panel.width*0.13,panel.height/2);
        panel._roomName.setPosition(panel._label.x + panel._label.width,panel.height/2);
    },

    //管理者收到的申请信息
    createManagerApplicant: function(){
        var managerApplicantPanel = this._managerApplicantPanel = new cc.Layer();
        managerApplicantPanel.setContentSize(this._rootLayer.getContentSize());
        this.addChild(managerApplicantPanel);

        var panel = managerApplicantPanel;
        var arrayLabel = [];

        var applicantName = panel._applicantName = new ccui.Text("申请者名字", FONT_ARIAL_BOLD, 24);
        applicantName.setAnchorPoint(0,0.5);
        applicantName.setColor(cc.color(21,25,26));
        panel.addChild(applicantName);
        applicantName.setPosition(panel.width*0.13,panel.height/2);

        var label = panel._label = new cc.LabelTTF("申请加入",FONT_ARIAL_BOLD, 24);
        label.setAnchorPoint(0,0.5);
        label.setColor(cc.color(21,25,26));
        panel.addChild(label);
        label.setPosition(applicantName.x + applicantName.width,panel.height/2);

        var roomName = panel._roomName = new ccui.Text("房间名字", FONT_ARIAL_BOLD, 24);
        roomName.setAnchorPoint(0,0.5);
        roomName.setColor(cc.color(217,73,47));
        panel.addChild(roomName);
        roomName.setPosition(label.x + label.width,panel.height/2);

        var avatar = panel._avatar = new CircleAvatar();
        panel.addChild(avatar);
        avatar.setScale(0.80);
        avatar.setPos(cc.p(15, panel.height/2),ANCHOR_LEFT);


        managerApplicantPanel.setVisible(false);
    },

    //刷新管理者收到的申请消息以及剪贴板上的消息cell
    refreshManagerApplicantOrClipboard: function(isShowManagerApplicantPanel,data){
        cc.log("刷管理者申请消息：");
        if(isShowManagerApplicantPanel){
            this._userApplicantPanel.setVisible(false);
            this._roomApplicantPanel.setVisible(false);
            var panel = this._managerApplicantPanel;
            panel.setVisible(true);

            this._btnConfirm.setTouchEnabled(true);
            this._textConfirm.setString("同意");

            var model = panel._model = new RoomApplyCellModel(data);
            var player = model.getSimplePlayer();

            panel._applicantName.setString(player.getNickName());
            panel._roomName.setString(model.getRoomName());
            panel._avatar.refresh(player);

            panel._applicantName.setPosition(panel.width*0.13,panel.height/2);
            panel._label.setPosition(panel._applicantName.x + panel._applicantName.width,panel.height/2);
            panel._roomName.setPosition(panel._label.x +  panel._label.width,panel.height/2);
        }
        else{
            this._userApplicantPanel.setVisible(false);
            this._managerApplicantPanel.setVisible(false);
            var panel = this._roomApplicantPanel;
            panel.setVisible(true);

            var self = this;
            var successCallBack = function(data){
                MainController.getInstance().hideLoadingWaitLayer();
                cc.log("dataRoomApplicantPanel::",JSON.stringify(data));
                if(data.length > 0){
                    panel._model = new RoomChooseCellModel(data[0]);
                    var player = panel._model.getSimplePlayer();

                    panel._applicantName.setString(player.getNickName());
                    panel._roomName.setString(panel._model.getRoomName());
                    panel._avatar.refresh(player);

                    panel._applicantName.setPosition(panel.width*0.13,panel.height/2);
                    panel._label.setPosition(panel._applicantName.x + panel._applicantName.width,panel.height/2);
                    panel._roomName.setPosition( panel._label.x +  panel._label.width,panel.height/2);
                }
            }.bind(this);
            HttpManager.requestSearchRoom(successCallBack,data["roomName"]);
            MainController.getInstance().showLoadingWaitLayer();
        }
    },

    //用户收到的房间邀请信息
    createRoomApplicant: function(){
        var roomApplicantPanel = this._roomApplicantPanel = new cc.Layer();
        roomApplicantPanel.setContentSize(this._rootLayer.getContentSize());
        this.addChild(roomApplicantPanel);

        var self = roomApplicantPanel;

        this._btnConfirm.setTouchEnabled(true);
        this._textConfirm.setString("同意");
        var arrayLabel = [];

        var applicantName = self._applicantName = new ccui.Text("邀请人名字", FONT_ARIAL_BOLD, 24);
        applicantName.setAnchorPoint(0,0.5);
        applicantName.setColor(cc.color(21,25,26));
        arrayLabel.push(applicantName);

        var label = self._label = new cc.LabelTTF("邀请您加入",FONT_ARIAL_BOLD, 24);
        label.setAnchorPoint(0,0.5);
        label.setColor(cc.color(21,25,26));
        arrayLabel.push(label);

        var roomName = self._roomName = new ccui.Text("房间名字七个字", FONT_ARIAL_BOLD, 24);
        roomName.setAnchorPoint(0,0.5);
        roomName.setColor(cc.color(217,73,47));
        arrayLabel.push(roomName);

        var groupPanel = UICommon.createPanelAlignWidgetsWithPadding(0, cc.UI_ALIGNMENT_HORIZONTAL_CENTER, arrayLabel);
        self.addChild(groupPanel);
        groupPanel.setPos(cc.p(self.width*0.1260,self.height/2),ANCHOR_LEFT);

        var avatar = self._avatar = new CircleAvatar();
        self.addChild(avatar);
        avatar.setScale(0.80);
        avatar.setPos(cc.p(15, self.height/2),ANCHOR_LEFT);


        roomApplicantPanel.setVisible(false);
    },

    addListener: function(){

        //用户申请消息反馈
        this._tcpDisUserApplicantListener = cc.eventManager.addCustomListener(NOTIFY_ROOM_JOIN_APPLY_RESULT, function(event)
        {

            cc.log("用户消息反馈");
            var data = event.getUserData();
            cc.log("dataaaaaaaa:",JSON.stringify(data));
            data.type = GB.ROOM_APPLY_USER;
            this._applicantDataArray.push(data);
            this.initAllPanelVisible();
            var canRefresh = (!this._managerApplicantPanel.isVisible()&&!this._roomApplicantPanel.isVisible()&&!this._userApplicantPanel.isVisible());
            if(canRefresh){
                this.refreshCellData();
            }
        }.bind(this));

        //新的房间申请信息
        this._tcpDisEmitApplicantListener = cc.eventManager.addCustomListener(NOTIFY_ROOM_NEW_JOIN_APPLY, function(event)
        {
            cc.log("申请");
            var data = event.getUserData();
            cc.log("新的房间申请信息数据：",JSON.stringify(data))
            data.type = GB.ROOM_APPLY_MANAGER;
            this._applicantDataArray.push(data);
            var canRefresh = (!this._managerApplicantPanel.isVisible()&&!this._roomApplicantPanel.isVisible()&&!this._userApplicantPanel.isVisible());
            if(canRefresh){
                this.refreshCellData();
            }
        }.bind(this));

        //新的房间申请信息处理删除
        this._tcpDisEmitApplicantDELListener = cc.eventManager.addCustomListener(NOTIFY_ROOM_DEL_JOIN_APPLY, function(event)
        {
            cc.log("申请消息删除");
            var data = event.getUserData();
            for(var i = 0; i < this._applicantDataArray.length; i++){
                for(var k in this._applicantDataArray[i]){
                    if(this._applicantDataArray[i][k] == data){
                        this._applicantDataArray.splice(i,1);
                        break;
                    }
                }
            }
            var canRefresh = (!this._managerApplicantPanel.isVisible()&&!this._roomApplicantPanel.isVisible()&&!this._userApplicantPanel.isVisible());
            if(canRefresh){
                this.refreshCellData();
            }
        }.bind(this));

        //每次进场与TCP链接的时候判断剪贴板是否有数据，如果有，则刷新
        this._tcpDisClipboardListener = cc.eventManager.addCustomListener(NOTIFY_GAME_ON_SHOW, function(event)
        {
            //cc.log("弹出弹出弹出邀请提示cell");
            //var clipboard = JavascriptBridge.getInstance().getClipboardContent();
            //var strArray = [];
            //if(clipboard.length > 0){
            //    var str = clipboard.split("&"); //字符分割
            //    var mapData = {};
            //    for (var i = 0;i<str.length ;i++ )
            //    {
            //        var strResult = str[i].split("=");
            //        mapData[strResult[0]] = strResult[1];
            //    }
            //    mapData.type = GB.ROOM_APPLY_INVITE;
            //    cc.log("clipbord::", JSON.stringify(mapData));
            //    this._applicantDataArray.push(mapData);
            //    JavascriptBridge.getInstance().cleanClipboard();
            //    if(canRefresh){
            //        this.refreshCellData();
            //    }
            //}
        }.bind(this));
    },

    //如果三种类型的cell都没有显示并且数据数组里面有数据，根据数据来刷新新的Cell
    refreshCellData: function(){
        cc.log("UI刷新啊刷新啊刷新啊刷新");
        cc.log("this._managerApplicantPanel.isVisible()：",this._managerApplicantPanel.isVisible());
        cc.log("this._roomApplicantPanel.isVisible()：",this._roomApplicantPanel.isVisible());
        cc.log("this._userApplicantPanel.isVisible()：",this._userApplicantPanel.isVisible());
        cc.log("this._applicantDataArray[0]::", JSON.stringify(this._applicantDataArray[0]));
        cc.log("this._applicantDataArray.length::", JSON.stringify(this._applicantDataArray.length));
        if(!this._managerApplicantPanel.isVisible()&&!this._roomApplicantPanel.isVisible()&&!this._userApplicantPanel.isVisible()&&this._applicantDataArray.length > 0){
            this.setVisible(true);
            //this.initAllPanelVisible();
            cc.log("房间消息提示开始");
            var mapData = this._applicantDataArray[0];
            cc.log("888mapData::", JSON.stringify(mapData));
            switch (mapData.type){
                case GB.ROOM_APPLY_USER:
                    this.refreshUserApplicant(mapData);
                    break;
                case GB.ROOM_APPLY_MANAGER:
                    this.refreshManagerApplicantOrClipboard(true,mapData);
                    break;
                default :
                    this.refreshManagerApplicantOrClipboard(false,mapData);
            }
            this._applicantDataArray.splice(0,1);
        }
        else
        {
          this.setVisible(false);
        }
    } ,

    openAction: function(){
        this.setVisible(true);
        this.runAction(new cc.MoveBy(0.2,cc.p(0,-300)));
    },

    closeAction: function(){
        this.setVisible(false);
        this.runAction(new cc.MoveBy(0.2,cc.p(0,300)));
    },

    initAllPanelVisible: function(){
        this._managerApplicantPanel.setVisible(false);
        this._roomApplicantPanel.setVisible(false);
        this._userApplicantPanel.setVisible(false);
    },

    initAllClickCallBack: function(){
        this._btnConfirm.addClickEventListener(function(sender){
            cc.log("确认按钮点击：");
            //管理者收到的申请消息
            if(this._managerApplicantPanel.isVisible()&&!this._roomApplicantPanel.isVisible()&&!this._userApplicantPanel.isVisible())
            {
                var panel= this._managerApplicantPanel;
                var successCallBack = function(data){
                    cc.log("同意申请:", JSON.stringify(data));
                }.bind(this);
                HttpManager.requestApproveJoinRoom(successCallBack,panel._model.getRoomId(),panel._model.getSimplePlayer().getId());
            }
            else if(!this._managerApplicantPanel.isVisible()&&this._roomApplicantPanel.isVisible()&&!this._userApplicantPanel.isVisible()){
                var panel = this._roomApplicantPanel;
                var successCallBack = function(data){
                    cc.log("同意邀请", JSON.stringify(data));
                }.bind(this);
                HttpManager.requestApplyJoinRoom(successCallBack,panel._roomApplyCellModel.getRoomId(),panel._roomApplyCellModel.getSimplePlayer().getId());
            }
            else if(!this._managerApplicantPanel.isVisible()&&!this._roomApplicantPanel.isVisible()&&this._userApplicantPanel.isVisible()){
                var panel = this._userApplicantPanel;
                if(this._isApproved == this._applyRefuse){
                    var successCallBack = function(data){
                        cc.log("重新申请:", JSON.stringify(data));
                    }.bind(this);
                    HttpManager.requestApplyJoinRoom(successCallBack,panel._model.getRoomId());
                }
                else if(this._isApproved == this._applyAgree){
                    if(Player.getInstance().getRoomId() != panel._model.getRoomId()){
                        var successCallBack = function(data){
                            cc.log("进入房间:", JSON.stringify(data));
                            Player.getInstance().setRoomId(panel._model.getRoomId());
                            cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_STATE_CHANGE);
                        }.bind(this);
                        HttpManager.requestEnterRoom(successCallBack,panel._model.getRoomId());

                    }
                }
            }
            this.initAllPanelVisible();
            this.refreshCellData();
        }.bind(this));

        this._imageClose.addClickEventListener(function(sender){
            cc.log("关闭按钮点击：");
            this.initAllPanelVisible();
            this.refreshCellData();
        }.bind(this));
    }
});