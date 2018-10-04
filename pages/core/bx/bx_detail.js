//bx_detail.js
//获取应用实例
var app = getApp();
var config = require('../../../config');
Page({
  data: {
    remind: '加载中',
    detail: {},   //工单详情
    state: [],     //处理详情(申请-审核-受理-派单-完工-驳回.倒序)
    star: 0,
    starMap: [
      '非常差',
      '差',
      '一般',
      '好',
      '非常好',
    ],
    formData: {
      bxID: '',//报修ID
      star: '',
      message: '',  
    },
  },
  //下拉更新
  onPullDownRefresh: function(){
    this.getData();
  },
  onLoad: function(options){
    this.setData({
      bxID: options.id
    });
    this.getData();
  },
  getData: function () {
    var _this = this;
    if (!app._user.we.id  ||!_this.data.bxID){
      _this.setData({
        remind: '404'
      });
      return false;
    }
    // 发送请求
    wx.request({
      //url: app._server + "/public/api/repair/get_repair_detail", 
      url: config.service.repairDetailService,
      method: 'POST',
      data: app.key({
        "openid": app._user.openid,
        "id": app._user.we.id,
        "bxID": _this.data.bxID
      }),
      success: function(res) {
        if(res.data && res.data.status === 200) {
          var info = res.data.data;
          //报修内容过滤标签
          info.wx_bt = _this.convertHtmlToText(info.wx_bt).replace(/[\r|\n]/g, "");
          info.wx_bxnr = _this.convertHtmlToText(info.wx_bxnr);
          //处理详情
          var state = [{
            'type': 'refused',
            name: '驳回',
            status: info.wx_wxztm == 'refused',
            list: {
              '原因': info.wx_jjyy
            }
          },{
            'type': 'finished',
            name: '完工',
            status: info.wx_wxztm == 'finished',
            list: {
              '用时': info.wx_wgsj
            }
          },{
            'type': 'dispatched',
            name: '派单',
            status: !!info.wx_wxgm.trim(),
            list: {
              '承修人': info.wx_wxgm,
              '联系电话': info.wx_wxgdh,//维修工联系电话
            }
          },{
            'type': 'accepted',
            name: '受理',
            status: !!info.wx_slr.trim(),
            list: {
              '受理人': info.wx_slr,
              '响应时间': info.wx_xysj
            }
          },{
            'type': 'waited',
            name: '审核',
            status: !!info.wx_shr.trim(),
            list: {
              '审核人': info.wx_shr
            }
          },{
            'type': 'waited',
            name: '申请',
            status: true,
            list: {
              '申请人': info.wx_bxr+' ('+info.wx_bxrrzm+')',
              '申报时间': info.wx_bxsj
            }
          }];
          console.log(state);
          _this.setData({
            'detail': info,
            'state': state.filter(function(e,i){
              return e.status
            }),
            'remind': ''
          });
        }else{
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }
      },
      fail: function(res) {
        app.showErrorModal(res.errMsg);
        _this.setData({
          remind: '网络错误'
        });
      },
      complete: function(){
        wx.stopPullDownRefresh();
      }
    });
  },
  listenerTextarea: function (e) {
    this.setData({
      'formData.message': e.detail.value
    });
  },
  submitRate: function (e) {
    var _this = this,
      formData = _this.data.formData;
    wx.showModal({
      title: '提示',
      content: '是否确认提交维修评价？',
      success: function (res) {
        if (res.confirm) {
          formData.openid = app._user.openid;
          formData.bxID = _this.data.bxID;
          wx.request({
            url: config.service.repairRateSubmitUrl,
            method: 'POST',
            data: app.key(formData),
            success: function (res) {
              if (res.data && res.data.status === 200) {
                wx.showToast({
                  title: '提交成功',
                  icon: 'success',
                  duration: 2000
                });
                wx.navigateBack();
              } else {
                var errorMessage = (res.data.data && res.data.data.reason) || res.data.message;
                app.showErrorModal(errorMessage);
              }
            },
            fail: function (res) {
              app.showErrorModal(res.errMsg);
            }
          });
        }
      }
    });
  },
  convertHtmlToText: function(inputText){
    var returnText = "" + inputText;
    returnText = returnText.replace(/<\/?[^>]*>/g, '').replace(/[ | ]*\n/g, '\n').replace(/ /ig, '')
                  .replace(/&mdash/gi,'-').replace(/&ldquo/gi,'“').replace(/&rdquo/gi,'”');
    return returnText;
  },

  myStarChoose(e) {
    let star = parseInt(e.target.dataset.star) || 0;
    this.setData({
      star: star,
      'formData.star': star
    });
  },
  previewPhoto: function (e) {
    var _this = this;
    console.log(_this.data);
    wx.previewImage({
      current: _this.data.detail.wx_wxzp[e.target.dataset.index],
      urls: _this.data.detail.wx_wxzp
    });
  },



  
});