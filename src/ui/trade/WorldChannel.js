/**
 * Created by 玲英 on 2016/11/8.
 */
var WorldChannel = cc.LayerColor.extend({
    _index:0,
    _lastScrollIndex:0,

    ctor:function()
    {
        this._super();

        this.setContentSize(650, 120);

        this._messageArray = [];
        this._cacheMessageArray = [];
        this.MAX_MESSAGE_LEN = 50;

        //this.testInfo();

        this.intUI();

        this.setOpacity(0);

        this.addListener();

        this.scheduleUpdate();

        //创建屏幕点击层（点击后滚动停止五秒钟）
       this.clickPausePanel();
    },

    addListener:function(){
        this._noticeListener = cc.eventManager.addCustomListener(NOTIFY_NOTICE, function(event)
        {
            var noticeInfo = event.getUserData();
            if(noticeInfo.getType() == NoticeInfo.TYPE_ORDER){
                this._betMsgPanel.refresh(noticeInfo);
            }else{
                this._cacheMessageArray.push(noticeInfo.getRichStr());
                //this.appendMessage(noticeInfo.getRichStr());
            }
        }.bind(this));
    },

    cleanup:function()
    {
        this.removeAllCustomListeners();
        this._super();
    },

    intUI:function()
    {
        var tableView = this._tableView = this.createTabView();
        this.addChild(tableView);
        tableView.setContentOffset(cc.p(0, 0));

        var betMsgPanel = this._betMsgPanel = new BetMsgPanel();
        this.addChild(betMsgPanel);
        betMsgPanel.setPos(leftTopInner(this), ANCHOR_LEFT_BOTTOM);
        betMsgPanel.setPositionYAdd(8);

        if(isEducationVersion) {
            betMsgPanel.setVisible(false);
        }
    },

    update:function(dt)
    {

        //这里是为了能平滑滚动
        if(this._autoScrollEnabled && this._cacheMessageArray.length > 0 && this._tableView.getContainer().getNumberOfRunningActions() == 0) {
            var diff = (this._messageArray.length + this._cacheMessageArray.length) - this.MAX_MESSAGE_LEN;
            if(diff > 0){
                //cc.log("缓存超出，队头消息移除num:", diff);
                this._messageArray.splice(0, Math.min(diff, this._messageArray.length));
            }
            for(var i = 0; i < this._cacheMessageArray.length; i++){
                this._messageArray.push(this._cacheMessageArray[i]);
            }
            this._index += this._cacheMessageArray.length;
            this._cacheMessageArray = [];
            if(this._autoScrollEnabled){
                this.doScroll();
            }
        }

        //点击五秒后允许屏幕滚动
        if(!this._autoScrollEnabled){
            this._timeCount += dt;
            if(this._timeCount >= 5){
                this._autoScrollEnabled = true;
            }
        }
    },

    //创建屏幕点击层（点击后滚动停止五秒钟）
    clickPausePanel: function(){
        var clickLayer = new ccui.Layout();
        this.addChild(clickLayer, 9);
        clickLayer.setContentSize(this.getContentSize());
        clickLayer.setTouchEnabled(true);
        clickLayer.setSwallowTouches(false);

        //创建计时index以及判断公告能否滚动
        var timeIndex = this._timeCount = 0;
        var scrollEnabled = this._autoScrollEnabled = true;
        var self = this;
        clickLayer.addTouchEventListener(function(sender, eventType){
            switch (eventType)
            {
                case ccui.Widget.TOUCH_BEGAN:
                    self._autoScrollEnabled = false;
                    break;
                case ccui.Widget.TOUCH_MOVED:
                    break;
                default :
                    self._timeCount = 0;
                    self._autoScrollEnabled = false;
                    break;
            }
        });
    },

    doScroll:function()
    {
        this._tableView.reloadData();
        var cellHeight = 30;    //滚动一行的高度

        //计算需要从哪里开始滚
        var offset = -cellHeight;
        var diff = this._index - this._lastScrollIndex;
        if(diff > 0){
            var indeedDiff = diff;
            diff = Math.min(diff, 4);       //让滚动不至于太快()
            offset = -cellHeight * diff;
            //cc.log("diff:", diff, indeedDiff);
        }
        this._tableView.setContentOffset(cc.p(0, offset));
        this._tableView.setContentOffsetInDuration(cc.p(0, 0), 0.5);
        //记住滚屏时的index
        this._lastScrollIndex = this._index;
    },

    createTabView:function()
    {
        var messageArray = this._messageArray;
        var delegate = cc.Class.extend({

            ctor: function() {},

            scrollViewDidScroll:function (view) {},
            scrollViewDidZoom:function (view) {},
            tableCellTouched:function (table, cell) {
                //cc.log("cell touched at index: " + cell.getIdx());
            },

            tableCellSizeForIndex:function (table, idx) {
                return cc.size(650, 30);
            },

            tableCellAtIndex:function (table, idx) {
                //cc.log("idx", idx);
                var cell = table.dequeueCell();
                var msgText = messageArray[idx];
                try{
                    if (cell == null) {
                        cell = new cc.TableViewCell();
                    }
                    else
                    {
                        if(cell._content){
                            cell._content.removeFromParent();
                            cell._content = null;
                        }
                    }
                    var uiStr = UIString.scriptToRichTextEx(msgText, undefined, FONT_ARIAL_BOLD, 24);
                    cell.addChild(uiStr);
                    uiStr.setPosition(centerInner(cell));
                    cell._content = uiStr;
                }catch (e)
                {
                    cc.log(e.stack);
                }

                return cell;
            },

            numberOfCellsInTableView:function (table) {
                return messageArray.length;
            }
        });

        var delegate = new delegate();
        var tableView = new cc.TableView(delegate, cc.size(650, 120));
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.setDelegate(delegate);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        tableView.setTouchEnabled(false);

        return tableView;
    },


    testInfo:function()
    {
        for(var i = 0; i < 40; i++){
            var str = cc.formatStr("<l c=ff0000 >精神高涨</l><l>效果：战斗金钱奖励增加</l><l c=ff0000 >%s</l>", (i + 80) + "%");
            cc.log("str::", str);
            this._messageArray.push(str);
        }
    }

});

