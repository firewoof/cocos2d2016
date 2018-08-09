/**
 * Created by Jony
 */
var LoadingWaitLayer = cc.LayerColor.extend({
    _loadingBar: null,
    _time: 0,

    ctor:function()
    {
        this._super();
        this.setOpacity(0);
        this.setTouchEventEnabled(true);
        this.setVisible(false);
        this._time = 10;

        var loadingBar = this._loadingBar = new LoadingCircle();
        this.addChild(loadingBar);
        loadingBar.setPos(centerInner(this), ANCHOR_CENTER);

        this.scheduleUpdate();

        //this.addListener();
    },

    cleanup:function(){
        this._super();
        LoadingWaitLayer.instance = null;
    },

    /**
     * 最长多少秒后自动消失
     */
    setTimeOut:function(dt)
    {
        this._time = dt;
    },

    update:function(dt)
    {
        this._time -= dt;
        if(this._time < 0 && this.isVisible())
        {
            this.hide();
            //MainController.showAutoDisappearAlertByText(LocalString.getString("LOADING_WAIT_TIP"));
        }
    },

    /**
     * 显示 并重置超时计数器
     * @param timeOut
     */
    show:function(timeout){
        var timeout = timeout || 10;
        //var self = this;
        this.setVisible(true);
        //this._loadingBar.setVisible(false);
        //适当延迟显示loading菊花
        this._loadingBar.runAction(new cc.Sequence(
            new cc.Hide(),
            new cc.DelayTime(0.5),
            new cc.Show()
        ));
        //setTimeout(function(){
        //    if(self._isShowing && cc.sys.isObjectValid(self)){
        //        self._loadingBar.setVisible(true);
        //    }
        //}, 1000 * 0.5);
        this.setTimeOut(timeout);
        this._isShowing = true;
    },

    hide:function(){
        this._isShowing = false;
        this.setVisible(false);
    }
});

LoadingWaitLayer.getInstance = function()
{
    var instance = LoadingWaitLayer.instance;
    if(instance == undefined){
        instance = LoadingWaitLayer.instance = new LoadingWaitLayer();
        cc.director.getRunningScene().addChild(instance, 111);
    }
    return instance;
};