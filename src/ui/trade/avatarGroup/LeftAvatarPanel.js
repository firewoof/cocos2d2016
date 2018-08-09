/**
 * Created by Administrator on 2017-03-20.
 */
var LeftAvatarPanel = ccui.Layout.extend({

    ctor:function(size)
    {
        this._super();
        this.setContentSize(size);
        this.setTouchEnabled(true);
        this._fetchGroupInfo = new FetchGroupModel();

        this.initUI();

        this.initTableView();

        this.addListener();
    },

    cleanup:function()
    {
        this._super();
        this.removeAllCustomListeners();
    },

    addListener:function()
    {
        //房间成员新增
        this._roomNewMemberListener = cc.eventManager.addCustomListener(NOTIFY_ROOM_NEW_MEMBER, function(event)
        {
            var data = event.getUserData();
            var curRoom = Player.getInstance().getRoomInfo();
            if(data["roomId"] == curRoom.getRoomId()){
                cc.log("add user::", JSON.stringify(data));
                var member = new BetPlayer(data);
                cc.log("member name::", member.getNickName());
                this._fetchGroupInfo.addMember(member);
                this._tableView.reloadData();
            }
        }.bind(this));

        this._perOneSecondListener = cc.eventManager.addCustomListener(NOTIFY_PER_ONE_SECOND, function(event)
        {
            if(!this.isVisible()){
                return;
            }
            var curSecs = cs.getCurSecs();
            //每隔一段时间
            if(curSecs % 36  == 0 && this._fetchGroupInfo.getMemberList().length > 1){
                cc.log("左侧房间人物,自动排序..........");
                this._fetchGroupInfo.sortMember();
                this._tableView.reloadData();
            }
        }.bind(this));

        //房间成员被删除/离开
        this._roomMemberDelListener = cc.eventManager.addCustomListener(NOTIFY_ROOM_DEL_MEMBER, function(event)
        {
            var data = event.getUserData();
            var curRoom = Player.getInstance().getRoomInfo();
            var memberIdList = data["memberIdList"];
            if(data["roomId"] == curRoom.getRoomId()){
                for(var i = 0; i < memberIdList.length; i++){
                    var id = memberIdList[i];
                    this._fetchGroupInfo.deleteMemberById(id);
                }
                this._tableView.reloadData();
            }
        }.bind(this));

        //房间成员下单
        this._roomMemberTradeOrderListener = cc.eventManager.addCustomListener(NOTIFY_ROOM_TRADE_ORDER, function(event)
        {
            var data = event.getUserData();
            var curRoom = Player.getInstance().getRoomInfo();
            if(data["roomId"] == curRoom.getRoomId()){
                var userId = data["userId"];
                var member = this._fetchGroupInfo.getMemberById(userId);
                var orderData  = data["order"];
                var result = orderData["result"];
                var orderId =  orderData["orderId"];
                var curSecs = cs.getCurSecs();
                //结算or下单
                if(!member){
                    cc.log("订单对应的成员不存在");
                    return;
                }
                if(result == BetInfo.RESULT_TYPE_UN_SETTLE){
                    var betInfo = new BetInfo(orderData);
                    member.appendOrder(betInfo);
                    cc.log("成员下单.....");
                    //通知刷新
                    cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_ORDER_REFRESH, member);
                    //通知抓取层
                    cc.eventManager.dispatchCustomEvent(NOTIFY_FETCH_NEW_ORDER, {"newBetInfo":betInfo, "betPlayer":member});
                    //是否需要排序
                    if(!this.isTableCellShowing(member)  && (curSecs - this._fetchGroupInfo._lastSortTime) > 5){
                        cc.log("左侧人物 触发排序");
                        this._fetchGroupInfo.sortMember();
                        this._tableView.reloadData();
                    }
                }else{
                    var betInfo =  member.getBetById(orderId);
                    if(betInfo){
                        betInfo.initFromJson(orderData);
                        //通知动画
                        cc.eventManager.dispatchCustomEvent(NOTIFY_ROOM_ORDER_COUNT, {"userId":userId, "betInfo":betInfo});
                    }else{
                        member.printBetMap();
                        cc.log("房间左侧人物...订单不存在");   //这里有可能客户端没有抓取完所有订单，但是推送在继续，故忽略
                    }
                }
            }
        }.bind(this));
    },

    initUI:function()
    {
        //右侧的白线
        var sprite = new cc.Scale9Sprite("bg_left_avatar.png");
        sprite.setInsetLeft(0);
        sprite.setInsetRight(4);
        sprite.setInsetTop(0);
        sprite.setInsetBottom(0);
        sprite.setContentSize(this.getContentSize());
        this.addChild(sprite);
        sprite.setPos(cc.p(0, 0), ANCHOR_LEFT_BOTTOM);
    },

    isTableCellShowing:function(member)
    {
        var memberList = this.getMemberList();
        var isShowing = false;
        for(var i = 0; i < 4; i++){
            var tempMember = memberList[i];
            if(tempMember && tempMember.getId() == member.getId()){
                isShowing = true;
                break;
            }
        }
        return isShowing;
    },

    switchProduct:function(productId, data)
    {
        var curProductId = Player.getInstance().getCurProductInfo().getId();
        if(productId != curProductId){
            return;
        }
        this._fetchGroupInfo.initFromJson(data);
        this._fetchGroupInfo.sortMember(productId);
        this._tableView.reloadData()
    },

    getMemberList:function(){
        return this._fetchGroupInfo.getMemberList();
    },

    initTableView:function(){
        var self = this;
        var cellSize = cc.size(this.width - 2, this.height/4);
        var delegate = cc.Class.extend({
            ctor: function() {},
            numberOfCellsInTableView:function (table) { return Math.max(self._fetchGroupInfo.getMemberList().length, 4); },
            tableCellTouched:function (table, cell) {
                var content = cell._content;
                if(content){
                    var member = content.getMember();
                    if(member.getId()){
                        MainController.getInstance().showUserDetailLayer(member.getId());
                    }
                }
            },
            tableCellSizeForIndex:function (table, idx) { return cellSize; },
            tableCellAtIndex:function (table, idx) {
                var cell = table.dequeueCell();
                var info = self._fetchGroupInfo.getMemberList()[idx];
                try{
                    if (cell == null) {
                        cell = new cc.TableViewCell();
                        var content = new FetchAvatarCell(cellSize);
                        cell.addChild(content);
                        content.setPosition(centerInner(cell));
                        content.refresh(info);
                        cell._content = content;

                    }
                    else
                    {
                        cell._content.refresh(info);
                        if(!cell._content._roomMemberOrderRefreshListener){
                            cell._content.addListener();
                        }
                    }
                }catch (e)
                {
                    cc.log(e.stack);
                    cc.log(e);
                }
                return cell;
            }
        });

        var delegate = new delegate();
        delegate._tradingHall = TradingHallLayer.instance;
        var tableView = new cc.TableView(delegate, cc.size(this.width, this.height));
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.setDelegate(delegate);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);

        this.addChild(tableView);
        tableView.setPos(topInner(this), ANCHOR_TOP);
        this._tableView = tableView;
    }

});

