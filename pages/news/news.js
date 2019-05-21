//news.js
//获取应用实例
var app = getApp();
var config = require('../../config');
Page({
  data: {
    page: 0,
    list: [],
    'active': {
      id: 0,
      'type': 'all',
      data: [],
      showMore: true,
      remind: '上滑加载更多'
    },
    loading: false,
    user_type: 'guest',
    disabledRemind: false,
    scrollTop: 0,
    headerStyle: 'relative',
    navFlag:false,//用来判断是否更新导航条，如果有更新，则从缓存中读取导航数据
  },
  onLoad: function () {
    var _this = this;
    if (app._user.is_bind) {
      _this.setData({
        user_type: !app._user.teacher ? 'student' : 'teacher'
      });
    } else {
      _this.setData({
        user_type: 'guest',
        'active.id': 5,
        'active.type': 'new'
      });
    }
    _this.setData({
      'loading': true,
      'active.data': [],
      'active.showMore': true,
      'active.remind': '上滑加载更多',
      'page': 0
    });
    this.initBar();
  },
  onShow:function(){
    var _this = this
    console.warn("onshow!!!")
    //若navFlag 为true 说明用户在tags页面保存过tags,此时从缓存读取最新nav
    _this.refreshNav()
  },
  initBar:function(){
    var _this = this;
    wx.request({
      url: config.service.newsNavUrl,
      method: 'POST',
      data: app.key({
        openid: app._user.openid,
        id: app._user.we.id
      }),
      success: function (res) {
        if (res.data && res.data.status === 200) {
          if (res.data.data) {
            _this.setData({
              list:res.data.data,
            });
          }
        }
      },
      fail: function (res) {
        app.showErrorModal(res.message);
      },
      complete: function () {
        //获取新闻列表
        _this.getNewsList()
        //将nav写入缓存
        _this.setNavToStorage()
      }
    });
  },
  wxSearchTab: function () {
    wx.navigateTo({
      url: './search/search'
    })
  },
  //下拉更新
  onPullDownRefresh: function () {
    var _this = this;
    _this.setData({
      'loading': true,
      'active.data': [],
      'active.showMore': true,
      'active.remind': '上滑加载更多',
      'page': 0
    });
    _this.getNewsList();
  },
  //上滑加载更多
  onReachBottom: function () {
    var _this = this
    if (_this.data.active.showMore) {
      _this.getNewsList()
    }
  },
  chooseTags: function(){
    
  },
  //获取新闻列表
  getNewsList: function (typeId) {
    var _this = this;
    if (app.g_status) {
      _this.setData({
        'active.showMore': false,
        'active.remind': app.g_status,
        loading: false
      });
      wx.stopPullDownRefresh();
      return;
    }
    typeId = typeId || _this.data.active.id;

    if (!_this.data.page) {
      _this.setData({
        'active.data': _this.data.list[typeId].storage
      });
    }
    _this.setData({
      'active.remind': '正在加载中'
    });
    wx.showNavigationBarLoading();
    var data = {};
    if (_this.data.list[typeId].channel === undefined){
      //tags
      data = {
        page: _this.data.page + 1,
        openid: app._user.openid,
        tag: _this.data.list[typeId].tag,
      }
    }else{
      //channel
      data = {
        page: _this.data.page + 1,
        openid: app._user.openid,
        channel: _this.data.list[typeId].channel,
      }
    }
    wx.request({
      url: config.service.newsListUrl,
      data: data,
      success: function (res) {
        if (res.data && res.data.status === 200) {
          if (_this.data.active.id != typeId) { return false; }
          if (res.data.data) {
            if (!_this.data.page) {
              if (!_this.data.list[typeId].storage.length || app.util.md5(JSON.stringify(res.data.data)) != app.util.md5(JSON.stringify(_this.data.list[typeId].storage))) {
                var data = {
                  'page': _this.data.page + 1,
                  'active.data': res.data.data,
                  'active.showMore': true,
                  'active.remind': '上滑加载更多',
                };
                data['list[' + typeId + '].storage'] = res.data.data;
                _this.setData(data);
              } else {
                _this.setData({
                  'page': _this.data.page + 1,
                  'active.showMore': true,
                  'active.remind': '上滑加载更多'
                });
              }
            } else {
              _this.setData({
                'page': _this.data.page + 1,
                'active.data': _this.data.active.data.concat(res.data.data),
                'active.showMore': true,
                'active.remind': '上滑加载更多',
              });
            }
          } else {
            _this.setData({
              'active.showMore': false,
              'active.remind': '没有更多啦'
            });
          }
        } else {
          app.showErrorModal(res.data.message);
          _this.setData({
            'active.remind': '加载失败'
          });
        }
      },
      fail: function (res) {
        app.showErrorModal(res.errMsg);
        _this.setData({
          'active.remind': '网络错误'
        });
      },
      complete: function () {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        _this.setData({
          loading: false
        });
      }
    });
  },
  //将新闻写入wx.setStorageSync
  setNavToStorage: function(){
    wx.setStorageSync('userTags',this.data.list)
  },
  getNavFromStorage: function(){
    console.log(wx.getStorageSync('userTags'))
    return wx.getStorageSync('userTags')
  },
  //刷新导航条
  refreshNav: function(){
    var _this = this
    var flag =  wx.getStorageSync('refreshNav')
    
    if(flag){
      console.log("=====refreshnav===")
      _this.setData({
        list: _this.getNavFromStorage()
      })
      wx.setStorageSync('refreshNav', false)
    }
  },
  //获取焦点
  changeFilter: function (e) {
    this.setData({
      'active': {
        'id': e.target.dataset.id,
        'type': e.target.id,
        data: [],
        showMore: true,
        remind: '上滑加载更多'
      },
      'page': 0
    });
    this.getNewsList(e.target.dataset.id);
  },
  //无权限查询
  changeFilterDisabled: function () {
    var _this = this;
    if (!_this.data.disabledRemind) {
      _this.setData({
        disabledRemind: true
      });
      setTimeout(function () {
        _this.setData({
          disabledRemind: false
        });
      }, 2000);
    }
  },
  onPageScroll:function(ev){
    var _this = this;
    //当滚动的top值最大或最小时，为什么要做这一步是因为在手机实测小程序的时候会发生滚动条回弹，所以为了处理回弹，设置默认最大最小值
    if (ev.scrollTop <= 0) {
      ev.scrollTop = 0;
      _this.setData({
        headerStyle: 'relative',
      });
    } else if (ev.scrollTop > wx.getSystemInfoSync().windowHeight) {
      ev.scrollTop = wx.getSystemInfoSync().windowHeight;
    } else if(ev.scrollTop > 40){
      _this.setData({
        headerStyle: 'fixed',
      });
    }
    
  }
});