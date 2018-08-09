/**
 * 助手指令
 * Created by 玲英 on 2016/10/5.
 */

var AsstInfo = cc.Class.extend({
    _id:-1,
    _type:0,
    _emotion:undefined,         //助手情绪状态(一般，开心，难过....)
    _animation:undefined,
    _audio:undefined,           //语音
    _condLayers:undefined,       //触发条件-界面
    _condIdentity:undefined,    //触发条件-身份(游客, 正式用户)
    _condLevel:[-1, 0],         //触发条件-等级
    _condSpecial:undefined,     //特殊条件
    _priority:1,                //优先级
    _limitNum:1,                //限制执行次数
    _chance:101,                //触发概率
    _dialogue:undefined,        //对话文本

    ctor:function(jsonData) {
        this._emotion = AsstInfo.EMOTION_NORMAL;
        this._condLevel = [-2, -1];
        this._condLayers = [];
        //this._condIdentity = AsstInfo.IDENTITY_GUEST;
        this._condSpecial = {};
        if(jsonData)
            this.initFromJson(jsonData);
    },

    initFromJson:function(jsonData)
    {
        this._emotion       = ALCommon.getValueWithKey(jsonData, "emotion", this._emotion);
        this._condLevel     = ALCommon.getValueWithKey(jsonData, "condLevel", this._condLevel);
        this._id            = ALCommon.getValueWithKey(jsonData, "id", this._id);
        this._animation     = ALCommon.getValueWithKey(jsonData, "animation", this._animation);
        this._audio         = ALCommon.getValueWithKey(jsonData, "audio", this._audio);
        this._condLayers    = ALCommon.getValueWithKey(jsonData, "condLayers", this._condLayers);
        this._condIdentity  = ALCommon.getValueWithKey(jsonData, "condIdentity", this._condIdentity);
        this._condSpecial   = ALCommon.getValueWithKey(jsonData, "condSpecial", this._condSpecial);
        this._priority      = ALCommon.getValueWithKey(jsonData, "priority", this._priority);
        this._limitNum      = ALCommon.getValueWithKey(jsonData, "limitNum", this._limitNum);
        this._chance        = ALCommon.getValueWithKey(jsonData, "chance", this._chance);
        this._dialogue      = ALCommon.getValueWithKey(jsonData, "dialogue", this._dialogue);
        this._type          = ALCommon.getValueWithKey(jsonData, "type", this._type);
    }
});

AsstInfo.EMOTION_NORMAL = 1;
AsstInfo.EMOTION_HAPPAY = 2;
AsstInfo.EMOTION_SAD = 3;

AsstInfo.IDENTITY_GUEST = 1;
AsstInfo.IDENTITY_NORMAL = 2;


AsstInfo.TYPE_OPEN_LAYER = 1;
AsstInfo.TYPE_ORDER_REST_OF_TIME = 2;
AsstInfo.TYPE_ORDER_LOST = 3;
AsstInfo.TYPE_ORDER_WIN = 4;
AsstInfo.TYPE_ORDER_CONTINUOUS_LOST = 5;
AsstInfo.TYPE_ORDER_CONTINUOUS_WIN = 6;
AsstInfo.TYPE_AMOUNT = 7;
AsstInfo.TYPE_EXP = 8;
AsstInfo.TYPE_INPUT_AMOUNT= 9;
AsstInfo.TYPE_CASH_OUT = 10;
AsstInfo.TYPE_POP_UP = 11;
AsstInfo.TYPE_WIN_RATE = 12;


/**
 * @returns {Number}
 */
AsstInfo.prototype.getEmotion = function() {
    return this._emotion;
};

/**
 * @returns {Array}
 */
AsstInfo.prototype.getCondLevel = function() {
    return this._condLevel;
};

/**
 * @returns {Number}
 */
AsstInfo.prototype.getId = function() {
    return this._id;
};

/**
 * @returns {*}
 */
AsstInfo.prototype.getAnimation = function() {
    return this._animation;
};

/**
 * @returns {*}
 */
AsstInfo.prototype.getAudio = function() {
    return this._audio;
};

/**
 * @returns {*}
 */
AsstInfo.prototype.getCondLayers = function() {
    return this._condLayers;
};

/**
 * @returns {*}
 */
AsstInfo.prototype.getCondIdentity = function() {
    return this._condIdentity;
};

/**
 * @returns {*}
 */
AsstInfo.prototype.getCondSpecial = function() {
    return this._condSpecial;
};

/**
 * @returns {Number}
 */
AsstInfo.prototype.getPriority = function() {
    return this._priority;
};

/**
 * @returns {Number}
 */
AsstInfo.prototype.getLimitNum = function() {
    return this._limitNum;
};

AsstInfo.prototype.reduceLimitNum = function(value) {
    return this._limitNum--;
};

/**
 * @returns {Number}
 */
AsstInfo.prototype.getChance = function() {
    return this._chance;
};

/**
 * @returns {*}
 */
AsstInfo.prototype.getDialogue = function() {
    return this._dialogue;
};

/**
 * @returns {*}
 */
AsstInfo.prototype.getType = function() {
    return this._type;
};