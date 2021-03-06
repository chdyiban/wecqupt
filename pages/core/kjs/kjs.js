//kjs.js
//获取应用实例
var app = getApp();
var config = require('../../../config');
// 定义常量数据
var WEEK_DATA = ['', '第一周', '第二周', '第三周', '第四周', '第五周', '第六周', '第七周', '第八周', '第九周', '第十周','十一周', '十二周', '十三周', '十四周', '十五周', '十六周', '十七周', '十八周', '十九周', '二十周'],
    DAY_DATA = ['', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    CLASSTIME_DATA = ['', {time: '1-2节', index: '1@2'}, {time: '3-4节', index: '3@4'}, {time: '5-6节', index: '5@6'},
                      {time: '7-8节', index: '7@8'}, {time: '9-11节', index: '9@11'}],
    BUILDING_DATA = ['宏远', '明远', '修远'];


// 处理数组classNo
function getHandledClassNo(classNo){
  var result = '';
  classNo.forEach(function(value,index){
    if(value){
      if(index === 1){
        result = CLASSTIME_DATA[index].index;
      }else if(index > 1){
        result = result + '@' + CLASSTIME_DATA[index].index;
      }
    }
  });
  return result;
}
Page({
  data: {
    DATA: {
      WEEK_DATA: WEEK_DATA,
      DAY_DATA: DAY_DATA,
      CLASSTIME_DATA: CLASSTIME_DATA,
      BUILDING_DATA: BUILDING_DATA,
    },
    active: { // 发送请求的数据对象 初始为默认值
      weekNo: 1,
      weekDay: 1,
      buildingNo: 2,
      classNo: ['',true,false,false,false,false,false],
    },
    nowWeekNo: 1,
    testData: null
  },

  onLoad: function(){
    this.setData({
      'nowWeekNo': app._time.week,
      'active.weekNo': app._time.week
    });
    // 初始默认显示
    this.sendRequest();
  },

  //下拉更新
  onPullDownRefresh: function(){

    this.sendRequest();
  },

  // 发送请求的函数
  sendRequest: function(query, bd){
    
    app.showLoadToast();

    var that = this;
    var query = query || {}, activeData = that.data.active;
    var requestData = {
      weekNo: query.weekNo || activeData.weekNo,
      weekDay: query.weekDay || activeData.weekDay,
      classNo: getHandledClassNo(query.classNo || activeData.classNo),
      buildingNo: query.buildingNo || activeData.buildingNo,
      openid: app._user.openid,
    };

    // 对成功进行处理
    function doSuccess(data) {

      that.setData({
        'testData': data,
        'errObj.errorDisplay': true
      });
    }

    // 对失败进行处理
    function doFail(message) {

      app.showErrorModal(message);
    }

    // 发送请求
    wx.request({
      url: config.service.emptyRoomUrl, 
      method: 'POST',
      data: app.key(requestData),
      success: function(res) {
        if(res.data && res.data.status === 200){
          doSuccess(res.data.data);
          //执行回调函数
          if(bd){ bd(that); }
        }else{
          doFail(res.data.message);
        }
      },
      fail: function(res) {
        doFail(res.errMsg);
      },
      complete: function() {
        wx.hideToast();
        wx.stopPullDownRefresh();
      }
    });
  },

  // week
  chooseWeek: function (e) {
    
    var index = parseInt(e.target.dataset.weekno, 10);
    
    if(isNaN(index)){ return false; }

    this.sendRequest({
      weekNo: index
    }, function(that){
      that.setData({
        'active.weekNo': index
      });
    });
  },

  // day
  chooseDay: function (e) {

    var index = parseInt(e.target.dataset.dayno, 10);
    
    if(isNaN(index)){ return false; }

    this.sendRequest({
      weekDay: index
    }, function(that){
      that.setData({
        'active.weekDay': index
      });
    });
  },

  // classTime
  chooseClaasTime: function (e) {
    
    var index = e.target.dataset.classno,
        classNo = this.data.active.classNo,
        selectNum = 0;
    console.log(classNo);
    classNo.forEach(function(value){
      if(value)
        ++selectNum;
    });
    if (classNo[index] && selectNum > 1){
      classNo[index] = !classNo[index];
    }else{
      classNo[index] = true;
    }
    if(isNaN(index)){ return false; }

    this.sendRequest({
      classNo: classNo
    }, function(that){
      that.setData({
        'active.classNo': classNo
      });
    });
  },

  // building
  chooseBuilding: function (e) {
    
    var index = parseInt(e.target.dataset.buildingno, 10);
    
    if(isNaN(index)){ return false; }

    this.sendRequest({
      buildingNo: index
    }, function(that){
      that.setData({
        'active.buildingNo': index
      });
    });
  }
});