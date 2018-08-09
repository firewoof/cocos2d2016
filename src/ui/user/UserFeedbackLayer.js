/**
 * Created by Jony on 2016/9/9
 */

var UserFeedbackLayer = BaseLayer.extend({
    _feedbackArray:[],

    ctor:function(feedbackArray)
    {
        this._super("UserFeedbackLayer");
        //UI
        this.initUI();
        //点击事件
        this.initAllClickFunc();
        //
        this.addListener();
        //
        this._feedbackArray = feedbackArray;
        this.showFeedbackList();
    },

    initUI:function()
    {
        var layer = ccs.loadWithVisibleSize(res.UserFeedbackLayer_json).node;
        // 加入到当前layer中。
        this.addChild(layer);
        // 按钮
        //
        var titlePanel = ccui.helper.seekWidgetByName(layer, "titlePanel");
        // 返回按钮
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");

        var userFeedbackPanel = this._userFeedbackPanel = ccui.helper.seekWidgetByName(layer, "userFeedbackPanel");
        var chatPanel = this._chatPanel = ccui.helper.seekWidgetByName(userFeedbackPanel, "chatPanel");
        var sendBtn = this._sendBtn = ccui.helper.seekWidgetByName(userFeedbackPanel, "sendBtn");
        this._sendBtn.setGray(true);

        var chatEditBoxBg = ccui.helper.seekWidgetByName(userFeedbackPanel, "chatEditBoxBg");
        this._chatEditBox = new cc.EditBox(chatEditBoxBg.getContentSize(),new cc.Scale9Sprite("bg_common_bottom_frame.png"));
        chatEditBoxBg.addChild(this._chatEditBox);
        this._chatEditBox.setPosition(centerInner(chatEditBoxBg));
        this._chatEditBox.setFontSize(24);
        this._chatEditBox.setFontColor(cs.BLACK);
        this._chatEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this._chatEditBox.setPlaceHolder(LocalString.getString("ACCOUNT_FEEDBACK_EDITBOX_PLACEHOLDER"));
        this._chatEditBox.setPlaceholderFontColor(cs.GRAY);
        this._chatEditBox.setPlaceholderFontSize(24);
        this._chatEditBox.setDelegate(this);
    },

    initAllClickFunc:function()
    {
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);

            if(this._doFeedback) {
                MainController.showAutoDisappearAlertByText(LocalString.getString("ACCOUNT_FEEDBACK_TIP"));
            }
        }.bind(this));

        this._sendBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);

            var str = this._chatEditBox.getString().trim();
            new HttpRequest("feedbackAdd", {auth:{content:str}}, function(data){
                //cc.log("用户反馈成功");
                this._doFeedback = true;
                this._chatEditBox.setString("");
                this._sendBtn.setGray(true);
            }.bind(this));
        }.bind(this));
    },

    addListener:function()
    {
        this._feedbackListener = cc.eventManager.addCustomListener(NOTIFY_FEEDBACK, function(event)
        {
            this._feedbackArray.push(event.getUserData());
            //cc.log("this._feedbackArray: "+JSON.stringify(this._feedbackArray));

            this._tableView.reloadData();

            // TODO
            if(this._tableView.getContentOffset().y < 0)
                this._tableView.setContentOffset(this._tableView.maxContainerOffset());
        }.bind(this));
    },

    //
    editBoxTextChanged: function (editBox, text) {
        //cc.log("editBox Changed !");
        if(this._chatEditBox == editBox)
        {
           this._sendBtn.setGray(text.trim().length==0);
        }
    },

    showFeedbackList: function()
    {
        //自动添加默认回复
        this._feedbackArray.unshift({questioner:false, content:LocalString.getString("ACCOUNT_FEEDBACK_CONTENT_PLACEHOLDER")});

        var self = this;
        var delegate = cc.Class.extend({

            ctor: function() {},

            scrollViewDidScroll:function (view) {
                //cc.log("scrollViewDidScroll")
            },
            scrollViewDidZoom:function (view) {},

            tableCellTouched:function (table, cell) {
                cc.log("cell touched at index: " + cell.getIdx());
                //cell._content.onTouchCallback();
            },

            tableCellSizeForIndex:function (table, idx) {
                //return cc.size(1108,115);
                //cc.log("tableCellSizeForIndex: " + idx);
                //TODO
                var txt = UIString.scriptToRichTextEx("<l>"+ self._feedbackArray[idx].content +"</l>", 698, "Arial", 24, cs.BLACK);
                var realH = 88 + txt.getVirtualRendererSize().height - 24 + 30;
                ////var cell = table.cellAtIndex(idx);
                ////if(cell && cell._content)
                ////    return cell._content.getAdaptSize();
                //
                if(realH < 88) realH = 88;
                return cc.size(1108,realH);
                //return cc.size(1108,200);
            },

            tableCellAtIndex:function (table, idx) {
                //cc.log("tableCellAtIndex: ", idx);
                var cell = table.dequeueCell();
                var info = self._feedbackArray[idx];
                try{
                    if (cell == null) {
                        cell = new cc.TableViewCell();

                        var content = new FeedbackListCell(info);
                        cell.addChild(content);
                        content.setPosition(centerInner(cell));
                        cell._content = content;
                    }
                    else
                    {
                        cell._content.refresh(info);
                    }
                }catch (e)
                {
                    cc.log(e.stack);
                }

                return cell;
            },

            numberOfCellsInTableView:function (table) {
                return self._feedbackArray.length;
            }
        });

        var delegate = new delegate();
        var tableView = this._tableView = new cc.TableView(delegate, this._chatPanel.getContentSize());
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.setDelegate(delegate);
        tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);

        this._chatPanel.addChild(tableView);
        tableView.setPos(topInner(this._chatPanel), ANCHOR_TOP);

        // TODO
        // ContentOffset 是最下面cell底部相对于（0,0）的偏移
        // maxContainerOffset(): (0,0)
        if(tableView.getContentOffset().y < 0)
            tableView.setContentOffset(tableView.maxContainerOffset());
    }
});



