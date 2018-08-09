/**
 * 客户端启动控制，主要用于更新，单件模式
 * Created by lex on 2016/12/06.
 */
var ClientLauncher =  cc.Class.extend({
    m_inst : null, //实例
    _remoteRootUrl : "http://cdn.aiweipan.com/",
    _updateRelativePath : "updatez/",
    _beginTime : 0,
    _endTime : 0,

    ctor : function(){

    },
    setBeginTime : function(beginTime){
        this._beginTime = beginTime;
    },

    setEndTime : function(endTime){
        this._endTime = endTime;
    },

    getBeginTime : function(){
        return this._beginTime;
    },

    getEndTime : function(){
        return this._endTime;
    },

    getBuildVersion:function()
    {
        return buildVersion;
    },

    need2Update : function() {
        if (cc.sys.platform == cc.sys.WIN32)
            return false;
        return true;
    },

    addSearchPaths:function(){
        var storagePath = jsb.fileUtils.getWritablePath() + this._updateRelativePath;
        var searchPaths = [
            storagePath,
            storagePath + "res/",
            storagePath + "res/arts",
            storagePath + "res/arts/ui_other",
            storagePath + "res/sounds",
            storagePath + "res/shaderFiles",
            storagePath + "src/",
            "",
            "res/",
            "res/arts",
            "res/arts/ui_other",
            "res/sounds",
            "res/shaderFiles",
            "src/"
        ];
        jsb.fileUtils.createDirectory(storagePath);
        jsb.fileUtils.setSearchPaths(searchPaths);

        //创建并添加头像目录(用于网络下载的头像)
        var downLoadAvatarsPath = jsb.fileUtils.getWritablePath() + "downLoadAvatars";
        jsb.fileUtils.createDirectory(downLoadAvatarsPath);
        jsb.fileUtils.addSearchPath(downLoadAvatarsPath);
        //行情缓存目录
        var quoteCachePath = jsb.fileUtils.getWritablePath() + "quoteCache";
        jsb.fileUtils.createDirectory(quoteCachePath);
    },

    // 启动更新
    launch : function(){
        cc.log("launch...");
        //热更目录
        var storagePath = jsb.fileUtils.getWritablePath() + this._updateRelativePath;

        //添加搜索目录
        this.addSearchPaths();

        var isNeedUpdate = this.need2Update();
        cc.log("isNeedUpdate::", isNeedUpdate);
        if(isNeedUpdate) {
            var url = "ipatch.aiweipan.com";
            var folder = window.appStoreName + "_" + window.appName + "_" + window.buildVersion;
            this._remoteRootUrl = cc.formatStr("http://%s/%s/", url, folder);
            cc.log(this._remoteRootUrl);
            ClientUpdaterModule.getInstance().show2CheckVersion(this._remoteRootUrl, handler(this, this.runGame), storagePath);
        }
        else {
            this.runGame();
        }
    },

    loadLogicJs : function() {
        cc.loader.loadJs("src/jsList.js");
        for(var k in new_jsList){
            cc.loader.loadJs(new_jsList[k]);
        }
    },

    // 更新完毕进入游戏
    runGame : function(){

        this.addSearchPaths();

        this.loadLogicJs();
        //切换场景
        cc.director.runScene(new cc.TransitionFade(0.5, new InitScene(), cc.BLACK));
    }
});

//获取实例
ClientLauncher.getInstance = function() {
    if (ClientLauncher.m_inst == null) {
        ClientLauncher.m_inst = new ClientLauncher();
    }
    return ClientLauncher.m_inst;
};



