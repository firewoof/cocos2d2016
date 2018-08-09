/**
 * Created by 玲英 on 2016/10/6.
 */
var AsstController = cc.Class.extend({
    _asstInfoPool:undefined, //规则池

    ctor:function() {
        this._asstInfoPool = {};

        //测试
        this.testInfo();

        //这个版本不用助手
        //cs.customEventManager.addListener(ASST_INFO_EVENT, function(event){
        //    var userData = event.getUserData();
        //    if(userData.type == undefined)
        //        return;
        //    cc.log("receive ASST_INFO_EVENT type::"+ userData.type);
        //    this.receiveMessage(userData.type, userData.args);
        //}.bind(this))
    },

    /**
     * 初始化规则
     */
    initPoolFromJson:function(asstDataArray)
    {
        //以消息类型分类 生成key < value[]
        for(var i = 0; i < asstDataArray.length; i++) {
            var asstInfo = new AsstInfo(asstDataArray[i]);
            var type = asstInfo.getType();
            //生成映射
            if(!this._asstInfoPool[type]){
                this._asstInfoPool[type] = [];
                this._asstInfoPool[type].push(asstInfo);
            }
        }

        //对所有同类消息 进行排序，优先级高的放在前面
        for(var prop in this._asstInfoPool){
            var asstInfos = this._asstInfoPool[prop];
            asstInfos.sort(function(asstA, asstB){
                return asstA.getPriority() > asstB.getPriority();
            });
        }
    },

    /**
     * 获取规则条目
     */
    getAsstsByType:function(type){
        return this._asstInfoPool[type];
    },

    /**
     * 接收并检查消息
     * @param asstInfo
     * @param sendArgs 该参数由触发消息处 dispatchEvent附带过来 {"type':type, "args":}
     */
    receiveMessage:function(type, sendArgs) {
       var asstInfoArray = this._asstInfoPool[type];
        if(!asstInfoArray || asstInfoArray.length == 0)
            return;
        //初始已经对同类消息排序，一旦符合则立即执行消息
        for(var i = 0; i < asstInfoArray.length; i++){
            var asstInfo = asstInfoArray[i];
            if(this.checkValidity(asstInfo, sendArgs))
                AsstLayer.getInstance().runMessage(asstInfo);
        }
    },

    /**
     * 合法性检查
     * @param asstInfo
     * @returns {boolean}
     */
    checkValidity:function(asstInfo, sendArgs) {
        cc.log("this.checkLimitNum(asstInfo)::",this.checkLimitNum(asstInfo));
        cc.log("this.checkLayers(asstInfo)::",this.checkLayers(asstInfo));
        cc.log("this.checkIdentity(asstInfo)::",this.checkIdentity(asstInfo));
        cc.log("this.checkLevel(asstInfo)::",this.checkLevel(asstInfo));
        cc.log("this.checkSpecial(asstInfo)::",this.checkSpecial(asstInfo));
        cc.log("this.checkChance(asstInfo)::",this.checkChance(asstInfo));

        if( !this.checkLimitNum(asstInfo)
            ||!this.checkLayers(asstInfo)
            || !this.checkIdentity(asstInfo)
            || !this.checkLevel(asstInfo)
            || !this.checkSpecial(asstInfo, sendArgs)
            || !this.checkChance(asstInfo)
        )
        {
            return false;
        }
        return true;
    },

    /**
     * 检查剩余次数 这个检查请放最前面
     */
    checkLimitNum:function(asstInfo){
        return asstInfo.getLimitNum() > 0;
    },

    /**
     * 检查执行概率
     */
    checkChance:function(asstInfo)
    {
        var chance = asstInfo.getChance();
        if(Math.random() * 100 <= chance){
            return true;
        }
        return false;
    },

    /**
     * 检查特殊条件
     * @param asstInfo
     * @returns {boolean}
     */
    checkSpecial:function(asstInfo, sendArgs){
        var condSpecial = asstInfo.getCondSpecial();
        //判断执行哪个检查函数
        var specialCheckFunc = this.getFuncByType(asstInfo.getType(), sendArgs);
        //表示无需检查
        if(specialCheckFunc == undefined)
            return true;
        return specialCheckFunc(condSpecial["args"], sendArgs);
    },

    /**
     * 获取特殊条件的检查函数
     * @param type
     * @returns {undefined}
     */
    getFuncByType:function(type){
        var func = undefined;
        switch (type){
          case AsstInfo.TYPE_AMOUNT:
              break;
          case AsstInfo.TYPE_ORDER_CONTINUOUS_WIN:
              break;
          case AsstInfo.TYPE_ORDER_CONTINUOUS_LOST:
              break;
          case AsstInfo.TYPE_WIN_RATE:
              func = this.checkWinRate;
              break;
          default :
              func = this.commonSpecialCheck;
        }
        return func;
    },

    /**
     * 通用检查
     * @param condSpecialArgs 规则条件参数
     * @param sendArgs  触发消息时穿过的的值
     */
    commonSpecialCheck:function(condSpecialArgs, sendArgs) {
        //没有特殊条件
        if(!condSpecialArgs)
            return true;
        //没有传值
        if(condSpecialArgs && !sendArgs)
            return false;
        //规则条件是数组(支持范围判断)
       if(condSpecialArgs instanceof Array){
            if(condSpecialArgs.length == 2)
                return sendArgs >= condSpecialArgs[0] && sendArgs <= condSpecialArgs[1];
           if(condSpecialArgs.length == 1)
               return sendArgs == condSpecialArgs[0]
       }else{
           return sendArgs == condSpecialArgs;
       }
    },

    /**
     * 检查玩家等级合法性
     * @param asstInfo
     * @returns {boolean}
     */
    checkLevel:function(asstInfo){
        var levelScope = asstInfo.getCondLevel();
        var level = Player.getInstance().getLevel();
        if(levelScope.length == 2 && level >= levelScope[0] && level <= levelScope[1]) {
            return true;
        }
        return false;
    },

    /**
     * 检查身份合法性
     */
    checkIdentity:function(asstInfo) {
        var condIdentity = asstInfo.getCondIdentity();
        var isGuest = Player.getInstance().isGuest();
        if(condIdentity == undefined)
            return true;
        if(isGuest && condIdentity != AsstInfo.IDENTITY_GUEST){
            return false
        }

        if(!isGuest && condIdentity != AsstInfo.IDENTITY_NORMAL){
            return false
        }

        return true;
    },

    /**
     * 界面合法性检查
     */
    checkLayers:function(asstInfo){
        var topLayer = MainController.getTopLayer(MainScene.instance);
        var condLayers = asstInfo.getCondLayers();
        var topLayerName = condLayers.last();
        for(var i = 0; i < condLayers.length; i++) {
            var condLayer = condLayers[i];
            if(eval(condLayer + ".instance") == undefined)
            {
                return false;
            }
        }
        //cc.log("checkLayers condLayers::", JSON.stringify(condLayers));
        //cc.log("checkLayers topLayerName::", JSON.stringify(topLayerName));
        //cc.log("topLayer._layerName", topLayer._layerName);
        cc.log("topLayer._layerName::"+topLayer._layerName + "topLayerName::", topLayerName);
        if(!topLayerName || topLayer._layerName != topLayerName){
            return false;
        }
        return true;
    },

    /**
     * ================特殊条件的检查函数========================
     */
    /**
     * 检查胜率
     */
    checkWinRate:function(args){
        //参数为空
        if(args instanceof Array == false)
            return false;
        var winRate = Player.getInstance().getWinRate();
        if(args.length == 0){
            return winRate == args[0];
        }
        if(args.length == 2){
            return winRate >= args[0] && winRate < args[0];
        }
        return false;
    },

    testInfo:function() {
        //尝试检查 指令队列
        var asstInfoArray = [];
        var dataArray = [{"id":1,"type":"1","emotion":"2","condLayers":["MainViewLayer"],"condLevel":[1,100],"priority":3,"limitNum":1,"chance":100,"dialogue":"欢迎来到1元秒盈！！"},{"id":2,"type":"1","emotion":"2","condLayers":["MainViewLayer"],"condLevel":[1,100],"priority":1,"limitNum":1,"chance":30,"dialogue":"点击免费交易大厅可以使用模拟金币进行交易！！"},{"id":3,"type":"1","emotion":"2","condLayers":["MainViewLayer"],"condLevel":[1,100],"priority":1,"limitNum":1,"chance":30,"dialogue":"点击交易大厅可以进行刺激的人民币交易哦！！"},{"id":4,"type":"1","emotion":"2","condLayers":["MainViewLayer"],"condLevel":[1,100],"priority":1,"limitNum":1,"chance":30,"dialogue":"排行榜里的大神，您有信心可以超越他们吗。"},{"id":5,"type":"7","emotion":"3","condLayers":["TradingHallLayer"],"condLevel":[1,100],"condSpecial":{"args":[0,100]},"priority":2,"limitNum":1,"chance":40,"dialogue":"您的资金快没了，谨慎下单。"},{"id":6,"type":"7","emotion":"3","condLayers":["TradingHallLayer"],"condLevel":[1,100],"condSpecial":{"args":[0,50]},"priority":2,"limitNum":1,"chance":40,"dialogue":"您的资金快没了，点击充值按钮可以充值哦。"},{"id":7,"type":"4","emotion":"2","condLayers":["TradingHallLayer"],"condLevel":[1,100],"priority":2,"limitNum":99,"chance":40,"dialogue":"继续继续，再接再厉！！"},{"id":8,"type":"4","emotion":"2","condLayers":["TradingHallLayer"],"condLevel":[1,100],"priority":2,"limitNum":99,"chance":40,"dialogue":"哎哟，不错哦！。"},{"id":9,"type":"2","emotion":"1","condLayers":["TradingHallLayer"],"condLevel":[1,3],"condSpecial":{"args":[20]},"priority":3,"limitNum":5,"chance":100,"dialogue":"您的订单还有20秒就结束了，注意哦！！"},{"id":10,"type":"2","emotion":"1","condLayers":["TradingHallLayer"],"condLevel":[1,3],"condSpecial":{"args":[10]},"priority":3,"limitNum":5,"chance":100,"dialogue":"您的订单还有10秒就结束了，注意哦！！"},{"id":11,"type":"9","emotion":"1","condLayers":["TradingHallLayer"],"condLevel":[1,10],"priority":2,"limitNum":10,"chance":40,"dialogue":"长按+和-按钮可以持续增加下单的金额哦。"}];
        this.initPoolFromJson(dataArray);
    }
});

