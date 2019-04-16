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
        moneyList:[]
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
        this.setData({
            selectArray: app.globalData.category,
            openid: app.globalData.openid
        })
        console.log(this.data.openid)
        this.initData()
        
    },
    //初始数据
    initData: function(){
        //获取数据库
        //获取数据库里的Money集合
        const db = wx.cloud.database({
            env: 'test-6e75df'
        });

        db.collection('Money').where({
            _openid: this.data.openid // 填入当前用户 openid
        }).get({
            success:res => {
                console.log(res.data)
                this.setData({
                    moneyList: res.data
                })
                
            }
        })
        
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
        var nowData = this.properties.propArray; //当前option的数据是引入组件的页面传过来的，所以这里获取数据只有通过this.properties
        var nowIdx = e.target.dataset.index; //当前点击的索引
        var nowText = nowData[nowIdx].text; //当前点击的内容
        //再次执行动画，注意这里一定，一定，一定是this.animation来使用动画
        this.animation.rotate(0).step();
        this.setData({
            selectShow: false,
            nowText: nowText,
            animationData: this.animation.export()
        })
    },
    //日期选择器函数
    bindDateChange(e) {
        
        /*this.setData({
          date: e.detail.value
        })*/
        let seleDate = e.detail.value;
        let nowDate = util.formatDateMonth(new Date());
        console.log('picker发送选择改变，携带值为', seleDate);
        console.log(nowDate)        
        if ( seleDate != nowDate ) {
            let seleM =seleDate.split('-')[1];
        //    let seleM = parseInt(seleDate.split('-')[1],10);

            this.setData({
                date: seleM+"月"
            })
        }
    }
})