/**
 * Created by Administrator on 2016/5/6.
 */
var TitleScene = cc.Scene.extend({

    totalCount:1,
    count:1,

    onEnter:function () {
        cc.log("----- TitleScene onEnter");
        this._super();
        this.scheduleUpdate();
        var layer = new TitleLayer();
        this.addChild(layer);
        cc.director.setAnimationInterval(1/60.0);
    }

    ,update:function(dt){
//        cc.log("----------- TitleScene update dt", dt);
        this.totalCount++;
        if(dt > 1/40.0){
            this.count++;
        }
    }

    ,onExit:function(){
        this._super();
        this.unscheduleUpdate();
        cc.log("----- TitleScene onExit", this.count, this.totalCount);
        if(this.count/this.totalCount < 1/4)
        {
            SETTING_GAME_FRAME = 60.0;
        }
        else
        {
            SETTING_GAME_FRAME = 30.0;
        }
        cc.director.setAnimationInterval(1/30);
        cc.log("----- TitleScene onExit 确认帧数", cc.director.getAnimationInterval());
    }
});


var TitleLayer = cc.Layer.extend({
    loginTouchLayer: null,
    isLogining: false,
    _account: "",
    _pwd: "",
    _session: "",

    ctor: function () {
        cc.log("----- TitleLayer ctor");
        this._super();

        this.initUI();
    },

    initUI:function() {

    },

    onEnterTransitionDidFinish:function(){
        this._super();
        cc.log("----- TitleLayer onEnterTransitionDidFinish");

        //声音
        //cc.audioEngine.stopMusic();
        //MainController.playMusic("bgm/BGM_title.mp3");
        //cc.audioEngine.setMusicVolume(0.3);

        this.runAction(new cc.Sequence(new cc.DelayTime(0.01), cc.callFunc(function() {
            this.showLoginLayer();
        }.bind(this))));

    },

    /**
     * 弹出登录界面
     */
    showLoginLayer:function()
    {

        if(false)
        {
            //TODO 这里留给要接的渠道登录
        }else
        {
            //自己的渠道
            var layer = new LoginLayer();
           // layer._okButtonCallback = this.requestLoginServer.bind(this);
            MainController.pushLayerToRunningScene(layer);
        }
    }
});