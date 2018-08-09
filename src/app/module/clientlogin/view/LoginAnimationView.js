/**
 * Created by Administrator on 2017/4/25.
 */

var LoginAnimationView = cc.Layer.extend({
    ctor:function() {
        this._super();

        this.initUI();
    },
    initUI:function(){
        var size = cc.winSize;
        var rootNode = this._rootNode= ccs.loadWithVisibleSize(res.LoginBgAnimation_json).node;
        this.addChild(rootNode);

        var moonAction = this._moonAction = ccui.helper.seekWidgetByName(rootNode,"bg_animation_picture_1");
        moonAction.setLocalZOrder(3);
        this._moonAction.runAction(cc.rotateBy(3, 360).repeatForever());
        var centerMoon  = ccui.helper.seekWidgetByName(rootNode,"bg_animation_picture_3");
        centerMoon.setLocalZOrder(4);

        var goldCoin1 = this._goldCoin1 = new cc.Sprite("#bg_animation_gold.png");
        goldCoin1.setScale(0);
        goldCoin1.x = 833;
        goldCoin1.y = 605;
        rootNode.addChild(goldCoin1,2);
        var scale1 = cc.scaleTo(1,1);
        this._goldCoin1.runAction(scale1);

        var goldCoin2 = this._goldCoin2 = new cc.Sprite("#bg_animation_gold.png");
        goldCoin2.setScale(0);
        goldCoin2.x = 483;
        goldCoin2.y = 662;
        rootNode.addChild(goldCoin2,2);
        this.scheduleOnce(function(){
            var scale2 = cc.scaleTo(1,1);
            this._goldCoin2.runAction(scale2);
        },2.6);

        //吃第一个金币前robot的动画
        var robot = this._robot = ccui.helper.seekWidgetByName(rootNode,"bg_animation_robot");
        robot.setLocalZOrder(5);
        var move1 = cc.moveTo(0.8,cc.p(this._robot.x - 30, this._robot.y + 30));
        var move2 = cc.moveTo(0.8,cc.p(this._robot.x - 20, this._robot.y - 10));
        var move3 = cc.moveTo(0.8,cc.p(this._robot.x + 20, this._robot.y - 25));
        var move4 = cc.moveTo(0.8,cc.p(this._robot.x + 10, this._robot.y + 35));
        var move5 = cc.moveTo(0.8,cc.p(this._robot.x - 45, this._robot.y - 20));
        var move6 = cc.moveTo(1.2,cc.p(this._goldCoin1.x + 25, this._goldCoin1.y));
        var seq = cc.sequence(move1,move2,move3,move4,move5,move6);
        this._robot.runAction(seq);

        var meteor1 = this._meteor1 = new cc.Sprite("#bg_animation_meteor.png");
        meteor1.x = 452;
        meteor1.y = 851;
        meteor1.setRotation(190);
        meteor1.setOpacity(0);
        rootNode.addChild(meteor1,10);
        var meteor2 = this._meteor2 =new cc.Sprite("#bg_animation_meteor.png");
        meteor2.x = -57;
        meteor2.y = 730;
        meteor2.setRotation(184);
        meteor2.setOpacity(0);
        rootNode.addChild(meteor2,10);
        //流星动画
        this.schedule(function(){
            var ac1 = cc.sequence(cc.fadeIn(0.3),cc.fadeOut(0.3));
            var ac2 = cc.moveTo(0.8,cc.p(this._meteor1.x + size.height * 1.3 ,0));
            this._meteor1.runAction(cc.sequence(cc.spawn(ac1,ac2),cc.moveTo(0.8,this._meteor1.x,this._meteor1.y)));
            this.scheduleOnce(function(){
                var ac3 = cc.sequence(cc.fadeIn(0.25),cc.fadeOut(0.25));
                var ac4 = cc.moveTo(0.6,cc.p(this._meteor2.x + size.height * 1.4 ,0));
                this._meteor2.runAction(cc.sequence(cc.spawn(ac3,ac4),cc.moveTo(0.8,this._meteor2.x,this._meteor2.y)));
            },0.4);
        },4);

        //第一个金币消失，移动吃第二个金币
        this.scheduleOnce(function(){
            var scale3 = cc.scaleTo(1,0);
            var move = cc.moveTo(1,cc.p(this._goldCoin1.x + 15,this._goldCoin1.y ));
            var spw = cc.spawn(scale3,move);
            this._goldCoin1.runAction(spw);
                this.scheduleOnce(function() {
                    this.initCatch(this._goldCoin2)
                },1);
        },5.5);

        //随机闪烁星星
        this.initStar();

        //随机静止星星
        for(var i = 0; i < 24; i++){
            var staticStar = new cc.Sprite("#bg_animation_star.png");
            var opac = ALCommon.getRandomInteger(30,255);
            staticStar.setOpacity(opac)
            var sca = ALCommon.getRandomInteger(4,9) / 10;
            staticStar.setScale(sca);
            var cutWidth = size.width / 24;
            staticStar.x = cutWidth  * ( cc.random0To1() + i );
            staticStar.y = size.height  * ALCommon.getRandomInteger(38,95) / 100;
            rootNode.addChild(staticStar,1)
        }

    },
    initStar:function(){
        var size = cc.winSize;
        var moonSize = this._moonAction.width;
        var moonX = this._moonAction.x;
        //星星闪烁动画
        var star = new cc.Sprite("#bg_animation_star.png");
        var star2 = new cc.Sprite("#bg_animation_star.png");

        this.schedule(function(){
            star.x = ( size.width - star.getContentSize().width ) * cc.random0To1() + star.getContentSize().width / 2;
            while((star.x < moonX + moonSize / 2) && (star.x > moonX - moonSize / 2)){
                star.x = ( size.width - star.getContentSize().width ) * cc.random0To1() + star.getContentSize().width / 2;
            }
            star.y = size.height  * ALCommon.getRandomInteger(40,95) / 100;
            var opac = ALCommon.getRandomInteger(150,255);
            var sca = ALCommon.getRandomInteger(6,9) / 10;
            star.setScale(0);
            var spw1 = cc.spawn(cc.scaleTo(0.5,sca),cc.fadeTo(0.5,opac));
            var spw2 = cc.spawn(cc.scaleTo(0.5,0),cc.fadeTo(0.5,50));
            var spw3 = cc.spawn(cc.rotateBy(0.5,144),spw2);
            var seq = cc.sequence(spw1,spw3);
            star.runAction(seq);

            this.scheduleOnce(function(){
                star2.x = ( size.width - star2.getContentSize().width ) * cc.random0To1() + star2.getContentSize().width / 2;
                while((star2.x < moonX + moonSize / 2) && (star2.x > moonX - moonSize / 2)){
                    star2.x = ( size.width - star2.getContentSize().width ) * cc.random0To1() + star2.getContentSize().width / 2;
                }
                star2.y = size.height  * ALCommon.getRandomInteger(40,95) / 100;
                star2.runAction(cc.sequence(spw1,spw3));
            },0.7);

        },1.5);
        this._rootNode.addChild(star,0);
        this._rootNode.addChild(star2,0);
    },
    initCatch:function(p){
        var movePosition = cc.p(p.x + 25, p.y);
        //吃第二金币轨迹
        var absX = Math.abs(p.x - this._robot.x);
        var absY = Math.abs(p.y - this._robot.y);
        var move1 = cc.moveTo(1,cc.p((this._robot.x - (absX / 4)), this._robot.y + absY ))                                                                              ;
        var move2 = cc.moveTo(1,cc.p((this._robot.x - absX / 3), this._robot.y + absY / 4))                                                                              ;
        var move3 = cc.moveTo(1,cc.p((this._robot.x - absX / 2), this._robot.y + absY * 1.5))                                                                              ;
        var move4 = cc.moveTo(1.5,cc.p((this._robot.x - absX / 4 * 3),this._robot.y + absY / 2))                                                                              ;
        var move5 = cc.moveTo(1.5,movePosition)                                                                              ;
        this._robot.runAction(cc.sequence(move1,move2,move3,move4,move5));
        this.scheduleOnce(function(){
            var scale3 = cc.scaleTo(1,0);
            var move = cc.moveTo(1,cc.p(p.x + 8,p.y ));
            var spw = cc.spawn(scale3,move);
            p.runAction(spw);
        },6);

        //无金币时运动轨迹
        var robotX = p.x;
        var robotY = p.y;
        this.schedule(function(){
            var move6 = cc.moveTo(1.5,cc.p(robotX - 20, robotY + 20));
            var move7 = cc.moveTo(1.5,cc.p(robotX - 15, robotY - 5));
            var move8 = cc.moveTo(1.5,cc.p(robotX + 15, robotY - 15));
            var move9 = cc.moveTo(1.5,cc.p(robotX + 5,  robotY + 20));
            var move10 = cc.moveTo(1, cc.p(robotX,      robotY));
            this._robot.runAction(cc.sequence(move6,move7,move8,move9,move10));
        },7);
    }
});