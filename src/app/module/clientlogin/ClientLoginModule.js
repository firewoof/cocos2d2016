/**
 * 登录 module
 */

var ClientLoginModule =  cc.Class.extend({
    m_inst : null, //实例
    _model : null,
    _controller : null,
    _view : null,

    ctor : function() {
        this._controller = new ClientLoginController(this._model);
    },

    startup : function() {
        this._controller.startup();
    },

    showPopup : function(msg, callBack) {
        this._controller._view.showPopup(msg, callBack);
    },

    showPercent : function(percent) {
        this._controller._view.onShowLoadingPercentView(percent);
    },

    showInvitation:function()
    {
        this._controller._view.showInvitation();
    },

    chooseLoginMode:function(){
        this._controller.chooseLoginMode();
    },

    login:function()
    {
        this._controller.login();
    },

    showLoginType:function()
    {
        this._controller._view.showLoginType();
    },

    destroy : function(){
        if(this._model){
            this._model.destroy();
            this._model = null;
        }
        if(this._controller){
            this._controller.destroy();
            this._controller = null;
        }
        ProxyClientLoginer = null;
    }
});


//获取实例
ClientLoginModule.getInstance = function() {
    if (ClientLoginModule.m_inst == null) {
        ClientLoginModule.m_inst = new ClientLoginModule();
    }
    return ClientLoginModule.m_inst;
};

//
ProxyClientLoginer = ClientLoginModule.getInstance();
