/**
 * create by lingying 2016-05-05
 * UI公共类，省事省力又巧妙的Ui通用操作集合
 */
var UICommon = UICommon || {};

// 水平组合的属性 Horizontal
cc.UI_ALIGNMENT_HORIZONTAL_TOP = 0;
cc.UI_ALIGNMENT_HORIZONTAL_CENTER = 1;
cc.UI_ALIGNMENT_HORIZONTAL_BOTTOM = 2;

// 垂直组合的属性.当遇到这些属性.默认是自动竖向组合 Vertical
cc.UI_ALIGNMENT_VERTICAL_LEFT = 3;
cc.UI_ALIGNMENT_VERTICAL_CENTER = 4;
cc.UI_ALIGNMENT_VERTICAL_RIGHT = 5;

/**
 * 根据panel创建scrollView
 * @param {* | cc.Node |ccui.Layout} contentPanel
 * @param {Object} size
 * @param {* | ccui.ScrollView.DIR_HORIZONTAL | ccui.ScrollView.DIR_VERTICAL} [dir] 默认垂直
 * @returns {ccui.ScrollView}
 */
UICommon.createScrollViewWithContentPanel = function(contentPanel, size, dir) {
    if (dir == undefined)
    {
        dir = ccui.ScrollView.DIR_VERTICAL;
    }

    var scrollView = ccui.ScrollView.create();
    scrollView.setTouchEnabled(true);
    scrollView.setBounceEnabled(true);

    if (dir == ccui.ScrollView.DIR_HORIZONTAL) {
        if (contentPanel.getContentSize().width) {
            scrollView.setDirection(dir);
        }
        else {
            scrollView.setDirection(ccui.ScrollView.DIR_NONE);
        }
    }

    if (dir == ccui.ScrollView.DIR_VERTICAL) {
        if (contentPanel.getContentSize().height) {
            scrollView.setDirection(dir);
        }
        else {
            scrollView.setDirection(ccui.ScrollView.DIR_NONE);
        }
    }

    scrollView.setContentSize(size);
    scrollView.addChild(contentPanel);
    scrollView.setInnerContainerSize(contentPanel.getBoundingBox());

    var height = Math.max(contentPanel.getBoundingBox().height, scrollView.getContentSize().height);

    contentPanel.setPos(cc.p(0, height), cc.p(0, 1.0));

    return scrollView;
};


/**
 * 创建一个 UIPanel, 其所有 子 Widget 水平对齐
 * @param {Number} padding   间隔
 * @param {Number} alignment 布局 cc.UI_ALIGNMENT_VERTICAL_CENTER..
 * @param ...（可直接传一个数组或者N个子widget）
 * @returns {ccui.Layout}
 */
UICommon.createPanelAlignWidgetsWithPadding = function (padding, alignment)
{
    var tmpArray = null;
    //判断第三个传递的是数组
    if(arguments[2] instanceof Array){
        tmpArray = arguments[2];
    }else {
        //除去前2个参数，将后续的参数转化成数组
        tmpArray = arguments.length >= 3 ? Array.prototype.slice.call(arguments, 2) : null;
    }

    if(tmpArray == null) return null;
    if(alignment == cc.UI_ALIGNMENT_HORIZONTAL_TOP || alignment == cc.UI_ALIGNMENT_HORIZONTAL_CENTER || alignment == cc.UI_ALIGNMENT_HORIZONTAL_BOTTOM)
    {
        return this._createPanelAlignWidgetsHorizontallyWithPadding(padding, alignment, tmpArray);
    }
    else if(alignment == cc.UI_ALIGNMENT_VERTICAL_CENTER || alignment == cc.UI_ALIGNMENT_VERTICAL_LEFT || alignment == cc.UI_ALIGNMENT_VERTICAL_RIGHT)
    {
        return this._createPanelAlignWidgetsVerticalWithPadding(padding,alignment,tmpArray);
    }
};

