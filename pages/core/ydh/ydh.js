// pages/core/ydh/ydh.js
var app = getApp()
var config = require('../../../config')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // queryFlag: 1,//防止多个网络请求

    tabCur: 0,
    typeTabCur: 0,
    bottomModel: false,
    donateModal: false,

    collegeTotalSteps: 0,
    collegeTodaySteps: 0,
    collegeTotalDonatePerson: 0,
    collegeName: '',
    myTotalSteps: 0,
    collegeHeat: 0,
    myTodaySteps: 0,
    myToadyHeatGrow: 0,
    donateStatus: null,

    hotListArray: [],

    scoreUpdateTime: '',
    scoreRankList: [],

    scoreDetailTJ: [], //田径项目
    scoreDetailGB: [], //国标项目
    scoreDetailQW: [], //趣味项目

    schedule:[],
  },

  tabSelect(e) {
    var _this = this
    var now = new Date()
    //判断点击积分榜时，提示点击可以查看详细分数
    if (e.currentTarget.dataset.id == 1 ){
      wx.showToast({
        title: '点击学院可查看积分明细',
        icon: 'none',
        duration: 3000
      })
    }
    //判断当点击赛程按钮
    if (e.currentTarget.dataset.id == 2){
      _this.getSchedule()
    }
    _this.setData({
      tabCur: e.currentTarget.dataset.id,
    })
  },
  typeTabSelect(e) {
    console.warn(e)
    this.setData({
      typeTabCur: e.currentTarget.dataset.id,
    })
  },
  showModal(e) {
    var _this = this
    //获取点击学院ID
    var collegeId = e.currentTarget.dataset.target


    //学院详细积分请求
    wx.showNavigationBarLoading()
    wx.showLoading()
    wx.request({
      url: config.service.sportsScoreDetail,
      method: 'POST',
      data: app.key({
        openid: app._user.openid,
        collegeid: collegeId //学院ID,包装数据统一小写
      }),
      success: function(res) {
        if (res.data && res.data.status === 200) {
          console.log(res.data)
          //学院详情渲染
          _this.setData({
            scoreDetailTJ: (res.data.data[0] == undefined) ? [] : res.data.data[0],
            scoreDetailGB: (res.data.data[1] == undefined) ? [] : res.data.data[1],
            scoreDetailQW: (res.data.data[2] == undefined) ? [] : res.data.data[2],
            bottomModel: true
          })
        } else {
          wx.showToast({
            title: '请求错误',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function(res) {
        console.warn('网络错误');
      },
      complete: function() {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
      }
    });
  },
  hideModal(e) {
    this.setData({
      bottomModel: false,
      //清空之前点击缓存数据
      scoreDetailTJ: [], //田径项目
      scoreDetailGB: [], //国标项目
      scoreDetailQW: [], //趣味项目
    })
  },
  /**
   * 调用微信步数授权
   */
  donate(e) {
    var _this = this
    wx.showLoading({
      title: '读取步数中...',
    })
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
            fail(err) {
              console.log(err)
            }
          })
        } else {
          //已经取得了授权，可以授权
          _this.getWxRunData()
        }
      }
    })
  },

  getWxRunData() {
    var _this = this
    wx.getWeRunData({
      success(res) {

        wx.showNavigationBarLoading()
        wx.request({
          url: config.service.sportsStepsQuery,
          method: 'POST',
          data: app.key({
            openid: app._user.openid,
            iv: res.iv,
            encryptedData: res.encryptedData
          }),
          success: function(res) {
            if (res.data && res.data.status === 200) {
              wx.hideLoading()

              if(res.data.data.donate_status === true){
                _this.setData({
                  donateStatus: true
                })
              }else{
                _this.setData({
                  donateStatus: false
                })
              }
             
              _this.setData({
                myTodaySteps: res.data.data.steps,
                myToadyHeatGrow: parseFloat(res.data.data.heat_grow).toFixed(2), //提升热度保留两位小数
                donateModal: true
              })
            } else {

            }
          },
          fail: function(res) {
            console.warn('网络错误');
          },
          complete: function() {
            wx.hideNavigationBarLoading();
          }
        });
      }
    })
  },
  getSchedule(){
    var _this = this
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '赛程读取中...'
    })
    wx.request({
      url: config.service.sportsSchedule,
      method: 'POST',
      data: app.key({
        openid: app._user.openid,
      }),
      success: function (res) {
        wx.hideLoading()
        wx.hideNavigationBarLoading()
        if (res.data && res.data.status === 200) {
          _this.setData({
            schedule: res.data.data
          })
        } else {
          wx.showToast({
            title: '你走开 ^_^',
            icon: 'none',
            duration: 3000
          })
        }
      },
      fail: function (res) {
        wx.hideLoading()
        wx.hideNavigationBarLoading()
        console.warn('网络错误');
      },
      complete: function () {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
      }
    });
  },
  hideDonateModal(){
    this.setData({
      donateModal: false,
    })
  },
  submitDonate(){
    var _this = this
    wx.showNavigationBarLoading()
    wx.showLoading({
      title:'正在捐献...'
    })
    wx.request({
      url: config.service.sportsStepsDonate,
      method: 'POST',
      data: app.key({
        openid: app._user.openid,
      }),
      success: function (res) {
        // wx.hideLoading()
        wx.hideNavigationBarLoading()
        if (res.data && res.data.status === 200 ) {

          //关闭捐献窗口
          _this.setData({
            donateModal: false,
          })

          if(res.data.data.donate_status === false){
            // wx.hideLoading()
            wx.showToast({
              title: '今天已经捐过，明天继续哟~',
              icon: 'none',
              duration: 3000
            })
          }else{
            //捐献成功
            // wx.hideLoading()
            wx.showToast({
              title: '捐献成功~',
              icon: 'success',
              duration: 3000
            })
          }
          
        } else {
          wx.showToast({
            title: '你走开 ^_^',
            icon: 'none',
            duration: 3000
          })
        }
      },
      fail: function (res) {
        console.warn('网络错误');
      },
      complete: function () {
        wx.hideNavigationBarLoading()
        setTimeout(() => {
          wx.hideToast()
        }, 2000)
      }
    });
  },

  getSportsInitData() {
    var _this = this
    // //判断是否绑定，若为绑定则跳转绑定界面
    // if (!app._user.is_bind && app._user.openid) {
    //   wx.navigateTo({
    //     url: '/pages/more/login'
    //   });
    // }
    wx.showNavigationBarLoading()
    wx.request({
      url: config.service.sportsInit,
      method: 'POST',
      data: app.key({
        openid: app._user.openid
      }),
      success: function(res) {
        wx.stopPullDownRefresh()
        if (res.data && res.data.status === 200) {
          var scoreData = res.data.data.score
          var hotData = res.data.data.hot
          _this.setData({
            // queryFlag: 0,

            collegeName: hotData.me.college_name,
            collegeTotalSteps: hotData.me.college_total_steps,
            collegeTodaySteps: hotData.me.today_grow_steps,
            collegeTotalDonatePerson: hotData.me.my_total_donate_person,
            collegeHeat: hotData.me.my_heat,
            myTotalSteps: hotData.me.my_total_steps,
            hotListArray: hotData.list,
            scoreRankList: scoreData.list,
            scoreUpdateTime: scoreData.update_time
          })
        } else {
          console.warn('服务器错误');
        }
      },
      fail: function(res) {

        console.warn('网络错误');
      },
      complete: function() {
        // _this.setData({
        //   queryFlag: 1,
        // })
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var _this = this
    app.loginLoad(function () {
      _this.loginHandler.call(_this, options);
    });
    _this.getSportsInitData()
  },
  //让分享时自动登录
  loginHandler: function (options) {
    console.log(options);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var _this = this
    wx.stopPullDownRefresh()
    //下拉刷新时，强制用queryFlag判断是否重复请求
    // if(_this.data.queryFlag === 1){
      _this.getSportsInitData()
    // }
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '【运动会积分榜】快来点一下，用微信步数提升学院热度哦！',
      // desc: '微信步数可捐赠，提高学院热度',
    }
  }
})