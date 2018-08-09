/**
 * Created by Administrator
 */


var JavascriptBridge = cc.Class.extend({
    ctor:function(){
    }
});

/**
 * 单列模式
 */
JavascriptBridge.getInstance = function()
{
  if(null == this.instance){
      cc.log("JavascriptBridge create");
      this.instance = new JavascriptBridge();
  }
   return this.instance;
};


/**
 * 获取第三方授权
 */
JavascriptBridge.prototype.ShareSDKAuthorize = function(platformName)
{
    cc.log("JavascriptBridge.prototype.ShareSDKAuthorize................");
    if(cc.sys.os == cc.sys.OS_ANDROID)
    {
        jsb.reflection.callStaticMethod("com/luogu/custom/ShareSDKUtils", "authorize", "(Ljava/lang/String;)V", platformName);
    }
    else if(cc.sys.os == cc.sys.OS_IOS)
    {
        cc.log("JavascriptBridge.prototype.ShareSDKAuthorize ios");
        jsb.reflection.callStaticMethod("ShareSDKUtils", "authorize:", platformName);
    }
    else
    {
        cc.log("cur platform not support.....")
    }

    //todo test
    if(!cc.sys.isMobile){
        var result = "QQ,onComplete,unknown,10086,win32测试";
        this.ShareSDKAuthorizeCallback(result);
    }
};

/**
 * 第三方授权回调
 */
JavascriptBridge.prototype.ShareSDKAuthorizeCallback = function(result)
{
    cc.log("JavascriptBridge.prototype.ShareSDKAuthorizeCallback");
    cc.log(result);
    var r = result.split(",");
    // 授权成功
    if ("onComplete" == r[1]) {
        cc.log("授权成功");
        var platform = r[0];
        var openId = r[3];
        var headPhoto = r[5];
        var gender =  r[6];
        var nickName = decodeURI(r[4]);
        var maxLength = 7;
        if(nickName.length > maxLength) {
            nickName = nickName.substr(0,maxLength);
        }
        var gid = cc.sys.localStorage.getItem("guestId") || undefined;
        var req = {
            auth:{
                gid:gid,
                //agentId:DeviceInfoManager.getInstance().getChannel(),
                openId:openId,
                nickName: nickName,
                headPhoto: headPhoto,
                gender: gender,
                invitedCode:GB.invitationCode,
                platform: cc.sys.os,
                appStore: appStoreName
            }
        };

        DataPool.verifyOpenId = openId;
        DataPool.openId = openId;
        DataPool.hasLogin = false;
        DataPool.showId = null;
        DataPool.platform = platform;
        DataPool.registerURL = "userSocialRegister";
        DataPool.registerData = req;
        cc.sys.localStorage.removeItem("aesKey");
        cc.sys.localStorage.removeItem("accessToken");

        ProxyClientLoginer.chooseLoginMode();
    }
    else if("onCancel" == r[1]) {
        cc.log("授权失败onCancel");
    }
    else {
        cc.log("授权失败unknown");
    }
   
};

JavascriptBridge.prototype.getUnionPayType = function()
{
    cc.log("JavascriptJavaBridge.prototype.getUnionPayType");
    if(cc.sys.os == cc.sys.OS_ANDROID) {
        return jsb.reflection.callStaticMethod("com/luogu/custom/JavaUtil", "getUnionPayType", "(Ljava/lang/String;)I", "");
    }
    else if(cc.sys.os == cc.sys.OS_IOS) {
        return jsb.reflection.callStaticMethod("PayController", "getUnionPayType");
    }
    else {
        cc.log("getUnionPayType not support for platform " + cc.sys.os);
        return null;
    }
};

/**
 * start智付sdk充值流程
 */
