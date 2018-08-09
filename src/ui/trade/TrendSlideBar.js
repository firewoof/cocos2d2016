/**
 * Created by 玲英 on 2016/8/31.
 */

var TrendSlideBar = cc.Node.extend({

    ctor:function() {
        this._super();
        this.setAnchorPoint(ANCHOR_CENTER);

        //init var
        this._updateCounter = 0;
        this._curPercent = 50;
        this._targetPercent = 50;   //需要滑动到的目标百分比

        //
        this.initUI();

        //初始化
        this.refresh(this._curPercent);

        //开启定时器
        this.scheduleUpdate();
    },

    initUI:function()
    {
        var size = this.getContentSize();
        var layer = ccs.load(res.SliderBar_json).node;
        //加入到当前layer中。
        this.addChild(layer);
        this.setContentSize(layer.getContentSize());

        var slideCursor = this._slideCursor = ccui.helper.seekWidgetByName(layer, "slideCursor");
        var loadingBarRise = this._loadingBarRise = ccui.helper.seekWidgetByName(layer, "loadingBarRise");
        var loadingBarFall = this._loadingBarFall = ccui.helper.seekWidgetByName(layer, "loadingBarFall");
        var risePercentText = this._risePercentText = ccui.helper.seekWidgetByName(layer, "risePercentText");
        var fallPercentText = this._fallPercentText = ccui.helper.seekWidgetByName(layer, "fallPercentText");

        var flashAniSprite = new cc.Sprite("#animation_flash.png");
        slideCursor.addChild(flashAniSprite);
        flashAniSprite.runAction(new cc.RepeatForever(new cc.Sequence(
            new cc.FadeIn(0.45),
            new cc.FadeOut(0.45)
        )));
        flashAniSprite.setPos(centerInner(slideCursor));
    },

    /**
     * {Number} risePercent
     */
    refresh:function(risePercent)
    {
        var size = this._loadingBarRise.getBoundingBox();
        var riseHeight = size.height * risePercent/100; //这里不能滑动100%的width 因为渐变

        this._slideCursor.setPositionY(riseHeight);

        this._curPercent = risePercent;
        this._loadingBarRise.setPercent(risePercent);
        this._loadingBarFall.setPercent(100 - risePercent);
        this._risePercentText.setString(this._curPercent.toFixed(0) + "%");
        this._fallPercentText.setString((100 - this._curPercent).toFixed(0) + "%");
    },

    getPercent:function(){
        return this._curPercent;
    },

    /**
     * 外部接口 设置涨跌条百分比
     * @param {Number} percent {0~100}
     * @param {Boolean} [isRunArrowAction]
     */
    setPercent:function(percent, isRunArrowAction)
    {
        if(percent == undefined)
            return;
        //百分数一律整数化
        var percent = parseInt(percent);
        if(percent == this._curPercent){
            return;
        }

        this._targetPercent = percent;
        this._startTime = cs.getCurTime();
        this._startPercent = this._curPercent;
        this._duration = 3; //涨跌游标跑到指定位置的滑动时间

        ////是否要执行箭头动画
        //if(isRunArrowAction)
        //{
        //    var isTrendRise = (percent - this._curPercent) > 0;
        //    var actionView = isTrendRise ? this._riseClippingPanel : this._fallClippingPanel;
        //    actionView.stopAllActions();
        //    //每次执行n遍
        //    actionView.runAction(
        //        new cc.Sequence(
        //            new cc.CallFunc(function(){
        //                this.doArrowAction(isTrendRise, 1.5);
        //            }.bind(this)),
        //            new cc.DelayTime(1.2),
        //            new cc.CallFunc(function(){
        //                this.doArrowAction(isTrendRise, 1.5);
        //            }.bind(this))
        //        )
        //    );
        //
        //    //游标点闪烁
        //    this._flashPointView.runAction(new cc.Sequence(
        //        new cc.FadeIn(0.5),
        //        new cc.FadeOut(0.5),
        //        new cc.FadeIn(0.5),
        //        new cc.FadeOut(0.5)
        //    ));
        //}
    },

    update:function(dt)
    {
        this._updateCounter += dt;
        if(this._updateCounter > 0.05)
        {
            this._updateCounter = 0;
            if(this._targetPercent != this._curPercent)
            {
                var curTime = cs.getCurTime();
                var passTimePercent = (curTime - this._startTime)/1000 / this._duration ;
                var diffPercent = (this._targetPercent - this._startPercent) * passTimePercent;
                var curPercent = this._startPercent + diffPercent;
                if(passTimePercent >= 1)
                    curPercent = this._targetPercent;
                //cc.log("curPercent::", curPercent);
                this.refresh(curPercent);
            }
        }
    },

    /**
     * 做趋势箭头动画
     */
    doArrowAction:function(isTrendRise, actionTime)
    {
        var arrowArray = this._riseArrowArray;
        if(isTrendRise == true)
            arrowArray = this._fallArrowArray;

        //this.stopAllActions();
        var stopArrowArray = isTrendRise == true ? this._riseArrowArray : this._fallArrowArray;
        for(var i = 0; i < stopArrowArray.length; i++ ) {
            var arrow = stopArrowArray[i];
            if(arrow.getNumberOfRunningActions() > 0)
            {
                arrow.stopAllActions();
                arrow.setOpacity(0);
            }
        }

        actionTime = actionTime || 2;
        var num = arrowArray.length;
        var delayUnit = actionTime/num;
        for(var i = 0; i < arrowArray.length; i++){
            var arrow  = arrowArray[i];
            arrow.runAction(
                new cc.Sequence(
                    new cc.DelayTime(i * delayUnit),
                    new cc.FadeIn(0.35),
                    new cc.FadeOut(0.35)
            ));
        }
    }
});