var FetchAvatarCell = ccui.Layout.extend({
    _member:undefined,

    ctor:function(size){

        this._super();

        this.setContentSize(size);

        this.initUI();

        this.addListener();
    },

    cleanup:function()
    {
        this._super();
        this.removeAllCustomListeners();
    },

    addListener:function()
    {
        //房间成员下单
        this._roomMemberOrderRefreshListener = cc.eventManager.addCustomListener(NOTIFY_ROOM_ORDER_REFRESH, function(event)
        {
            //cc.log("receive NOTIFY_ROOM_ORDER_REFRESH");
            var member = event.getUserData();
            var curProduct = Player.getInstance().getCurProductInfo();
            if(this._member && member.getId() == this._member.getId()){
                var betArray = member.getBetArray();
                //cc.log("准备显示左侧订单::", betArray.last().getOrderId());
                if(betArray.length > 0 && betArray.last().getProductId() == curProduct.getId()) {
                    this.refreshBetInfo(betArray.last())
                }
            }
        }.bind(this));

        //房间成员下单
        this._roomMemberOrderCountListener = cc.eventManager.addCustomListener(NOTIFY_ROOM_ORDER_COUNT, function(event)
        {
            var userData = event.getUserData();
            var userId = userData["userId"];
            //var curProduct = Player.getInstance().getCurProductInfo();
            if(this._member && userId == this._member.getId()){
                this.showNextBet();
                //TODO 结算动画
                cc.log("执行结算动画.......");
            }
        }.bind(this));

        //切换产品时重置一次 等待刷新
        this._tradeStartListener = cc.eventManager.addCustomListener(NOTIFY_PRODUCT_TRADE_START, function(event)
        {
            var roomId = Player.getInstance().getRoomInfo();
            if(roomId){
                this.resetBet();
            }
        }.bind(this));
    },

    refreshBetInfo:function(betInfo)
    {
        this._betInfo = betInfo;
        //更新下单信息
        this._betAmountText.setString(MONEY_SIGN + betInfo.getBetAmount());
        if(betInfo.isBullish()){
            this._directionLabel.setString(LocalString.getString("BULLISH"));
            this._directionLabel.setColor(cs.RED);
        }else{
            this._directionLabel.setString(LocalString.getString("BEARISH"));
            this._directionLabel.setColor(cs.GREEN);
        }
        this._betAmountText.setFontSize(24);
        this._directionLabel.setFontSize(24);
        if(betInfo.getBetAmount() > 999){
            this._betAmountText.setFontSize(20);
            this._directionLabel.setFontSize(20);
        }
        this._betAmountText.getParent().arrangeChildrenCenter(2, [this._betAmountText, this._directionLabel]);
    },

    initUI:function()
    {
        //底板
        var bgPanel = new ccui.Layout();
        bgPanel.setContentSize(this.getContentSize());
        this.addChild(bgPanel);

        var avatar = new CircleAvatar();
        avatar.setScale(88/avatar.height);
        avatar.setDetailEnabled(false);

        var nameText = new ccui.Text("  ", FONT_ARIAL_BOLD, 20);
        nameText.setColor(cc.color(117, 120, 135));

        var betAmountText = new cc.LabelTTF("    ", FONT_ARIAL_BOLD, 24);
        var directionLabel = new cc.LabelTTF("    ", FONT_ARIAL_BOLD, 24);

        //这里需要方便后面的刷新金额 调整距离
        var betPanel = new ccui.Widget();
        betPanel.setContentSize(this.width, betAmountText.height);
        betPanel.addChild(betAmountText);
        betAmountText.setPos(centerInner(betPanel));
        betPanel.addChild(directionLabel);
        directionLabel.setPos(centerInner(betPanel));

        //垂直组合
        var cobPanel = UICommon.createPanelAlignWidgetsWithPadding(adaptiveSizeHeight(4), cc.UI_ALIGNMENT_VERTICAL_CENTER, avatar, nameText, betPanel);

        bgPanel.addChild(cobPanel);
        cobPanel.setPos(centerInner(bgPanel));
        cobPanel.setVisible(false);

        //头像底部的光晕
        var haloSprite = new cc.Sprite("#animation_avatar_left_bg.png");
        avatar.getParent().addChild(haloSprite);
        haloSprite.setPos(centerOutter(avatar), ANCHOR_CENTER);
        avatar.setLocalZOrder(3);   //保证光晕在头像下面 中心处
        haloSprite.setOpacity(0);

        //没有抓取用户时需要显示 空头像中心位置显示
        var emptyAvatar = new cc.Sprite("#icon_avatar_empty.png");
        bgPanel.addChild(emptyAvatar);
        emptyAvatar.setPos(centerInner(bgPanel));

        //底部加根分割线
        var line  = new cc.LayerColor();
        line.setColor(cc.color(71, 75, 87));
        line.setContentSize(this.width, 2);
        bgPanel.addChild(line);
        line.setPos(bottomInner(bgPanel), ANCHOR_BOTTOM);

        this._circleAvatar = avatar;
        this._nameText = nameText;
        this._cobPanel = cobPanel;
        this._haloSprite = haloSprite;
        this._emptyAvatar = emptyAvatar;
        this._betAmountText = betAmountText;
        this._directionLabel = directionLabel;
    },

    //重置
    resetBet:function()
    {
        this._betInfo = null;
        this._betAmountText.setString("");
        this._directionLabel.setString("");
    },

    showNextBet:function()
    {
        if(!this._member){
            return;
        }
        this.resetBet();
        var member = this._member;
        var productId = Player.getInstance().getCurProductInfo().getId();
        //找到当前期权最近的单
        var unSettledBet = member.getLatestUnSettledBet(productId);
        if(unSettledBet){
            this.refreshBetInfo(unSettledBet);
        }
    },

    getMember:function()
    {
        return this._member;
    },

    refresh:function(member)
    {
        this._betInfo = null;
        this._member = member;
        if(member)
        {
            this._circleAvatar.refresh(member);
            var nickName = member.getNickName();
            this._nameText.setString(nickName);
            if(this._nameText.width > 0.85 * this.width){
                nickName = nickName.substring(0, Math.min(nickName.length - 3, 5)) + "...";
                this._nameText.setString(nickName);
            }

            //显示下一个订单
            this.showNextBet();

            this._emptyAvatar.setVisible(false);
            this._cobPanel.setVisible(true);
        }
        else
        {
            this._circleAvatar.setAvatarSrc("avatar_default.png");
            this._nameText.setString("");
            this._emptyAvatar.setVisible(true);
            this._cobPanel.setVisible(false);
            this.resetBet();
        }
    }

});

