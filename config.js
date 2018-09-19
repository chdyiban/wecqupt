/**
 * 小程序配置文件
 */
var system = wx.getSystemInfoSync();
console.log(system);
// 此处主机域名修改成腾讯云解决方案分配的域名
if (system.brand == 'devtoolss') {
  var host = 'http://localhost/fastadmin';
  var api = host + '/public/api';
}else{
  var host = 'https://service.knocks.tech';
  var api = host + '/?s=api';
}

var config = {

  service: {
    host,
    api,
    //初始化url
    initUrl: `${api}/wxuser/info`,
    initUnloginUrl: `${api}/wxuser/init`,
    //维修url
    repairListUrl: `${api}/repair/get_list`,
    repairTypeUrl: `${api}/repair/get_repair_type`,
    repairAreaUrl: `${api}/repair/get_repair_areas`,
    repairSubmitUrl: `${api}/repair/submit`,
    repairDetailService: `${api}/repair/get_repair_detail`,
    repairRateSubmitUrl: `${api}/repair/submit_rate`,
    //获取课表
    kebiaoUrl: `${api}/course`,
    //获取成绩
    scoreUrl:`${api}/portal/score`,
    //获取一卡通
    yikatongUrl: `${api}/portal/yikatong`,
    //获取图书馆
    booksUrl: `${api}/portal/books`,

    //获取空教室
    emptyRoomUrl: `${api}/portal/empty_room`,

    //新闻栏目导航
    newsNavUrl: `${api}/news/information/nav`,
    //新闻列表
    newsListUrl: `${api}/news/information/`,
    //新闻详情
    newsDetailUrl: `${api}/news/information/detail`,

    //门户绑定
    bindUrl: `${api}/wxuser/bind`,
    //完善信息
    appendUrl: `${api}/wxuser/append`,

    //上传
    uploadTokenUrl: `${api}/upload/token`,
  }
};



module.exports = config;