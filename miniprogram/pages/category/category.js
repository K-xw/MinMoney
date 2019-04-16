//category.js
//获取应用实例
const app = getApp()

Page({
    data: {
        categoryList: []
    },
    onLoad: function(options){
        let cate = options.bool;
        if (cate == 'true'){
            this.setData({
                categoryList: app.globalData.spendCategory
            })
        }else{
            this.setData({
                categoryList: app.globalData.incomeCategory
            })
        }   	
    },
    confirmCategory(event){      
        var pages = getCurrentPages();  //获取页面栈的实例
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面

        //获得当前点击类别对象
        var currCategory = event.currentTarget.dataset.item;
        
        prevPage.setData({
            seleCategory : currCategory
        });
        
        //跳回上一个页面
        wx.navigateBack({
            delta: 1
        })
    }
})
