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
        _month:''   //用来条件查询
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
        console.log(this.data.openid)
        this.initData()

    },
    //初始数据
    initData: function(o){
        var that = this;
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
                console.log(res.data)
                if (res.data.length == 0){
                    wx.showToast({
                        image: '/images/none.png',
                        title: '本月没有数据',
                    })
                }
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
    }
})