/**
 * 创建一个 UIPanel, 其所有 子 Widget 水平对齐
 * @param {Number} padding
 * @param {Number|cc.UI_ALIGNMENT_VERTICAL_CENTER|cc.UI_ALIGNMENT_VERTICAL_LEFT|cc.UI_ALIGNMENT_VERTICAL_RIGHT} alignment
 * @param {Array} array
 * @returns {ccui.Layout}
 */
UICommon._createPanelAlignWidgetsHorizontallyWithPadding = function(padding, alignment, array)
{
    // 使用 UIPanel 绝对坐标
    // 算出宽高
    var width = 0;
    var height = 0;

    var child = null;
    for(var i = 0; i < array.length; i++)
    {
        child = array[i];

        if(!child)
            continue;

        //  并非 纹理 getContentSize();
        width += child.getBoundarySize().width;
        width += padding;

        height = Math.max(height, child.getBoundarySize().height);
    }

    // 减去最后的间隔
    width -= padding;

    var offsetX = 0;

    var panel = ccui.Layout.create();
    panel.setSize(cc.size(width, height));
    panel.setAnchorPoint(cc.p(0.5, 0.5));

    for(var i = 0; i < array.length; i++)
    {
        child = array[i];
        if(!child)
            continue;

        panel.addChild(child);

        var offsetY = 0;
        var childBoundingBox = child.getBoundingBox();
        switch (alignment)
        {
            case cc.UI_ALIGNMENT_HORIZONTAL_TOP:
                offsetY = height - childBoundingBox.height/2;
                break;

            case cc.UI_ALIGNMENT_HORIZONTAL_CENTER:
                offsetY = height/2;
                break;

            case cc.UI_ALIGNMENT_HORIZONTAL_BOTTOM:
                offsetY = childBoundingBox.height/2;
                break;

            default:
                offsetY = height/2;
                break;
        }

        offsetX += childBoundingBox.width/2;

       child.setPos(cc.p(offsetX, offsetY), cc.p(0.5, 0.5));

        offsetX += childBoundingBox.width/2;
        offsetX += padding;
    }

    return panel;


};

/**
 * 创建一个 UIPanel, 其所有 子 Widget 垂直居中对齐
 * @param {Number} padding
 * @param {Number|cc.UI_ALIGNMENT_HORIZONTAL_TOP|cc.UI_ALIGNMENT_HORIZONTAL_CENTER|cc.UI_ALIGNMENT_HORIZONTAL_BOTTOM} alignment
 * @param {Array} array
 * @returns {ccui.Layout}
 */
UICommon._createPanelAlignWidgetsVerticalWithPadding = function(padding, alignment, array)
{
    // 使用 UIPanel 绝对坐标
    // 算出宽高
    var width = 0;
    var height = 0;

    var child = null;
    for(var i = 0; i < array.length; i++)
    {
        child = array[i];
        if(!child)
            continue;

        height += child.getBoundingBox().height;
        height += padding;

        width = Math.max(width, child.getBoundingBox().width);

    }

    // 减去最后的间隔
    height -= padding;

    var offsetY = height;

    var panel = ccui.Layout.create();
    panel.setSize(cc.size(width, height));
    panel.setAnchorPoint(cc.p(0.5, 0.5));

    for(var i = 0; i < array.length; i++)
    {
        child = array[i];
        if(!child)
            continue;

        panel.addChild(child);

        var offsetX = 0;
        var childBoundingBox = child.getBoundingBox();
        switch (alignment)
        {
            case cc.UI_ALIGNMENT_VERTICAL_LEFT:
                offsetX = childBoundingBox.width/2;
                break;

            case cc.UI_ALIGNMENT_VERTICAL_CENTER:
                offsetX = width/2;
                break;

            case cc.UI_ALIGNMENT_VERTICAL_RIGHT:
                offsetX = width - childBoundingBox.width/2;
                break;

            default:
                offsetX = width - childBoundingBox.width/2;
                break;
        }

        offsetY -= childBoundingBox.height/2;

        child.setPos(cc.p(offsetX, offsetY), cc.p(0.5, 0.5));

        offsetY -= childBoundingBox.height/2;
        offsetY -= padding;
    }

    return panel;
};

