/**
 * 轮询辅助类 interval = 0 故每帧都调用
 */
var PollingHelper = cc.Class.extend({

    /**
     * 构造函数
     * @param {function(PollingHelper)}pollingFunc
     */
    ctor: function(pollingFunc, interval, maxLoopSecs) {
        this._pollingFunc = pollingFunc;
        this._interval = interval || 0;
        this._maxLopSecs = maxLoopSecs;
    },

    _pollingFunc: function(helper) {
        cc.log("default polling function");
    }
});

PollingHelper.prototype.start = function() {
    var startTime = cs.getCurSecs();
    cc.director.getScheduler().scheduleCallbackForTarget(this, function() {
        this._pollingFunc(this);
        //超过一定时间 直接结束循环
        if(this._maxLopSecs && (cs.getCurSecs() - startTime) > this._maxLopSecs)
        {
            this.end();
            return;
        }
    }.bind(this), this._interval, cc.REPEAT_FOREVER, 0, false);
};

PollingHelper.prototype.end = function() {
    cc.director.getScheduler().unscheduleAllForTarget(this);
};
