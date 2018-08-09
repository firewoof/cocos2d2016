/**
 * 交易大厅--下单区--抓取层
 * Created by 玲英 on 2016/10/26.
 */
var TrendSubFetchPanel = cc.Node.extend({

    /**
     * @param formulas 位置-数据转换公式
     */
    ctor:function()
    {
        this._super();

        //this.setBackGroundColorEx(cc.GREEN);

        //this._betPlayers = [];
        //减少频繁创建
        //this._cycleBetViews = [];       //被回收的下单点
        //this._cycleBetAvatars = [];      //被回收的抓取头像
        this._betAvatars = [];          //已被创建的头像(包括标记回收的)
        this._maxAvatar = 40;

        this.addListener();
    },

    cleanup:function()
    {
        this.removeAllCustomListeners();
        //this._betPlayers = [];
        this._betAvatars = [];

        this._super();
        cc.log("TrendSubFetchPanel cleanup");
    },

    addListener:function()
    {
        //this._addFetchPlayerListener = cc.eventManager.addCustomListener(NOTIFY_ADD_FETCH_PLAYER, function(event)
        //{
        //    var betPlayer = event.getUserData();
        //    var curProductId = Player.getInstance().getCurProductInfo().getId();
        //    var lastBetInfo = betPlayer.getBetArray().last();
        //    if(betPlayer && lastBetInfo && lastBetInfo.getProductId() == curProductId)
        //        this.addBetPlayer(betPlayer);
        //}.bind(this));
        //
        //this._removeFetchPlayerListener = cc.eventManager.addCustomListener(NOTIFY_REMOVE_FETCH_PLAYER, function(event)
        //{
        //    var betPlayer = event.getUserData();
        //    if(betPlayer)
        //        this.removeBetPlayer(betPlayer);
        //}.bind(this));

        //抓取用户有变更( 这里为了方便 直接重置本类的面板头像)
        this._fetchPlayerChangesListener = cc.eventManager.addCustomListener(NOTIFY_FETCH_PLAYER_CHANGES, function(event)
        {
            cc.log("receive NOTIFY_FETCH_PLAYER_CHANGES");
            //var productId = event.getUserData();
            this.reset();

            this.refresh();
        }.bind(this));

        ////抓满用户监听
        //this._fullFetchListener = cc.eventManager.addCustomListener(NOTIFY_FETCH_FULL_PLAYERS, function(event)
        //{
        //    var productId = event.getUserData();
        //    if(productId == Player.getInstance().getCurProductInfo().getId()) {
        //        this.reset();
        //    }
        //}.bind(this));

        //用户下单
        this._fetchNewOrderListener = cc.eventManager.addCustomListener(NOTIFY_FETCH_NEW_ORDER, function(event)
        {
            var userData = event.getUserData();
            var productInfo = Player.getInstance().getCurProductInfo();
            var newBetInfo  = userData["newBetInfo"];
            if(!userData || productInfo.getId() != newBetInfo.getProductId())
                return;

            var betPlayer =  userData["betPlayer"];
            this.genBetAvatar(betPlayer, newBetInfo.getOrderId());
            //var betAvatars = this._betAvatars;
            //for(var i = 0; i < betAvatars.length; i++) {
            //    var betAvatar = betAvatars[i];
            //    var tempPlayer = betAvatar.getBetPlayer();
            //    if(tempPlayer && tempPlayer.getId() == userId && betAvatar){
            //        betAvatar.refresh();
            //        break;
            //    }
            //}
        }.bind(this));
    },

    setFormulas:function(formulas)
    {
       this._formulas = formulas;
    },

    /**
     * 重置
     */
    reset:function()
    {
        var productInfo = Player.getInstance().getCurProductInfo();
        //产品可能还没预备好
        if(!productInfo){
            return;
        }

        //cc.log("before remove this._betAvatars::", this._betAvatars.length);

        var betAvatars = this._betAvatars;
        //回收所有头像
        for(var i = 0; i < betAvatars.length; i++) {
            var betAvatar = betAvatars[i];
            this.cycleAvatar(betAvatar);
        }
        //重置
        //this._betPlayers = [];


        //重刷数据
        var roomId = Player.getInstance().getRoomId();
        if(roomId){
            var members =  TradingHallLayer.instance._leftAvatarPanel.getMemberList();
            for(var i = 0; i < members.length; i++) {
                var betPlayer = members[i];
                if(betPlayer && betPlayer.getBetArray().length > 0)
                    this.addBetPlayer(betPlayer);
            }
        }else{
            var fetchPlayers = productInfo.getFetchPlayers();
            for(var i = 0; i < fetchPlayers.length; i++) {
                var betPlayer = fetchPlayers[i];
                if(betPlayer)
                    this.addBetPlayer(betPlayer);
            }
        }
    },

    /**
     * 新增玩家
     */
    addBetPlayer:function(betPlayer)
    {
        if(!betPlayer ||  betPlayer.getBetArray().length == 0)
            return;

        var betArray = betPlayer.getBetArray();
        var len = betArray.length;
        var curProductId = Player.getInstance().getCurProductInfo().getId();
        for(var i = 0; i < len; i++){
            var tempBetInfo = betArray[i];
            if(tempBetInfo.getProductId() == curProductId){
                this.genBetAvatar(betPlayer, tempBetInfo.getOrderId());
            }
        }
        //cc.log("adBetPlayer:", betPlayer.getNickName());
        //this._betPlayers.push(betPlayer);

        //头像
        //var betAvatar = this.genBetAvatar(betPlayer);

        //现在只需要显示最新单了
        ////为这个用户绑定三个下单点(k线上最多支持显示该用户三个单)
        //var fixedBetNum = 3;
        //betAvatar._betViews = [];
        //for(var i = 0; i < fixedBetNum; i++) {
        //    var betInfo = betPlayer.getBetArray().last(i);
        //    var betView = this.genBetView(betInfo);
        //    betAvatar._betViews.push(betView);
        //}
    },

    ///**
    // * 移除抓取玩家 会动态修改 _betPlayers _betAvatars长度，慎用
    // * @param betPlayer
    // */
    //removeBetPlayer:function(betPlayer){
    //    var betPlayers = this._betPlayers;
    //    for(var i = 0; i < betPlayers.length; i++) {
    //        var tempPlayer = betPlayers[i];
    //        if(tempPlayer && tempPlayer.getId() == betPlayer.getId()){
    //            betPlayers.splice(i, 1);
    //            break;
    //        }
    //    }
    //
    //    var betAvatars = this._betAvatars;
    //    cc.log("this._betAvatars::", this._betAvatars.length);
    //    for(var i = 0; i < betAvatars.length; i++) {
    //        var betAvatar = betAvatars[i];
    //        var tempPlayer = betAvatar.getBetPlayer();
    //        if(tempPlayer && tempPlayer.getId() == betPlayer.getId()) {
    //            this.cycleAvatar(betAvatar);
    //            break;
    //        }
    //    }
    //},

    ///**
    // * 新增下单点
    // * @param betInfo
    // * @returns {T}
    // */
    //genBetView:function(betInfo)
    //{
    //    var betView = this._cycleBetViews.pop();
    //    if(!betView) {
    //        betView = new cc.Sprite("#icon_mt_self_bet_rise.png");
    //        betView._betInfo = betInfo;
    //        this.addChild(betView);
    //    }
    //
    //    var srcName = "icon_mt_self_bet_rise.png";
    //    if(betInfo && !betInfo.isBullish())
    //    {
    //        srcName = "icon_mt_self_bet_fall.png";
    //        betView.setVisible(true);
    //    }else{
    //        betView.setVisible(false);
    //    }
    //    UICommon.setSpriteWithDefaultSpriteName(betView, srcName, "icon_mt_self_bet_rise.png");
    //    return betView;
    //},

    /**
     * 新增获取头像
     */
    genBetAvatar:function(betPlayer, orderId)
    {
        if(betPlayer.getId() == Player.getInstance().getId()){
            return;
        }

        if(!betPlayer.getBetById(orderId)){
            cc.log("betPlayer 没有该订单id::", orderId);
            betPlayer.printBetMap();
            return;
        }

        var betAvatar = this.getNotUsingAvatar();
        if(!betAvatar){
            //cc.log("new betAvatar");
            betAvatar = new BetAvatar();
            this.addChild(betAvatar);        //保证在betView上方
            this._betAvatars.push(betAvatar);
            //cc.log("new betAvatar finished");
        }
        betAvatar.setVisible(true);
        betAvatar.setPositionX(-200);
        betAvatar._isUsing = true;
        betAvatar.refresh(betPlayer, orderId);
        return betAvatar;
    },

    /**
     * 未使用的头像
     * @returns {*}
     */
    getNotUsingAvatar:function()
    {
        var notUsingAvatar = null;
        var len = this._betAvatars.length;
        for(var i = 0; i < len; i++)
        {
            var tempAvatar = this._betAvatars[i];
            if(tempAvatar && !tempAvatar._isUsing){
                notUsingAvatar = tempAvatar;
                break;
            }
        }
        //超过阀值则强制回收下单最早的一个
        if(notUsingAvatar == null && len > this._maxAvatar)
        {
            var earliestAvatar = this._betAvatars[0];
            var earliestTime = earliestAvatar.getBetInfo().getBetTime();
            for(var i = 0; i < len; i++){
                var tempAvatar = this._betAvatars[i];
                var betInfo = tempAvatar.getBetInfo();
                if(betInfo && betInfo.getBetTime() < earliestTime){
                    earliestAvatar = tempAvatar;
                    earliestTime = tempAvatar.getBetInfo().getBetTime();
                }
            }
            this.cycleAvatar(earliestAvatar);
            notUsingAvatar = earliestAvatar;
        }

        return notUsingAvatar;
    },

    /**
    * 回收头像(当用户n久不下单之后，调用此函数回收头像)
    * @param betAvatar
    */
    cycleAvatar:function(betAvatar)
    {
        betAvatar._isUsing = false;
        betAvatar.setVisible(false);
    },

    /**
     * 刷新
     */
    refresh:function()
    {
        var betAvatars = this._betAvatars;
        //转换公式
        var getXPosByValue = this._formulas.getXPosByValue;
        var getYPosByValue = this._formulas.getYPosByValue;
        if(!getXPosByValue || !getYPosByValue){
            return;
        }
        var productInfo = Player.getInstance().getCurProductInfo();
        var lineData = Player.getInstance().getCurLineData();

        var curSecs = cs.getCurSecs();

        //cc.log("betAvatars::", betAvatars.length);

        //更新头像位置
        for(var i = 0; i < betAvatars.length; i++)
        {
            var betAvatar = betAvatars[i];
            if(!betAvatar._isUsing){
                this.cycleAvatar(betAvatar);
                continue;
            }

            //取最后一单 设置位置
            //var betPlayer = betAvatar.getBetPlayer();
            var betInfo = betAvatar.getBetInfo();
            if(betInfo && betInfo)
            {
                var isSettled = betInfo.isSettled();
                //粗略计算
                if(betInfo.getTradeSettleTime() > 0) {
                    //按固定时间结算的 只要结算时间一到就算结算了，准备移除
                    isSettled = betInfo.getTradeSettleTime() < curSecs;
                }

                if(!isSettled){
                    var sampleData = lineData.getDataByTime(betInfo.getTradeBeginTime());
                    if(sampleData){
                        var pos = cc.p(getXPosByValue(sampleData.getXValue()), getYPosByValue(sampleData.getYValue()));
                        betAvatar.setPosition(pos);
                    }
                }else{
                    ////最后一单都结算了，先移除视野之外
                    //betAvatar.setPositionY(-1000);
                    this.cycleAvatar(betAvatar)
                }
            }
        }
    }
});