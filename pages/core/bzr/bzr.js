//xf.js
//获取应用实例
var app = getApp()
var config = require('../../../config')
Page({
  data: {
    mainTitle:'问卷内容',
    step:null,
    rate:{
      status:false,
      msg:'',
    },
    adviser:{
      adviser_name:'...',
      adviser_college:'...',
      adviser_class:'...',
      working_logs:{},
    },
    questionnaire:{},
    star: 0,
    starMap: [
      '非常差',
      '差',
      '一般',
      '好',
      '非常好',
    ],
    optionObj:{},           //radioChange使用
    formData: {             //表单数据 
    },
  },
  onPullDownRefresh: function () {
    this.getData()
  },
  onLoad: function () {
    this.getData()
  },
  getData: function () {
    var _this = this

    //学号(we.id) 与班级号(we.more.bj) 半段
    if (!app._user.we.id || !app._user.we.more.bj) {
      wx.navigateTo({
        url: '/pages/more/append'
      })
    }

    //formData数据初始化
    _this.setData({
      'formData.openid': app._user.openid,
      'formData.id': app._user.we.id,
    });

    //loading
    wx.showToast({
      title: '数据读取中',
      mask: true,
      icon: 'loading',
      duration: 15000,
    })

    //发送初始化请求
    wx.request({
      url: config.service.adviserUrl,
      method: 'POST',
      data: app.key({
        openid: app._user.openid,
        id: app._user.we.id
      }),
      success: function (res) {
        wx.hideToast()
        var adviserResObj = res.data.data
        if(res.data.status != 200){
          //服务器出错或非法请求
          wx.showToast({
            title: "error:"+res.data.msg,
            mask: true,
            icon: 'none',
          })
          return false
        }
        switch(res.data.step){
          case 0:
            //step为0，未获取班主任信息，即该学生未找到对应班主任
            _this.setData({
              'step':0,
              'rate.msg':res.data.msg
            })
            break
          case 1:
            _this.setData({
              'step':1,
              'rate.status':true,
              'rate.msg':'可评价',
              'adviser.adviser_name': adviserResObj.adviser_name,
              'adviser.adviser_college': adviserResObj.adviser_college,
              'adviser.adviser_class': adviserResObj.adviser_class,
              'adviser.working_logs':adviserResObj.working_logs,
              'questionnaire':adviserResObj.questionnaire,
            })
            break
          case 2:
            _this.setData({
              'step':2,
              'rate.status':false,
              'rate.msg':'待发布',
              'adviser.adviser_name': adviserResObj.adviser_name,
              'adviser.adviser_college': adviserResObj.adviser_college,
              'adviser.adviser_class': adviserResObj.adviser_class,
            })
            break
          case 3:
            //step 为3 已经完成评价
            _this.setData({
              'step':3,
              'rate.status': false,
              'rate.msg': '已评价',
              'adviser.adviser_name': adviserResObj.adviser_name,
              'adviser.adviser_college': adviserResObj.adviser_college,
              'adviser.adviser_class': adviserResObj.adviser_class,
              'adviser.working_logs': adviserResObj.working_logs,
            })
            break
          default:
            break
        }
      },
      fail: function (res) {
       
      },
      complete: function () {
        wx.stopPullDownRefresh()
      }
    })
  },

  radioChange(e) {
    var _this = this
    var index = e.target.dataset.index
    _this.data.optionObj[index] = e.detail.value

    this.setData({
      'formData.options': _this.data.optionObj
    })
  },

  myStarChoose(e) {
    var _this = this
    var star = parseInt(e.target.dataset.star) || 0
    var index = e.currentTarget.dataset.index
    _this.data.optionObj[index] = ""+star
    this.setData({
      star: star,
      'formData.options': _this.data.optionObj
    })
  },

  submit(){
    var _this = this
    //loading
    wx.showToast({
      title: '正在提交',
      mask: true,
      icon: 'loading',
      duration: 15000,
    })

    //前端检查必填项是否全部填写
    //当前判断逻辑 formData.option属性个数与问卷数相同
    if (typeof (_this.data.formData.options) === "undefined" ){
      wx.showToast({
        title: '请先填写字符串',
        mask: true,
        icon: 'none',
      })
      return false
    }
    if ( _this.data.questionnaire.length !== Object.getOwnPropertyNames(_this.data.formData.options).length){
      wx.showToast({
        title: '请填写完再提交',
        mask: true,
        icon: 'none',
      })
      return false
    }

    //提交
    wx.request({
      url: config.service.adviserSubmitUrl,
      method:'POST',
      data: app.key(_this.data.formData),
      success: function (res) {
        wx.hideToast()

        //请求成功，但后端返回错误的情况下
        if(res.data.status !== 200){
          wx.showToast({
            title: res.data.msg,
            mask: true,
            icon: 'none',
          })
        }
      },
      fail: function (res) {
        console.log(res)
      },
      complete: function () {
        wx.stopPullDownRefresh()
      }
    })
  },
})