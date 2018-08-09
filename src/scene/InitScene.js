/**
 * Created by Administrator on 2016/5/6.
 */
var FRAMES_PER_SECOND = 30;
var InitScene = cc.Scene.extend({

    ctor: function ()
    {
        this._super();

        this.showVersion();

        this.logGlobalConfig();

        if(appName == window.APPNAME_AJY){
            LocalString.replaceCurUnit("元宝");
        }

        //是否是测试服
        isTestServer =  buildVersion == BUILDVERSION_DEVELOP;
        cc.log("isTestServer:: ", isTestServer);
        //正式服才走账号服务器
        if(buildVersion != BUILDVERSION_RELEASE){
            GB.isSplitLoginModel = false;
        }

        //这里显示帧数，需要用来优化的，不要轻易注释
        if(!cc.sys.isMobile || buildVersion == BUILDVERSION_DEVELOP){
            cc.director.setDisplayStats(true);
        }

        //设置帧数
        cc.director.setAnimationInterval(1.0 / FRAMES_PER_SECOND);

      //重置固化log数组
        g_solidLogArray = [];
        cs.readJsonFromFile("solidLog.json", function(jsonData){
            if(jsonData)
                g_solidLogArray = jsonData;
        });

        //启动每秒的驱动器
        this.initSecsGenerator();

        //如果是测试服才显示左下角帧率
        if(isTestServer || !cc.sys.isMobile)
            cc.director.setDisplayStats(true);

        // 初始化ShareSDK 配置
        JavascriptBridge.getInstance().ShareSDKInit();
    },

    /**
     * 显示当前版本号
     */
    showVersion:function(){
        var versionText = new cc.LabelTTF("ver "+DeviceInfoManager.getInstance().getVersionCode(), "Arial", 20);
        versionText.setColor(cc.WHITE);
        this.addChild(versionText);
        versionText.setPos(cc.p(cc.winSize.width -5, 3), ANCHOR_RIGHT_BOTTOM);
    },

    /**
     * 打印所有的全局变量
     */
    logGlobalConfig:function()
    {
        cc.log("============log config=============");
        cc.log("appStoreName:", window.appStoreName);
        cc.log("appName:", window.appName);
        cc.log("isEducationVersion:", window.isEducationVersion);
        cc.log("enableInvitationUI:", window.enableInvitationUI);
        cc.log("BUILDVERSION_DEVELOP:", window.BUILDVERSION_DEVELOP);

        cc.log("============log config end==========");
    },

    initSecsGenerator:function()
    {
        //启动一个每帧执行的公共逻辑
        setInterval(function(){
            //每帧生成一次时间戳
            cs._genCurSecs();
        }.bind(this));

        //启动每秒的通知
        setInterval(function(){
            cc.eventManager.dispatchCustomEvent(NOTIFY_PER_ONE_SECOND);
        }, 1000);
    },

    onEnterTransitionDidFinish:function()
    {
        //是否进入测试场景
        cc.log("InitScene", TO_TEST_CASE);
        if (TO_TEST_CASE || isTestServer)
        {
            var Action = cc.callFunc(function(){
                cc.director.runScene(new cc.TransitionFade(0.5, new TestViewScene(), cc.BLACK));
            });
            this.runAction(cc.sequence(cc.delayTime(0.6), Action));
        }
        else
        {
            if (isEducationVersion) {
                var Action = cc.callFunc(function(){
                    MainController.getInstance().showShopLayer();
                });
                this.runAction(cc.sequence(cc.delayTime(0.6), Action));
            }
            else
            {
                this.splash();
            }
        }
    },

    splash: function()
    {
        var txt = new ccui.Text(LocalString.getString("TITLE_TXT"), FONT_ARIAL_BOLD, 30);
        this.addChild(txt);
        txt.setPosition(cc.winSize.width/2,70);

        //cc.loader.loadJson("res/arts/CustomConfig.json", function(err, jsonData){
        //    if(jsonData.corporation){
        //        var corporationTxt = new ccui.Text(jsonData.corporation, FONT_ARIAL_BOLD, 30);
        //        corporationTxt.setColor(cc.color(84,80,80));
        //        this.addChild(corporationTxt);
        //        corporationTxt.setPosition(cc.winSize.width/2,30);
        //    }
        //}.bind(this));

        var word = new cc.Sprite("annimation_start_words.png");
        this.addChild(word);
        word.setAnchorPoint(0.5,0.5);
        word.setPosition(cc.winSize.width/2,cc.winSize.height/2);

        var light = new cc.Sprite("animation_start_bg.png");
        this.addChild(light);
        light.setPosition(cc.winSize.width/2,cc.winSize.height/2);

        var firstAction = cc.callFunc(function(){
            light.runAction(cc.fadeOut(2.0));
        });
        var secondAction = cc.callFunc(function(){
            word.runAction(cc.fadeOut(1.0));
            light.runAction(cc.scaleTo(1.0,0.0,0.0));
        });

        //// 邀请码检测
        //var invitationCode = GB.invitationCode = cc.sys.localStorage.getItem(GB.ST_INVITATION_CODE);
        //cc.log("invitationCode", isNeedInvitation, invitationCode);
        var thirdAction = cc.callFunc(function(){ ProxyClientLoginer.startup(); });
        this.runAction(cc.sequence(firstAction,cc.delayTime(1.0),secondAction,cc.delayTime(1.0),thirdAction));
    },


    cleanup:function(){
        this._super();
        cc.log("initScene cleanup...");
    }
});
