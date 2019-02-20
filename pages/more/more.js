//more.js
//获取应用实例
var app = getApp();
var config = require('../../config');
Page({
  data: {
    user: {}
  },
  onShow: function(){
    this.getData();
  },
  getData: function(){
    var _this = this;
    var days = ['一','二','三','四','五','六','日'];
    _this.setData({
      'user': app._user,
      'time': {
        'term': app._time.term,
        'week': app._time.week,
        'day': days[app._time.day - 1]
      },
      'is_bind': !!app._user.is_bind
    });
  },
  getPhoneNumber(e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    wx.showNavigationBarLoading();
    wx.request({
      url: config.service.wxmobileUrl,
      method: 'POST',
      data: app.key({
        openid: app._user.openid,
        iv: e.detail.iv,
        encryptedData: e.detail.encryptedData
      }),
      success: function (res) {
        if (res.data && res.data.status === 200) {
          var info = res.data.data;
          console.log(info)
        } else {

        }
      },
      fail: function (res) {
      
        console.warn('网络错误');
      },
      complete: function () {
        wx.hideNavigationBarLoading();
      }
    });
  }
});