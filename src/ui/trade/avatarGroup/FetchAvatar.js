/**
 * Created by 玲英 on 2016/9/27.
 */

var FetchAvatar = cc.Node.extend({
    _colorStage0:cc.color(41, 173, 66),
    _colorStage1:cc.color(107, 173, 41),
    _colorStage2:cc.color(161, 144, 39),
    _colorStage3:cc.color(222, 0, 33),
    _betPlayer: undefined,
    _index:0,

    ctor:function(size)
    {
        this._super();
        //this.setAnchorPoint(ANCHOR_CENTER);
        this.setContentSize(size);

        this._isStopped = false;

        this.initUI();

        this.scheduleUpdate();

        this.addListener();
    },

    cleanup:function()
    {
        this.removeAllCustomListeners();
        this._super();
    },

    enableTouch:function()
    {
        //开启面板的触摸功能 朝左滑动表示剔除
        var isMoved = false;
        var listenerJson = {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,

            onTouchBegan: function(touch, event){
                var isOnTouch = UICommon.isOnTouch(touch, event);
                if(isOnTouch){
                    isMoved = false;
                }
                return isOnTouch;
            },
            onTouchMoved:function(touch, event)
            {
                var pos = touch.getLocation();
                var prePos = touch.getStartLocation();
                var originPos = this._cobPanelOriginPos;
                var diffPos = cc.pSub(prePos,pos);
                var moveYOffset = Math.abs(prePos.y - pos.y);
                if(pos.x < prePos.x && moveYOffset < this._cobPanel.height * 0.5){
                    this._cobPanel.setPosition(cc.pSub(originPos, diffPos));
                }
                if(moveYOffset > 3){
                    isMoved = true;
                }
            }.bind(this),
            onTouchEnded:function(touch, event)
            {
                if(!this._betPlayer) {
                    return;
                }
                var pos = touch.getLocation();
                var prePos = touch.getStartLocation();
                var moveXOffset = prePos.x - pos.x;
                //必须向左移动n个像素才能触发移除
                if(moveXOffset < 15){
                    var originPos = this._cobPanelOriginPos;
                    this._cobPanel.setPosition(originPos);
                    if(!isEducationVersion && !isMoved){
                        MainController.getInstance().showUserDetailLayer(this._betPlayer.getId());
                    }
                    return;
                }

                //尝试剔除
                this.attemptKick();

            }.bind(this)
        };

        if(!this._touchPanel)
        {
            this._touchPanel = new cc.Node();
            this.addChild(this._touchPanel, 9);
            this._touchPanel.setContentSize(this.getContentSize());
        }
        cc.eventManager.addListener(listenerJson, this._touchPanel);
    },

    addListener:function()
    {
        this._perOneSecondListener = cc.eventManager.addCustomListener(NOTIFY_PER_ONE_SECOND, function()
        {
            if(!this._productInfo || this._isStopped)
            {
                return;
            }

            var curSecs = cs.getCurSecs();

            //每15秒 对没有填满的项做一次抓取
            if(curSecs % 15 == 0)
            {
                var fetchPlayers = this._productInfo.getFetchPlayers();
                //这里顺便容个错 一旦发现表现不对 立即刷新
                if(this._betPlayer != fetchPlayers[this._index]) {
                    this.refresh(fetchPlayers[this._index]);
                }


                if(this._isAutoFetchEnabled && (curSecs - this._productInfo._lastKickTime) > 5 && !this._isKicking){
                    //存在空位就抓 但保证全局只抓一个空位 防止几个一起同时抓导致重复
                    for(var i = 0; i < fetchPlayers.length; i++)
                    {
                        //cc.log("检查第: "+ (i+1) + " 个 fetchPlayer:: "+ fetchPlayers[i]);
                        //检查抓取
                        if(!fetchPlayers[i]) {
                            if(i == this._index){
                                cc.log("抓取第"+(i+1)+"个位置的头像");
                                this.requestNewPlayer();
                            }
                            break;
                        }
                    }
                }

            }

            //
            if(!this._betPlayer)
                return;

            //每n秒根据位置 10 22 34 46秒检查过期
            if(curSecs % (10 + this._index * 12) == 0)
            {
                this.checkOverTime();
            }

            //触碰模式n+x秒查一次结果
            if(this._productInfo.getTradeSettleGap() <= 0){
                if(curSecs % (120 + this._index) == 0){
                    //检查订单结果
                    this.checkTouchBetResult();
                }
            }else{
                if(curSecs % 60 == 0){
                    //检查订单结果
                    this.checkBetResult();
                }
            }
        }.bind(this));

        this._fetchNewOrderListener = cc.eventManager.addCustomListener(NOTIFY_FETCH_NEW_ORDER, function(event)
        {
            if(this._isStopped)
                return;
            var userData = event.getUserData();
            if(!this._betPlayer || !this._productInfo || !userData)
                return;
            var betPlayer  = userData["betPlayer"];
            var newBetInfo  = userData["newBetInfo"];
            if(this._betPlayer.getId() != betPlayer.getId() || this._productInfo.getId() != newBetInfo.getProductId())
                return;
            //cc.log("抓取用户下单:" + this._betPlayer.getNickName() + "  amount:" + betInfo.getBetAmount());

            this.refreshBetInfo(newBetInfo);

        }.bind(this));

        //修正名字
        this._fixAvatarUrlListener = cc.eventManager.addCustomListener(NOTIFY_USER_DETAIL_OPENED, function(event){
            var playerInfo = event.getUserData();
            if(this._betPlayer && playerInfo && this._betPlayer.getId() == playerInfo.getId()
                && playerInfo.getNickName() != this._betPlayer.getNickName())
            {
                var nickName = playerInfo.getNickName();
                this._betPlayer.setNickName(nickName);
                this._nameText.setString(nickName);
                if(this._nameText.width > 0.85 * this.width){
                    var replaceNickName = nickName.substring(0, Math.min(nickName.length - 3, 5)) + "...";
                    this._nameText.setString(replaceNickName);
                }
            }
        }.bind(this));
    },

    initUI:function()
    {

        var bgPanel = this._avatarPanel = this.createAvatarPanel();
        bgPanel.setAnchorPoint(0, 0);
        this.addChild(bgPanel);
        bgPanel.setPos(centerInner(this));
    },

    setStop:function(bool)
    {
        this._isStopped = bool;
    },

    isStopped:function()
    {
        return this._isStopped;
    },

    createAvatarPanel:function()
    {
        var avatar = this._circleAvatar = new CircleAvatar();
        avatar.setScale(88/avatar.height);
        //avatar.setDetailEnabled(false);

        var nameText = this._nameText = new ccui.Text("  ", FONT_ARIAL_BOLD, 20);
        nameText.setColor(cc.color(117, 120, 135));

        var betAmountText = this._betAmountText = new cc.LabelTTF("    ", FONT_ARIAL_BOLD, 24);
        var directionLabel = this._directionLabel = new cc.LabelTTF("    ", FONT_ARIAL_BOLD, 24);

        //这里需要方便后面的刷新金额 调整距离
        var betPanel = new ccui.Widget();//UICommon.createPanelAlignWidgetsWithPadding(2, cc.UI_ALIGNMENT_HORIZONTAL_CENTER, betAmountText, directionLabel);
        betPanel.setContentSize(this.width, betAmountText.height);
        betPanel.addChild(betAmountText);
        betAmountText.setPos(centerInner(betPanel));
        betPanel.addChild(directionLabel);
        directionLabel.setPos(centerInner(betPanel));

        //垂直组合
        var cobPanel = this._cobPanel = UICommon.createPanelAlignWidgetsWithPadding(adaptiveSizeHeight(4), cc.UI_ALIGNMENT_VERTICAL_CENTER, avatar, nameText, betPanel);

        //底板
        var bgPanel = new ccui.Layout();//new cc.Scale9Sprite("common_account_bg.png");
        bgPanel.setContentSize(this.getContentSize());


        bgPanel.addChild(cobPanel);
        cobPanel.setPos(centerInner(bgPanel));
        cobPanel.setVisible(false);

        //头像底部的光晕
        var haloSprite = this._haloSprite = new cc.Sprite("#animation_avatar_left_bg.png");
        avatar.getParent().addChild(haloSprite);
        haloSprite.setPos(centerOutter(avatar), ANCHOR_CENTER);
        avatar.setLocalZOrder(3);   //保证光晕在头像下面 中心处
        haloSprite.setOpacity(0);

        //没有抓取用户时需要显示 空头像中心位置显示
        var emptyAvatar = this._emptyAvatar = new cc.Sprite("#icon_avatar_empty.png");
        bgPanel.addChild(emptyAvatar);
        emptyAvatar.setPos(centerInner(bgPanel));

        //frameRect
        var frameSprite = new cc.Sprite("#animation_avatar_left.png");
        var frameLoadingBar = this._frameProgressTimer = new cc.ProgressTimer(frameSprite);
        frameLoadingBar.setType(cc.ProgressTimer.TYPE_RADIAL);
        frameLoadingBar.setPercentage(0);
        frameLoadingBar.setColor(this._colorStage0);
        frameLoadingBar.setReverseDirection(true);
        bgPanel.addChild(frameLoadingBar);
        frameLoadingBar.setPos(centerInner(this));

        //底部加根分割线
        var line = this._bottomLine = new cc.LayerColor();
        line.setColor(cc.color(71, 75, 87));
        line.setContentSize(this.width, 2);
        bgPanel.addChild(line);
        line.setPos(bottomInner(this), ANCHOR_BOTTOM);

        //记住位置
        if(!this._cobPanelOriginPos){
            this._cobPanelOriginPos = this._cobPanel.getPosition();
        }

        return bgPanel;
    },

    setBottomLineVisible:function(visible)
    {
        this._bottomLine.setVisible(visible);
    },

    /**
     * 第几个头像（这样方便独立管理product中存放的数据 降低耦合）
     */
    setIndex:function(index)
    {
        this._index = index;
    },

    /**
     * 检查玩家是否超时
     */
    checkOverTime:function()
    {
        if(!this._betPlayer)
        {
            return;
        }

        var overTime = 5 * 60;
        var curSecs = cs.getCurSecs();
        var betArray = this._betPlayer.getBetArray();
        if(betArray.length > 0){
            var lastBetInfo = betArray.last();
            if((curSecs - lastBetInfo.getTradeBeginTime()) > overTime)
            {
                cc.log(this._index + " 驻留超时了::", (curSecs - lastBetInfo.getTradeBeginTime()));
                this.attemptKick(true);
            }
        }

    },

    /**
     * 尝试踢出
     */
    attemptKick:function(isAutoKick)
    {
        //防止频繁剔除的最小间隔
        var minInterval = 2;
        var curSecs = cs.getCurSecs();
        var originPos = this._cobPanelOriginPos;
        var lastKickTime = this._productInfo._lastKickTime;

        //防止自动和手动重复 任何时候只有一个
        if(this._isKicking) {
            //防止异常 kicking过程超过一定时间就重置
            if((curSecs - lastKickTime) > 60){
                this._isKicking = false;
            }else{
                cc.log("isKicking return::", this._index);
                //手动的话怎么都给他来点动画
                if(!isAutoKick){
                    this._cobPanel.runAction(new cc.Sequence(
                        new cc.MoveTo(0.18, originPos.x-320, originPos.y + 80),
                        new cc.MoveTo(0.18, originPos.x, originPos.y)
                    ));
                }
                return;
            }
        }

        if(lastKickTime && (curSecs - lastKickTime) < minInterval){
            //自动移除不做动画 维持不动
            if(isAutoKick){
                return false;
            }else{
                if(isTestServer){
                    MainController.showAutoDisappearAlertByText("剔除cd未到, 剩余::"+(curSecs - lastKickTime));
                }
            }
            cc.log("剔除cd未到,:" + this._index + " 剩余::"+(curSecs - lastKickTime));
            //做个假象
            this._cobPanel.runAction(new cc.Sequence(
                new cc.MoveTo(0.18, originPos.x-320, originPos.y + 80),
                new cc.MoveTo(0.18, originPos.x, originPos.y)
            ));
            return false;
        }

        if(!isAutoKick){
            this._cobPanel.runAction(new cc.Sequence(
                new cc.MoveTo(0.18, originPos.x-320, originPos.y + 50),
                new cc.Hide()
            ));
        }

        this._productInfo._lastKickTime = curSecs;

        this._isKicking = true;

        //移除
        var productInfo = this._productInfo;
        //更新给服务器
        productInfo.removeFetchPlayer(this._betPlayer.getId(), this.requestAfterKick.bind(this));
        ////刷新
        //this.refresh(null);

        return true;
    },

    getBetPlayer:function(){
      return this._betPlayer;
    },

    /**
     * 踢人(替换)动画
     */
    doKickAction:function(newBetPlayer)
    {
        //新替换的玩家先出现在左上角
        var newAvatarPanel = this.createAvatarPanel();
        this.addChild(newAvatarPanel);
        newAvatarPanel.setPos(leftTopInner(this), ANCHOR_CENTER);
        newAvatarPanel.setPositionXAdd(-this.width * 0.5);

        //刷新
        this.refresh(newBetPlayer);

        //
        this._avatarPanel.setAnchorPoint(0, 0);
        newAvatarPanel.setAnchorPoint(0, 0);

        //最终位置
        var targetPos = cc.p(0, 0);

        var actionDuration = 0.35;
        //新替换往下掉落，老玩家继续被压扁
        newAvatarPanel.runAction(new cc.Sequence(
            (new cc.MoveTo(actionDuration, targetPos)).easing(cc.easeInOut(actionDuration)),
            new cc.CallFunc(function(){
                this._avatarPanel = newAvatarPanel;
                this._isReplacing = false;
            }.bind(this))
        ));

        this._avatarPanel.runAction(new cc.Sequence(
            new cc.ScaleTo(actionDuration - 0.08, 1.35, 0.02),
            new cc.MoveTo(0.35, -300, 0),
            new cc.CallFunc(function(target){
                target.removeFromParent();
            })
        ));

        //正在替换/踢人
        this._isReplacing = true;
    },

    /**
     * 检查用户的订单结算并请求结算结果 检查指定时间结算的
     * 本方法调用不宜太频繁
     */
    checkBetResult:function()
    {
        var curSecs = cs.getCurSecs();
        var delay = 5;  //延迟多久去拿结算结果
        if(!this._betPlayer)
            return;
        var betArray = this._betPlayer.getBetArray();
        var unSettledOrderIdArray = [];
        for(var i = 0; i < betArray.length; i++)
        {
            var betInfo = betArray[i];
            var settleTime = betInfo.getTradeSettleTime();
            if(betInfo.isSettled())
                continue;

            //废弃....即使有问题也要暴露出来
            //var maxRequestCounter = betInfo.getMaxRequestCounter();
            ////对于已知结算时间的
            //if(betInfo.getTradeSettleTime() > 0 && maxRequestCounter <= 0){
            //    cc.log("maxRequestCounter over times");
            //    return;
            //}
            ////已拿到结果或者请求n次之后还没拿到结果 则不再请求
            //if(betInfo.isSettled() || betInfo._isRequesting){
            //    cc.log("isSettled or isRequesting");
            //    return;
            //}

            //如果预先知道结算时间的 延迟delay去拿结果
            if(settleTime > 0 && (curSecs - settleTime) >= delay){
                unSettledOrderIdArray.push(betInfo.getOrderId());
            }
        }
        if(unSettledOrderIdArray.length > 0){
            this.requestResult(unSettledOrderIdArray);
        }
    },

    /**
     * 专门用来检查不定时结算的
     */
    checkTouchBetResult:function()
    {
        if(!this._betPlayer)
            return;
        var betArray = this._betPlayer.getBetArray();
        var unSettledOrderIdArray = [];
        for(var i = 0; i < betArray.length; i++)
        {
            var betInfo = betArray[i];
            if(!betInfo.isSettled()){
                cc.log("FetchAvatar: " + this._index +"请求结算...");
                unSettledOrderIdArray.push(betInfo.getOrderId());
            }
        }
        if(unSettledOrderIdArray.length > 0){
            this.requestResult(unSettledOrderIdArray);
        }
    },

    refreshBetInfo:function(betInfo)
    {
        if(!betInfo){
            return;
        }
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

    /**
     * 请求订单结算结果
     */
    requestResult:function(unSettledOrderIdArray)
    {
        var orderIds =  unSettledOrderIdArray.join(",");
        var requestData = {
            "auth":{
                "pid": this._productInfo.getId(),
                "orderIds":orderIds
            }
        };

        var responseCallBack = function(jsonData) {
            if(!jsonData){
                return;
            }
            //
            var countList = jsonData["countList"];
            if(countList.length == 0)
            {
                cc.log("========================结算返回为空=停止update====");
                return;
            }
            for(var i = 0; i < countList.length; i++){
                var betData = countList[i];
                var orderId = betData["orderId"];
                var betInfo  = this._betPlayer.getBetById(orderId);
                if(betInfo){
                    betInfo.initFromJson(betData);
                }
            }

            //显示下一个未结算的单
            this.showNextBet();

            //if(betInfo.isWin()){
            //    //金钱动画
            //    this.doCoinNumPlusAnimation(betInfo.getEarnAmount());
            //    //光晕动画
            //    this.doFadeHaloAction();
            //}
        }.bind(this);

        var urlKey = "tradeQuery";
        new HttpRequest(urlKey, requestData, responseCallBack);
        //
        ////计数器-1
        //betInfo.maxRequestCounterReduce();
    },

    /**
     * 请求抓取新的用户
     * @param productId
     */
    requestNewPlayer:function(productId)
    {
        var productId = productId || this._productInfo.getId();
        var productInfo = Player.getInstance().getProductById(productId);
        var fetchPlayers = productInfo.getFetchPlayers();
        var callBack = function()
        {
            if(this._betPlayer == fetchPlayers[this._index]);
            {
                return;
            }
            //cc.log("this._betPlayer::", this._betPlayer);
            cc.log("fetchPlayers[this._index]::", fetchPlayers[this._index]);
            this.doKickAction(productInfo.getFetchPlayers()[this._index]);
        }.bind(this);

        productInfo.requestFetchNewPlayer(callBack, this._index);
    },

    /**
     * 剔除后请求抓取新的用户
     * @param productId
     * @param idFlag 待被抓取的用户idFlag 如果没有 则表示本次不能剔除
     */
    requestAfterKick:function(productId, idFlag)
    {
        var productId = productId || this._productInfo.getId();
        var productInfo = Player.getInstance().getProductById(productId);
        var fetchPlayers = productInfo.getFetchPlayers();

        //cc.log("kicking 返回：", idFlag);
        //cc.log("this._cobPanel.isVisible()::", this._cobPanel.isVisible());
        //cc.log("fetchPlayers[this._index]::",fetchPlayers[this._index]);

        if(idFlag){
            var callBack = function()
            {
                cc.log("抓取新的 idFlag");
                this._isKicking = false;
                //var originPos = this._cobPanel.originPos;
                if(this._betPlayer == fetchPlayers[this._index] && this._cobPanel.isVisible()) {
                    cc.log("位置没有便宜 保持不动");
                    return;
                }
                this.doKickAction(productInfo.getFetchPlayers()[this._index]);
            }.bind(this);

            productInfo.requestFetchPlayer(callBack, idFlag, this._index);
        }else{
            this._cobPanel.stopAllActions();
            //重置
            this._cobPanel.setPosition(this._cobPanelOriginPos);
            this.refresh(fetchPlayers[this._index]);
            this._isKicking = false;
        }

    },

    /**
     * 首次初始化(切换产品时需要)
     */
    switchProduct:function(productInfo)
    {
        if(!productInfo)
        {
            cc.log("switchProduct productInfo is null：", productInfo);
            return;
        }

        this._productInfo = productInfo;

        //找出指定位置的betPlayer 没有则新增
        var betPlayer = productInfo.getFetchPlayers()[this._index];
        this.refresh(betPlayer);
    },

    setAutoFetchEnabled:function(bool)
    {
        this._isAutoFetchEnabled = bool;
    },

    /**
     * 做金钱数字增加动画
     */
    doCoinNumPlusAnimation:function(num)
    {
        if(!num || !TradingHallLayer.instance){
            testSeverLog("左侧人物盈利动画:num: "+ num +"tradingHall.instance: "+ TradingHallLayer.instance);
            return;
        }
        var plusNumText = new ccui.Text("+" + num, FONT_ARIAL_BOLD, 34);
        plusNumText.setAnchorPoint(0, 0.5);
        plusNumText.setColor(cc.color(244, 168, 47));

        TradingHallLayer.instance.addAnimationNode(plusNumText);
        var scenePos = this.getPosAtAncestor(TradingHallLayer.instance, ANCHOR_RIGHT);
        if(!scenePos){
            testSeverLog("左侧人物盈利动画:: scenePos is undefined");
            return;
        }

        plusNumText.setPosition(cc.p(scenePos.x + 8, scenePos.y));
        plusNumText._originPos = plusNumText.getPosition();

        var action = new cc.Sequence(
            new cc.DelayTime(1.5),
            new cc.Spawn(
                new cc.MoveTo(0.45, plusNumText._originPos.x + 20, plusNumText._originPos.y+75),
                new cc.FadeOut(1.0)
            ),
            new cc.RemoveSelf()
        );
        plusNumText.runAction(action);
    },

    /**
     * 光晕动画
     */
    doFadeHaloAction:function() {
        this._haloSprite.runAction(new cc.Repeat(
            new cc.Sequence
            (
                new cc.FadeIn(0.35),
                new cc.FadeOut(0.35)
            ), 3));
    },

    refresh:function(betPlayer) {
        if(betPlayer)
        {
            this._circleAvatar.refresh(betPlayer);

            var nickName = betPlayer.getNickName();
            this._nameText.setString(nickName);
            if(this._nameText.width > 0.85 * this.width){
                var replaceNickName = nickName.substring(0, Math.min(nickName.length - 3, 5)) + "...";
                this._nameText.setString(replaceNickName);
            }

            this.showNextBet();
            //if(betPlayer.getBetArray().length > 0)
            //{
            //    var lastBetInfo = betPlayer.getBetArray().last();
            //    //var productInfo = Player.getInstance().getProductById(lastBetInfo.getProductId());
            //    var cusSecs = cs.getCurSecs();
            //    var settleTime = lastBetInfo.getTradeSettleTime();
            //    //超过一定时间的也不显示了
            //    if(lastBetInfo.isSettled() || (settleTime > 0 && (cusSecs - 60) > settleTime)){
            //        this.resetBet();
            //    }else{
            //        this.refreshBetInfo(betPlayer.getBetArray().last());
            //    }
            //}

            this._emptyAvatar.setVisible(false);
            this._cobPanel.setVisible(true);
            this._betPlayer = betPlayer;
        }
        else
        {
            this._circleAvatar.setAvatarSrc("avatar_default.png");
            this._nameText.setString("");
            this._emptyAvatar.setVisible(true);
            this._cobPanel.setVisible(false);
            //this._frameProgressTimer.setPercentage(0);
            this._betPlayer = null;
            this.resetBet();
        }
    },

    /**
     * 重置显示
     */
    resetBet:function()
    {
        this._betAmountText.setString("");
        this._directionLabel.setString("");
    },

    showNextBet:function()
    {
        this.resetBet();
        if(!this._betPlayer || !this._productInfo || this._betPlayer.getBetArray().length == 0){
            return;
        }
        var betInfo = this._betPlayer.getLatestUnSettledBet(this._productInfo.getId());
        if(betInfo){
            this.refreshBetInfo(betInfo);
        }
    },

    setDetailEnabled:function(bool) {
            this._circleAvatar.setDetailEnabled(bool);
    }
});