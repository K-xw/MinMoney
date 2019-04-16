//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/utils.js')

Page({
    data: {
        isActive:true,      //true 是支出  false 是收入
        money:'',  //金额
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        seleCategory: {
            id: '1',
            name: '饮食',
            img: 'food.png'
        }, //选中类别，默认为饮食
        date: '',   //日期
        note:'' //说明
    },
    onLoad: function() {
        // 获取用户信息
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        }
        this.setData({
            date: util.formatDate(new Date())
        })
        this.onGetOpenid();
        
    },
    //获取openid
    onGetOpenid: function () {
        // 调用云函数
        wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
                console.log('[云函数] [login] user openid: ', res.result.openid)
                app.globalData.openid = res.result.openid
            },
            fail: err => {
                console.error('[云函数] [login] 调用失败', err)
            }
        })
    },
    //事件处理函数
    //  支出 和 收入 之间的切换
    changeClass:function(e){
        let active = e.currentTarget.dataset.active;       
        if (!active){     
            this.setData({
                isActive: !this.data.isActive
            })       
        }
    },
    //跳转到类别管理
    tapCategory: function () {
        wx.navigateTo({
            url: '../category/category?bool=' + this.data.isActive
        })
    },
    getUserInfo: function(e) {
        console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
    //日期选择器函数
    bindDateChange(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            date: e.detail.value
        })
    },
    //实时监听金额input的值
    confirmMoney(e) {
        this.setData({
            money: e.detail.value
        })
    },
    //实时监听说明input的值
    confirmNote(e) {
        this.setData({
            note: e.detail.value
        })
    },
    //提交表单，将用户数据添加到云端数据库
    submit(e){
        var record = {};
        record.money = this.data.money;
        record.seleCategory = this.data.seleCategory;
        record.seleDate = this.data.date;
        record.note = this.data.note;
        record.active = this.data.isActive;

    //    console.log(record)
        wx.cloud.callFunction({
            // 云函数名称
            name: 'addData',
            // 传给云函数的参数
            data: {
                record: record
            },
        }).then(res => {
                console.log(res) 
            })
            .catch(console.error)

    }
    
})