/**
 * Created by lingying on 2016/5/5.
 */

cc.pCenter = function(size)
{
    return cc.p(size.width * 0.5, size.height * 0.5);
}
/**
 * 以锚点相对布局(不会修改node锚点)
 * @param position      (想要设置的位置)
 * @param anchorPoint   (以哪个锚点设置位置)
 */
cc.Node.prototype.setPos = function(position, anchorPoint) {
    var nodeAnchorPoint = this.getAnchorPoint();
    if(this.isIgnoreAnchorPointForPosition()){
        nodeAnchorPoint = cc.p(0, 0);
    }
    var width = this.getBoundingBox().width;
    var height = this.getBoundingBox().height;
    var offsetX = (nodeAnchorPoint.x - anchorPoint.x) * width;
    var offsetY = (nodeAnchorPoint.y - anchorPoint.y) * height;
    this.setPosition(cc.p(position.x + offsetX, position.y + offsetY));
};

/**
 * x偏移设置
 * @param value
 */
cc.Node.prototype.setPositionXAdd = function(value){
    this.setPositionX(this.getPositionX() + value);
};

/**
 * y偏移设置Y
 * @param value
 */
cc.Node.prototype.setPositionYAdd = function(value){
    this.setPositionY(this.getPositionY() + value);
};

/**
 * 获取节点在任意祖先节点上的位置
 * @param {*|cc.Node} ancestorNode
 * @param {*|cc.Point} [visualAnchorPoint]  你想要以node的那个锚点计算位置(默认结果是以node本身锚点返回坐标)
 * returns {cc.Point}
 */
cc.Node.prototype.getPosAtAncestor = function(ancestorNode, visualAnchorPoint){
    if(ancestorNode == undefined) return;
    var nodePoint = cc.p(0, 0);
    if(visualAnchorPoint){
        var boundingBox = this.getBoundingBox();
        var anchorPoint = this.getAnchorPoint();
        nodePoint = cc.p(boundingBox.width * (visualAnchorPoint.x - anchorPoint.x), boundingBox.height * (visualAnchorPoint.y - anchorPoint.y));
    }
    var position = ancestorNode.convertToNodeSpace(this.convertToWorldSpaceAR(nodePoint));
    return position;
};

/**
 *
 * @param location
 * @returns {Boolean|*}
 */
cc.Node.prototype.isContainPoint = function(location){
    var size = this.getContentSize();
    var rectObj =cc.rect(0,0,size.width,size.height);
    var pos = this.convertToNodeSpace(location);
    var result = cc.rectContainsPoint(rectObj,pos);
    size=null;
    rectObj = null;
    pos=null;
    return result;
};

/**
 * 为ccNode添加touch事件
 * @param func
 * @param [isSwallowTouch]
 */
cc.Node.prototype.addTouchEventListenerOneByOne = function(func, isSwallowTouch, isTouchAnimateEnable){
    this._touchCallBack = func;
    this._isTouchAnimateEnable = isTouchAnimateEnable;  //点击时是否执行缩放动画
    //默认吞掉事件
    if(isSwallowTouch == undefined){
        isSwallowTouch = true;
    }
    //默认有点击的缩放动画
    if(isTouchAnimateEnable == undefined){
        this._isTouchAnimateEnable = true;
    }

    //重复添加时 只会更换回调不做listener移除
    if(this._touchEventListener != undefined){
        this._touchCallBack = func;
        this._touchEventListener.setSwallowTouches(isSwallowTouch);
        return this._touchEventListener;
    }
    this._originScaleX = this.getScaleX();
    this._originScaleY = this.getScaleY();
    var listenerJson = {
        event: cc.EventListener.TOUCH_ONE_BY_ONE,
        swallowTouches: isSwallowTouch,

        onTouchBegan: onTouchBeganOneByOneFunction,
        onTouchEnded: onTouchEndedOneByOneFunction

    };

    this._touchEventListener = cc.eventManager.addListener(listenerJson, this);
    return this._touchEventListener;
};

var onTouchBeganOneByOneFunction = function(touch, event) {
    var currentNode = event.getCurrentTarget();
    //自身及父节不可见时
    if(currentNode.isVisible() === false){
        return false;
    }
    for(var parent = currentNode.getParent(); parent != null; parent = parent.getParent()){
        if(parent.isVisible() === false){
            parent = null;
            return false;
        }
        if(parent instanceof ccui.ScrollView){
            var pos = touch.getLocation();
            if(!parent.isContainPoint(pos)){
                return false;
            }
        }
    }
    parent=null;
    var isOnTouch = UICommon.isOnTouch(touch, event);

    if(isOnTouch == true && currentNode._isTouchAnimateEnable){
        var touchSprite = currentNode;
        if(currentNode._touchSprite){
            touchSprite = currentNode._touchSprite;
        }
        touchSprite.runAction(cc.sequence(cc.scaleTo(0.15, currentNode.getScaleX() * 1.1, currentNode.getScaleY() * 1.1)));
    }
    return isOnTouch;
};

var onTouchEndedOneByOneFunction = function(touch, event) {
    var currentNode = event.getCurrentTarget();
    if(currentNode._isTouchAnimateEnable){
        var touchSprite = currentNode;
        if(currentNode._touchSprite){
            touchSprite = currentNode._touchSprite;
        }
        touchSprite.runAction(new cc.Sequence(new cc.ScaleTo(0.15, currentNode._originScaleX, currentNode._originScaleY)));
    }
    if((this.swallowTouches === true && UICommon.isOnTouch(touch, event)) || (this.swallowTouches === false && UICommon.isOnTouchWithDistance(touch, 35))){
        MainController.playButtonSoundEffect(currentNode);
        if(currentNode._touchCallBack && currentNode._touchCallBack instanceof Function)
        {
            currentNode._touchCallBack(currentNode);
        }
    }
};

/**
 * panel的背景颜色
 * @param [color]
 */
ccui.Layout.prototype.setBackGroundColorEx = function(color){
    this.setBackGroundColor(color || cc.RED);
    this.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
};

/**
 * @param {cc.Size} s1
 * @param {cc.Size} s2
 * @return {cc.Size}
 */
cc.sizeAdd = function(s1, s2) {
    return cc.size(s1.width + s2.width, s1.height + s2.height);
};

/**
 * @param {cc.Size} s1
 * @param {cc.Size} s2
 * @return {cc.Size}
 */
cc.sizeSub = function(s1, s2) {
    return cc.size(s1.width - s2.width, s1.height - s2.height);
};