/**
 * 下单通告
 * @type {Function}
 */
var BetMsgPanel = cc.Node.extend({

    ctor:function()
    {
        this._super();
        this.setContentSize(300, 56);

        this.initUI();

        this._noticeArray = [];
    },

    initUI:function()
    {
        var bgPanel = this._bgPanel = new cc.Scale9Sprite("bg_news_roll.png");
        bgPanel.setAnchorPoint(ANCHOR_LEFT);
        bgPanel.setInsetLeft(35);
        bgPanel.setInsetRight(35);
        bgPanel.setInsetTop(0);
        bgPanel.setInsetBottom(0);
        bgPanel.setContentSize(this.getContentSize());
        bgPanel.setVisible(false);

        this.addChild(bgPanel);
        bgPanel.setPos(leftInner(this), ANCHOR_LEFT);
        bgPanel.originPos = bgPanel.getPosition();


        var avatar = this._avatar = new CircleAvatar();
        this._bgPanel.addChild(avatar);
        avatar.setScale(45/avatar.height);
        avatar.setPos(leftInner(this._bgPanel), ANCHOR_LEFT);
        avatar.setPositionXAdd(6);
        avatar.setCascadeOpacityEnabled(true);
    },

    doRemoveAction:function()
    {
        var bgPanel = this._bgPanel;
        bgPanel.setPosition(0, 0);
        bgPanel.setScale(1, 1);
        bgPanel.setVisible(true);
        bgPanel.setOpacity(255);
        bgPanel.stopAllActions();
        bgPanel.setCascadeOpacityAll();
        bgPanel.setPosition(bgPanel.originPos.x-300, bgPanel.originPos.y);

        //bgPanel.setOpacity(180);

        bgPanel.runAction(new cc.Sequence(
            //new cc.ScaleTo(0.15, 1.0, 1.0).easing(cc.easeBackOut()),
            new cc.MoveTo(0.2, bgPanel.originPos).easing(cc.easeBackOut()),
            new cc.DelayTime(6.0),
            new cc.Spawn(
                new cc.MoveTo(0.6, 0, 50),
                new cc.FadeTo(0.8, 50)
            ),
            new cc.ScaleTo(0.2, 1, 0),
            new cc.Hide()
        ));
    },

    //update:function(dt)
    //{
    //    var curSecs = cs.getCurSecs();
    //    //这里是为了能平滑滚动
    //    if (this._noticeArray.length > 0 && this._lastRefreshTime && (curSecs - this._lastRefreshTime) <= 2) {
    //        for (var i = 0; i < this._cacheMessageArray.length; i++) {
    //            this._messageArray.push(this._cacheMessageArray[i]);
    //            //保证公告容器不大于100条
    //            if (this._messageArray.length >= 100) {
    //                this._messageArray.slice(0, 1);
    //            }
    //        }
    //        this._index += this._cacheMessageArray.length;
    //        this._cacheMessageArray = [];
    //        if (this._autoScrollEnabled) {
    //            this.doScroll();
    //        }
    //    }
    //},
    //
    //pushNotice:function(noticeInfo)
    //{
    //    this._noticeArray.push(noticeInfo);
    //},

    refresh:function(noticeInfo)
    {
        //var curSecs = cs.getCurSecs();
        //if(this._lastRefreshTime && (curSecs - this._lastRefreshTime) <= 2){
        //    //cc.log("大单播报过快 本次丢弃");
        //    return;
        //}
        //this._lastRefreshTime = curSecs;
        //刷新头像
        this._avatar.setAvatarSrc(noticeInfo.getAvatarUrl());

        //文本
        var richStr = "";
        var productName = noticeInfo.getProductName();    //产品名称
        var nickName = noticeInfo.getNickName();          //玩家名称
        var directionStr = noticeInfo.getDirectionStr();  //看涨看跌
        var betAmount = noticeInfo.getBetAmount();

        //var nickName = "测试长度7个字啊啊啊";
        if(nickName.gblen() > 14){
            nickName = nickName.substring(0, Math.min(nickName.length - 3, 5)) + "**";
        }

        var nameLabel = new cc.LabelTTF(cc.formatStr("%s 在", nickName), FONT_ARIAL_BOLD, 16);

        var productLabel = new cc.LabelTTF(productName, FONT_ARIAL_BOLD, 16);

        productLabel.setColor(cs.RED);
        var topPanel = UICommon.createPanelAlignWidgetsWithPadding(2, cc.UI_ALIGNMENT_HORIZONTAL_CENTER, nameLabel, productLabel);

        var directionLabel = null;
        if(noticeInfo.getDirection() > 0){
            directionLabel = new cc.LabelTTF(LocalString.getString("BULLISH"), FONT_ARIAL_BOLD, 24);
            directionLabel.setColor(cs.RED);
        }else{
            directionLabel = new cc.LabelTTF(LocalString.getString("BEARISH"), FONT_ARIAL_BOLD, 24);
            directionLabel.setColor(cs.GREEN);
        }
        var betAmountLabel = new cc.LabelTTF(MONEY_SIGN + betAmount, FONT_ARIAL_BOLD, 24);
        var bottomPanel = UICommon.createPanelAlignWidgetsWithPadding(4, cc.UI_ALIGNMENT_HORIZONTAL_CENTER, betAmountLabel, directionLabel);


        if(this._msgPanel){
            this._msgPanel.removeFromParent();
        }
        var msgPanel = this._msgPanel = UICommon.createPanelAlignWidgetsWithPadding(2, cc.UI_ALIGNMENT_VERTICAL_LEFT, topPanel, bottomPanel);

        this._bgPanel.addChild(msgPanel);
        msgPanel.setAnchorPoint(cc.p(0, 0.5));
        msgPanel.setPosition(rightOutter(this._avatar));
        msgPanel.setPositionXAdd(6);

        this.doRemoveAction();
    }

});