var FetchGroupModel = cc.Class.extend({
    _memberList:undefined,
    _productId:-1,

    ctor:function(jsonData)
    {
        this._memberList = [];
        this._memberMap = {};
        if(jsonData){
            this.initFromJson(jsonData);
        }
    },

    initFromJson:function(jsonData)
    {
        this._memberList = [];
        this._memberMap = {};
        this._memberList = ALCommon.getArrayWithKey(jsonData, "memberList", this._memberList, BetPlayer);
        //生成map映射
        for(var i = 0; i < this._memberList.length; i++){
            var member = this._memberList[i];
            this._memberMap[member.getId()] = member;
        }
    },

    addMember:function(member)
    {
        this._memberList.push(member);
        this._memberMap[member.getId()] = member;
    },

    deleteMemberById:function(id)
    {
        var len = this._memberList.length;
        for(var i = 0; i < len; i++){
            var member = this._memberList[i];
            if(member.getId() == id){
                this._memberList.splice(i, 1);
                this._memberMap[id] = undefined;
                break;
            }
        }
    },

    getMemberById:function(id)
    {
        return this._memberMap[id];
    },

    getMemberList:function()
    {
        return this._memberList;
    },

    getProductId:function()
    {
        return this._productId;
    },

    sortCompareFunc:function(a, b){
        var productId = Player.getInstance().getCurProductInfo().getId();
        var aBets = a.getBetArray();
        var bBets = b.getBetArray();
        var aBetsLength = aBets.length;
        var bBetsLength = bBets.length;
        //cc.log("比较::"+a.getNickName() + ' <==> ' + b.getNickName() + " aLen:"+ aBetsLength +" bLen:"+bBetsLength);
        if(bBetsLength == 0){
            return false;
        }
        if(bBetsLength > 0  && aBetsLength == 0){
            return true;
        }
        var bIsExistsProductBet = false;
        var bLatestBetTime = null;
        for(var i = bBetsLength - 1; i >= 0  ; i--){
            var betInfo = bBets[i];
            if(betInfo.getProductId() == productId) {
                bIsExistsProductBet = true;
                bLatestBetTime = betInfo.getBetTime();
                break;
            }
        }

        if(bIsExistsProductBet && bBetsLength > 0){
            var aIsExistsProductBet = false;
            var aLatestBetTime = null;
            for(var i = aBetsLength - 1; i >= 0  ; i--){
                var betInfo = aBets[i];
                if(betInfo.getProductId() == productId) {
                    aIsExistsProductBet = true;
                    aLatestBetTime = betInfo.getBetTime();
                    break;
                }
            }
            if(aIsExistsProductBet){
                return bLatestBetTime > aLatestBetTime;
            }
        }
        return false;
    },

    sortMember:function()
    {
        this._lastSortTime = cs.getCurSecs();
        this._memberList.sort(this.sortCompareFunc)
    }
});