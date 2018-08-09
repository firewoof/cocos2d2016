/**
 * 更新器 controller
 * Created by lex on 2016/12/06.
 */

ClientUpdaterController = cc.Class.extend({
   ctor : function(model){
       this._model = model;
       this._need2WriteVersion = false;
       this._downloadProgressTime = null;
       this._writeVersionIntervalInS = 4;    //
       this._checkSpeedIntervalInS = 1;      //

       this._tryCount = 3;                   // 尝试次数
   }
});

ClientUpdaterController.prototype.getSizeString = function(size){
    var result = "";
    if(size < 1000) {
        result = ceil(size).toString() + "B";
    }
    else if(size < 1000*1000){
        result = ceil(size/1000*10).toString() + "KB";
    }
    else {
        result = (ceil(size/1000/1000*10)/10).toString() + "MB";
    }
    return result;
};

ClientUpdaterController.prototype.requestVersion = function(url, counter){
    var tryCount = counter || 1;
    this._model.setRequestUrl(url);
    this._model.setRequestTryCount(tryCount);
    var requestUrl = url + '?t=' + new Date().getTime();
    Http.getInstance().requestWithUrl(requestUrl, handler(this, this.onVersionComplete), handler(this, this.onVersionFailed), null, handler(this, this.onVersionFailed), 10*1000, "GET", null, "text");
};

ClientUpdaterController.prototype.requestManifest = function(url, counter){
    var tryCount = counter || 1;
    this._model.setRequestUrl(url);
    this._model.setRequestTryCount(tryCount);
    var requestUrl = url + '?t=' + new Date().getTime();
    Http.getInstance().requestWithUrl(requestUrl, handler(this, this.onMainfestComplete), handler(this, this.onManifestFailed), null, handler(this, this.onManifestFailed), 10*1000, "GET", null, "text");
};

ClientUpdaterController.prototype.requestOneFile = function(url, counter){
    var tryCount = counter || 1;
    this._model.setRequestUrl(url);
    this._model.setRequestTryCount(tryCount);
    Http.getInstance().requestWithUrl(url, handler(this, this.onOneFileDownloadedComplete), handler(this, this.onOneFileDownloadFailed), null, handler(this, this.onOneFileDownloadFailed), 10*1000, "GET", null, "arraybuffer");
};

ClientUpdaterController.prototype.onVersionComplete = function(args){
    cc.log("onVersionComplete");
    var newVersionStr = args[0];
    var newVersionConfig = newVersionStr.split(",");

    // 先读patch目录，再读原始资源
    var curVersionStr = jsb.fileUtils.getStringFromFile(this._model.getLocalUpdateRootUrl() + this._model.getVersionRelativePath());
    if(curVersionStr == null || curVersionStr == "") {
        curVersionStr = jsb.fileUtils.getStringFromFile(this._model.getVersionRelativePath());
    }
    var curVersionConfig = curVersionStr.split(",");
    this._model.setNewVersionStr(newVersionStr);

    cc.log("newVersionConfig", newVersionConfig);
    cc.log("curVersionConfig", curVersionConfig);
    if(newVersionConfig[0] != curVersionConfig[0])
    {
        var newVersion = newVersionConfig[0];
        var curVersion = curVersionConfig[0];
        var newVersionNodeArray = newVersion.split(".");
        var curVersionNodeArray = curVersion.split(".");
        //主版本号
        var newMainVersion = newVersionNodeArray[0];
        var curMainVersion = curVersionNodeArray[0];
        if(parseInt(newMainVersion) > parseInt(curMainVersion)){
            //大版本更新
            if (cc.sys.platform == cc.sys.ANDROID) {
                cc.log("big ANDROID version update", newVersionConfig[2]);
                if (undefined == newVersionConfig[2] || "" == newVersionConfig[2].trim()){
                    cc.log("no apk url");
                    this._model.getFinishCallback()();
                }
                else {
                    ClientUpdaterModule.getInstance().show(true);
                    var url = newVersionConfig[2].trim();
                    jsb.reflection.callStaticMethod("com/luogu/custom/JniTool", "downLoadFile", "(Ljava/lang/String;Ljava/lang/String;)V", url, "spinageUpdate.apk");
                }
            }
            else if (cc.sys.platform == cc.sys.IPHONE || cc.sys.platform == cc.sys.IPAD) {
                cc.log("big IPHONE version update");
                //苹果检测到大版本更新...依然做热更允许进场
                this._model.setNewVersionConfig(newVersionConfig);
                this._model.setNewVersionStr(newVersionStr);
                ClientUpdaterModule.getInstance().show();
                var requestUrl = this._model.getRemoteRootUrl() + newVersionConfig[1].trim();
                this.requestManifest(requestUrl);
            }
            else {
                cc.log("big OTHER version update");
                this._model.getFinishCallback()();
            }
        }
        else if(newMainVersion == curMainVersion && this.compareVersion(curVersion,newVersion))
        {
            cc.log("hot version update");
            this._model.setNewVersionConfig(newVersionConfig);
            this._model.setNewVersionStr(newVersionStr);
            ClientUpdaterModule.getInstance().show();
            var requestUrl = this._model.getRemoteRootUrl() + newVersionConfig[1].trim();
            this.requestManifest(requestUrl);
        }
        else {
            cc.log("no version update");
            this._model.getFinishCallback()();
        }
    }
    else {
        //this.loadLogicJs();
        cc.log("no version update");
        this._model.getFinishCallback()();
    }
};

