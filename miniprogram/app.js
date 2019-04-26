//app.js
App({
    onLaunch: function() {

        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                traceUser: true,
            })
        }

        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })
        //获取openid
        // 调用云函数
        wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
                console.log('[云函数] [login] user openid: app.js', res.result.openid)
                this.globalData.openid = res.result.openid
                console.log('this.globalData.openid app.js', this.globalData.openid)
            },
            fail: err => {
                console.error('[云函数] [login] 调用失败', err)
            }
        })
        this.globalData = {
            userInfo: null,
            openid: '',
            userName: '',
            category: [{
                    id: '0',
                    name: '全部消费',
                    img: 'cart.png'
                }, {
                    id: '1',
                    name: '饮食',
                    img: 'food.png'
                },
                {
                    id: '2',
                    name: '服饰美容',
                    img: 'clothing.png'
                }, {
                    id: '3',
                    name: '生活日用',
                    img: 'daily.png'
                },
                {
                    id: '4',
                    name: '住房缴费',
                    img: 'house.png'
                },
                {
                    id: '5',
                    name: '交通出行',
                    img: 'traffic.png'
                }, {
                    id: '6',
                    name: '通讯',
                    img: 'chat.png'
                },
                {
                    id: '7',
                    name: '文教娱乐',
                    img: 'play.png'
                }, {
                    id: '8',
                    name: '健康',
                    img: 'health.png'
                },
                {
                    id: '9',
                    name: '理财',
                    img: 'financial.png'
                }, {
                    id: '10',
                    name: '保险',
                    img: 'insurance.png'
                },
                {
                    id: '11',
                    name: '借还款',
                    img: 'replay.png'
                }, {
                    id: '12',
                    name: '人情往来',
                    img: 'human.png'
                },
                {
                    id: '13',
                    name: '公益',
                    img: 'love.png'
                }, {
                    id: '14',
                    name: '小买卖',
                    img: 'businesses.png'
                },
                {
                    id: '15',
                    name: '酬劳',
                    img: 'salary.png'
                }, {
                    id: '16',
                    name: '奖金',
                    img: 'bonus.png'
                },
                {
                    id: '17',
                    name: '其他',
                    img: 'other.png'
                }
            ],
            spendCategory: [{
                    id: '1',
                    name: '饮食',
                    img: 'food.png'
                }, {
                    id: '2',
                    name: '服饰美容',
                    img: 'clothing.png'
                },
                {
                    id: '3',
                    name: '生活日用',
                    img: 'daily.png'
                }, {
                    id: '4',
                    name: '住房缴费',
                    img: 'house.png'
                },
                {
                    id: '5',
                    name: '交通出行',
                    img: 'traffic.png'
                }, {
                    id: '6',
                    name: '通讯',
                    img: 'chat.png'
                },
                {
                    id: '7',
                    name: '文教娱乐',
                    img: 'play.png'
                }, {
                    id: '8',
                    name: '健康',
                    img: 'health.png'
                },
                {
                    id: '9',
                    name: '理财',
                    img: 'financial.png'
                }, {
                    id: '10',
                    name: '保险',
                    img: 'insurance.png'
                },
                {
                    id: '11',
                    name: '借还款',
                    img: 'replay.png'
                }, {
                    id: '12',
                    name: '人情往来',
                    img: 'human.png'
                },
                {
                    id: '13',
                    name: '公益',
                    img: 'love.png'
                }, {
                    id: '14',
                    name: '小买卖',
                    img: 'businesses.png'
                },
                {
                    id: '15',
                    name: '酬劳',
                    img: 'salary.png'
                }, {
                    id: '17',
                    name: '其他',
                    img: 'other.png'
                }
            ],
            incomeCategory: [{
                    id: '9',
                    name: '理财',
                    img: 'financial.png'
                }, {
                    id: '10',
                    name: '保险',
                    img: 'insurance.png'
                },
                {
                    id: '11',
                    name: '借还款',
                    img: 'replay.png'
                }, {
                    id: '12',
                    name: '人情往来',
                    img: 'human.png'
                },
                {
                    id: '13',
                    name: '公益',
                    img: 'love.png'
                }, {
                    id: '14',
                    name: '小买卖',
                    img: 'businesses.png'
                },
                {
                    id: '15',
                    name: '酬劳',
                    img: 'salary.png'
                }, {
                    id: '16',
                    name: '奖金',
                    img: 'bonus.png'
                },
                {
                    id: '17',
                    name: '其他',
                    img: 'other.png'
                }
            ]
        }
    }
})