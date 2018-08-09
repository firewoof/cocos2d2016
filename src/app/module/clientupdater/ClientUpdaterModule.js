/**
 * 更新器 module
 * Created by lex on 2016/12/06.
 */

var ClientUpdaterModule =  cc.Class.extend({
    m_inst : null, //实例
    _model : null,
    _controller : null,
    _view : null,

    ctor : function() {
        this._model = new ClientUpdaterModel();
        this._controller = new ClientUpdaterController(this._model);
        this._view = new ClientUpdateView(this._model, this._controller);
    },

    show : function (bigUpdate) {
        this._view.show(bigUpdate);
    },

    showPopup : function(msg, callBack) {
        this._view.showPopup(msg, callBack);
    },

    destroy : function(){
        if(this._model){
            this._model.destroy();
            this._model = null;
        }
        if(this._view){
            this._view.destroy();
            this._view = null;
        }
        if(this._controller){
            this._controller.destroy();
            this._controller = null;
        }
    }
});

ClientUpdaterModule.prototype.show2CheckVersion = function(url, callback, localUpdateRootUrl, scriptsFileName){
    if(scriptsFileName){
        this._model.setScriptsFileName(scriptsFileName);
    }
    this._model.setLocalUpdateRootUrl(localUpdateRootUrl);
    this._model.setRemoteRootUrl(url);
    this._model.setFinishCallback(callback);
    this._controller.requestVersion(url + this._model.getVersionRelativePath());
};

//获取实例
ClientUpdaterModule.getInstance = function() {
    if (ClientUpdaterModule.m_inst == null) {
        ClientUpdaterModule.m_inst = new ClientUpdaterModule();
    }
    return ClientUpdaterModule.m_inst;
};
