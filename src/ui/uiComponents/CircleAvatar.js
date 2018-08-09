var DownloadImageBuffer = DownloadImageBuffer || {};

/**
 * 圆形头像
 * Created by Administrator on 2016/6/7.
 */
var CircleAvatar = cc.Node.extend({
    _avatarSprite:undefined,
    _simplePlayer:undefined,
    _clickCallBack:undefined,

    ctor:function(simplePlayer)
    {
        this._super();
        this._simplePlayer = simplePlayer;

        var circlePanel = new cc.Sprite("#icon_avatar_big_1.png");
        this.setContentSize(cc.sizeAdd(circlePanel.getContentSize(), cc.size(5, 5)));
        this.setAnchorPoint(0.5, 0.5);
        this.addChild(circlePanel);
        circlePanel.setPosition(centerInner(this));

        //裁剪node
        var clippingNode = new cc.ClippingNode();
        clippingNode.setAlphaThreshold(0.5);
        clippingNode.setPosition(centerInner(this));
        this.addChild(clippingNode);

        //裁剪模板
        var stencil = new cc.Node();
        var bgSprite = new cc.Sprite("#icon_avatar_big_1.png");
        bgSprite.setScale(0.96);
        stencil.addChild(bgSprite);
        clippingNode.setStencil(stencil); //设置模板Stencil

        //头像
        var avatarSprite = this._avatarSprite = new cc.Sprite("avatar_default.png");
        clippingNode.addChild(avatarSprite);
        //默认 先刷一次
        this.refreshAvatarTexture();

        //外圈(可以遮盖由裁剪带来的锯齿)
        var circleFrameSprite = new cc.Sprite("#icon_avatar_big.png");
        this.addChild(circleFrameSprite);
        circleFrameSprite.setScale(0.98);
        circleFrameSprite.setPos(centerInner(this));

        this._clickCallBack = function() {
            //cc.log("this._simplePlayer.getId()::", this._simplePlayer.getId());
            if(this._simplePlayer && this._simplePlayer.getId()){
                MainController.getInstance().showUserDetailLayer(this._simplePlayer.getId());
            }
        }.bind(this);
        //响应点击面板
        var touchPanel = this._touchPanel = ccui.Layout();
        touchPanel.setContentSize(this.getContentSize());
        this.addChild(touchPanel);
        touchPanel.setTouchEnabled(true);
        touchPanel.setSwallowTouches(false);
        if (!isEducationVersion) {
            touchPanel.addClickEventListener(function(){
                this._clickCallBack();
            }.bind(this));
        }

        var srcNameOrUrl = "";
        if(typeof simplePlayer == "string")
        {
           srcNameOrUrl = simplePlayer;
        }
        else if(simplePlayer instanceof SimplePlayer)
        {
           srcNameOrUrl = simplePlayer.getAvatarUrl();
        }
        if(srcNameOrUrl)
           this.setAvatarSrc(srcNameOrUrl);

        //监听
        this.addListener();
    },

    addListener:function(){
        // 头像修改
        this._selfAvatarChangesListener = cc.eventManager.addCustomListener(NOTIFY_SELF_AVATAR_CHANGES, function(event){
            cc.log("receive NOTIFY_SELF_AVATAR_CHANGES");
            if(this._simplePlayer && this._simplePlayer.getId() == Player.getInstance().getId()){
                this._simplePlayer.setAvatarUrl(Player.getInstance().getAvatarUrl());
                this.setAvatarSrc(Player.getInstance().getAvatarUrl());
            }
        }.bind(this));

        //查看其它人头像时，发现头像有变更则立即更新，防止显示不一致
        this._fixAvatarUrlListener = cc.eventManager.addCustomListener(NOTIFY_USER_DETAIL_OPENED, function(event){
            var playerInfo = event.getUserData();
            //if(this._simplePlayer){
            //    cc.log("receive NOTIFY_USER_DETAIL_OPENED pid::", this._simplePlayer.getId(), this._simplePlayer.getNickName());
            //}
            if(this._simplePlayer && playerInfo && this._simplePlayer.getId() == playerInfo.getId()
                && playerInfo.getAvatarUrl() != this._avatarUrl)
            {
                this._simplePlayer.setAvatarUrl(playerInfo.getAvatarUrl());
                this.setAvatarSrc(playerInfo.getAvatarUrl());
                cc.log("receive NOTIFY_USER_DETAIL_OPENED pid::", this._simplePlayer.getId(), this._simplePlayer.getNickName());
            }
        }.bind(this));
    },

    cleanup:function()
    {
        this.removeAllCustomListeners();
        this._super();
    },

    addClickCallBack:function(clickCallBack){
        this._clickCallBack = clickCallBack;
    },

    setClickCallback:function(clickCallBack){
        this.addClickCallBack(clickCallBack);
    },

    setDetailEnabled:function(isEnable)
    {
        this._touchPanel.setTouchEnabled(isEnable == undefined ? true : isEnable);
    },

    setSwallowTouches:function(isSwallow){
        this._touchPanel.setSwallowTouches(isSwallow);
    },

    refresh:function(simplePlayer)
    {
        if(!simplePlayer)
            return;
        var simplePlayer = this._simplePlayer = simplePlayer || this._simplePlayer;
        this.setAvatarSrc(simplePlayer.getAvatarUrl());
    },

    /**
     * 顺带处理，可能存在的并发的下载逻辑
     * @param srcNameOrUrl
     * @private
     */
    _downLoad:function(srcNameOrUrl)
    {
        //下载接受后的刷新
        var callBack = function(srcName){
            //回调回来可能this已经被销毁
            if(this && cc.sys.isObjectValid(this) && this._avatarSprite){
                this.refreshAvatarTexture(srcName);
            }
        }.bind(this);

        if(!CircleAvatar.downLoadRequestManager[srcNameOrUrl])
        {
            CircleAvatar.downLoadRequestManager[srcNameOrUrl] = [callBack];

            cc.log("头像不存在，尝试请求服务器：", srcNameOrUrl);
            //第一个请求故只由它下载
            cs.NativeTool.downloadImage(srcNameOrUrl, function(srcName)
            {
                //请求到达后分发给所有的与此相关的头像控件
                var callBacks = CircleAvatar.downLoadRequestManager[srcNameOrUrl];
                for(var i = 0; i < callBacks.length; i++)
                {
                    callBacks[i](srcName);
                }
                //注意: 重置
                CircleAvatar.downLoadRequestManager[srcNameOrUrl] = [];
            });
        }
        else
        {
            CircleAvatar.downLoadRequestManager[srcNameOrUrl].push(callBack);
        }


    },

    /**
     *
     * @param {String} [name]
     */
    refreshAvatarTexture:function(name)
    {
        var sprite = this._avatarSprite;
        var defaultName = "avatar_default.png";
        var texture = (name == undefined || name == "")? cc.textureCache.addImage(defaultName) : cc.textureCache.addImage(name);
        if (texture != null)
        {
            var size = texture.getContentSize();
            sprite.initWithTexture(texture, cc.rect(0, 0, size.width, size.height));
            var scale = (98)/Math.min(sprite.width, sprite.height);
            sprite.setScale(scale);
        }
    },

    /**
     * 设置头像url
     * @param srcNameOrUrl
     */
    setAvatarSrc:function(srcNameOrUrl)
    {
        if(srcNameOrUrl && srcNameOrUrl.startsWith("http"))
        {
            this._avatarUrl = srcNameOrUrl;
            var immediatelyRefresh = true;
            var srcName = "";
            var md5Url = cs.NativeTool.stringByMD5(srcNameOrUrl);
            var srcNamePng = md5Url + ".png";
            var srcNameJpg = md5Url + ".jpg";

            if(!cc.textureCache.getTextureForKey(srcNamePng) || !cc.textureCache.getTextureForKey(srcNameJpg))
            {
                //本地有保存
                //cc.log("srcNameOrUrl::", srcNameOrUrl);
                //cc.log("md5 md5Url::", md5Url);
                if(jsb.fileUtils.isFileExist(srcNamePng)) {
                    //cc.log("本地头像已找到："+srcNamePng);
                    cc.textureCache.addImage(srcNamePng);
                    srcName = srcNamePng;
                }else if(jsb.fileUtils.isFileExist(srcNameJpg)){
                    //cc.log("本地头像已找到："+srcNameJpg);
                    cc.textureCache.addImage(srcNameJpg);
                    srcName = srcNameJpg;
                }
                else
                {
                    //cc.log("本地头像未找到 准备请求下载");
                    //下载完成前 先重置成默认的
                    this.refreshAvatarTexture();
                    //下载
                    this._downLoad(srcNameOrUrl);
                    immediatelyRefresh = false;
                }
            }

            if(immediatelyRefresh) {
                this.refreshAvatarTexture(srcName);
            }
        }
        else
        {
            this.refreshAvatarTexture(srcNameOrUrl);
        }
    }
});