/**
 * 版本号比较  true表示版本号 reqV 比小 reqV大，需要更新
 * @param curV
 * @param reqV
 * @returns {boolean}
 */
ClientUpdaterController.prototype.compareVersion = function(curV,reqV)
{
    cc.log("curV::",curV);
    cc.log("reqV::",reqV);
    if(curV && reqV){
        //将两个版本号拆成数字
        var curVersionArray = curV.split('.');
        var reqVersionArray = reqV.split('.');
        var minLength = Math.min(curVersionArray.length,reqVersionArray.length);
        var position = 0;
        var diff = 0;
        //依次比较版本号每一位大小，当对比得出结果后跳出循环
        while(position < minLength && ((diff = parseInt(reqVersionArray[position]) - parseInt(curVersionArray[position])) == 0)){
            position++;
        }
        diff = (diff != 0) ? diff : (reqVersionArray.length - curVersionArray.length);
        //若reqV大于curV，则返回true
        return diff > 0;
    }else{
        //输入为空
        cc.log("版本号不能为空");
        return false;
    }
};

ClientUpdaterController.prototype.onMainfestComplete = function(args){
    cc.log("onMainfestComplete");
    var manifestStr = jsb.fileUtils.getStringFromFile(this._model.getLocalUpdateRootUrl() + this._model.getManifestRelativePath());
    if(manifestStr == null || manifestStr == ""){
        manifestStr = jsb.fileUtils.getStringFromFile(this._model.getManifestRelativePath());
    }
    this._model.setNewManifestStr(args[0]);

    var myVersionFiles = (new CSV(manifestStr, {header : true, cast : false})).parse();
    this._model.setMyVersionFiles(myVersionFiles);

    var versionFiles = (new CSV(args[0], {header : true, cast : false})).parse();
    this._model.setVersionFiles2Download(versionFiles);
    this._model.setNewManifestStr(args[0]);

    // total size
    var downloadTotalSize = 0;
    for(var k in versionFiles){
        var item = myVersionFiles[k]
        if (null == item || item.md5 != versionFiles[k].md5) {
            downloadTotalSize += versionFiles[k].size;
        }
    }
    this._model.setDownloadTotalSize(downloadTotalSize);

    // next file
    this.requestNextFile();
};

ClientUpdaterController.prototype.requestNextFile = function(){
    cc.log("requestNextFile");
    var myVersionFiles = this._model.getMyVersionFiles();
    var versionFiles = this._model.getVersionFiles2Download();

    for(var k in versionFiles){
        if(myVersionFiles[k] == null || myVersionFiles[k].md5 != versionFiles[k].md5) {
            this._model.setCurVersionFile(versionFiles[k]);
            cc.log(this._model.getRemoteRootUrl() + k);
            this.requestOneFile(this._model.getRemoteRootUrl() + k);
            delete versionFiles[k];
            break;
        }
        else{
            delete versionFiles[k];
        }
    }

    // 检测是否更新完成
    if(isEmptyObject(versionFiles)){
        cc.log("ClientUpdaterController.prototype.writeVersion2Manifest");
        //写版本文件
        var rootUrl = this._model.getLocalUpdateRootUrl()
        cs.GameFileUtils.createPath(rootUrl.substring(jsb.fileUtils.getWritablePath().length, rootUrl.lastIndexOf("/")+1));
        cs.GameFileUtils.writeStringToFile(rootUrl + this._model.getManifestRelativePath(), this._model.getNewManifestStr(), "w+b");
        cs.GameFileUtils.writeStringToFile(rootUrl + this._model.getVersionRelativePath(), this._model.getNewVersionStr(), "w+b");
        // 进入游戏
        this._model.getFinishCallback()();
    }
};

