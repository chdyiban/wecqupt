// pages/news/tags/tags.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: false,
    topic: [
      { type: 'topic', name: "官网新闻", channel: 4 },
      { type: 'topic', name: "先锋家园", channel: 5 },
      { type: 'topic', name: "门户通知", channel: 7 },
    ],
    tuan: [
      { type: 'tuan', name: "专题头条" },
      { type: 'tuan', name: "公告通知" },
      { type: 'tuan', name: "团学新闻" },
      { type: 'tuan', name: "活动预告" },
      { type: 'tuan', name: "院系传真" },
    ],
    // college: ["公路学院", "汽车学院", "机械学院","经管学院","电控学院","信息学院"],
    choose: [
      { type: 'topic', name: "官网新闻", channel: 4 },
      { type: 'topic', name: "综合新闻", channel: 5 }
    ],
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

        //遍历缓存栏目，将已经在里面的删除
        _this.data.userTagsCache.forEach(function(v){
          for(var i = 0; i<_this.data[v.type].length;i++){
            if (v.name === _this.data[v.type][i].name) {
              _this.data[v.type].splice(i, 1)
              break
            }
          }
        });

        
        //我的栏目赋值
        _this.setData({
          choose: value,
          tuan: _this.data.tuan,
          //college: _this.data.college,
          topic: _this.data.topic
        })
      }
    } catch (e) { console.warn(e) }
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
      //college:_this.data.college,
      topic:_this.data.topic
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
      //college: _this.data.college,
      topic: _this.data.topic
    })    
  },

})