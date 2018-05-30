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
    disabledRemind: false
  },
  onLoad: function () {
    var _this = this;
    if (app._user.is_bind) {
      this.setData({
        user_type: !app._user.teacher ? 'student' : 'teacher'
      });
    } else {
      this.setData({
        user_type: 'guest',
        'active.id': 5,
        'active.type': 'new'
      });
    }
    this.setData({
      'loading': true,
      'active.data': [],
      'active.showMore': true,
      'active.remind': '上滑加载更多',
      'page': 0
    });
    this.initBar();
  },
  initBar:function(){
    var that = this;
    wx.request({
      url: config.service.newsNavUrl,
      success: function (res) {
        if (res.data && res.data.status === 200) {
          if (res.data.data) {
            that.setData({
              list:res.data.data,
            });
          }
        }
      },
      fail: function (res) {
        app.showErrorModal(res.message);
      },
      complete: function () {
        that.getNewsList();
      }
    });
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
    var _this = this;
    if (_this.data.active.showMore) {
      _this.getNewsList();
    }
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
    if (_this.data.page >= 5) {
      _this.setData({
        'active.showMore': false,
        'active.remind': '没有更多啦'
      });
      return false;
    }
    if (!_this.data.page) {
      _this.setData({
        'active.data': _this.data.list[typeId].storage
      });
    }
    _this.setData({
      'active.remind': '正在加载中'
    });
    wx.showNavigationBarLoading();
    wx.request({
      url: config.service.newsListUrl,
      data: {
        page: _this.data.page + 1,
        openid: app._user.openid,
        channel: _this.data.list[typeId].channel,
      },
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
  //获取焦点
  changeFilter: function (e) {
    //console.log(e.target);
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
  }
});