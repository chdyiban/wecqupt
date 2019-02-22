var config = require('./config')
//app.js
App({
  version: 'v0.2.1', //版本号
  onLaunch: function() {
    var _this = this;
    //读取缓存
    try {
      var data = wx.getStorageInfoSync();
      if (data && data.keys.length) {
        data.keys.forEach(function(key) {
          var value = wx.getStorageSync(key);
          if (value) {
            _this.cache[key] = value;
          }
        });
        if (_this.cache.version !== _this.version) {
          _this.cache = {};
          wx.clearStorage();
        } else {
          //_this.cache.userinfo不存在，获取不到，会报错。
          //_this._user.wx = _this.cache.userinfo.userInfo || {};
          _this.processData(_this.cache.userdata);
        }
      }
    } catch(e) { console.warn('获取缓存失败'); }
  },
  //保存缓存
  saveCache: function(key, value) {
    if(!key || !value){return;}
    var _this = this;
    _this.cache[key] = value;
    wx.setStorage({
      key: key,
      data: value
    });
  },
  //清除缓存
  removeCache: function(key) {
    if(!key){return;}
    var _this = this;
    _this.cache[key] = '';
    wx.removeStorage({
      key: key
    });
  },
  //后台切换至前台时
  onShow: function(){

  },
  //判断是否有登录信息，让分享时自动登录
  loginLoad: function(onLoad){
    var _this = this;
    if(!_this._t){  //无登录信息
      _this.getUser(function(e){
        typeof onLoad == "function" && onLoad(e);
      });
    }else{  //有登录信息
      typeof onLoad == "function" && onLoad();
    }
  },
  //getUser函数，在index中调用
  getUser: function(response) {
    var _this = this;
    wx.showNavigationBarLoading();
    //forked from https://github.com/aqingyang/mplogin/blob/master/pages/login/login.js
    //  支持getsetting 1.2.0
    // if (wx.getSetting){
    //   wx.getSetting({
    //     success: function(res){
    //       //  用户已经授权 1.2.0基础库
    //       if (res.authSetting['scope.userInfo']) {
    //         wx.getUserInfo({
    //           success: function (UserInfo) {
    //             console.log(UserInfo);
    //           }
    //         })
    //         // 用户未授权
    //       } else {

    //       }
    //     },
    //     fail: function(err){

    //     }
    //   })
    // }
    // else{

    // }

    // forked end

    wx.getSetting({
      success: function (res) {
        //console.log(res.authSetting);
        // if (res.authSetting['scope.userInfo']) {
        //   // 已经授权，可以直接调用 getUserInfo 获取头像昵称
        //   wx.getUserInfo({
        //     success: function (res) {
        //       console.log(UserInfo);
        //     }
        //   })
        // }else{
          wx.login({
            success:function(res){
              if(res.code){
                //获取临时code
                wx.request({
                  method: 'POST',
                  url: config.service.initUnloginUrl,
                  data: {
                    code: res.code,
                  },
                  success: function (res) {
                    if (res.data && res.data.status >= 200 && res.data.status < 400) {
                      var status = false, data = res.data.data;
                      //判断缓存是否有更新
                      if (_this.cache.version !== _this.version || _this.cache.userdata !== data) {
                        _this.saveCache('version', _this.version);
                        _this.saveCache('userdata', data);
                        _this.processData(data);
                        status = true;
                      }
                      if (!_this._user.is_bind) {
                        wx.navigateTo({
                          url: '/pages/more/login'
                        });
                      }
                      //如果缓存有更新，则执行回调函数
                      if (status) {
                        typeof response == "function" && response();
                      }
                    } else {
                      //清除缓存
                      if (_this.cache) {
                        _this.cache = {};
                        wx.clearStorage();
                      }
                      typeof response == "function" && response(res.data.message || '加载失败');
                    }
                  },
                  fail: function (res) {
                    var status = '';
                    // 判断是否有缓存
                    if (_this.cache.version === _this.version) {
                      status = '离线缓存模式';
                    } else {
                      status = '网络错误';
                    }
                    _this.g_status = status;
                    // typeof response == "function" && response(status);
                    //console.warn(status);
                  },
                  complete: function () {
                    wx.hideNavigationBarLoading();
                  }
                });
              }
              
            },
            fail:function(res){
              //console.log("app::getUser::getSetting::login::fail")
              //console.log(res)
            }
          })

        // }
      },
      fail: function(res){
        //console.log("app::getUser::getSetting::fail")
        //console.log(res)
      }
    })
    // wx.login({
    //   success: function(res){
    //     if(res.code){
    //       //调用函数获取微信用户信息
    //       _this.getUserInfo(function(info){
    //         console.log("app::login::getUserInfo");
    //         console.log(info);
    //         _this.saveCache('userinfo', info);
    //         _this._user.wx = info.userInfo;
    //         if(!info.encryptedData || !info.iv){
    //           _this.g_status = '无关联AppID';
    //           typeof response == "function" && response(_this.g_status);
    //           return;
    //         }
    //         //发送code与微信用户信息，获取学生数据
    //         wx.request({
    //           method: 'POST',
    //           url: config.service.initUrl,
    //           data: {
    //             code: res.code,
    //             key: info.encryptedData,
    //             iv: info.iv
    //           },
    //           success: function(res){
    //             if(res.data && res.data.status >= 200 && res.data.status < 400){
    //               var status = false, data = res.data.data;
    //               //判断缓存是否有更新
    //               if(_this.cache.version !== _this.version || _this.cache.userdata !== data){
    //                 _this.saveCache('version', _this.version);
    //                 _this.saveCache('userdata', data);
    //                 _this.processData(data);
    //                 status = true;
    //               }
    //               if(!_this._user.is_bind){
    //                 wx.navigateTo({
    //                   url: '/pages/more/login'
    //                 });
    //               }
    //               //如果缓存有更新，则执行回调函数
    //               if(status){
    //                 typeof response == "function" && response();
    //               }
    //             }else{
    //               //清除缓存
    //               if(_this.cache){
    //                 _this.cache = {};
    //                 wx.clearStorage();
    //               }
    //               typeof response == "function" && response(res.data.message || '加载失败');
    //             }
    //           },
    //           fail: function(res){
    //             var status = '';
    //             // 判断是否有缓存
    //             if(_this.cache.version === _this.version){
    //               status = '离线缓存模式';
    //             }else{
    //               status = '网络错误';
    //             }
    //             _this.g_status = status;
    //             typeof response == "function" && response(status);
    //             console.warn(status);
    //           },
    //           complete: function(){
    //             wx.hideNavigationBarLoading();
    //           }
    //         });
    //       });
    //     }
    //   },
    //   fail: function (res){
    //     console.log('获取用户登录态失败：' + res.errMsg);
    //   }
    // });
  },
  processData: function(key){
    var _this = this;
    var data = JSON.parse(_this.util.base64.decode(key));
    console.log(data);
    _this._user.is_bind = data.is_bind;
    _this._user.openid = data.user.openid;
    _this._user.teacher = (data.user.type == '教职工');
    _this._user.we = data.user;
    _this._user.wxmobile = data.user.info.wxmobile;
    _this._time = data.time;
    _this._t = data['token'];
    return data;
  },
  getUserInfo: function(cb){
    var _this = this;
    //获取微信用户信息
    // wx.getUserInfo({
    //   success: function(res){
    //     typeof cb == "function" && cb(res);
    //   },
    //   fail: function(res){
    //     _this.showErrorModal('拒绝授权将导致无法关联学校帐号并影响使用，请重新打开长大易班小程序再点击允许授权！', '授权失败');
    //     _this.g_status = '未授权'; 
    //   }
    // });
  },
  //完善信息
  appendInfo: function(data){
    var _this = this;
    _this.cache = {};
    wx.clearStorage();
    _this._user.we.build = data.build || '';
    _this._user.we.room = data.room || '';
  },
  showErrorModal: function(content, title){
    wx.showModal({
      title: title || '加载失败',
      content: content || '未知错误',
      showCancel: false
    });
  },
  showLoadToast: function(title, duration){
    wx.showToast({
      title: title || '加载中',
      icon: 'loading',
      mask: true,
      duration: duration || 10000
    });
  },
  util: require('./utils/util'),
  key: function(data){ return this.util.key(data) },
  enCodeBase64:function(data){ return this.util.base64.encode(data)},
  cache: {},
  _server: config.service.host,
  _user: {
    //微信数据
    wx: {},
    //学生\老师数据
    we: {}
  },
  _time: {} //当前学期周数
});