ClientUpdaterController.prototype.onOneFileDownloadedComplete = function(args){
    cc.log("onOneFileDownloadedComplete");
    var md5v = md5.hex(args[0]).toUpperCase();
    if (this._model.getCurVersionFile().md5 != md5v)
    {
        cc.log("onOneFileDownloadedComplete", md5v, this._model.getCurVersionFile().md5);
        this.onOneFileDownloadFailed(args);
    }
    else {
        var curFile = this._model.getLocalUpdateRootUrl() + this._model.getCurVersionFile().path;
        cc.log(curFile.substring(jsb.fileUtils.getWritablePath().length, curFile.lastIndexOf("/")+1));
        cs.GameFileUtils.createPath(curFile.substring(jsb.fileUtils.getWritablePath().length, curFile.lastIndexOf("/")+1));
        if (typeof args[0] == "string"){
            cs.GameFileUtils.writeStringToFile(curFile, args[0], "w+b");
        }
        else {
            cs.GameFileUtils.writeFile(curFile, args[0], "w+b");
        }

        this._model.setCurDownloadedSize(this._model.getCurDownloadedSize() + this._model.getCurVersionFile().size);
        var downloadedPercent = this._model.getCurDownloadedSize() / this._model.getDownloadTotalSize();
        this._model.setCurShowLoadingPercent(downloadedPercent);
        cc.log("downloadedPercent", downloadedPercent, this._model.getCurDownloadedSize(), this._model.getDownloadTotalSize(), this._model.getCurShowLoadingPercent() );

        this.requestNextFile();
    }
};

ClientUpdaterController.prototype.onVersionFailed = function(args){
    var requestUrl = this._model.getRequestUrl();
    var requestTryCount = this._model.getRequestTryCount();
    cc.log("onVersionFailed", requestUrl, requestTryCount);
    if (requestTryCount + 1 <= this._tryCount) {
        this.requestVersion(requestUrl, requestTryCount + 1);
    }
    else {
        // 进入游戏
        var finishCallback = this._model.getFinishCallback();
        if (finishCallback) {
            this._model.setFinishCallback(null);
            finishCallback();
        }
    }
};

ClientUpdaterController.prototype.onManifestFailed = function(args){
    var requestUrl = this._model.getRequestUrl();
    var requestTryCount = this._model.getRequestTryCount();
    cc.log("onMainfestFailed", requestUrl, requestTryCount);
    if (requestTryCount + 1 <= this._tryCount) {
        this.requestManifest(requestUrl, requestTryCount + 1);
    }
    else {
        // 提示框
        var callback = function() {
            this.requestManifest(requestUrl);
        }.bind(this);
        ClientUpdaterModule.getInstance().showPopup("下载更新失败请重试", callback);
    }
};

ClientUpdaterController.prototype.onOneFileDownloadFailed = function(args){
    var requestUrl = this._model.getRequestUrl();
    var requestTryCount = this._model.getRequestTryCount();
    cc.log("onOneFileDownloadFailed", requestUrl, requestTryCount);
    if (requestTryCount + 1 < this._tryCount) {
        this.requestOneFile(requestUrl, requestTryCount + 1);
    }
    else if (requestTryCount + 1 == this._tryCount) {
        var newRequestUrl = requestUrl;
        if (-1 == newRequestUrl.indexOf("?t=")) {
            newRequestUrl = requestUrl + "?t=" + new Date().getTime();
        }
        this.requestOneFile(newRequestUrl, requestTryCount + 1);
    }
    else {
        // 提示框
        var callback = function() {
            this.requestOneFile(requestUrl);
        }.bind(this);
        ClientUpdaterModule.getInstance().showPopup("下载更新失败，请重试", callback);
    }
};
