/*
signal.js
Copyright (c) 2011 Josh Tynjala
Released under the MIT license.

Based on as3-signals by Robert Penner
http://github.com/robertpenner/as3-signals
Copyright (c) 2009 Robert Penner
Released under the MIT license.
]] --


*/


SignalAs3 = cc.Class.extend({
    _traceName : "noNameSignal",
    _listenersDic : {}, //key是getKey出来的字符串，value是listener
    _oneTimeListenersDic : {}, //key是getKey出来的字符串，value是listener
    _emitListenersArr : null,
    _numListeners : 0,
    _numOneTimeListeners : 0,
    _newIndex : 0,

    ctor:function(traceName) {
        this._traceName = traceName;
    }
});

SignalAs3.prototype.isEmpty = function() {
    return this._numListeners <= 0;
};

SignalAs3.prototype.add = function(func, scope) {
    if (func == null) {
        cc.error("Function passed to signal:add() must not non-nil.");
    }
    var obj = this.getListener(func, scope)
    if (obj.isNew) {
        this._listenersDic[obj.listener.key] = obj.listener;
        this._numListeners = this._numListeners + 1;
        if (this._emitListenersArr) {
            this._emitListenersArr.push(obj.listener);
        }
    }
    else
        obj.listener = null;

    return obj.listener;
}

SignalAs3.prototype.addOnce = function(func, scope) {
    var listener = this.add(func, scope);
    if (listener) {
        this._oneTimeListenersDic[listener.key] = listener;
        this._numOneTimeListeners = this._numOneTimeListeners + 1;
    }
    return listener;
}

SignalAs3.prototype.emit = function(value) {
    if (this._numListeners <= 0) {
        return;
    }

    var t = null;
    var emitNum = null;
    if (this._numListeners == 1) {
        var listener = SignalAs3.getOne(this._listenersDic);
        if (listener.scope) {
            listener.func.call(listener.scope, value);
        }
        else
            listener.func(value);
    }
    else {
        if (!this._emitListenersArr) {
            this._emitListenersArr = SignalAs3.toArray(this._listenersDic);
            this._emitListenersArr.sort(SignalAs3.listenerSorter);
        }
        for (var i = 0; i <  this._emitListenersArr.length; i++) {
            listener =  this._emitListenersArr[i];
            if (listener.scope)
                listener.func.call(listener.scope, value);
            else
                listener.func(value);

        }
    }

    if (this._numOneTimeListeners > 0) {
        for (k in this._oneTimeListenersDic) {
            this.remove(this._oneTimeListenersDic[k]);
        }
    }

};

SignalAs3.prototype.remove = function(func, scope) {
    var listener = null;
    if(type(func) == "function") {
        listener = this.getListener(func, scope);
    }
    else {
        listener = func;
    }
    var isContains = this._listenersDic[listener.key] != null;
    if(isContains) {
        this._listenersDic[listener.key] = null;
        this._numListeners = this._numListeners - 1
        this._listenersDic[listener.key] = null;
    }

    if(this._oneTimeListenersDic[listener.key]) {
        this._oneTimeListenersDic[listener.key] = null;
        this._numOneTimeListeners = this._numOneTimeListeners - 1;
    }
};

SignalAs3.prototype.removeAll = function() {
    this._listenersDic = {}
    this._oneTimeListenersDic = {}
    this._numListeners = 0;
    this._numOneTimeListeners = 0;

    this._emitListenersArr = null;

    this._newIndex = 0;
};

SignalAs3.prototype.getListener = function(func, scope){
    var key = SignalAs3.getKey(func, scope);
    var listener = this._listenersDic[key];
    var isNew = false;
    var scopeFunc = null;
    if(!listener){
        this._newIndex = this._newIndex + 1;
        isNew = true;
        listener = {func: func, scope: scope, key: key, index: this._newIndex};
    }

    return {listener : listener, isNew : isNew};
};

//清除这个对象上面的所有SignalAs3的事件绑定
SignalAs3.clearAllSignal = function(obj){
    for(k in obj) {
        var signal = obj[k];
        if(typeof signal == "function" && signal._className == "SignalAs3") {
            signal.removeAll();
        }
    }
};


SignalAs3.toArray = function(dic){
    var result = Array();
    for(k in dic) {
        result.push(dic[k]);
    }

    return result;
};

SignalAs3.getOne = function(listeners) {
    for (v in listeners) {
        return listeners[v];
    }
    return null;
};

SignalAs3.listenerSorter = function(a, b) {
    return a.index - b.index;
};

SignalAs3.getKey = function(func, scope) {
    return md5.hex(func.toString() + "|" + (scope || "").toString());
};