//格式：{“avatarUrl”:[callback1, callback2,...], “avatarUr2”:[callback1, callback2,...]}
CircleAvatar.downLoadRequestManager = {};


/**
 * k线上抓取的用户头像
 * @type {Function}
 */
var BetAvatar = cc.Node.extend({
    _betPlayer:undefined,

    ctor:function()
    {
        this._super();

        var circleAvatar = this._circleAvatar = new CircleAvatar();
        circleAvatar.setScale(37/circleAvatar.height);
        circleAvatar.setDetailEnabled(false);

        var size = cc.size(38, 38);
        this.setContentSize(size);
        circleAvatar.setAnchorPoint(ANCHOR_CENTER);
        this.addChild(circleAvatar);
        circleAvatar.setPosition(cc.pCenter(size));

        var frame = this._isBullishSprite = new cc.Sprite("#icon_jiancang_die.png");
        frame.setAnchorPoint(ANCHOR_LEFT_BOTTOM);
        this.addChild(frame);

        //设中间为锚点方便布局
        this.setAnchorPoint(ANCHOR_CENTER);
    },

    //
    //cleanup:function()
    //{
    //     cc.log("betAvatar cleanup:", this.__instanceId);
    //    this._super();
    //},

    /**
     * @param {BetPlayer | SimplePlayer} betPlayer
     */
    refresh:function(betPlayer, orderId)
    {
        var betPlayer = this._betPlayer = betPlayer || this._betPlayer;
        //var betArray = betPlayer.getBetArray();
        var isBullish = false;
        //if(betArray && betArray.length > 0 && betArray.last().isBullish()) {
        //    isBullish = true;
        //}
        var betInfo = this._betInfo  =  betPlayer.getBetById(orderId);
        if(!betInfo){
            betPlayer.printBetMap();
            cc.log("BetAvatar refresh order is null.....");
        }
        if(betInfo && betInfo.isBullish()) {
            isBullish = true;
        }

        //刷新头像
        this._circleAvatar.refresh(betPlayer);

        //看涨
        if(isBullish)
        {
            UICommon.setSpriteWithDefaultSpriteName(this._isBullishSprite, "icon_jiancang_zhang.png");
        }else
        {
            UICommon.setSpriteWithDefaultSpriteName(this._isBullishSprite, "icon_jiancang_die.png");
        }
    },

    getBetPlayer:function()
    {
        return this._betPlayer;
    },

    getBetInfo:function()
    {
        return this._betInfo;
    }
});