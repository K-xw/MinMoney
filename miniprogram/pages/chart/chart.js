// pages/chart/chart.js

const util = require('../../utils/utils.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isActive: true, //true 是支出  false 是收入
        date: '本月',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let nowDate = util.formatDateMonth(new Date());

        this.setData({
            date: nowDate
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

   

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

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
        if (year.length == 2) {
            seleDate = 2000 + parseInt(year, 10)
            seleDate = seleDate + '-' + mon;
        }
        console.log("兼容之后的：", seleDate)

        if (seleDate != nowDate) {
            var seleM = seleDate.split('-')[1];
            this.setData({
                date: seleM + "月",
            })
        } else {
            var seleM = seleDate.split('-')[1];
            this.setData({
                date: '本月',
            })
        }
        
    }
   
})