JavascriptBridge.prototype.startMerchantPay = function(xml, mode)
{
    cc.log("JavascriptJavaBridge.prototype.startMerchantPay");
    // start智付sdk充值流程
    if(cc.sys.os == cc.sys.OS_ANDROID) {
        jsb.reflection.callStaticMethod("com/luogu/custom/UnionPayZhifuUtil", "startPay", "(Ljava/lang/String;)V", xml);
    }
    else if(cc.sys.os == cc.sys.OS_IOS) {
        if(isNeedSetPayScheme) {
            jsb.reflection.callStaticMethod("UnionPayZhifuUtil", "startPay:fromScheme:tnMode:", xml, appName, mode);
        }
        else {
            jsb.reflection.callStaticMethod("UnionPayZhifuUtil", "startPay:tnMode:", xml, mode);
        }
    }
    else {
        cc.log("startMerchantPay not support for platform " + cc.sys.os);
    }
};


/**
 * start银联sdk充值流程
 */
JavascriptBridge.prototype.startUnionPayOfficial = function(tn, mode)
{
    cc.log("JavascriptJavaBridge.prototype.startUnionPayOfficial");
    if(cc.sys.os == cc.sys.OS_ANDROID) {
        jsb.reflection.callStaticMethod("com/luogu/custom/UnionPayOfficialUtil", "startPay", "(Ljava/lang/String;Ljava/lang/String;)V", tn, mode);
    }
    else if(cc.sys.os == cc.sys.OS_IOS) {
        if (isNeedSetPayScheme) {
            jsb.reflection.callStaticMethod("UnionPayOfficialUtil", "startPay:fromScheme:tnMode:", tn, appName, mode);
        }
        else {
            jsb.reflection.callStaticMethod("UnionPayOfficialUtil", "startPay:tnMode:", tn, mode);
        }
    }
    else {
        cc.log("startUnionPayOfficial not support for platform " + cc.sys.os);
    }

};

/**
 * IOS IAP支付
 */
JavascriptBridge.prototype.appleIAPRequest = function(orderNo, productId) 
{
    if(cc.sys.os == cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("AppleIAP", "appleIAPRequest:productId:", orderNo, productId);
    }
    else {
        cc.log("appleIAPRequest not support for platform " + cc.sys.os);
    }
}

/**
 * 分享
 * @param shareData : 以下字段拼接
 // platform 分享平台 QQ QZone Wechat WechatMoments SinaWeibo
 // title标题，印象笔记、邮箱、信息、微信、人人网、QQ和QQ空间使用
 // titleUrl是标题的网络链接，仅在Linked-in,QQ和QQ空间使用
 // text是分享文本，所有平台都需要这个字段
 // imageUrl 分享网络图片，新浪微博分享网络图片需要通过审核后申请高级写入接口，否则请注释掉测试新浪微博
 // imagePath是图片的本地路径，Linked-In以外的平台都支持此参数("/sdcard/test.jpg");//确保SDcard下面存在此张图片
 // url仅在微信（包括好友和朋友圈）中使用
 // comment是我对这条分享的评论，仅在人人网和QQ空间使用
 // site是分享此内容的网站名称，仅在QQ空间使用
 // siteUrl是分享此内容的网站地址，仅在QQ空间使用
 */