/**
 * @param {cc.Node} node
 * @param {cc.Color} [color3b]
 * @param {Number|byte} [opacity]
 */
UICommon.addBackgroundLayer = function(node, color3b, opacity) {
    var a = (opacity == undefined) ? 127 : opacity;
    if (color3b == undefined) {
        color3b = cc.RED;
    }
    var layerColor = new cc.LayerColor(cc.color(color3b.r, color3b.g, color3b.b, a));
    layerColor.setContentSize(node.getContentSize());
    layerColor.setPosition(cc.p(0, 0));
    layerColor.setAnchorPoint(cc.p(0, 0));
    node.addChild(layerColor, -1000);
};

/**
 *
 * @param oldWidget
 * @param newWidget
 * @param [isNeedFreeMem]
 */
UICommon.replaceWidget = function(oldWidget, newWidget)
{
    var parent = oldWidget.getParent();
    if (parent == null)
    {
        return;
    }
    var pos = oldWidget.getPosition();
    var anchorPoint = oldWidget.getAnchorPoint();
    oldWidget.removeFromParent();
    parent.addChild(newWidget);
    newWidget.setAnchorPoint(anchorPoint);
    newWidget.setPosition(pos);
};

/**
 * @param {string} str
 * @returns {cc.Color}
 */
UICommon.colorFromHexString = function(str) {
    var intValue = parseInt(str, 16);
    return cc.color((intValue >>> 16) & 255, (intValue >>> 8) & 255, (intValue) & 255);
};


/**
 * 设置指定node的AnchorPoint，但不改变node的相对位置
 * 有旋转的node不适用
 * @param anchorPoint {cc.Point}
 * @param node {cc.Node}
 */
UICommon.setAnchorPointWithoutMoving=function(node, anchorPoint){
    var box = node.getBoundingBox();
    node.setAnchorPoint(anchorPoint);
    node.setPosition(box.x+anchorPoint.x*box.width,box.y+anchorPoint.y*box.height);
};

/**
 * 将一组Node/Widget按矩阵排列
 * @param {*|cc.Node|ccui.Widget} returnType 这是一个“伪模板参数”，请传cc.Node或cc.Widget
 * @param {Array} array
 * @param {Number|int} col 列数
 * @param {cc.Size} [gapSize] 间距 默认0，紧密排列，没有间距
 * @param {cc.Size} [eachContentSize] 按这个Size排列 默认取第一个的size，如果这组Node/Widget不等大，请传入一个合适的size
 * @returns {*|cc.Node|ccui.Widget}
 */
UICommon.arrangeAsMatrixByColumn = function(returnType, array, col, gapSize, eachContentSize) {
    var root = new returnType();

    var cnt = array.length;
    if (cnt == 0) {
        return root;
    }

    var fullRow = Math.div(cnt, col);
    var rem = cnt % col;
    var row = fullRow + (rem > 0 ? 1 : 0);

    if (eachContentSize == undefined) {
        eachContentSize = array[0].getBoundingBox();
    }

    if (gapSize == undefined) {
        gapSize = cc.size(0, 0);
    }

    var size = cc.size(0, 0);
    size.width = ((col == 1) ? (eachContentSize.width) : (eachContentSize.width * col + gapSize.width * (col - 1)));
    size.height = ((row == 1) ? (eachContentSize.height) : (eachContentSize.height * row + gapSize.height * (row - 1)));

    root.setContentSize(size);

    var posX = eachContentSize.width * 0.5;
    var posY = size.height - eachContentSize.height * 0.5;
    for (var i = 0; i < cnt; ++i) {
        var child = array[i];
        root.addChild(child);
        child.setAnchorPoint(cc.p(0.5, 0.5));
        child.setPosition(cc.p(posX, posY));

        if (i % col < col - 1) {
            posX += (eachContentSize.width + gapSize.width);
        } else {
            posX = eachContentSize.width * 0.5;
            posY -= (eachContentSize.height + gapSize.height);
        }
    }

    return root;
};


