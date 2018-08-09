/**
 * Created by Administrator on 2017/1/10.
 */
var GeneralClickEffect = cc.Node.extend({

    ctor:function()
    {
        this._super();

        this.initUI();
    },

    initUI:function()
    {
        var rootLayer = this._rootLayer = ccs.loadWithVisibleSize(res.GeneralClickEffect_json).node;
        this.addChild(rootLayer);

        //取得studio里面的组件
        var panel = this._panel = ccui.helper.seekWidgetByName(rootLayer, "panel");
        var innerImage = this._innerImage = ccui.helper.seekWidgetByName(panel, "innerImage");
        var outerImage = this._outerImage = ccui.helper.seekWidgetByName(panel, "outerImage");
        panel.setTouchEnabled(false);
        innerImage.setScale(0);
        outerImage.setScale(0);

        //动画组件
        var animation = this._animation = ccs.load(res.GeneralClickEffect_json).action;
        rootLayer.runAction(animation);

        var self = this;

        var listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,                       // 设置是否吞没事件，在 onTouchBegan 方法返回 true 时吞没
            onTouchBegan: function (touch, event) {
                self.stopAllActions();

                //初始化图片的大小和透明度
                self._innerImage.setOpacity(0);
                self._innerImage.setScale(0.01);
                self._outerImage.setOpacity(0);
                self._outerImage.setScale(0.01);

                //设置容器的坐标
                //var target = event.getCurrentTarget();
                //self._panel.setPosition(target.convertToNodeSpace(touch.getLocation()));
                self._panel.setPosition(touch.getLocation());

                //执行动画
                self._animation.play("GeneralShark", false);

                return true;
            },
            onTouchMoved: function (touch, event) {

            },
            onTouchEnded: function (touch, event) {

            },
            onTouchCancelled: function (touch, event) {

            }
        });
        cc.eventManager.addListener(listener,rootLayer);

    }
});