/**
 * Created by Jony on 2016/8/23.
 */

var CashOutLayer = cc.Layer.extend({
    _cashType: "union",
    _provinceArr: [],
    _provinceData: {},
    _bankData: {},
    _inputProvinceId: "",
    _inputCityId: "",
    _lastCityPanelShowProvinceId: "",
    _isProvincePanelInit: false,
    _feeCheckBoxSelected: true,

    ctor:function()
    {
        this._super();

        this.initData();
        //UI
        this.initUI();
        this.initScrollView();
        //点击事件
        this.initAllClickFunc();

    },

    cleanup:function(){
        this.removeAllCustomListeners();
        this._rechargeResultListender = null;
        this._super();
    },

    initData: function()
    {
        var configMap = JSON.parse(jsb.fileUtils.getStringFromFile("res/arts/DinPaySDKCashOut.json"));
        this._provinceArr = configMap.province;
        for(var provinceId in configMap.city){
            this._provinceData[provinceId] = configMap.city[provinceId];
        }
        this._bankData = configMap.bank;

        this._needFeeCheck = ClientConfig.getInstance().getWithdrawFee() > 0;
    },

    initUI:function()
    {
        var layer  = ccs.loadWithVisibleSize(res.CashOutLayer_json).node;
        // 加入到当前layer中。
        this.addChild(layer);
        // 按钮
        //
        var titlePanel =this._titlePanel = ccui.helper.seekWidgetByName(layer, "titlePanel");
        // 返回按钮
        var backBtn = this._backBtn = ccui.helper.seekWidgetByName(titlePanel, "backBtn");
        var inputPanel = this._inputPanel = ccui.helper.seekWidgetByName(layer, "inputPanel");

        // 请输入银行卡号
        var cardNumBg = this._cardNumBg = ccui.helper.seekWidgetByName(inputPanel, "cardNumBg");
        this._cardNumEditBox = new cc.EditBox(cardNumBg.getContentSize(),new cc.Scale9Sprite("bg_common_bar.png"));
        cardNumBg.addChild(this._cardNumEditBox);
        this._cardNumEditBox.setPosition(centerInner(cardNumBg));
        this._cardNumEditBox.setFontSize(24);
        this._cardNumEditBox.setFontColor(cs.BLACK);
        this._cardNumEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_NUMERIC);
        this._cardNumEditBox.setPlaceHolder(LocalString.getString("PLEASE_INPUT_BANK_CARD"));
        this._cardNumEditBox.setPlaceholderFontColor(cs.GRAY);
        this._cardNumEditBox.setPlaceholderFontSize(24);
        this._cardNumEditBox.setDelegate(this);

        // 请输入账户名
        var userNameBg =this._userNameBg = ccui.helper.seekWidgetByName(inputPanel, "userNameBg");
        this._userNameEditBox = new cc.EditBox(userNameBg.getContentSize(),new cc.Scale9Sprite("bg_common_bar.png"));
        userNameBg.addChild(this._userNameEditBox);
        this._userNameEditBox.setPosition(centerInner(userNameBg));
        this._userNameEditBox.setFontSize(24);
        this._userNameEditBox.setFontColor(cs.BLACK);
        this._userNameEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this._userNameEditBox.setPlaceHolder(LocalString.getString("PLEASE_INPUT_RECEIVE_NAME"));
        this._userNameEditBox.setPlaceholderFontColor(cs.GRAY);
        this._userNameEditBox.setPlaceholderFontSize(24);
        this._userNameEditBox.setMaxLength(7);
        this._userNameEditBox.setDelegate(this);

        var realName = Player.getInstance().getRealName();
        if(realName != undefined && realName != ""){
            this._userNameEditBox.setString(realName);
            this._userNameEditBox.setEnabled(false);
        }

        // 请输入银行支行
        var bankNameBg =this._bankNameBg =  ccui.helper.seekWidgetByName(inputPanel, "bankNameBg");
        this._bankNameEditBox = new cc.EditBox(bankNameBg.getContentSize(),new cc.Scale9Sprite("bg_common_bar.png"));
        bankNameBg.addChild(this._bankNameEditBox);
        this._bankNameEditBox.setPosition(centerInner(bankNameBg));
        this._bankNameEditBox.setFontSize(24);
        this._bankNameEditBox.setFontColor(cs.BLACK);
        this._bankNameEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this._bankNameEditBox.setPlaceHolder(LocalString.getString("PLEASE_INPUT_BANK_NAME"));
        this._bankNameEditBox.setPlaceholderFontColor(cs.GRAY);
        this._bankNameEditBox.setPlaceholderFontSize(24);
        this._bankNameEditBox.setDelegate(this);

        //跳转身份证上传界面
        var upLoadIDCardBg  = this._upLoadIDCardBg = ccui.helper.seekWidgetByName(inputPanel, "upLoadIDCardBg");
        var upLoadIDCardText = this._upLoadIDCardText = ccui.helper.seekWidgetByName(upLoadIDCardBg, "text");
        upLoadIDCardText.setColor(cs.GRAY);
        upLoadIDCardText.setOpacity(150);

        var moneyMaxBg = this._moneyMaxBg= ccui.helper.seekWidgetByName(inputPanel, "moneyMaxBg");
        this._moneyMaxEditBox = new cc.EditBox(moneyMaxBg.getContentSize(),new cc.Scale9Sprite("bg_common_bar.png"));
        moneyMaxBg.addChild(this._moneyMaxEditBox);
        this._moneyMaxEditBox.setPosition(centerInner(moneyMaxBg));
        this._moneyMaxEditBox.setFontSize(24);
        this._moneyMaxEditBox.setFontColor(cs.BLACK);
        this._moneyMaxEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_DECIMAL);
        var fee = (Player.getInstance().getBalance()*ClientConfig.getInstance().getWithdrawFee()).toFixed(2);
        if(fee < ClientConfig.getInstance().getMinWithdrawFee())
        {
            fee = ClientConfig.getInstance().getMinWithdrawFee();
        }
        if(fee > ClientConfig.getInstance().getMaxWithdrawFee())
        {
            fee = ClientConfig.getInstance().getMaxWithdrawFee();
        }
        this._canCashOutMoney = (Player.getInstance().getBalance() - fee).toFixed(2);
        if(this._canCashOutMoney < 0)
        {
            this._canCashOutMoney = 0.00;
        }
        this._moneyMaxEditBox.setPlaceHolder(cc.formatStr(LocalString.getString("CAN_WITNDRAW_MONEY"), this._canCashOutMoney, fee));
        this._moneyMaxEditBox.setPlaceholderFontColor(cs.GRAY);
        this._moneyMaxEditBox.setPlaceholderFontSize(24);
        this._moneyMaxEditBox.setDelegate(this);

        // 备注
        var remarkBg = this._remarkBg = ccui.helper.seekWidgetByName(inputPanel, "remarkBg");
        this._remarkEditBox = new cc.EditBox(remarkBg.getContentSize(),new cc.Scale9Sprite("bg_common_bar.png"));
        remarkBg.addChild(this._remarkEditBox);
        this._remarkEditBox.setPosition(centerInner(remarkBg));
        this._remarkEditBox.setFontSize(24);
        this._remarkEditBox.setFontColor(cs.BLACK);
        this._remarkEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
        this._remarkEditBox.setPlaceHolder(LocalString.getString("REMARK"));
        this._remarkEditBox.setPlaceholderFontColor(cs.GRAY);
        this._remarkEditBox.setPlaceholderFontSize(24);
        this._remarkEditBox.setDelegate(this);

        //var unionPaybtn = this._unionPaybtn = ccui.helper.seekWidgetByName(inputPanel, "unionPaybtn");
        //var unionPaybtnTag = this._unionPaybtnTag = ccui.helper.seekWidgetByName(unionPaybtn, "tag");
        //var zhiFuBaoBtn = this._zhiFuBaoBtn = ccui.helper.seekWidgetByName(inputPanel, "zhiFuBaoBtn");
        //var zhiFuBaoBtnTag = this._zhiFuBaoBtnTag = ccui.helper.seekWidgetByName(zhiFuBaoBtn, "tag");
        //var zhiFuBaoBtnImage = this._zhiFuBaoBtnImage = ccui.helper.seekWidgetByName(zhiFuBaoBtn, "image");
        //var zhiFuBaoBtnTagN = ccui.helper.seekWidgetByName(zhiFuBaoBtn, "tag_0");
        //zhiFuBaoBtn.setGray(true);
        //UICommon.setGrayRecursive(zhiFuBaoBtnImage);
        //UICommon.setGrayRecursive(zhiFuBaoBtnTag);
        //UICommon.setGrayRecursive(zhiFuBaoBtnTagN);

        var addressPanel = this._addressPanel = ccui.helper.seekWidgetByName(inputPanel, "addressPanel");

        var provinceBtn = this._provinceBtn = ccui.helper.seekWidgetByName(addressPanel, "provinceBtn");
        var provinceBtnTxt = this._provinceBtnTxt = ccui.helper.seekWidgetByName(provinceBtn, "txt");
        var openDirectionImage = this._provinceOpenDirectionImage = ccui.helper.seekWidgetByName(provinceBtn, "openDirectionImage");
        var cityBtn = this._cityBtn = ccui.helper.seekWidgetByName(addressPanel, "cityBtn");
        var cityBtnTxt = this._cityBtnTxt = ccui.helper.seekWidgetByName(cityBtn, "txt");
        var cityOpenDirectionImage = this._cityOpenDirectionImage = ccui.helper.seekWidgetByName(cityBtn, "openDirectionImage");
        var provincePanel = this._provincePanel = ccui.helper.seekWidgetByName(addressPanel, "provincePanel");
        var cityPanel = this._cityPanel = ccui.helper.seekWidgetByName(addressPanel, "cityPanel");
        //this._provinceBtnTxt.setColor(cc.color.GRAY);
        //this._cityBtnTxt.setColor(cc.color.GRAY);

        var feePanel = this._feePanel = ccui.helper.seekWidgetByName(inputPanel,"feePanel");

        var feeCheckBox = this._feeCheckBox = ccui.helper.seekWidgetByName(feePanel, "feeCheckBox");
        this._feeTxt = ccui.helper.seekWidgetByName(feePanel, "feeTxt");

        this._feeTxt.setString(cc.formatStr(LocalString.getString("WITHDRAW_FEE"),
                                            ClientConfig.getInstance().getWithdrawFee()*100,
                                            ClientConfig.getInstance().getMinWithdrawFee(),
                                            ClientConfig.getInstance().getMaxWithdrawFee()));

        var confirmPanel = this._confirmPanel = ccui.helper.seekWidgetByName(inputPanel, "confirmPanel");
        var confirmBtn = this._confirmBtn = ccui.helper.seekWidgetByName(confirmPanel, "confirmBtn");

        //this.setCashPanelClicked("union");

        //// 结果面板
        var resultPanel = this._resultPanel = ccui.helper.seekWidgetByName(layer, "resultPanel");
        var resultConfirmBtn = this._resultConfirmBtn = ccui.helper.seekWidgetByName(resultPanel, "confirmBtn");
        //var resultStateTxt = this._resultStateTxt = ccui.helper.seekWidgetByName(resultPanel, "txt_result");
        var resultOrderNoTxt = this._resultOrderNoTxt = ccui.helper.seekWidgetByName(resultPanel, "txt_orderNo");

        this.initInputInfo();

        //this._feeCheckBox.setVisible(this._needFeeCheck);
        //this._feeTxt.setVisible(this._needFeeCheck);
    },

    initScrollView:function(){

        var cellSize = this._cardNumBg.getContentSize();

        var cellArray = [];
        var cardNumCell = this.getPanel(this._cardNumBg);
        var userNameCell = this.getPanel(this._userNameBg);
        var bankNameCell = this.getPanel(this._bankNameBg);
        var upLoadIDCardCell = this.getPanel(this._upLoadIDCardBg);
        var moneyMaxCell = this.getPanel(this._moneyMaxBg);
        var remarkCell = this.getPanel(this._remarkBg);
        var addressCell = this.getPanel(this._addressPanel);
        addressCell.setLocalZOrder(20);
        var feeCell = this.getPanel(this._feePanel);
        var confirmCell = this.getPanel(this._confirmPanel);
        cellArray.push(addressCell);
        cellArray.push(cardNumCell);
        cellArray.push(userNameCell);
        cellArray.push(bankNameCell);

        var isWithdrawNeedIdCard = ClientConfig.getInstance().isWithdrawNeedIdCard();
        if(isWithdrawNeedIdCard){
            cellArray.push(upLoadIDCardCell);
        }
        cellArray.push(moneyMaxCell);
        cellArray.push(remarkCell);
        if(this._needFeeCheck){
            cellArray.push(feeCell);
        }
        cellArray.push(confirmCell);

        var diff = 15;
        var contentPanel = UICommon.createPanelAlignWidgetsWithPadding(diff, cc.UI_ALIGNMENT_VERTICAL_CENTER,cellArray);//初始化画布间隔、排列方向及数据
        cellArray.push(confirmCell);
        var scrollView = this._scrollview = UICommon.createScrollViewWithContentPanel(contentPanel,cc.size(cellSize.width + diff * 2, cc.winSize.height - this._titlePanel.height - diff));//初始化scrollview，添加画布，设置位置
        this.addChild(scrollView);
        scrollView.setPos(cc.p(cc.winSize.width * 0.5 + diff, cc.winSize.height - this._titlePanel.height - diff), ANCHOR_TOP);

    },
    getPanel:function(panelBg){
        panelBg.retain();
        panelBg.removeFromParent();
        return panelBg;
    },

    initAllClickFunc:function()
    {
        // 返回
        this._backBtn.addClickEventListener(function(sender)
        {

            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
        }.bind(this));

        //跳转上传身份证界面
        this._upLoadIDCardBg.addClickEventListener(function(sender){

            this.addressPanelDismiss();

            MainController.pushLayerToRunningScene(new IDCardUpLoadLayer());
        }.bind(this));

        // 点击确认按钮响应
        this._confirmBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect();

            var txtTip = "";
            var cardNum = this._cardNumEditBox.getString().trim();
            var userName = this._userNameEditBox.getString().trim();
            var bankName = this._bankNameEditBox.getString().trim();
            var bankKey = this.isNormalBank(bankName);
            var moneyMax = this._moneyMaxEditBox.getString().trim();
            var remark = this._remarkEditBox.getString().trim();

            //是否需要上传身份证
            var isWithdrawNeedIdCard = ClientConfig.getInstance().isWithdrawNeedIdCard();
            //是否已经上传身份证
            var hasUploadedCard = RemoteStorage.getInstance().hasUploadedCard();

            if(this._inputProvinceId == "")
            {
                txtTip = LocalString.getString("PLEASE_SELECT_PROVINCE");
            }
            else if(this._inputCityId == "")
            {
                txtTip = LocalString.getString(LocalString.getString("PLEASE_SELECT_CITY"));
            }
            else if(cardNum.length == 0 )
            {
                txtTip = LocalString.getString("PLEASE_INPUT_BANK_CARD");
            }
            else if(userName.length == 0 )
            {
                txtTip = LocalString.getString("PLEASE_INPUT_RECEIVE_NAME");
            }
            else if(bankKey == "")
            {
                txtTip = LocalString.getString("PLEASE_INPUT_BANK_NAME");
            }
            else if(moneyMax.length == 0 )
            {
                txtTip = LocalString.getString("PLEASE_INPUT_WITHDRAW_MONEY");
            }
            else if(moneyMax < 0 )
            {
                txtTip = LocalString.getString("CAN_NOT_WITHDRAW_MONEY_ZERO");
            }
            else if(this._needFeeCheck && !this._feeCheckBoxSelected)
            {
                txtTip = LocalString.getString("PLEASE_AGREE_WITHDRAW_FEE");
            }
            else if(isWithdrawNeedIdCard && !hasUploadedCard )
            {
                txtTip = LocalString.getString("PLEASE_UPLOAD_IDCARD");
            }

            if(txtTip != "")
            {
                MainController.showAutoDisappearAlertByText(txtTip);
                return;
            }

            var req = {
                auth: {
                    payPassword: DataPool.curPayPassword,
                    provinceCode: this._inputProvinceId,
                    province: this._provinceBtnTxt.getString(),
                    cityCode: this._inputCityId,
                    city: this._cityBtnTxt.getString(),
                    bankAccount: cardNum,
                    receiverName: userName,
                    bankName: bankKey,
                    bankCode: this._bankData[bankKey],
                    amount: moneyMax,
                    remark: remark
                }
            }

            MainController.getInstance().showLoadingWaitLayer();
            new HttpRequest("accountWithdraw", req, function(data){
                MainController.getInstance().hideLoadingWaitLayer();
                this.showResultPanel(true, data.orderNo);

                Player.getInstance().initFromJson(data);
                cc.sys.localStorage.setItem("withdrawInfo", JSON.stringify(req.auth));
            }.bind(this));

        }.bind(this));

        this._resultConfirmBtn.addClickEventListener(function(sender)
        {
            MainController.playButtonSoundEffect(sender);
            MainController.popLayerFromRunningScene(this);
            //if(cc.sys.isMobile) buglySetTag(26232);
        }.bind(this));

        //this._unionPaybtn.addClickEventListener(function(sender)
        //{
        //    this.setCashPanelClicked("union");
        //}.bind(this));
        //
        //this._zhiFuBaoBtn.addClickEventListener(function(sender)
        //{
        //    this.setCashPanelClicked("zhiFuBao");
        //}.bind(this));

        this._provinceBtn.addClickEventListener(function(sender)
        {
            this.showProvinceOrCityPanel(sender);
        }.bind(this));

        this._cityBtn.addClickEventListener(function(sender)
        {
            this.showProvinceOrCityPanel(sender);
        }.bind(this));


        ////
        //this._rechargeResultListener = cc.eventManager.addCustomListener(NOTIFY_RECHARGE_RESULT, function(event){
        //   var data = event.getUserData();
        //   this.showResultPanel(true, data.state, data.amount);
        //}.bind(this));

        this._feeCheckBox.addEventListener(this.selectedStateEvent,this);

    },
    addressPanelDismiss:function(){
        if(this._provincePanel.isVisible()){
            this._provincePanel.setVisible(false);
        }
        if(this._cityPanel.isVisible()){
            this._cityPanel.setVisible(false);
        }
    },

    initInputInfo: function()
    {
        var info = cc.sys.localStorage.getItem("withdrawInfo") || "";
        if(info!= "")
        {
            var map = JSON.parse(info);

            this._inputProvinceId = map.provinceCode;
            this._provinceBtnTxt.setString(map.province);
            this._provinceBtnTxt.setTextColor(cs.BLACK);
            this._inputCityId = map.cityCode;
            this._cityBtnTxt.setString(map.city);
            this._cityBtnTxt.setTextColor(cs.BLACK);

            this._cardNumEditBox.setString(map.bankAccount);
            this._bankNameEditBox.setString(map.bankName);
            this._userNameEditBox.setString(map.receiverName);
            this._remarkEditBox.setString(map.remark);
        }

    },

    editBoxEditingDidBegin: function (editBox) {
        this.addressPanelDismiss();
    },

    editBoxReturn: function (editBox) {
        if(this._moneyMaxEditBox == editBox) {
           var money = parseFloat(editBox.getString().trim());
            var tipTxt = "";
            if(money> this._canCashOutMoney)
            {
                tipTxt = LocalString.getString("CASH_OUT_TIP_NO_MONEY");
            }
            else if(money < ClientConfig.getInstance().getWithDrawMinAmount())
            {
                tipTxt = cc.formatStr(LocalString.getString("CASH_OUT_TIP_MIN_AMOUNT"),ClientConfig.getInstance().getWithDrawMinAmount());
                //tipTxt = "提现最小金额为"+ ClientConfig.getInstance().getWithDrawMinAmount();
            }
            else if(money > ClientConfig.getInstance().getWithDrawMaxAmount())
            {
                tipTxt = cc.formatStr(LocalString.getString("CASH_OUT_TIP_MAX_AMOUNT"),ClientConfig.getInstance().getWithDrawMaxAmount());
                //tipTxt = "提现最大金额为"+ ClientConfig.getInstance().getWithDrawMaxAmount();
            }

            if(tipTxt!="")
            {
                MainController.showAutoDisappearAlertByText(tipTxt);
                editBox.setString("");
            }
        }
        //cc.log("editBox  was returned !");
    },

    selectedStateEvent: function (sender, type) {
        switch (type) {
            case ccui.CheckBox.EVENT_SELECTED:
                this._feeCheckBoxSelected = true;
                break;
            case ccui.CheckBox.EVENT_UNSELECTED:
                this._feeCheckBoxSelected = false;
                break;

            default:
                break;
        }
    },

    //// 点击充值panel响应
    //setCashPanelClicked: function( cashType )
    //{
    //    if(this._cashType == cashType) return;
    //    MainController.playButtonSoundEffect();
    //    if(cashType == "union")
    //    {
    //        this._zhiFuBaoBtnTag.setVisible(false);
    //        this._unionPaybtnTag.setVisible(true);
    //    }
    //    else
    //    {
    //        this._zhiFuBaoBtnTag.setVisible(true);
    //        this._unionPaybtnTag.setVisible(false);
    //    }
    //
    //    this._cashType = cashType;
    //
    //    // 切换不同体现方式ui
    //    //this.freshUi();
    //},

     showProvinceOrCityPanel: function( sender )
     {
         var panel = (sender == this._provinceBtn) ? this._provincePanel : this._cityPanel;
         if(panel == this._cityPanel && this._inputProvinceId == "" )
         {
             //txtTip = LocalString.getString("CASH_OUT_TIP_SELECT_PROVINCE");
             MainController.showAutoDisappearAlertByText(LocalString.getString("CASH_OUT_TIP_SELECT_PROVINCE"));

             return;
         }
         var directionImage = (sender == this._provinceBtn) ? this._provinceOpenDirectionImage : this._cityOpenDirectionImage;
         var visible = panel.isVisible();
         if(!visible)
         {
             directionImage.setRotation(180);
             //panel.runAction(cc.sequence(cc.callFunc(function() {
             //   panel.setVisible(true);
             //   this.refreshProvinceOrCityList(panel);
             //}.bind(this)) , cc.moveBy(0.1,cc.p(0, -64)) ));
             panel.setVisible(true);
             this.refreshProvinceOrCityList(panel);
         }
         else
         {
             directionImage.setRotation(0);
             //panel.runAction(cc.sequence(cc.moveBy(0.05,cc.p(0, 64)), cc.callFunc(function() { panel.setVisible(false);} )));
             if(this._provincePanel.isVisible() && panel == this._cityPanel){
                 this._provincePanel.setVisible(false);
             }

             panel.setVisible(false);
         }
     },

    /*
     * 显示省or城市列表
     * */
    refreshProvinceOrCityList: function(listPanel)
    {
        var needRefresh = false;
        var array = [];
        if( listPanel == this._provincePanel)
        {
            if(!this._isProvincePanelInit) {
                needRefresh = true;
                for (var i = 0; i < this._provinceArr.length; i++) {
                    var cell = new ProvinceOrCityCell(this._provinceArr[i], function (data) {
                        this._provinceBtnTxt.setString(data.name);
                        this._provinceBtnTxt.setTextColor(cs.BLACK);
                        this._inputProvinceId = data.id;

                        //if(this._cityPanel.isVisible())
                        //{
                           this.refreshProvinceOrCityList(this._cityPanel);
                        //}

                        this.showProvinceOrCityPanel(this._provinceBtn);
                    }.bind(this));
                    array.push(cell);
                }
                this._isProvincePanelInit = true;
            }
        }
        else
        {
            if(this._lastCityPanelShowProvinceId == "" || this._lastCityPanelShowProvinceId != this._inputProvinceId)
            {
                needRefresh = true;
                listPanel.removeAllChildren();

                for (var i = 0; i< this._provinceData[this._inputProvinceId].length; i++)
                {
                    var cell = new ProvinceOrCityCell(this._provinceData[this._inputProvinceId][i], function(data)
                    {
                        cc.log("点击选择city + ")
                        this._cityBtnTxt.setString(data.name);
                        this._cityBtnTxt.setTextColor(cs.BLACK);
                        this._inputCityId = data.cityId;

                        this.showProvinceOrCityPanel(this._cityBtn);
                    }.bind(this));
                    array.push(cell);
                }

                this._lastCityPanelShowProvinceId = this._inputProvinceId;

                this._cityBtnTxt.setString(LocalString.getString("PLEASE_SELECT_CITY"));
                this._cityBtnTxt.setTextColor(cs.GRAY);
            }
        }

        if(needRefresh)
        {
            var playerPanel = UICommon.createPanelAlignWidgetsWithPadding(2, cc.UI_ALIGNMENT_VERTICAL_CENTER, array);
            if(playerPanel.height > listPanel.height){
                playerPanel = UICommon.createScrollViewWithContentPanel(playerPanel, cc.size(playerPanel.width, listPanel.height-30), ccui.ScrollView.DIR_VERTICAL);
            }

            listPanel.addChild(playerPanel);
            playerPanel.setPos(cc.p(listPanel.width * 0.5, listPanel.height - 15), ANCHOR_TOP);
        }
    },

    isNormalBank: function(bank)
    {
        for(var k in this._bankData)
        {
            if(bank.indexOf(k) >=0 )
                return k;
        }
        return "";
    },

     showResultPanel: function(visible, orderNo)
     {
        this._scrollview.setVisible(!visible);
        this._resultPanel.setVisible(visible);

        if(visible)
        {
            this._resultOrderNoTxt.setString(cc.formatStr(LocalString.getString("CASH_OUT_TIP_YOUR_ORDER"), orderNo));
        }

     }
}

);

