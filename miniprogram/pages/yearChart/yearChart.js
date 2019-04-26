// pages/yearChart/yearChart.js
const util = require('../../utils/utils.js')
const wxCharts = require('../../utils/wxcharts-min.js')

const app = getApp();
var yearArr = []
var flag = true //标志

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isActive: true, //true 是支出  false 是收入
        isSele: true,    // true 是分类 false 是月份
        count: '',    //账单 数量
        monTotal: 0,    //算钱的
        date: '',
        openid: '',
        cateSeries: [],//用来 画 饼图的 数据
        monSeries: {},  //用来 画 柱状图的 数据
        tit: '总支出',
        year: '',
        selectShow: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let nowDate = util.formatDateMonth(new Date());
        let _year = nowDate.split('-')[0]
        this.setData({
            date: nowDate,
            year: _year,
            openid: app.globalData.openid,
        })
        yearArr = []
        this.getAll(0, this.piecb)
    },

    //  支出 和 收入 之间的切换
    changeClass: function (e) {
        let active = e.currentTarget.dataset.active;
        if (!active) {
            this.setData({
                isActive: !this.data.isActive,
            })
        }
        if (this.data.isActive) {
            this.setData({
                tit: '总支出',
                monTotal:0,
                count: ''
            })
        } else {
            this.setData({
                tit: '总收入',
                monTotal: 0,
                count: ''
            })
        }
   //     this.setData({
    //        isSele: true,
    //    })
        yearArr = []
        this.getAll(0, this.piecb)
    },
    // 分类 和 月份 之间的切换
    changeChart: function (e) {
        let select = e.currentTarget.dataset.select;
        if (!select) {
            this.setData({
                isSele: !this.data.isSele,
            })
        }
        let cate = e.currentTarget.dataset.cate;
        if (cate == 'month') {
            console.log(cate)

            yearArr = []
            this.getallMon(0, this.columcb)
            let _year = this.data.date.split('-')[0]
            this.setData({
                year: _year
            })
            
        } else if (cate == 'cate') {
            yearArr = []
            this.getAll(0, this.piecb)
        }
    },
    //获取一整年的数据 有 支出 与 收入 之分
    getAll: function (num, cb) {
        //获取数据库
        //获取数据库里的Money集合
        var _cb = cb
        var year = this.data.year
        var reg_date = new RegExp(year);
        console.log(reg_date)
        const db = wx.cloud.database({
            env: 'test-6e75df'
        });
        db.collection('Money').where({
            _openid: this.data.openid, // 填入当前用户 openid
            seleDate: reg_date,
            active: this.data.isActive,
        })
            .skip(num)
            .get({
                success: res => {
                    if (res.data.length == 0) {
                        if (flag) {
                            wx.showToast({
                                image: '/images/none.png',
                                title: '没有数据',
                            })
                            this.setData({
                                selectShow: false,
                                count: '0',
                                monTotal: 0
                            })
                            return
                        }
                        _cb(yearArr)
                    } else {
                        flag = false
                        
                        yearArr = yearArr.concat(res.data)
                        console.log(yearArr)
                        this.getAll(num + 20, _cb)
                    }
                }
            })
    },
    //  一年的月份 画图 的数据
    getallMon: function (num, cb) {
        //获取数据库
        //获取数据库里的Money集合
        var _cb = cb
        var year = this.data.year
        console.log(year)
        var reg_date = new RegExp(year);
        console.log(reg_date)
        const db = wx.cloud.database({
            env: 'test-6e75df'
        });
        db.collection('Money').where({
            _openid: this.data.openid, // 填入当前用户 openid
            seleDate: reg_date
        })
            .skip(num)
            .get({
                success: res => {
                    console.log(res.data)
                    if (res.data.length == 0) {
                        if (flag) {
                            wx.showToast({
                                image: '/images/none.png',
                                title: '没有数据',
                            })
                            this.setData({
                                selectShow: false,
                                count: '0',
                                monTotal: 0
                            })
                            return
                        }
                        _cb(yearArr)
                    } else {
                        flag = false
                        console.log("askdhkjh")
                        yearArr = yearArr.concat(res.data)
                        console.log("yearArr", yearArr)
                        this.getallMon(num + 20, _cb)
                    }
                }
            })
    },
    // 处理 一年的月份 数据，用于画 饼图 分类用的
    piecb: function (res) {
        console.log("columcb",res)
        var _monTotal = 0
        var result = []
        var oldarr = res
        var len = oldarr.length
        for (let i = 0; i < len; i++) {
            var tag = oldarr[i].category.id
            var flag = true
            var n = 0
            for (var j = 0; j < result.length; j++) {
                if (tag == result[j].id) {
                    flag = false
                    n = j
                    break
                }
            }
            if (flag) {
                var obj = {}
                obj.id = oldarr[i].category.id
                obj.name = oldarr[i].category.name
                var money = oldarr[i].money.split(/[+|-]/)[1]
                var m = parseFloat(money, 10)
                obj.data = m
                _monTotal += m
                result.push(obj)
            } else {
                var money = oldarr[i].money.split(/[+|-]/)[1]
                var m = parseFloat(money, 10)
                result[n].data += m
                _monTotal += m
            }
        }
        _monTotal = _monTotal.toFixed(2)
        this.setData({
            cateSeries: result,
            count: len,
            monTotal: _monTotal
        })
        if (result.length > 0) {
            this.pieChartShow()
        }
    },
    //显示 饼 图表
    pieChartShow: function () {
        var windowWidth = 150;
        try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
            console.log(windowWidth)
        } catch (e) {
            console.error('getSystemInfoSync failed!');
        }
        var pie = {
            animation: true,
            canvasId: 'pieCanvas',
            type: 'pie',
            series: this.data.cateSeries,
            width: windowWidth,
            height: 250,
            dataLabel: true,
        }
        var pieChart = new wxCharts(pie)
    },
    // 处理 一年的月份 数据，用于画 柱状图
    columcb: function (res) {
        this.setData({
            selectShow: true
        })
        console.log("chulishuju", res)
        var len = res.length
        var _newres = []
        for (let i = 0; i < len; i++) {
            var _date = res[i].seleDate.split('-')[1]
            var tag = _date
            var flag = true
            var n = 0
            for (let j = 0; j < _newres.length; j++) {
                if (tag == _newres[j].date) {
                    flag = false
                    n = j
                    break
                }
            }
            if (flag) {
                var obj = {}
                obj.date = _date
                if (res[i].active) {
                    obj.spend = parseFloat(res[i].money.split(/[+|-]/)[1], 10)
                } else {
                    obj.income = parseFloat(res[i].money.split('+')[1], 10)
                }
                _newres.push(obj)
            } else {
                if (res[i].active) {
                    _newres[n].spend += parseFloat(res[i].money.split(/[+|-]/)[1], 10)
                } else {
                    if (_newres[n].income == undefined) {
                        _newres[n].income = 0
                    }
                    _newres[n].income += parseFloat(res[i].money.split('+')[1], 10)
                }
            }
        }
        //进一步处理数据，符合 画图所用
        var seriesObj = {}
        seriesObj.mon = []
        seriesObj.data = []
        for (let m = 0; m < _newres.length; m++) {
            seriesObj.mon.push(_newres[m].date)
            var _data = (_newres[m].spend / _newres[m].income).toFixed(2)
            //    console.log("之处 / 收入", _data)
            seriesObj.data.push(_data)
        }
        console.log("处理后 seriesObj", seriesObj)
        //对数据按照月份排序
        for (let n = 0; n < seriesObj.mon.length - 1; n++) {
            for (let k = 0; k < seriesObj.mon.length - n - 1; k++) {
                var pre = parseInt(seriesObj.mon[k], 10)
                var next = parseInt(seriesObj.mon[k + 1], 10)
                if (pre > next) {
                    var _mon = seriesObj.mon[k]
                    seriesObj.mon[k] = seriesObj.mon[k + 1]
                    seriesObj.mon[k + 1] = _mon

                    var _d = seriesObj.data[k]
                    seriesObj.data[k] = seriesObj.data[k + 1]
                    seriesObj.data[k + 1] = _d
                }
            }
        }
        for (let a = 0; a < seriesObj.mon.length; a++) {
            seriesObj.mon[a] = seriesObj.mon[a] + "月"
        }
        console.log("排序后 seriesObj", seriesObj)
        this.setData({
            monSeries: seriesObj
        })
        this.columnChartShow()
    },
    //显示 柱状图
    columnChartShow: function () {
        var windowWidth = 320;
        try {
            var res = wx.getSystemInfoSync();
            console.log(res)
            windowWidth = res.windowWidth * 0.9;
        } catch (e) {
            console.error('getSystemInfoSync failed!');
        }
        console.log(windowWidth)
        var column = {
            canvasId: 'columnCanvas',
            type: 'column',
            animation: true,
            categories: this.data.monSeries.mon,
            series: [{
                name: '支出/收入',
                data: this.data.monSeries.data,
            }],
            yAxis: {
                min: 0
            },

            xAxis: {
                disableGrid: false,
                type: 'calibration'
            },
            extra: {
                column: {
                    width: 10
                }
            },
            width: windowWidth,
            height: 200,
        }
        var columnChart = new wxCharts(column)
        console.log(windowWidth,"ssadsd")
    },
    //改年
    bindDateChangeYear(e) {
        let seleYear = e.detail.value;
        console.log('picker发送选择改变，携带值为', seleYear);
        this.setData({
            year: seleYear
        })
        console.log(this.data.year)
        yearArr = []
        flag = true
        this.getallMon(0, this.columcb)
    },
})