/**
 * 将一组Node/Widget按矩阵排列(但限制行数 create by jeff4)
 * @param {*|cc.Node|ccui.Widget} returnType 这是一个“伪模板参数”，请传cc.Node或cc.Widget
 * @param {Array} array
 * @param {Number|int} row 行数
 * @param {cc.Size} [gapSize] 间距 默认0，紧密排列，没有间距
 * @param {cc.Size} [eachContentSize] 按这个Size排列 默认取第一个的size，如果这组Node/Widget不等大，请传入一个合适的size
 * @returns {*|cc.Node|ccui.Widget}
 */
UICommon.arrangeAsMatrixByRow = function(returnType, array, row, gapSize, eachContentSize) {
    var root = new returnType();

    var cnt = array.length;
    if (cnt == 0) {
        return root;
    }

    var col = Math.ceil(cnt / row); //列数

    if (eachContentSize == undefined) {
        eachContentSize = array[0].getBoundingBox();
    }

    if (gapSize == undefined) {
        gapSize = cc.size(0, 0);
    }

    var size = cc.size(0, 0);
    size.width = ((col == 1) ? (eachContentSize.width) : (eachContentSize.width * col + gapSize.width * (col - 1)));
    size.height = ((row == 1) ? (eachContentSize.height) : (eachContentSize.height * row + gapSize.height * (row - 1)));

    root.setContentSize(size);

    var posX = 0;
    var posY = 0;
    for (var i = 0; i < cnt; ++i) {
        var child = array[i];
        root.addChild(child);

        var curCol = Math.ceil( (i+1) / row);
        var rem = (i + 1 + row) % row;
        var curRow = (rem == 0 ? row : rem);

        posX = eachContentSize.width  * (curCol - 1) + gapSize.width * (curCol - 1);
        posY = eachContentSize.height * (row - curRow) + gapSize.height * (row - curRow); //从上往下排

        child.setPos(cc.p(posX, posY), cc.p(0, 0));
    }

    return root;
};

/**
 * @param {String} name
 * @param {String} defaultName
 * @returns {cc.Sprite}
 */
UICommon.safeCreateSpriteWithDefaultSpriteName = function(name, defaultName) {
    var sprite = new cc.Sprite();
    var frame = cc.spriteFrameCache.getSpriteFrame(name + ".png");
    if (frame == null) {
        cc.error(name + " not found in SpriteFrameCache");
        frame = cc.spriteFrameCache.getSpriteFrame(defaultName + ".png");
    }
    if (frame != null) {
        sprite.setSpriteFrame(frame);
    }
    return sprite;
};

/**
 * @param {String} name
 * @param {String} defaultName
 * @returns {cc.Sprite}
 */
UICommon.safeCreateSpriteWithDefaultTextureName = function(name, defaultName) {
    var sprite = new cc.Sprite();
    var texture = cc.textureCache.addImage(name + ".png");
    //cc.log("图片加载 src === " + name + ".png");
    if (texture == null) {
        cc.error("警告! 图片加载失败 src === " + name + ".png   (将使用默认资源)", defaultName);
        texture = cc.textureCache.addImage(defaultName + ".png");
    }
    if (texture != null) {
        var frame = new cc.SpriteFrame();
        var size = texture.getContentSize();
        frame.initWithTexture(texture, cc.rect(0, 0, size.width, size.height));
        sprite.setSpriteFrame(frame);
    }
    return sprite;
};

UICommon.setSpriteWithDefaultTextureName = function(sprite, name, defaultName) {
    cc.log("------- BPUICommon.setSpriteWithDefaultTextureName");
    var texture = cc.textureCache.addImage(name + ".png");
    if (texture == null)
    {
        cc.error("警告! 图片加载失败 src === ", name, "(将使用默认资源)", defaultName);
        texture = cc.textureCache.addImage(defaultName + ".png");
    }

    if (texture != null)
    {
        var frame = new cc.SpriteFrame();
        var size = texture.getContentSize();
        frame.initWithTexture(texture, cc.rect(0, 0, size.width, size.height));
        sprite.setSpriteFrame(frame);
    }
};

