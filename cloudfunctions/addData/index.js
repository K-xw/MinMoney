// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//获取数据库
//获取数据库里的Money集合
const db = cloud.database({
    env: 'test'
})


// 云函数入口函数
exports.main = async (event, context) => {
    var result;
    const record = event.record;
    const wxContext = cloud.getWXContext()
      
    let user_openid = wxContext.OPENID;

    var cate = JSON.stringify(record.seleCategory)

    var collection = db.collection(user_openid);
    if ( !collection ){
        db.createCollection(user_openid)
            .then(res => {
                result = res
            })
            .catch(console.error)
    } else{
        result = collection
    }

    
/*    db.add({
        data: {
            _openId: user_openid,
            userName: '柯_xw',
            money:record.money,
            category: cate,
            seleDate: record.seleDate,
            note:record.note,
            active:record.active
        },
        success: function (res) {
            //  输出成功插入后的id以及其他信息
            result = res
        }
    })
*/    
    return {msg:'插入失败'}
}