/*
 * 反馈列表cell
 **/
var FeedbackListCell = ccui.Layout.extend({
    _feedbackInfo:undefined,

    ctor:function(feedbackInfo)
    {
        this._super();
        //this.setContentSize(cc.size(1108,88));
        this._feedbackInfo = feedbackInfo;
        this.refresh(feedbackInfo);
    },

    cleanup:function()
    {
        this.removeAllCustomListeners();
        this._super();
    },

    refresh:function(feedbackInfo) {
        var feedbackInfo = this._feedbackInfo = feedbackInfo || this._feedbackInfo;
        if(!feedbackInfo)
            return;
        this.removeAllChildren();
        //
        var txt = UIString.scriptToRichTextEx("<l>"+feedbackInfo.content+"</l>", 698, "Arial", 24, cs.BLACK);
        var txtRealH = txt.getVirtualRendererSize().height;
        //cc.log("txt.getVirtualRendererSize().height" + txtRealH);
        if(txtRealH < 24) txtRealH = 24;
        this.setContentSize(cc.size(1108,88 + txtRealH - 24 + 30));

        var bg = null;//底框
        var avatar = null;
        var avatarPosDx = 20;
        var titleTxt = null;
        if(feedbackInfo.questioner)
        {
            bg = new cc.Scale9Sprite("bg_talk_separate.png");
            bg.setInsetLeft(10);
            bg.setInsetRight(20);

            avatar = new CircleAvatar(Player.getInstance());
            avatar.setDetailEnabled(false);
            this.addChild(avatar);
            avatar.setPos(cc.p(this.width - avatarPosDx, this.height - 5), ANCHOR_RIGHT_TOP);
        }
        else
        {
            bg = new cc.Scale9Sprite("bg_talk_separate_2.png");
            bg.setInsetLeft(20);
            bg.setInsetRight(10);

            avatar = new cc.Sprite("#icon_avatar_cs.png");
            this.addChild(avatar);
            avatar.setPos(cc.p(avatarPosDx, this.height -8), ANCHOR_LEFT_TOP);

            titleTxt = new ccui.Text(LocalString.getString("ACCOUNT_FEEDBACK_SERVER"), FONT_ARIAL_BOLD, 24);
            titleTxt.setTextColor(cs.GRAY);
            //bg.addChild(titleTxt);
            //titleTxt.setPos(cc.p(46, this.height -8), ANCHOR_LEFT_TOP);
        }

        bg.setInsetTop(64);
        bg.setInsetBottom(20);
        bg.setScale9Enabled(true);
        bg.setContentSize(790,88 + txtRealH - 24);

        bg.addChild(txt);
        txt.setPos(centerInner(bg), ANCHOR_CENTER);

        this.addChild(bg);
        bg.setPos(centerInner(this), ANCHOR_CENTER);
        bg.setPositionXAdd(5);
        txt.setPositionXAdd(-5);

        if(titleTxt)
        {
            bg.addChild(titleTxt);
            titleTxt.setPos(cc.p(46+5, bg.height - 13), ANCHOR_LEFT_TOP);
            txt.setPos(cc.p(bg.width/2 + 5, bg.height - 26 - 24), ANCHOR_TOP);

            bg.setPositionXAdd(-10);
            //txt.setPositionXAdd(10);
        }
    }
});
