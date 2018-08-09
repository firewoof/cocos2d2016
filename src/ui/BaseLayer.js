/**
 * Created by 玲英 on 2016/8/12.
 */
var BaseLayer = cc.LayerColor.extend({

    //特殊标记变量
    _layerName:undefined,        //界面的名字,辅助助手检查界面
    _isFullScreenOpaque:true,    //表示是一个全屏不透明度界面(在绘制多层的时候，这个标记可以帮助下层隐藏，减少绘制)

   ctor:function(layerName)
   {
       this._super();
       this.setOpacity(170);

       //赋值单例
       if(layerName)
       {
           this._layerName = layerName;
           cc.log("创建界面::", layerName);
           if(this._layerName){
               eval(this._layerName+".instance = this");
           }
       }

       //全屏触摸透明遮罩
       var blockPanel = this._blockPanel = new ccui.Layout();
       blockPanel.setContentSize(cc.winSize);
       this.addChild(blockPanel);
       blockPanel.setTouchEnabled(true);
   },

    /**
     * 是否阻塞界面点击
     * @param enabled
     */
    setBlockTouches:function(isBlock)
    {
        this._blockPanel.setTouchEnabled(isBlock);
    },

    setFullScreenOpaque:function(bool)
    {
        this._isFullScreenOpaque = bool;
    },

    onEnter:function()
    {
        this._super();
    },

    cleanup:function()
    {
        this._super();
        this.removeAllCustomListeners();
        //重置
        if(this._layerName){
            eval(this._layerName + ".instance = null");
            cc.log("clean up " + this._layerName + ".instance = null");
        }
    }
});