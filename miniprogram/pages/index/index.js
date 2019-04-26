//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/utils.js')

Page({
    data: {
        _date:'',   //当前日期，始终不变
        isActive: true, //true 是支出  false 是收入
        money: '', //金额
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        seleCategory: {
            id: '1',
            name: '饮食',
            img: 'food.png'
        }, //选中类别，默认为饮食
        date: '', //日期
        note: '', //说明
        openid:'',
    //    counterId:'',
        insertMoney:''
    },
    onLoad: function() {
        // 获取用户信息
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
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
            date: util.formatDate(new Date()),
            _date:util.formatDate(new Date())
        })

        this.onGetOpenid();

    },
    
    //获取openid
    onGetOpenid: function() {
        // 调用云函数
        wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
                console.log('[云函数] [login] user openid: index.js ', res.result.openid)
                app.globalData.openid = res.result.openid
                this.setData({
                    openid : res.result.openid
                })
            },
            fail: err => {
                console.error('[云函数] [login] 调用失败', err)
            }
        })
    },
    //事件处理函数
    //  支出 和 收入 之间的切换
    changeClass: function(e) {
        let active = e.currentTarget.dataset.active;
        if (!active) {
            this.setData({
                isActive: !this.data.isActive,
                money:'',
                note:''
            })
        }
    },
    //跳转到类别管理
    tapCategory: function() {
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
    //监听 金额input 和 说明textarea 的值
    inputWatch:function(e){
        console.log(e);
        let item = e.currentTarget.dataset.model;
        this.setData({
            [item]: e.detail.value
        });
    //    console.log(item, this.data.money)
    //   console.log(item, this.data.note)
    },
    //实时监听金额input的值
    confirmMoney(e) {
        this.setData({
            money: e.detail.value
        })
    //    console.log("金额input", e.detail.value)
    },
    //实时监听说明input的值
    confirmNote(event) {
        this.setData({
            note: event.detail.value
        })
        console.log("说明input", event.detail.value)
    },
    //提交表单，将用户数据添加到云端数据库
    submit(e) {
        this.onAdd();
    },
    //向数据库插入数据
    onAdd: function() {
        if (this.data.isActive) {
            this.setData({
                insertMoney: "-" + this.data.money
            })
        } else {
            this.setData({
                insertMoney: "+" + this.data.money
            })
        }
        //获取数据库
        //获取数据库里的Money集合
        const db = wx.cloud.database({
            env: 'test-6e75df'
        });
       
        db.collection('Money').add({
            data: {
                _openId: this.data.openid,
                money: this.data.insertMoney,
                category : this.data.seleCategory,
                seleDate : this.data.date,
                note : this.data.note,
                active :this.data.isActive
            },
            success: res => {
                // 在返回结果中会包含新创建的记录的 _id
            //    this.setData({
            //        counterId: res._id,
            //    })
                wx.showToast({                  
                    title: '新增记录成功',
                })
                this.setData({
                    money: '',
                    note:'',
                    date: _date

                })
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '新增记录失败'
                })
                console.error('[数据库] [新增记录] 失败：', err)
            }
        })

    }

})