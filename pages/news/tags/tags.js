// pages/news/tags/tags.js
var config = require('../../../config');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: false,
    vip: [],
    tuan: [],
    college: [],
    choose: [],
    userTagsCache:{}
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

      }
    } catch (e) { console.warn(e) }

    //读取所有标签
    wx.request({
      url: config.service.newsTagsUrl,
      success: function (res) {
        if (res.data && res.data.status === 200) {
          //这里应首先删除已经在nav里面的标签,最方便
          var tagList = res.data.data
          //将剩下标签数组按分类写入到tags中
          var tmpVip = [];
          var tmpTuan = [];
          var tmpCollege = [];
          tagList.forEach(function (v,k) {
            //先判断是否在我的栏目中，在则不展示
            //if(){}
            // _this.data.userTagsCache.forEach(val,key){
            //   if()
            // }
            switch(v.category_id){
              case 0:
                tmpVip.push(v)
                break
              case 1:
                tmpTuan.push(v)
                break
              case 2:
                tmpCollege.push(v)
                break
            }
          })
          _this.setData({
            vip: tmpVip,
            tuan: tmpTuan,
            college: tmpCollege
          })
        }
      },
      fail: function (res) {
        app.showErrorModal(res.message)
      },
      complete: function () {
      }
    });

    // //读取缓存
    // try {
    //   var data = wx.getStorageInfoSync()
    //   var value = wx.getStorageSync('userTags')
    //   if (value) {
    //     _this.data.userTagsCache = value

    //     //遍历缓存栏目，将已经在里面的删除
    //     _this.data.userTagsCache.forEach(function(v,k){
    //       for(var i = 0; i<_this.data[v.type].length;i++){
    //         if (v.name === _this.data[v.type][i].name) {
    //           _this.data[v.type].splice(i, 1)
    //           break
    //         }
    //       }
    //     });

        
    //     //我的栏目赋值
    //     _this.setData({
    //       choose: value,
    //       tuan: _this.data.tuan,
    //       college: _this.data.college,
    //       vip: _this.data.vip
    //     })
    //   }
    // } catch (e) { console.warn(e) }
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
    if(_this.data.active === true){
      _this.userTagsCache = _this.data.choose
      wx.setStorage({
        key: 'userTags',
        data: _this.data.choose
      });
    }

    _this.setData({
      active: !_this.data.active,
    });
  },

  deleteTag: function(e){
    var _this = this
    //判断active激活状态
    if(_this.data.active === true){
      for(var i = 0; i < _this.data.choose.length ; i++){
        if(e.currentTarget.dataset.name === _this.data.choose[i].name){
          var datasetType = _this.data.choose[i].type
          //还原
          _this.data[datasetType].push(_this.data.choose[i])
          //删除
          _this.data.choose.splice(i, 1)
          break
        }
      }
    }
    _this.setData({
      choose:_this.data.choose,
      tuan:_this.data.tuan,
      college:_this.data.college,
      vip:_this.data.vip
    })
  },
  addTag:function(e){
    var _this = this
    var datasetType = e.currentTarget.dataset.type

    if (_this.data.active === true) {
      for (var i = 0; i < _this.data[datasetType].length; i++) {
        if(e.currentTarget.dataset.name === _this.data[datasetType][i].name){

          //添加至我的栏目
          _this.data.choose.push(_this.data[datasetType][i])

          //本身栏目删除
          _this.data[datasetType].splice(i,1)
          break
        }
      }
    }
    _this.setData({
      choose: _this.data.choose,
      tuan: _this.data.tuan,
      college: _this.data.college,
      vip: _this.data.vip
    })    
  },

})