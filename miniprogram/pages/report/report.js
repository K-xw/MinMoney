// pages/report/report.js

//获取应用实例
const app = getApp()
const util = require('../../utils/utils.js')

Page({
    /**
     * 页面的初始数据
     */
    data: {
        selectShow: false, //初始option不显示
        nowText: "分类", //初始内容
        animationData: {}, //右边箭头的动画
        logs: [],
        selectArray: [],
        date:'本月',
        openid:'',
        moneyList:[],   //当前页面 数据数组
        spendCount:0,   //支出总金额
        incomeCount:0,   //收入 总金额
        _month:'',   //用来条件查询
        delBtnWidth: 185, //删除按钮宽度单位（rpx）
    },
    //跳转到统计页面
    tapChart: function() {
        wx.navigateTo({
            url: '../chart/chart'
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let nowDate = util.formatDateMonth(new Date());

        this.setData({
            selectArray: app.globalData.category,
            openid: app.globalData.openid,
            _month: nowDate.split('-')[1]
        })
        console.log("report.js",this.data.openid)
        this.initData()
        this.initEleWidth();
    },
    //初始数据
    initData: function(o){
        var that = this;
        var result = []
        //获取数据库
        //获取数据库里的Money集合
        const db = wx.cloud.database({
            env: 'test-6e75df'
        });
        if (arguments.length > 0){      //判断是否有参数，若有，则是修改查询条件 seleDate的正则
            if(o.categoryid.length > 0){
                if (o.categoryid != '0'){
                    var _id = o.categoryid;
                } 
            }
            var d = o.dat
            var _year = util.formatDateYear(new Date());
            var _date = _year + '-' + d;
            var reg_date = new RegExp(_date);
    
        }else{
            var _date = util.formatDateMonth(new Date());
            var reg_date = new RegExp(_date);

        }
        db.collection('Money').where({
            _openid: this.data.openid, // 填入当前用户 openid
            seleDate: reg_date,
            'category.id': _id,
        }).get({
            success:res => {
                console.log("report.js",res.data)
                if (res.data.length == 0){
                    wx.showToast({
                        image: '/images/none.png',
                        title: '本月没有数据',
                    })
                }
                res.data.reverse()
                this.setData({
                    moneyList: res.data
                })
                that.countMoney(this.data.moneyList)
            }
        })
    },
    //计算 支出 、收入 总金额
    countMoney: function(arr){
        if (this.data.spendCount > 0 || this.data.incomeCount > 0){
            this.setData({
                spendCount: 0,
                incomeCount: 0
            })
        }
        for(let i=0; i<arr.length; i++){
            var item = arr[i];
            if (item.active){
                var spend = parseFloat(item.money.split('-')[1])
                this.setData({
                    spendCount: this.data.spendCount + spend,
                })
            }else{
                var n = item.money.split('+')[1];
                var income = parseFloat(n)
                this.setData({
                    incomeCount: this.data.incomeCount + income,
                })
            }
        }
    },
    //option的显示与否
    selectToggle: function() {
        var nowShow = this.data.selectShow; //获取当前option显示的状态
        //创建动画
        var animation = wx.createAnimation({
            timingFunction: "ease"
        })
        this.animation = animation;
        if (nowShow) {
            animation.rotate(0).step();
            this.setData({
                animationData: animation.export()
            })
        } else {
            animation.rotate(180).step();
            this.setData({
                animationData: animation.export()
            })
        }
        this.setData({
            selectShow: !nowShow
        })
    },
    //设置内容
    setText: function(e) {
        var nowIdx = e.currentTarget.dataset.index; //当前点击的索引 对象
        let obj = {}
        obj.categoryid = nowIdx.id
        obj.dat = this.data._month

        //再次执行动画，注意这里一定，一定，一定是this.animation来使用动画
        this.animation.rotate(0).step();
        this.setData({
            selectShow: false,
            animationData: this.animation.export()
        })
        this.initData(obj)
    },
    //日期选择器函数
    bindDateChange(e) {
        let seleDate = e.detail.value;
        let nowDate = util.formatDateMonth(new Date());
        console.log('picker发送选择改变，携带值为', seleDate);
        console.log(nowDate)

        /** 为iphone6 时间选择器 做兼容处理 */
        var year = seleDate.split('-')[0]
        var mon = seleDate.split('-')[1]
        if ( year.length == 2){
            seleDate = 2000 + parseInt(year,10)
            seleDate = seleDate + '-' + mon;
        }
        console.log("兼容之后的：", seleDate)

        if ( seleDate != nowDate ) {
            var seleM =seleDate.split('-')[1];
            this.setData({
                date: seleM+"月",
                _month: seleM
            })
        }else{
            var seleM = seleDate.split('-')[1];
            this.setData({
                date: '本月',
                _month: nowDate.split('-')[1]
            })
        }
        let obj = new Object()
        obj.categoryid = '';
        obj.dat = seleM;
        this.initData(obj)
    },
    //获取元素自适应后的实际宽度 
    getEleWidth: function (w) {
        var real = 0;
        try {
            var res = wx.getSystemInfoSync().windowWidth;
            var scale = (750 / 2) / (w / 2); //以宽度750px设计稿做宽度的自适应 
            // console.log(scale); 
            real = Math.floor(res / scale);
            return real;
        } catch (e) {
            return false;
            // Do something when catch error 
        }
    },
    initEleWidth: function () {
        var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
        this.setData({
            delBtnWidth: delBtnWidth
        });
    },

    // 开始滑动事件
    touchS: function (e) {
        if (e.touches.length == 1) {
    //        console.log("touchS", e)
            this.setData({
                //设置触摸起始点水平方向位置 
                startX: e.touches[0].clientX
            });
        }
    },
    touchM: function (e) {
   //     console.log("touchM", e)
        if (e.touches.length == 1) {
            //手指移动时水平方向位置 
            var moveX = e.touches[0].clientX;
            //手指起始点位置与移动期间的差值 
            var disX = this.data.startX - moveX;
            var delBtnWidth = this.data.delBtnWidth;
            var txtStyle = "";
            if (disX == 0 || disX < 0) { //如果移动距离小于等于0，文本层位置不变 
                txtStyle = "left:0px";
            } else if (disX > 0) { //移动距离大于0，文本层left值等于手指移动距离 
                txtStyle = "left:-" + disX + "px";
                if (disX >= delBtnWidth) {
                    //控制手指移动距离最大值为删除按钮的宽度 
                    txtStyle = "left:-" + delBtnWidth + "px";
                }
            }
            //获取手指触摸的是哪一项 
            var index = e.currentTarget.dataset.index;
            var moneyList = this.data.moneyList;
            moneyList[index].shows = txtStyle;
    //        console.log("1", moneyList[index].shows);
            //更新列表的状态 
            this.setData({
                moneyList: moneyList
            });
        }
    },
    // 滑动中事件
    touchE: function (e) {
    //    console.log("touchE", e)
        if (e.changedTouches.length == 1) {
            //手指移动结束后水平位置 
            var endX = e.changedTouches[0].clientX;
            //触摸开始与结束，手指移动的距离 
            var disX = this.data.startX - endX;
            var delBtnWidth = this.data.delBtnWidth;
            //如果距离小于删除按钮的1/2，不显示删除按钮 
            var txtStyle = "";
            txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "px" : "left:0px";

    //        console.log("touchE", txtStyle)
    //        console.log("touchE", disX)
    //        console.log("touchE", delBtnWidth)
    //        console.log("touchE  更新前", this.data.moneyList)
            //获取手指触摸的是哪一项 
            var index = e.currentTarget.dataset.index;
            var moneyList = this.data.moneyList;
            moneyList[index].shows = txtStyle;
   //         console.log("1", moneyList[index].shows);
            //更新列表的状态 
            this.setData({
                moneyList: moneyList
            });

        } else {
            console.log("2");
        }
    },
    //点击删除按钮事件
    delItem: function (e) {
        //获取列表中要删除项的下标
        var index = e.currentTarget.dataset.index;
        var _id = e.currentTarget.dataset.id;  // 唯一标识 _id 用来删除数据库里的数据
        var moneyList = this.data.moneyList;
        //移除列表中下标为index的项
        moneyList.splice(index, 1);
        //更新列表的状态
        this.setData({
            moneyList: moneyList
        });
        console.log(_id)
        //获取数据库
        //获取数据库里的Money集合
        const db = wx.cloud.database({
            env: 'test-6e75df'
        });
        try {
            db.collection('Money').doc(_id).remove().then(res=>{
        //        console.log(res)
        //        console.log(res.stats.removed)
                if (res.stats.removed == 1){
                    wx.showToast({
                        title: '删除成功！',
                    })
                    
                }
            })
        } catch (e) {
            console.error(e)
        }

    },

})