JavascriptBridge.prototype.ShareSDKShowShare = function(shareData)
{
    cc.log("JavascriptBridge.prototype.ShareSDKShowShare................");
    //var shareData = {
    //    platform: platformName,
    //    title: platformName +"title",
    //    titleUrl: "http://www.irongyuan.com",
    //    text: platformName + "text",
    //    imageUrl: "http://f1.sharesdk.cn/imgs/2014/02/26/owWpLZo_638x960.jpg"
    //};
    // 组装mLink动态参数
    var paramsArray = [];
    paramsArray.push("invitationCode" + "=" + DeviceInfoManager.getInstance().getInvitationCode());
    var mLinkParamsMap = shareData["mLinkParams"];
    if(mLinkParamsMap) {
        for (var key in mLinkParamsMap)
        {
            paramsArray.push(key + "=" + mLinkParamsMap[key]);
        }
    }
    if(paramsArray.length > 0)
    {
        shareData["titleUrl"] = shareData["titleUrl"] + "?" + paramsArray.join("&");
    }
    //微博类需要将titleUrl拼接到text文本里
    if(shareData["platform"] == GB.SOCIAL_PLATFORM_SINAWEIBO)
    {
        shareData["text"] = shareData["text"] + shareData["titleUrl"];
    }
    if(cc.sys.os == cc.sys.OS_ANDROID)
    {
        jsb.reflection.callStaticMethod("com/luogu/custom/ShareSDKUtils", "showShare", "(Ljava/lang/String;)V", JSON.stringify(shareData));
    }
    else if(cc.sys.os == cc.sys.OS_IOS)
    {
        cc.log("JavascriptBridge.prototype.ShareSDKShowShare ios");
        jsb.reflection.callStaticMethod("ShareSDKUtils", "showShare:", JSON.stringify(shareData));
    }
    else
    {
        cc.log("ShareSDKShowShare cur platform not support.....")
    }
};

/**
 * 分享回调
 */
JavascriptBridge.prototype.ShareSDKShowShareCallback = function(result)
{
    cc.log("JavascriptBridge.prototype.ShareSDKShowShareCallback: "+ result);
    if ("onComplete" == result) {
        cc.log("分享成功");
        //TODO
        setTimeout(
            function(){
                MainController.showAutoDisappearAlertByText("分享成功");
            }, 0.04
        )
    }
    else if("onError" == result) {
        cc.log("分享失败onError");
    }
    else {
        cc.log("分享取消onCancel");
    }
};

/**
 * shareSdk init
 */
JavascriptBridge.prototype.ShareSDKInit = function()
{
    cc.log("JavascriptBridge.prototype.ShareSDInit: ");
    var initData = ShareSDKInitData[appName];
    if(buildVersion == BUILDVERSION_DEVELOP && appName == APPNAME_QCJY)
    {
        initData = ShareSDKInitData_QCJY_DEV;
    }
    cc.log("shareSdk init data",JSON.stringify(initData));
    if(cc.sys.os == cc.sys.OS_ANDROID)
    {
        jsb.reflection.callStaticMethod("com/luogu/custom/ShareSDKUtils", "init", "(Ljava/lang/String;)V", JSON.stringify(initData));
    }
    else if(cc.sys.os == cc.sys.OS_IOS)
    {
        try{
            cc.log("JavascriptBridge.prototype.ShareSDKInit ios");
            jsb.reflection.callStaticMethod("ShareSDKUtils", "init:", JSON.stringify(initData));
        }catch (e){
            cc.log("ShareSDKInit exception....skip");
            return;
        }
    }
    else
    {
        cc.log("ShareSDKInit cur platform not support.....")
    }
};

/**
 * 获取剪切板内容
 * @returns {*}
 */
JavascriptBridge.prototype.getClipboardContent = function()
{
    var content = "";
    if (cc.sys.platform == cc.sys.ANDROID) {
        cc.log("ANDROID getClipboardContent");
        content = jsb.reflection.callStaticMethod("com/luogu/custom/JniTool", "getClipboardContent", "()Ljava/lang/String;") || content;
    }
    else if (cc.sys.os == cc.sys.OS_IOS) {
        cc.log("IOS getClipboardContent");
        content = jsb.reflection.callStaticMethod("IOSUtil", "getClipboardContent") || content;
    }
    cc.log("clipboard content::", content);
    return content;
};

JavascriptBridge.prototype.cleanClipboard = function()
{
    if (cc.sys.platform == cc.sys.ANDROID) {
        cc.log("ANDROID getClipboard");
        jsb.reflection.callStaticMethod("com/luogu/custom/JniTool", "cleanClipboard", "()V");
    }
    else if (cc.sys.os == cc.sys.OS_IOS) {
        cc.log("IOS cleanClipboard");
        jsb.reflection.callStaticMethod("IOSUtil", "cleanClipboard");
    }
};