/**
 *
 * @param sprite
 * @param name
 * @param {String} [defaultName]
 */
UICommon.setSpriteWithDefaultSpriteName = function(sprite, name, defaultName) {
    var frame = cc.spriteFrameCache.getSpriteFrame(name + ".png");
    if (!frame) {
        cc.log("BPUICommon.setSpriteWithDefaultSpriteName: no sprite, name="+name);
        sprite.setSpriteFrame(defaultName + ".png");
    }else{
        sprite.setSpriteFrame(frame);
    }
};

/**
 * 给所有传入的button, label 字体包边（包边按字体百分比）
 * 例:BPUICommon.enableOutlineForAll(cc.BLACK, ccLabel, ccControlButton, ccuiButton, ccLabel....) 自定义颜色
 * 或：:BPUICommon.enableOutlineForAll(ccLabel, ccControlButton,.....)    //默认黑色
 * @param color3b cc.color
 */
UICommon.enableOutlineForAll = function(color3b){
    var param = 0.15;
    var startIndex = 1;
    var localColor = color3b;
    if(color3b.a == undefined){
        startIndex = 0;    //若没有传颜色, 表示传递的是Node 我们默认给黑色
        localColor = cc.BLACK;
    }
    for(var i = startIndex; i < arguments.length; i++){
        var node = arguments[i];
        if(node == null) continue;
        if(node instanceof  cc.ControlButton)
        {
            var fontSize = node.getTitleTTFSizeForState(cc.CONTROL_STATE_NORMAL);
            node.getTitleLabel().enableOutline(localColor, param * fontSize);
        }
        else if (node instanceof cc.Label)
        {
            var fontSize = node.height;
            node.enableOutline(localColor, param * fontSize);
        }
        else if (node instanceof ccui.Button)
        {
            var fontSize = node.getTitleFontSize();
            node.getTitleRenderer().enableOutline(localColor, param * fontSize);
        }
        else if (node instanceof cc.LabelTTF)
        {
            var fontSize = node.getFontSize();
            node.enableStroke(localColor, param * fontSize);
        }
    }
};

/**
 * 是否在 指定距离间 点击触摸了
 * @param touch
 * @param maxDistance
 * @returns {boolean}
 */
UICommon.isOnTouchWithDistance = function(touch, maxDistance)
{
    var startPos = touch.getStartLocationInView();
    var endPos = touch.getLocationInView();
    var distance = cc.pDistance(startPos, endPos);

    return distance < maxDistance;
};

/**
 * 是否触摸在 target 内
 * @param touch
 * @param event
 * @returns {boolean}
 */
UICommon.isOnTouch = function(touch, event)
{
    // 获取事件所绑定的 target, 通常是cc.Node及其子类
    var target = event.getCurrentTarget();
    var pos = touch.getLocation();
    var result = target.isContainPoint(pos);

    target=null;
    touch=null;
    event=null;
    pos=null;
    return result ;
};

/**
 * 创建通用button
 * @param {*|cc.size|Number} sizeOrWidthValue
 * @param {Number}          [widthValue]
 * @returns {ccui.button | undefined}
 */
UICommon.createCommonButton = function(sizeOrWidthValue, heightValue)
{
    var size = undefined;
    if(sizeOrWidthValue == undefined){
        cc.error("createCommonButton expect arguments not less than one");
        return;
    }
    if(heightValue != undefined){
        size = cc.size(sizeOrWidthValue, heightValue);
    }else{
        size = sizeOrWidthValue;
    }

    //
    var button = new ccui.Button();
    button.setContentSize(size);
    button.setBackGroundColorEx(cc.RED);
   // button.addClickEventListener()
    return button;
}