/**
 * Created by Jony on 2016/9/7.
 */
/*
 * 选择省市cell
 * */
var ProvinceOrCityCell = ccui.Layout.extend({
    _provinceOrCityInfo: undefined,
    _clickCallback: undefined,

    ctor:function( provinceOrCityInfo, clickCallback )
    {
        this._super();
        this.setContentSize(cc.size(490,69));
        this._provinceOrCityInfo = provinceOrCityInfo;
        this._clickCallback = clickCallback;

        this.initUI();
    },

    cleanup:function()
    {
        this.removeAllCustomListeners();
        this._super();
    },

    initUI:function( )
    {
        var name = new ccui.Text(this._provinceOrCityInfo.name, FONT_ARIAL_BOLD, 24);
        name.setTextColor(cs.BLACK);
        this.addChild(name);
        name.setPos(leftInner(this), ANCHOR_LEFT);
        name.setPositionXAdd(34);

        //响应点击面板
        var touchPanel = this._touchPanel = ccui.Layout();
        touchPanel.setContentSize(this.getContentSize());
        this.addChild(touchPanel);
        touchPanel.setTouchEnabled(true);
        touchPanel.addClickEventListener(function() {
            this._clickCallback(this._provinceOrCityInfo);

            //this.setHighlight(true);
        }.bind(this));

        //this.setHighlight();
    },

    setHighlight:function(isHighLight)
    {
        if(isHighLight || isHighLight == undefined)
        {
            this.setBackGroundColorEx(cc.color(150, 200, 255));
            this.setBackGroundColorOpacity(30);
        }
        else
        {
            this.setBackGroundColorEx(cc.color(45, 75, 109));
        }
    }
});
