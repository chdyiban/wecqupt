//detail.js (common)
var app = getApp();
var WxParse = require('../../../utils/wxParse/wxParse.js');
var config = require('../../../config');
module.exports.ipage = {
  data: {
    remind: "加载中",
    id: "",
    title: "", // 新闻标题
    date: "", // 发布日期
    author: "", // 发布作者
    views: 0, // 阅读量
    likes: 0,
    thumb: '',//缩略图
    content: "", // 新闻内容
    files_len: 0, // 附件数量
    files_list: [],
    file_loading: false, //下载状态
    source: '', // 附件来源
    sources: {
      'yiban': '长安大学易班',
      'xfjy': '先锋家园',
      'new': '新闻中心',
      'portal': '信息门户',
      'chdnews': '长安大学新闻网'
    },
    screenWidth: 0,
    hidden: true,
    prurl: '',
    painting: {},
    shareImage: '',
    showModal: false,
  },
  //分享
  onShareAppMessage: function() {
    var _this = this;
    return {
      title: _this.data.title,
      desc: '长大易班 - 资讯详情',
      path: '/pages/news/news/news_detail?id=' + _this.data.id
    }
  },

  convertHtmlToText: function(inputText) {
    var returnText = "" + inputText;
    returnText = returnText.replace(/<\/?[^>]*>/g, '').replace(/[ | ]*\n/g, '\n').replace(/ /ig, '')
      .replace(/&mdash/gi, '-').replace(/&ldquo/gi, '“').replace(/&rdquo/gi, '”');
    return returnText;
  },

  onLoad: function(options) {
    var _this = this;

    wx.getSystemInfo({
      success: function(res) {
        _this.setData({
          screenWidth: res.screenWidth
        })
      }
    })

    app.loginLoad(function() {
      _this.loginHandler.call(_this, options);
    });
  },
  loginHandler: function(options) {
    var _this = this;
    console.log(options)
    
    //由分享画布扫描而进入
  
    var scene = decodeURIComponent(options.scene)
    console.warn(scene)

    if (!options.id && !scene) {
      _this.setData({
        remind: '404'
      });
      return false;
    }
    options.id = (options.id === undefined) ? scene : options.id;
    _this.setData({
      id: options.id
    });
    options.openid = app._user.openid;
    wx.request({
      url: config.service.newsDetailUrl,
      data: options,
      success: function(res) {
        if (res.data && res.data.status === 200) {
          var info = res.data.data;
          // 提取信息中的时间，作者，阅读量
          //var author_info = [];
          // if(info.author){
          //   author_info = info.author.split(' ').map(function(e){
          //     return e.split(':')[1];
          //   });
          // }
          //console.log(author_info);
          _this.setData({
            date: info.archivesInfo.create_date || "", // 发布日期
            author: info.archivesInfo.author || "", // 发布作者
            views: info.archivesInfo.views || 0, // 阅读量
            likes: info.archivesInfo.likes || 0,
            title: info.archivesInfo.title, //新闻标题
            tags: info.archivesInfo.tags,
            thumb: info.archivesInfo.image,
            //source: _this.data.sources[options.type],
            commentList: info.commentList,
            remind: ''
          });
          WxParse.wxParse('article', 'html', info.archivesInfo.content, _this, 5);

          // 如果存在附件则提取附件里面的信息
          if (info.fjlist && info.fjlist.length) {
            info.fjlist.map(function(e) {
              //判断是否支持预览
              e.preview = (e.fjtitle.search(/\.doc|.xls|.ppt|.pdf|.docx|.xlsx|.pptx$/) !== -1);
              return e;
            });
            _this.setData({
              files_len: info.fjlist.length,
              files_list: info.fjlist
            });
          }
        } else {
          app.showErrorModal(res.data.message);
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }
      },
      fail: function() {
        app.showErrorModal(res.errMsg);
        _this.setData({
          remind: '网络错误'
        });
      }
    })
  },
  getFj: function(e) {
    var _this = this;
    if (!e.currentTarget.dataset.preview) {
      app.showErrorModal('不支持该格式文件预览！', '无法预览');
      return;
    }
    wx.showModal({
      title: '提示',
      content: '预览或下载附件需要消耗流量，是否继续？',
      confirmText: '继续',
      success: function(res) {
        if (res.confirm) {
          app.showLoadToast('下载中，请稍候');
          wx.showNavigationBarLoading();
          _this.setData({
            file_loading: true
          });
          //下载
          wx.downloadFile({
            url: e.currentTarget.dataset.url,
            success: function(res) {
              var filePath = res.tempFilePath;
              //预览
              wx.openDocument({
                filePath: filePath,
                success: function(res) {
                  console.info('预览成功');
                },
                fail: function(res) {
                  app.showErrorModal(res.errMsg, '预览失败');
                },
                complete: function() {
                  wx.hideNavigationBarLoading();
                  wx.hideToast();
                  _this.setData({
                    file_loading: false
                  });
                }
              });
            },
            fail: function(res) {
              app.showErrorModal(res.errMsg, '下载失败');
              wx.hideNavigationBarLoading();
              wx.hideToast();
              _this.setData({
                file_loading: false
              });
            }
          });
        }
      }
    });
  },
  bindGetUserInfo: function(e) {
    var _this = this
    //console.log(e.detail.userInfo)
    _this.getAvaterInfo(e.detail.userInfo.avatarUrl)
  },
  //获取用户头像
  getAvaterInfo: function(avatarUrl) { //cardInfo是传入的信息参数，按实际需要。
    wx.showLoading({
      title: '生成中头像...',
      mask: true,
    });
    var _this = this;
    wx.downloadFile({
      url: avatarUrl,
      success: function(res) {
        wx.hideLoading();
        if (res.statusCode === 200) {
          var avaterSrc = res.tempFilePath;
          //console.log(avaterSrc);
          _this.getQrCode(avaterSrc);
        } else {
          wx.showToast({
            title: '头像下载失败！',
            icon: 'none',
            duration: 2000,
            success: function() {
              //_this.getQrCode(avaterSrc = "", cardInfo);//回调另一个图片下载
            }
          })
        }
      }
    })
  },
  getQrCode: function(avaterSrc) {
    wx.showLoading({
      title: '生成中小程序码中...',
      mask: true,
    });
    var _this = this;
    var qrCodeUrl = config.service.newsShareQrCode + '?scene=' + _this.data.id + '&page=pages/news/news/news_detail';
    //console.log(qrCodeUrl)
    _this.eventDraw(avaterSrc, qrCodeUrl)
    // wx.request({
    //   url: qrCodeUrl,
    //   success:function(res){
    //     wx.hideLoading()

    //     if(res.statusCode === 200){
    //       //var data = res.data
    //       console.log(res.data);
    //       var array = wx.base64ToArrayBuffer(res.data)
    //       var base64 = wx.arrayBufferToBase64(res.data)
    //       base64 = base64.replace(/<[^>]+>/g, "")
    //       console.log(base64)
    //       _this.eventDraw(avaterSrc, base64) //真正的绘图方法
    //     }else{
    //       console.log("小程序码下载失败");
    //     }
        
    //   }
    // })
  },

  eventDraw(avaterSrc, qrCodeUrl) {
    var _this = this
    wx.showLoading({
      title: '绘制分享图片中',
      mask: true
    })
    _this.setData({
      showModal: true,
      painting: {
        width: 375,
        height: 555,
        clear: true,
        views: [{
            type: 'image',
            url: '../../../../../images/news/yiban-share-bg.jpg',
            top: 0,
            left: 0,
            width: 375,
            height: 555
          },
          {
            type: 'image',
            url: _this.data.thumb,
            top: 80,
            left: 9,
            width: 358,
            height: 220
          },
          {
            type:'image',
            url: qrCodeUrl,
            top:395,
            left:230,
            width:120,
            height:120
          },
          {
            type: 'text',
            content: _this.data.date,
            fontSize: 12,
            lineHeight: 21,
            color: '#383549',
            textAlign: 'left',
            top: 305,
            left: 44,
            width: 100,
            MaxLineNumber: 1,
          },
          {
            type: 'text',
            content: _this.data.title,
            fontSize: 16,
            lineHeight: 21,
            color: '#000',
            textAlign: 'left',
            top: 336,
            left: 44,
            width: 287,
            MaxLineNumber: 2,
            breakWord: true,
            bolder: true
          },
          {
            type: 'text',
            content: "长按扫码",
            fontSize: 11,
            lineHeight: 14,
            color: '#ccc',
            textAlign: 'left',
            top: 430,
            left: 185,
            width: 44,
            MaxLineNumber: 1,
            breakWord: true,
          },
          {
            type: 'text',
            content: "查看详情",
            fontSize: 11,
            lineHeight: 14,
            color: '#ccc',
            textAlign: 'left',
            top: 445,
            left: 185,
            width: 44,
            MaxLineNumber: 1,
            breakWord: true,
          },
          {//头像
            type: 'image',
            url: avaterSrc,
            top: 19,
            left: 30,
            width: 44,
            height: 44
          },
          {
            type: 'image',
            url: '../../../../../images/news/head.png',
            top: 19,
            left: 30,
            width: 44,
            height: 44
          },
        ],
      }
    })
  },
  eventGetImage(event) {
    var _this = this
    //console.log(event)
    wx.hideLoading()
    const {
      tempFilePath,
      errMsg
    } = event.detail
    if (errMsg === 'canvasdrawer:ok') {
      _this.setData({
        shareImage: tempFilePath
      })
    }
  },
  eventSave() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.shareImage,
      success(res) {
        wx.showToast({
          title: '保存图片成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  notopentips(){
    wx.showToast({
      title: "暂未开放",
      mask: true,
      icon: 'none',
    })
  },
  hideModal(){
    this.setData({
      showModal:false,
    })
  }

};