AsstController.getInstance = function(){
    if(!this.instance){
        this.instance = new AsstController();
    }
    return this.instance;
};

var CustomEventManager = cc.Class.extend({
    _listenerArray:undefined,

    ctor:function(){
        this._listenerArray = [];
    },

    /**
     * 注册监听
     */
    addListener:function(eventName, callFunc) {
        if(!eventName || !callFunc)
            return;
        var eventListener = {"eventName":eventName, "callFunc":callFunc};
        this._listenerArray.push(eventListener);
        return eventListener;
    },

    /**
     * 分发事件
     * @param eventName
     * @param userData
     */
    dispatchEvent:function(eventName, userData){
        this._eventToObservers(eventName, userData);
    },

    /**
     * 移除监听
     * @param objOrEvtName
     */
    removeListener:function(objOrEvtName){
        //可以通过对象引用来删除，也可以通过eventName来删除
        if(typeof objOrEvtName == "string")
        {
            //这里考虑到删除多个，故从后往前删
            for(var i = this._listenerArray.length - 1; i >= 0; i--) {
                var listenerObj = this._listenerArray[i];
                if(listenerObj && listenerObj.eventName == objOrEvtName){
                    this._listenerArray.splice(i, 1);
                    i--;
                }
            }
        }else{
            //这里考虑到删除多个，故从后往前删
            for(var i = this._listenerArray.length - 1; i >= 0; i--) {
                var listenerObj = this._listenerArray[i];
                if(listenerObj && listenerObj == objOrEvtName){
                    this._listenerArray.splice(i, 1);
                    i--;
                }
            }
        }
    },

    _eventToObservers:function(eventName, userData){
        for(var i = 0; i < this._listenerArray.length; i++) {
            var listenerObj = this._listenerArray[i];
            if(listenerObj.eventName == eventName){
                var event = new cc.EventCustom(eventName);
                event.setUserData(userData);
                listenerObj.callFunc(event);
            }
        }
    }
});

/**
 * 自定义事件管理器
 * @returns {CustomEventManager}
 */
cs.customEventManager = (function(){
    if(CustomEventManager.instance == undefined){
        CustomEventManager.instance = new CustomEventManager();
    }
    return CustomEventManager.instance;
})();
