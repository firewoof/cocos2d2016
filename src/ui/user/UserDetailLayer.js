/**
 * Created by Jony on 2016/8/8.
 */

var UserDetailLayer = cc.Layer.extend({
    _defaultOpacity: 160,
    _enableMaskTouch: true,

    ctor:function(player)
    {
        this._super();
        this._showPlayer = player;
        //UI
        this.initUI();

        //点击事件
        this.initAllClickFunc();

        this.addListener();

        //刷新
        this.refresh();
    },

    cleanup:function(){
        this.removeAllCustomListeners();
        this._super();
    },

    initUI:function()
    {
        //遮罩
        var mask = this._maskPanel = new ccui.Layout();
        mask.setContentSize(cc.winSize);
        mask.setBackGroundColorEx(cc.BLACK);
        mask.setBackGroundColorOpacity(this._defaultOpacity);
        this.addChild(mask);

        var layer  = ccs.loadWithVisibleSize(res.UserDetail_json).node;
        // 加入到当前layer中。
        this.addChild(layer);
        // 按钮
        var detailPanel = this._detailPanel = ccui.helper.seekWidgetByName(layer, "detailPanel");
        var btn_close = this._btn_close = ccui.helper.seekWidgetByName(detailPanel, "btn_close");
        var btn_changeNickName = this._btn_changeNickName = ccui.helper.seekWidgetByName(detailPanel, "btn_changeNickName");
        var btn_changeNickName1 = this._btn_changeNickName1 = ccui.helper.seekWidgetByName(detailPanel, "btn_changeNickName1");
        //var btn_changeAvatar = this._btn_changeAvatar = ccui.helper.seekWidgetByName(detailPanel, "btn_changeAvatar");
        var btn_sendFlower = this._btn_sendFlower = ccui.helper.seekWidgetByName(detailPanel, "btn_sendFlower");
        var btn_sendShit = this._btn_sendShit = ccui.helper.seekWidgetByName(detailPanel, "btn_sendShit");
        var btn_like = this._btn_like = ccui.helper.seekWidgetByName(detailPanel, "btn_like");

        // 左上基础信息
        var avatarPanel = this._avatarPanel = ccui.helper.seekWidgetByName(detailPanel, "avatarPanel");
        var changeAvatarBg = this._changeAvatarBg = ccui.helper.seekWidgetByName(detailPanel, "changeAvatarBg");
        var changeAvatarTxt = this._changeAvatarTxt = ccui.helper.seekWidgetByName(detailPanel, "changeAvatarTxt");

        var txt_nickName = this._txt_nickName = ccui.helper.seekWidgetByName(detailPanel, "txt_nickName");
        var nickNameEditBoxBg = ccui.helper.seekWidgetByName(detailPanel, "nickNameEditBoxBg");
        this._txt_nickNameEditBox = new cc.EditBox(nickNameEditBoxBg.getContentSize(),new cc.Scale9Sprite("bg_common_bar.png"));
        nickNameEditBoxBg.addChild(this._txt_nickNameEditBox);
        this._txt_nickNameEditBox.setPosition(centerInner(nickNameEditBoxBg));
        this._txt_nickNameEditBox.setFontSize(30);
        this._txt_nickNameEditBox.setMaxLength(7);
        this._txt_nickNameEditBox.setFontColor(cs.BLACK);
        this._txt_nickNameEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        //this._txt_nickNameEditBox.setPlaceHolder(LocalString.getString("PLEASE_INPUT_BANK_CARD"));
        //this._txt_nickNameEditBox.setPlaceholderFontColor(cc.color.GRAY);
        //this._txt_nickNameEditBox.setPlaceholderFontSize(24);
        this._txt_nickNameEditBox.setDelegate(this);
        this._txt_nickNameEditBox.setVisible(false);
        this._txt_nickNameEditBox.setString(this._showPlayer.getNickName());

        var txt_id = this._txt_id = ccui.helper.seekWidgetByName(detailPanel, "txt_id");
        var txt_winRate = this._txt_winRate = ccui.helper.seekWidgetByName(detailPanel, "txt_winRate");
        var lvPanel = ccui.helper.seekWidgetByName(detailPanel, "lvPanel");
        var txt_lv = this._txt_lv = ccui.helper.seekWidgetByName(detailPanel, "txt_lv");
        //var influencePanel = ccui.helper.seekWidgetByName(detailPanel, "influencePanel");
        //influencePanel.setVisible(false);
        //var txt_influence = this._txt_influence = ccui.helper.seekWidgetByName(influencePanel, "txt_influence");
        // 右上盈利信息
        var txt_highestWin = this._txt_highestWin = ccui.helper.seekWidgetByName(detailPanel, "txt_highestWin");
        var txt_totalWin = this._txt_totalWin = ccui.helper.seekWidgetByName(detailPanel, "txt_totalWin");
        var txt_totalWinRank = this._txt_totalWinRank = ccui.helper.seekWidgetByName(detailPanel, "txt_totalWinRank");
        var txt_weekWinRank = this._txt_weekWinRank = ccui.helper.seekWidgetByName(detailPanel, "txt_weekWinRank");

        // 持仓列表
        var tradeRecordPanel = ccui.helper.seekWidgetByName(detailPanel, "tradeRecordPanel");
        var betListPanel = this._betListPanel = ccui.helper.seekWidgetByName(tradeRecordPanel, "betListPanel");

        // 送花，送屎，打赏
        var txt_flowerNum = this._txt_flowerNum = ccui.helper.seekWidgetByName(detailPanel, "txt_flowerNum");
        var txt_shitNum = this._txt_shitNum = ccui.helper.seekWidgetByName(detailPanel, "txt_shitNum");
        var txt_heartNum = this._txt_heartNum = ccui.helper.seekWidgetByName(detailPanel, "txt_heartNum");
    },

    initAllClickFunc:function()
    {
        this._maskPanel.setTouchEnabled(this._enableMaskTouch);
        if(this._enableMaskTouch)
        {
            this._maskPanel.addClickEventListener(function(sender)
            {
                MainController.playButtonSoundEffect(sender);
                MainController.popLayerFromRunningScene(this);
            }.bind(this));
        }

        //关闭
        this._btn_close.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);

            //cc.eventManager.dispatchCustomEvent(NOTIFY_CLOSE_USER_DETAIL,this._showPlayer.getId());
        }.bind(this));

        //修改昵称按钮
        this._btn_changeNickName.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);

            this._btn_changeNickName.setVisible(false);
            this._txt_nickName.setVisible(false);
            this._txt_nickNameEditBox.setVisible(true);
            //this._txt_nickNameEditBox.setString(this._showPlayer.getNickName());
            this._txt_nickNameEditBox.touchDownAction(this._txt_nickNameEditBox, ccui.Widget.TOUCH_ENDED);

        }.bind(this));

        //修改昵称按钮
        this._btn_changeNickName1.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);

            this._btn_changeNickName.setVisible(false);
            this._txt_nickName.setVisible(false);
            this._txt_nickNameEditBox.setVisible(true);
            //this._txt_nickNameEditBox.setString(this._showPlayer.getNickName());
            this._txt_nickNameEditBox.touchDownAction(this._txt_nickNameEditBox, ccui.Widget.TOUCH_ENDED);

        }.bind(this));

        //修改头像
        if(this._showPlayer.getId() == Player.getInstance().getId()){
            //if(!cc.sys.isMobile)
            //    return;
            this._avatarPanel.setTouchEnabled(true);

            this._avatarPanel.addClickEventListener(function(sender)
            {
                //设置裁剪照片的尺寸
                if(cc.sys.os == cc.sys.OS_ANDROID){
                    jsb.reflection.callStaticMethod("com/luogu/custom/ImageCrop", "setOutputSize", "(II)V", 200, 200);
                }
                cs.NativeTool.openPhoto(function(filePath){
                    cc.log("Photo filePath::", filePath);

                    var endPoint = "https://oss-cn-shenzhen.aliyuncs.com";
                    var accessKeyId = "LTAI7WKAo6Wy8Iuq";
                    var accessKeySecret = "rFUNC7UfG80nTMKKgJmiYJHvcIav03";
                    var bucketName = "ipatch2static";
                    var addr = "http://static.aiweipan.com";
                    var folder = window.appName + "_" + window.buildVersion;
                    var objectKey = "head/"+ folder + "/" + Player.getInstance().getId() + "_" + cs.getCurSecs() + ".jpg";
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
            }.bind(this));
        }

        //送花按钮
        this._btn_sendFlower.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);

        }.bind(this));
        //送屎按钮
        this._btn_sendShit.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);

        }.bind(this));
        //打赏按钮
        this._btn_like.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);

        }.bind(this));
    },

    addListener: function()
    {
        if(Player.getInstance().getId() == this._showPlayer.getId()) {
            // 更新用户昵称
            this._refreshUserNickNameListener = cc.eventManager.addCustomListener(NOTIFY_REFRESH_USER_NICK_NAME, function(event){
                this._btn_changeNickName.setVisible(true);
                this._txt_nickNameEditBox.setVisible(false);
                this._txt_nickName.setVisible(true);
                this._txt_nickName.setString(Player.getInstance().getNickName());
                this._txt_nickNameEditBox.setString(Player.getInstance().getNickName());
            }.bind(this));
        }

        //文件上传
        this._fileUpLoadSuccessListener = cc.eventManager.addCustomListener(NOTIFY_UPLOAD_FILE_SUCCESS, function(event)
        {
            cc.log("NOTIFY_UPLOAD_FILE_SUCCESS receive");
            var userData = event.getUserData();
            var fileName = userData["fileName"];
            var url = userData["url"];
            cc.log("userData::", JSON.stringify(userData));

            //更新给服务器
            if(url && url.indexOf(Player.getInstance().getId())){

                var sendData = {
                    "auth":{"headPhoto": url}
                };
                var deleteSrcNameOrUrl = Player.getInstance().getAvatarUrl();
                new HttpRequest("userUpdate", sendData, function() {
                    //更新头像数据
                    Player.getInstance().setAvatarUrl(url);
                    //上传url成功

                    ////尝试删除原来的头像文件
                    //var deleteSuffix = deleteSrcNameOrUrl.Right(4);
                    //var fileName = cs.NativeTool.stringByMD5(deleteSrcNameOrUrl) + deleteSuffix;
                    //var status = cs.GameFileUtils.deleteFile(jsb.fileUtils.getWritablePath() + "downLoadAvatars/"+fileName);
                    //cc.log("delete status：：", status >= 0);
                    //cc.log("jsb.fileUtils.isFileExist(fileName)：：", jsb.fileUtils.isFileExist(fileName));

                    var callback = function()
                    {
                        cc.log("新的头像下载完毕....准备通知其他avatar 控件更新");
                        //关掉loading
                        MainController.getInstance().hideLoadingWaitLayer();
                        //头像修改通知
                        cc.eventManager.dispatchCustomEvent(NOTIFY_SELF_AVATAR_CHANGES);

                        //更新头像
                        if(this._avatar)
                            this._avatar.setAvatarSrc(url);
                    }.bind(this);

                    //下载新头像
                    cc.log("强制下载 更新后的URL头像");
                    cs.NativeTool.downloadImage(url, function()
                    {
                        callback();
                    }.bind(this));
                }.bind(this))
            }
        }.bind(this));
    },

    refresh: function() {
        var showPlayer = this._showPlayer;
        if(Player.getInstance().isGuest() || Player.getInstance().getId() != showPlayer.getId()) {
            //this._btn_changeAvatar.setVisible(false);
            this._btn_changeNickName.setVisible(false);
            this._btn_changeNickName1.setVisible(false);
            this._changeAvatarBg.setVisible(false);
            this._changeAvatarTxt.setVisible(false);
        }

        this._txt_nickName.setString(showPlayer.getNickName());
        var avatar = this._avatar = new CircleAvatar(showPlayer);
        avatar.setScale(0.8);
        this._avatarPanel.addChild(avatar);
        avatar.setPos(centerInner(this._avatarPanel));
        avatar.setDetailEnabled(false);

        //var statusData = jsonData.stat;
        var winRateTxt = LocalString.getString("WIN_RATE");
        if(showPlayer.getTradeCount() < 15){ winRateTxt = LocalString.getString("ESTIMATE") + winRateTxt};
        this._txt_winRate.setString(winRateTxt + (showPlayer.getWinRate()*100).toFixed(0) + "%");
        this._txt_lv.setString("Lv." + showPlayer.getLevel());
        var id = showPlayer.getShowId();
        if("" != id) {
            this._txt_id.setString("ID:" + showPlayer.getShowId());}
        else {
            this._txt_id.setString("");
        }
        //this._txt_influence.setString(LocalString.getString("INFLUENCE") + showPlayer.getInfluence());
        var txt = showPlayer.getHighestDayWin().toFixed(2);
        if(txt > 10000)
            txt = (txt/10000).toFixed(2) + "万";
        this._txt_highestWin.setString(txt + LocalString.getString("YUAN"));
        var totalTxt = showPlayer.getTotalWin().toFixed(2);
        if(totalTxt > 10000)
            totalTxt = (totalTxt/10000).toFixed(2) + "万";
        this._txt_totalWin.setString(totalTxt + LocalString.getString("YUAN"));
        this._txt_totalWinRank.setString(showPlayer.getWinRank());
        if(isNaN(showPlayer.getWinRank())) {
            this._txt_totalWinRank.setTextColor(cs.GRAY);
        }
        else {
            this._txt_totalWinRank.setTextColor(cs.RED);
        }
        this._txt_weekWinRank.setString(showPlayer.getWeekRank());
        if(isNaN(showPlayer.getWeekRank())) {
            this._txt_weekWinRank.setTextColor(cs.GRAY);
        }
        else {
            this._txt_weekWinRank.setTextColor(cs.RED);
        }
        this._txt_flowerNum.setString(showPlayer.getFlowerCount());
        this._txt_shitNum.setString(showPlayer.getShitCount());
        this._txt_heartNum.setString(showPlayer.getGivenCount());

        // 持仓记录
        this.doBetRecordReq(showPlayer.getId());
    },

    doBetRecordReq: function(id) {
        new HttpRequest("tradeOthersRecord", {auth:{id:id}}, function (data) {
            this.refreshBetList(data.list);
        }.bind(this));
    },

    refreshBetList: function(jsonData)
    {
        this._betListPanel.removeAllChildren();

        var arr = [];
        for (var i = 0; i < jsonData.length; i++) {
            var betInfo = jsonData[i];
            arr[i] = new BetListCell(betInfo);
        }

        var panel = UICommon.createPanelAlignWidgetsWithPadding(22, cc.UI_ALIGNMENT_VERTICAL_CENTER, arr);
        this._betListPanel.addChild(panel);
        panel.setPos(cc.p(this._betListPanel.width * 0.5, this._betListPanel.height), ANCHOR_TOP);
    },

    editBoxEditingDidBegin: function (editBox) {
        cc.log("editBox DidBegin !");
    },

    editBoxEditingDidEnd: function (editBox) {
        cc.log("editBoxEditingDidEnd");
    },

    editBoxReturn: function (editBox) {
        cc.log("editBoxReturn");
        var name = Player.getInstance().getNickName();
        var newName = editBox.getString().trim();
        if(newName != "")
        {
            newName = function (s) {
                var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）&;—|{}【】‘；：”“'。，、？]")
                var rs = "";
                for (var i = 0; i < s.length; i++) {
                    rs = rs + s.substr(i, 1).replace(pattern, '');
                }
                return rs;
            }(newName);
        }

        if(newName == "" || name == newName)
        {
            //if(!isLegal)
            //{
            //    MainController.showAutoDisappearAlertByText("您输入的内容中包含了特殊字符");
            //}

            this._btn_changeNickName.setVisible(true);
            this._txt_nickNameEditBox.setVisible(false);
            this._txt_nickName.setVisible(true);

            return;
        }
        //
        ////newName = replaceStr(newName);
        //if(newName!= "" && name != newName){

            cc.eventManager.dispatchCustomEvent(NOTIFY_REFRESH_USER_BASE, { nickName:newName} );
        //}

    },
});