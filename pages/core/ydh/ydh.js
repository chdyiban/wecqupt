// pages/core/ydh/ydh.js
var app = getApp()
var config = require('../../../config')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabCur: 0,
    typeTabCur: 0,
    bottomModel: false,

    collegeTotalSteps: 0,
    collegeTodaySteps: 0,
    collegeTotalDonatePerson: 0,
    hotListArray:[],

    scoreUpdateTime: '',
    scoreRankList: [],
  },

  tabSelect(e) {
    console.log(e)
    this.setData({
      tabCur: e.currentTarget.dataset.id,
    })
  },
  typeTabSelect(e) {
    console.log(e)
    this.setData({
      typeTabCur: e.currentTarget.dataset.id,
    })
  },
  showModal(e) {
    console.log(e)
    //获取点击学院ID
    var collegeId = e.currentTarget.dataset.target
    

    //学院详细积分请求
    wx.showNavigationBarLoading()
    wx.request({
      url: config.service.sportsScoreDetail,
      method: 'POST',
      data: app.key({
        openid: app._user.openid,
        collegeid: collegeId //学院ID,包装数据统一小写
      }),
      success: function (res) {
        if (res.data && res.data.status === 200) {
          console.log(res.data)
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

    this.setData({
      bottomModel: true
    })
  },
  hideModal(e) {
    this.setData({
      bottomModel: false
    })
  },
  /**
   * 调用微信步数授权
   */
  donate(e){
    var _this = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.werun']) {

          wx.authorize({
            scope: 'scope.werun',
            success() {
              // 用户已经同意小程序使用微信步数授权
              console.log("success")
              _this.getWxRunData()
            },
            fail(err){
              console.log(err)
            }
          })
        }else{
          //已经取得了授权，可以授权
          _this.getWxRunData()
        }
      }
    })
  },

  getWxRunData(){
    wx.getWeRunData({
      success(res) {
        //捐献API
        console.log(res)

        //学院详细积分请求
        wx.showNavigationBarLoading()
        wx.request({
          url: config.service.sportsStepsDonate,
          method: 'POST',
          data: app.key({
            openid: app._user.openid,
            iv: res.iv,
            encryptedData: res.encryptedData
          }),
          success: function (res) {
            if (res.data && res.data.status === 200) {

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
    })
  },

  getSportsInitData(){
    var _this = this
    wx.showNavigationBarLoading()
    wx.request({
      url: config.service.sportsInit,
      method: 'POST',
      data: app.key({
        openid: app._user.openid
      }),
      success: function (res) {
        if (res.data && res.data.status === 200) {
          var scoreData = res.data.data.score
          var hotData = res.data.data.hot
          _this.setData({
            collegeTotalSteps: hotData.me.my_total_steps,
            collegeTodaySteps: hotData.me.today_grow_steps,
            hotListArray: hotData.list,
            scoreRankList: scoreData.list,
            scoreUpdateTime: scoreData.update_time
          })
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this

    _this.getSportsInitData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var _this = this
    _this.getSportsInitData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '【运动会积分榜】快来点一下，用微信步数提升学院热度哦！',
      // desc: '微信步数可捐赠，提高学院热度',
    }
  }
})