//append.js
//获取应用实例
var app = getApp();
var config = require('../../config');
Page({
  data: {
    remind: '加载中',
    building_list: ['1','2','3','4','5','6','8','9',
      '10','11','12','15','16','17','18','19'
    ],  //寝室楼栋
    buildings: ['1号公寓（西区）', '2号公寓（西区）', '3号公寓（西区）', '4号公寓（西区）', '5号公寓（西区）', '6号公寓（西区）', '7号公寓（东区）', '8号公寓（东区）', '9号公寓（东区）', '10号公寓（东区）', '11号公寓（东区）', '12号公寓（东区）', '13号公寓（东区）', '14号公寓（东区）', '15号公寓（东区）', '16号公寓（东区）', '17号公寓（西区）', '18号公寓（西区）', '19号公寓（西区）'], // picker-range
    ibuilding: false,  // picker-index
    room_focus: false,
    room: '',
    mobile_focus:false,
    mobile:'',
    angle: 0
  },
  onLoad: function(){
    var _this = this;
    console.log(app._user);
    if(app._user.we.info.build){
      _this.data.buildings.forEach(function(e,i){
        if (e.split("号")[0] == app._user.we.info.build){
          _this.setData({
            ibuilding: i
          });
        }
      });
    }
    if (app._user.we.info.room){
      _this.setData({
        'room': app._user.we.info.room
      });
    }
    if(app._user.we.info.mobile){
      _this.setData({
        'mobile': app._user.we.info.mobile
      });
    }
    wx.onAccelerometerChange(function(res) {
      var angle = -(res.x*30).toFixed(1);
      if(angle>14){ angle=14; }
      else if(angle<-14){ angle=-14; }
      if(_this.data.angle !== angle){
        _this.setData({
          angle: angle
        });
      }
    });
  },
  onReady: function(){
    var _this = this;
    setTimeout(function(){
      _this.setData({
        remind: ''
      });
    }, 1000);
  },
  buildingPicker: function(e) {
    this.setData({
      ibuilding: e.detail.value
    });
  },
  inputFocus: function(e){
    var id = e.target.id,
      newData = {};
    newData[id + '_focus'] = true; 
    this.setData(newData);     
  },
  inputBlur: function(e){
    var id = e.target.id,
         newData = {};
    newData[id + '_focus'] = false;   
    this.setData(newData);  
  },
  roomInput:  function(e){
    this.setData({
      'room': e.detail.value
    });
    if(e.detail.value.length >= 4){
      wx.hideKeyboard();
    }
  },
  mobileInput: function(e){
    this.setData({
      'mobile': e.detail.value
    });
  },
  volunteerHelp:function(){
    wx.navigateTo({
      url: './help/volunteerHelp',
    })
  },
  confirm: function(){
    var _this = this;
    if(app.g_status){
      app.showErrorModal(app.g_status, '提交失败');
      return;
    }
    var data = {
      openid: app._user.openid
    };
    if (!_this.data.ibuilding || !_this.data.room || !_this.data.mobile){
      app.showErrorModal('请填写完整的表单信息', '提醒');
      return false;
    }
    var buildText = _this.data.buildings[_this.data.ibuilding];
    var build = buildText.split("号")[0];
    data.build = build;
    data.room = _this.data.room;
    data.mobile = _this.data.mobile;
    app.showLoadToast();
    wx.request({
      url: config.service.appendUrl,
      data: app.key(data),
      method: 'POST',
      success: function(res){
        if(res.data && res.data.status === 200){
          app.appendInfo(data);
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          });
          app._user.we.mobile = _this.data.mobile;
          app._user.we.room = _this.data.room;
          app._user.we.build = data.build;
          app.removeCache('fw');
          wx.navigateBack();
        }else{
          wx.hideToast();
          app.showErrorModal(res.data.message);
        }
      },
      fail: function(res) {
        wx.hideToast();
        app.showErrorModal(res.errMsg);
      }
    })
  }
});