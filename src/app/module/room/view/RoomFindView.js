/**
 * Created by Administrator on 2017/2/22.
 */


var RoomFindView = BaseLayer.extend({
    ctor: function (controller) {
        this._super("RoomFindView");

        this._controller = controller;
        this._cellInfoArray = [];
        this.setContentSize(cc.winSize);

        this.initUI();

        this.initAllClickFunc();

        this.refreshFindList("");

        this.addListener();
    },

    addListener:function()
    {
        this._quitRoomListener = cc.eventManager.addCustomListener(NOTIFY_QUIT_ROOM, function(){
            this.refreshFindList();
        }.bind(this))
    },

    initUI: function () {
        //从studio中取出相应的组件
        var rootLayer = this._rootLayer = ccs.loadWithVisibleSize(res.RoomFindRoom_json).node;
        ccui.helper.doLayout(rootLayer);
        this.addChild(rootLayer);

        var bgPanel = this._bgPanel = ccui.helper.seekWidgetByName(rootLayer, "bgPanel");
        var titlePanel = this._titlePanel = ccui.helper.seekWidgetByName(bgPanel, "titlePanel");
        var touchPanel = this._touchPanel = ccui.helper.seekWidgetByName(rootLayer, "touchPanel");
        var titleTxt = this._titleTxt = ccui.helper.seekWidgetByName(titlePanel, "titleTxt");
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");
        var listPanel = this._listPanel = ccui.helper.seekWidgetByName(rootLayer, "listPanel");
        var imageFind = this._imageFind = ccui.helper.seekWidgetByName(touchPanel, "imageFind");
        var hotRoomText = this._hotRoomText = ccui.helper.seekWidgetByName(rootLayer, "hotRoomText");

        backBtn.setTouchEnabled(true);
        imageFind.setTouchEnabled(true);
        touchPanel.setTouchEnabled(true);


        var label = this._label = cc.LabelTTF("搜索房间号或名称",FONT_ARIAL_BOLD,28);
        this._touchPanel.addChild(label);
        label.setAnchorPoint(ANCHOR_CENTER);
        label.setPos(cc.p(this._touchPanel.width/2,this._touchPanel.height/2),ANCHOR_CENTER);
        label.setColor(cc.color(143,162,176));

        //创建修改按键
        var btnClose = this._btnClose = new ccui.ImageView("btn_close_n.png",ccui.Widget.PLIST_TEXTURE);
        btnClose.setTouchEnabled(true);
        this._touchPanel.addChild(btnClose);
        btnClose.setVisible(false);

        this.createEditBox();

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
                var content = cell._content;
                if(content){
                    content.enterRoom();
                }
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
                        var roomCell = new RoomChooseCellView(info);
                        cell.addChild(roomCell);
                        cell._content = roomCell;
                        cell._content.setTouchEnabled(false);
                    }
                    else {
                        cc.log("info name::", info.getRoomName());
                        cell._content.refresh(info);
                        if(!cell._content._roomNameChangeListener){
                            cell._content.addListener();
                        }
                    }
                }catch(e){
                    cc.log(e);
                    cc.log(e.stack);
                    G_collectLog(e);
                    G_collectLog(e.stack);
                    //throw e
                }
                return cell;
            },

            numberOfCellsInTableView:function (table) {
                return self._cellInfoArray.length;
            }
        });

        var delegate = new delegate();
        var tableView = this._tableView = new cc.TableView(delegate, this._listPanel.getContentSize());
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.setDelegate(delegate);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);

        this._listPanel.addChild(tableView);
        tableView.setAnchorPoint(ANCHOR_TOP);
        tableView.setPos(topInner(this._listPanel), ANCHOR_TOP);
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
        editBox.setPlaceHolder("请输入房间名称");
        editBox.setPlaceholderFont(FONT_ARIAL_BOLD,24);
        editBox.setFont(FONT_ARIAL_BOLD,24);
        editBox.setFontColor(cc.color(21,25,26));
        editBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);  //修改为不使用密文
        editBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        panelEditBox.addChild(editBox,1,10);
        editBox.setPos(cc.p(0,0),ANCHOR_LEFT_BOTTOM);

        //创建确定按钮
        var btnConfirmEditBox = this._btnConfirmEditBox = new ccui.ImageView("btn_common_green_n.png",ccui.Widget.PLIST_TEXTURE);
        btnConfirmEditBox.setScale9Enabled(true);
        btnConfirmEditBox.setCapInsets(cc.rect(20,5,5,5));
        btnConfirmEditBox.setContentSize(cc.size(165,90));
        panelEditBox.addChild(btnConfirmEditBox,1,10);
        btnConfirmEditBox.setTouchEnabled(true);
        btnConfirmEditBox.setPos(cc.p(1165,panelEditBox.height/2),ANCHOR_LEFT);

        //创建确定按钮的标题
        var text = new ccui.Text("确定", FONT_ARIAL_BOLD, 30);
        btnConfirmEditBox.addChild(text);
        text.setPosition(centerInner(btnConfirmEditBox));
        text.setColor(cc.color(255,255,255));
    },

    refreshFindList: function(keyword){
        cc.log("keyword::", keyword);
        if(keyword == undefined){
            keyword = "";
        }
        this._keyword = keyword;
        var successCallBack = function(data){
            cc.log("refreshFindRoomListAAAAAAAA:", JSON.stringify(data));
            MainController.getInstance().hideLoadingWaitLayer();
            this._cellInfoArray = [];
            //添加虚拟的房间cellInfo 交易大厅
            this.addTradingHallCellInfo();

            if(data.length > 0){
                for(var i=0; i< data.length; i++){
                    var info = new RoomChooseCellModel(data[i]);
                    if(info.getIsMember()){
                        info.setParentNode(this);
                    }
                    this._cellInfoArray.push(info);
                }
            }
            this._tableView.reloadData();
        }.bind(this);
        HttpManager.requestSearchRoom(successCallBack,keyword);
        MainController.getInstance().showLoadingWaitLayer();
    },

    /**
     * 需求新增--在顶部放交易大厅入口
     */
    addTradingHallCellInfo:function(){
        var info = new RoomChooseCellModel();
        info.setRoomName(LocalString.getString("TRADING_HALL"));
        info.setRoomId(-1);
        this._cellInfoArray.unshift(info);
    },

    clickCallBackForEditBox: function(){
        this.showEditBox(false);

        var editString = this._editBox.getString().trim();
        cc.log("editString::", editString);
        if(editString.length > 0){
            this._label.setString(editString);
            this._label.setColor(cc.color(21,25,26));

            this._btnClose.setPos(rightOutter(this._label), ANCHOR_LEFT);
            this._btnClose.setPositionXAdd(2);
            this._btnClose.setVisible(true);
        }else{
            this._btnClose.setVisible(false);
            this._label.setString("搜索房间号或房间名称");
            this._label.setColor(cc.color(143,162,176));
        }
        this.refreshFindList(editString);
    },

    showEditBox:function(isShow)
    {
        if(!this._editBox){
            this.createEditBox();
        }
        this._maskEditBox.setVisible(true);
        this._panelEditBox.setVisible(true);
        if(isShow ==  true || isShow == undefined){
            cc.log("重新赋值  editBox string:", this._keyword);
            this._editBox.setString(this._keyword || "");
        }else{
            this._maskEditBox.setVisible(false);
            this._panelEditBox.setVisible(false);
        }
    },

    initAllClickFunc: function(){
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        //清除EditBox字符串
        this._btnClose.addClickEventListener(function(sender)
        {
            this._editBox.setString("");
            this.clickCallBackForEditBox();
        }.bind(this));

        //打开EditBox
        this._touchPanel.addClickEventListener(function(sender)
        {
            this.showEditBox();
        }.bind(this));

        //EditBox确认按键
        this._btnConfirmEditBox.addClickEventListener(function(sender)
        {
            this.clickCallBackForEditBox();
        }.bind(this));

        //遮罩点击
        this._maskEditBox.addClickEventListener(function(sender)
        {
           this.showEditBox(false);
        }.bind(this));
    }
});