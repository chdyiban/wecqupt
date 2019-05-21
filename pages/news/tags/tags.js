// pages/news/tags/tags.js
var config = require('../../../config');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: false,
    tags:[],
    choose: [],
    userTagsCache: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var _this = this

    //读取缓存
    try {
      var data = wx.getStorageInfoSync()
      var value = wx.getStorageSync('userTags')
      if (value) {
        _this.data.userTagsCache = value

        _this.setData({
          choose: value,
        })

      }
    } catch (e) {
      console.warn(e)
    }

    //读取所有标签
    wx.request({
      url: config.service.newsTagsUrl,
      success: function(res) {
        if (res.data && res.data.status === 200) {
          //这里应首先删除已经在nav里面的标签,最方便
          var tagList = res.data.data
          //将剩下标签数组按分类写入到tags中
          var tmpTags = [[],[],[]]

          _this.data.userTagsCache.forEach(function (_v) {
            for (var i = 0; i < tagList.length; i++){
              if(_v.name == tagList[i].name){
                tagList.splice(i,1)
                continue
              }
            }
          })

          tagList.forEach(function(v, k) {
            var type_id = parseInt(v.type_id)
            tmpTags[type_id].push(v)
          })

          _this.setData({
            tags:tmpTags
          })
        }
      },
      fail: function(res) {
        app.showErrorModal(res.message)
      },
      complete: function() {
        //
      }
    })
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

  },

  activeHandle: function() {
    var _this = this

    //按钮激活状态,写缓存
    if (_this.data.active === true) {
      
      //自定义标签先进行对ID重排序
      _this.data.choose.forEach(function(v,k){
        _this.data.choose[k].id = k
      })
      wx.setStorage({
        key: 'userTags',
        data: _this.data.choose
      });
      //将自定义标签提交至云端保存
      wx.request({
        url: config.service.newsTagsSetUrl,
        method: 'POST',
        data: app.key({
          openid: app._user.openid,
          id: app._user.we.id,
          mynav: _this.data.choose
        }),
        success: function (res) {
          if (res.data && res.data.status === 200) {
            console.log(res.data)
          }
        },
        fail: function (res) {
          console.warn(res.data)
          app.showErrorModal(res.message)
        },
        complete: function () {
          //用户保存自定义nav 
          wx.setStorage({
            key: 'refreshNav',
            data: true,
          })
        }
      });

    }

    _this.setData({
      active: !_this.data.active,
    });
  },

  deleteTag: function(e) {
    var _this = this
    //判断active激活状态
    if (_this.data.active === true) {
      for (var i = 0; i < _this.data.choose.length; i++) {
        if (e.currentTarget.dataset.name === _this.data.choose[i].name) {
          var type_id = _this.data.choose[i].type_id
          //还原
          _this.data.tags[type_id].push(_this.data.choose[i])
          //删除
          _this.data.choose.splice(i, 1)
          break
        }
      }
    }
    _this.setData({
      choose: _this.data.choose,
      tags:_this.data.tags
    })
  },
  addTag: function(e) {
    var _this = this
    var type_id = e.currentTarget.dataset.type

    if (_this.data.active === true) {
      for (var i = 0; i < _this.data.tags[type_id].length; i++) {
        if (e.currentTarget.dataset.name === _this.data.tags[type_id][i].name) {

          //添加至我的栏目
          _this.data.choose.push(_this.data.tags[type_id][i])

          //本身栏目删除
          _this.data.tags[type_id].splice(i, 1)
          break
        }
      }
    }
    _this.setData({
      choose: _this.data.choose,
      tags: _this.data.tags
    })
  },

})