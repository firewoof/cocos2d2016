/**
 * Created by Administrator on 2017/5/11.
 */

var IDCardUpLoadLayer = BaseLayer.extend({
    ctor:function(){
        this._super();

        this.initUI();

        this.initAllButtonClick();

        this.addListeners();

        var hasUploadedCard = RemoteStorage.getInstance().hasUploadedCard();
        cc.log("hasUploadedCard::",hasUploadedCard);
        if(hasUploadedCard){
            if(!DP.idCardFrontUrl && !DP.idCardBackUrl){
                MainController.getInstance().showLoadingWaitLayer();
                HttpManager.requestLoadIdCardUrl(function(data){
                    MainController.getInstance().hideLoadingWaitLayer();
                    var idCardUrl = data["value"];
                    var splitArray = idCardUrl.split(",");
                    for(var i = 0; i < splitArray.length; i++){
                        var tempUrl = splitArray[i];
                        if(tempUrl.indexOf("front") >= 0){
                            DP.idCardFrontUrl = tempUrl;
                            this.setCardSrc(tempUrl, true);
                        }
                        else if(tempUrl.indexOf("back") >= 0)
                        {
                            DP.idCardBackUrl = tempUrl;
                            this.setCardSrc(tempUrl, false);
                        }
                    }
                }.bind(this));
            }
            else
            {
                cc.log("DP.idCardFrontUrl::",DP.idCardFrontUrl);
                cc.log("DP.idCardBackUrl::",DP.idCardBackUrl);
                if(DP.idCardFrontUrl)
                    this.setCardSrc(DP.idCardFrontUrl, true);
                if(DP.idCardBackUrl)
                    this.setCardSrc(DP.idCardBackUrl, false);
            }

        }
    },

    /**
     * @param srcNameOrUrl
     */
    setCardSrc:function(url, isFront, isForceDownload)
    {
        var immediatelyRefresh = true;
        var md5Url = cs.NativeTool.stringByMD5(url);
        var srcNameJpg = md5Url + ".jpg";
        var srcName = srcNameJpg;
        if(!isForceDownload && !cc.textureCache.getTextureForKey(srcNameJpg))
        {
           if(jsb.fileUtils.isFileExist(srcNameJpg)){
                cc.textureCache.addImage(srcNameJpg);
                srcName = srcNameJpg;
            }
            else
            {
                cc.log("本地头像未找到 准备请求下载");
                //下载完成前 先重置成默认的
                //this.refreshCard(default, isFront);
                //下载
                this._downLoad(url, isFront);
                immediatelyRefresh = false;
            }
        }

        //强制下载
        if(isForceDownload){
            cc.log("isForceDownload::",isForceDownload);
            this._downLoad(url, isFront);
            immediatelyRefresh = false;
        }

        if(immediatelyRefresh) {
            this.refreshCard(srcName, isFront);
        }
    },

    _downLoad:function(url, isFront)
    {
        MainController.getInstance().showLoadingWaitLayer();
        cc.log("_downLoad isFront::",  isFront);
        cs.NativeTool.downloadImage(url, function(srcName)
        {
            MainController.getInstance().hideLoadingWaitLayer();
            if(this && cc.sys.isObjectValid(this)){
                cc.textureCache.reloadTexture(srcName);
                this.refreshCard(srcName, isFront);
            }
        }.bind(this));

    },

    addListeners:function(){
        //上传成功后 准备下载
        this._fileUpLoadSuccessListener = cc.eventManager.addCustomListener(NOTIFY_UPLOAD_FILE_SUCCESS, function(event)
        {
            cc.log("NOTIFY_UPLOAD_FILE_SUCCESS receive");
            var userData = event.getUserData();
            var fileName = userData["fileName"];
            var url = userData["url"];
            cc.log("userData::", JSON.stringify(userData));

            var isFront = url.indexOf("front")>=0;

            //保存标记
            var remoteStorage = RemoteStorage.getInstance();
            if(!remoteStorage.hasUploadedCard()){
                remoteStorage.setHasUploadedCard(true);
                remoteStorage.saveToRemote();
            }

            if(isFront){
                DP.idCardFrontUrl = url;
            }
            else{
                DP.idCardBackUrl = url;
            }
            //更新url给服务器
            var frontUrl = DP.idCardFrontUrl || "";
            var backUrl = DP.idCardBackUrl || "";
            var idCardUrl = frontUrl+","+backUrl;
            var successCallBack = function(){
                cc.log("SaveIdCardUrl 保存成功");
                if(isFront && this._frontPicture){
                    this._frontPicture.removeFromParent();
                    this._frontPicture = null;
                }
                if(!isFront && this._backPicture){
                    this._backPicture.removeFromParent();
                    this._backPicture = null;
                }
                var md5Url = cs.NativeTool.stringByMD5(url);
                var srcNameJpg = md5Url + ".jpg";
                cc.textureCache.removeTextureForKey(srcNameJpg);
                cs.GameFileUtils.deleteFile("downLoadAvatars/"+srcNameJpg);
                cc.log("force download card url");
                //强制下载
                this.setCardSrc(url, isFront, true);
            }.bind(this);
            //更新成功才开始下载
            HttpManager.requestSaveIdCardUrl(successCallBack, idCardUrl);
        }.bind(this));
    },

    initUI:function(){
        var layer = ccs.loadWithVisibleSize(res.IDCardUpLoadLayer_json).node;
        this.addChild(layer);

        var titlePanel =this._titlePanel = ccui.helper.seekWidgetByName(layer, "titlePanel");
        // 返回按钮
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");
        var uploadPanel = this._uploadPanel = ccui.helper.seekWidgetByName(layer, "uploadPanel");


        //上传身份证正面
        var IDCardFrontSidePanel = this._IDCardFrontSidePanel = ccui.helper.seekWidgetByName(uploadPanel,"IDCardFrontSidePanel");
        this._frontSizeAddImage = ccui.helper.seekWidgetByName(IDCardFrontSidePanel,"addImage");
        this._frontSideTxt = ccui.helper.seekWidgetByName(IDCardFrontSidePanel,"text");


        //上传身份证反面
        var IDCardBackSidePanel = this._IDCardBackSidePanel = ccui.helper.seekWidgetByName(uploadPanel,"IDCardBackSidePanel");
        this._backSizeAddImage = ccui.helper.seekWidgetByName(IDCardBackSidePanel,"addImage");
        this._backSideTxt = ccui.helper.seekWidgetByName(IDCardBackSidePanel,"text");


        var confirmBtn = this._confirmBtn = ccui.helper.seekWidgetByName(uploadPanel,"confirmBtn");
    },

    openPhoto:function(isFront){
        //设置裁剪照片的尺寸
        if(cc.sys.os == cc.sys.OS_ANDROID){
            jsb.reflection.callStaticMethod("com/luogu/custom/ImageCrop", "setOutputSize", "(II)V", 360, 200);
        }

        //打开相机/相册
        cs.NativeTool.openPhoto(function(filePath){
            cc.log("Photo filePath::", filePath);

            //照片本地处理完毕准备上传
            var endPoint = "https://oss-cn-shenzhen.aliyuncs.com";
            var accessKeyId = "LTAI7WKAo6Wy8Iuq";
            var accessKeySecret = "rFUNC7UfG80nTMKKgJmiYJHvcIav03";
            var bucketName = "ipatch2static";
            var addr = "http://static.aiweipan.com";
            var folder = window.appName + "_" + window.buildVersion;
            var side = isFront ? "front_" : "back_";
            var objectKey = "id_card/"+ folder + "/" + side + Player.getInstance().getIdFlag() + ".jpg";
            var uploadFilePath = filePath;

            if(cc.sys.os == cc.sys.OS_ANDROID)
            {
                //触发上传
                var jsonData = {};
                jsonData.endPoint = endPoint;
                jsonData.accessKeyId = accessKeyId;
                jsonData.accessKeySecret = accessKeySecret;
                jsonData.bucketName = bucketName;
                jsonData.objectKey = objectKey;
                jsonData.uploadFilePath = filePath;
                jsonData.addr = addr;
                //
                jsb.reflection.callStaticMethod("com/luogu/custom/JniTool", "upLoadFile", "(Ljava/lang/String;)V", JSON.stringify(jsonData));
            }
            else if(cc.sys.os == cc.sys.OS_IOS)
            {
                cc.log("AliyunOSSTool ios");
                jsb.reflection.callStaticMethod("AliyunOSSTool", "initOSSClient:::::", accessKeyId, accessKeySecret, endPoint, bucketName, addr);
                jsb.reflection.callStaticMethod("AliyunOSSTool", "uploadObjectAsync::", objectKey, uploadFilePath);

            }

            //显示loading先
            MainController.getInstance().showLoadingWaitLayer();
        });
    },

    refreshCard:function(srcName, isFront){
        if(isFront){
            this.refreshFrontCard(srcName);
        }else{
            this.refreshBackCard(srcName);
        }
    },

    //刷新正面纹理
    refreshFrontCard:function(srcName){
        this._frontSideTxt.setVisible(false);
        this._frontSizeAddImage.setVisible(false);

        if(this._frontPicture){
            this._frontPicture.removeFromParent();
        }
        var picture = this._frontPicture = new cc.Sprite(srcName);
        this._IDCardFrontSidePanel.addChild(picture);
        picture.setPos(centerInner(this._IDCardFrontSidePanel));
        var parentSize = this._IDCardFrontSidePanel.getContentSize();
        var childSize = picture.getContentSize();
        var scale = Math.min(parentSize.width / childSize.width , parentSize.height / childSize.height);
        picture.setScale(scale);
    },

    //刷新反面纹理
    refreshBackCard:function(srcName){
        this._backSizeAddImage.setVisible(false);
        this._backSideTxt.setVisible(false);

        if(this._backPicture){
            this._backPicture.removeFromParent();
        }
        var picture = this._backPicture = new cc.Sprite(srcName);
        this._IDCardBackSidePanel.addChild(picture);
        picture.setPos(centerInner(this._IDCardBackSidePanel));
        var parentSize = this._IDCardBackSidePanel.getContentSize();
        var childSize = picture.getContentSize();
        var scale = Math.min(parentSize.width / childSize.width , parentSize.height / childSize.height);
        picture.setScale(scale);
    },

    initAllButtonClick:function(){
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        this._confirmBtn.addClickEventListener(function(sender){
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        this._IDCardFrontSidePanel.addClickEventListener(function(sender){
            this.openPhoto(true);
        }.bind(this));

        this._IDCardBackSidePanel.addClickEventListener(function(sender){
            this.openPhoto(false);
        }.bind(this));
    }
});
