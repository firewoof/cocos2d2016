/**
 * 更新器 model
 * Created by lex on 2016/12/06.
 */

var ClientUpdaterModel = cc.Class.extend({
    ctor : function() {
        createSetterGetter(this, "finishCallback", null);       //更新完成的回调
        createSetterGetter(this, "scriptsFileName", "src");     //
        createSetterGetter(this, "myVersionConfig", null);      //客户端当前的版本配置
        createSetterGetter(this, "newVersionConfig", null);     //远端新的版本配置
        createSetterGetter(this, "newVersionStr", null);        //远端新的版本字符串
        createSetterGetter(this, "newManifestStr", null);        //远端新的Manifest字符串
        createSetterGetter(this, "myVersionFiles", null);           //客户端当前文件信息
        createSetterGetter(this, "versionFiles2Download", null);   //需要更新的所有文件
        createSetterGetter(this, "curVersionFile", null);       //当前更新的文件
        createSetterGetter(this, "downloadTotalSize", 0);       //总共需要下载的文件大小，单位字节
        createSetterGetter(this, "curDownloadedSize", 0);       //当前已下载的字节
        createSetterGetter(this, "curShowLoadingPercent", 0, true); //当前loading的比例
        createSetterGetter(this, "popupMsg", null);       //弹出框信息体

        createSetterGetter(this, "localUpdateRootUrl", null);       //更新在本地根目录的路径
        createSetterGetter(this, "remoteRootUrl", null);             //远程的根目录
        createSetterGetter(this, "versionRelativePath", "version.csv");           //version.csv文件相对路径
        createSetterGetter(this, "manifestRelativePath", "manifest.csv");           //manifest.csv文件相对路径

        createSetterGetter(this, "requestUrl", null);             //当前请求URL
        createSetterGetter(this, "requestTryCount", null);        //当前请求URL请求次数
    }
});

//
ClientUpdaterModel.prototype.getFileDownloadUrl = function(versionConfig){
    return this.getRemoteRootUrl() + "/" + this.getScriptsFileName();
};

//
ClientUpdaterModel.prototype.getFileSaveUrl = function(versionConfig) {
    return this.getLocalUpdateRootUrl() + "/" + this.getScriptsFileName();
};

ClientUpdaterModel.prototype.destroy = function(){
    SignalAs3.clearAllSignal(this); //by lex

    this._finishCallback = null;
    this._myVersionConfigs = null;
    this._newVersionConfigs = null;
    this._versionFiles2Download = null;
    this._curVersionFile = null;
    this._downloadTotalSize = null;
    this._curDownloadedSize = null;
    this._curShowLoadingPercent = null;
    this._curDownloadIndex = null;
    this._popupMsg = null;
    this._remoteRootUrl = null;
    this._localUpdateRootUrl = null;
};