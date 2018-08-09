
/*
 * 排行榜列表cell
 **/
var RankListCell = ccui.Layout.extend({
    _id:0,

    ctor:function(simplePlayer, index, type, isSelfRank)
    {
        this._index = index;
        this._id = simplePlayer.getId();

        this._super();
        this.setContentSize(cc.size(1046,91));
        if(isSelfRank)
            this.setBackGroundImage("bg_top_separate_bg_user.png",ccui.Widget.PLIST_TEXTURE);
        else
            this.setBackGroundImage("bg_common_bar.png",ccui.Widget.PLIST_TEXTURE);
        this.setBackGroundImageScale9Enabled(true);
        //this.addListener();
        this.initUI(simplePlayer, index, type);

        this.addListener();
},

    cleanup:function()
    {
        this.removeAllCustomListeners();
        //this._showUserDetailListener = null;
        //this._closeUserDetailListener = null;
        this._super();
    },

    addListener:function()
    {
        if(Player.getInstance().getId() == this._id)
        {
            // 刷新昵称
            this._refreshUserNickNameListener = cc.eventManager.addCustomListener(NOTIFY_REFRESH_USER_NICK_NAME, function(event){
                this._nickNameText.setString(Player.getInstance().getNickName());
            }.bind(this));
        }
    },

    initUI:function(simplePlayer, index, type) {
        var indexUi = (index < 4) ? new cc.Sprite("#icon_home_top_" + index + ".png") : new ccui.Text(index, FONT_ARIAL_BOLD, 30);
        this.addChild(indexUi);
        indexUi.setPos(leftInner(this), ANCHOR_LEFT);
        indexUi.setPositionXAdd((index < 4)? 24: 34);
        if(index>=4) indexUi.setColor(cs.BLACK);

        // 头像
        var avatar = new CircleAvatar(simplePlayer);
        this.addChild(avatar);
        avatar.setScale(0.6);
        avatar.setPos(cc.p(69,this.height/2), ANCHOR_LEFT);

        // 昵称
        var nickNameText = this._nickNameText =  new ccui.Text(simplePlayer.getNickName(), FONT_ARIAL_BOLD, 30);
        this._nickNameText.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        this._nickNameText.setAnchorPoint(0,0.5);
        this._nickNameText.setColor(cc.color(21,25,26));
        this.addChild(nickNameText);
        nickNameText.setPos(cc.p(148,this.height/2), ANCHOR_LEFT);

        //文本
        //var typeText = LocalString.getString("MONTH_WIN_MONEY");
        var moneyTxt = (type == "totalWinList")? simplePlayer.getTotalWin() : simplePlayer.getWeekWin();
        if(moneyTxt > 10000)
            moneyTxt = (moneyTxt/10000).toFixed(2) + "万";
        else
            moneyTxt = moneyTxt.toFixed(2);
        moneyTxt = MONEY_SIGN + moneyTxt;

        moneyTxt = new ccui.Text(moneyTxt, FONT_ARIAL_BOLD, 30);
        moneyTxt.setColor(cc.color(224, 130,31));
        this.addChild(moneyTxt);
        moneyTxt.setPos(cc.p(this.width - 30 ,this.height/2), ANCHOR_RIGHT);

        //响应点击面板
        var touchPanel = this._touchPanel = ccui.Layout();
        touchPanel.setContentSize(this.getContentSize());
        this.addChild(touchPanel);
        touchPanel.setTouchEnabled(true);
        touchPanel.addClickEventListener(function() {
            if(this._id)
                MainController.getInstance().showUserDetailLayer(this._id);
        }.bind(this));
    },

    setHighlight:function(isHighLight)
    {
        if(isHighLight || isHighLight == undefined)
        {
            this.setBackGroundColorEx(cc.color(150, 200, 255));
            this.setBackGroundColorOpacity(30);
        }
        else
        {
            this.setBackGroundColorEx(cc.color(45, 75, 109));
        }
    }
});