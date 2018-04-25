//bx_apply.js
//获取应用实例
var app = getApp();
Page({
  remind: '加载中',
  data: {
    serviceTypeList: {},      //获取到的服务类型列表数据
    serviceAreaList: [],      //获取到的服务区域列表数据
    serviceTypeValue: false,  //服务类型picker-value
    serviceTypeRange: [],     //服务类型picker-range
    serviceObjectValue: false,//服务项目picker-value
    serviceObjectRange: ['请先选择服务类型'],   //服务项目picker-range
    serviceAreaValue: false,  //服务区域picker-value
    serviceAreaRange: [],     //服务区域picker-range  
    formData: {             //表单数据
        Id: '',         //统一认证码
        Name: '',       //姓名
        Title: '',      //标题
        CategoryId: '', //服务类型
        SpecificId: '', //服务项目id
        Phone:  '',     //报修用户电话
        AddressId:  '', //报修区域id
        Address: '',    //报修地点
        Content: ''     //报修内容
    },
    showError: false,
    // images: [],
    // urlArr: [],
    // loading: false,

    imgs: [],
    imgLen: 0,
    upload: true,
    uploading: false,
    qiniu: '',
    showError: false
  },
  onLoad: function(){
    if(!app._user.we.id || !app._user.we.name){
      this.setData({
        remind: '未绑定'
      });
      return false;
    }
    this.setData({
      'formData.Id': app._user.we.id,
      'formData.Name': app._user.we.name
    });
    // 发送请求
    this.getServiceType();
    this.getServiceArea();
    this.getImgUploadToken();
  },
  getImgUploadToken:function(){
    var _this = this;
    wx.request({
      url: app._server + '/public/api/upload/token',
      method: 'POST',
      data: app.key({
        openid: app._user.openid
      }),
      success: function (res) {
        if (res.data.status === 200) {
          _this.setData({
            upload: true,
            qiniu: res.data.data.token
          });
        }
      },
      complete: function () {
        wx.hideNavigationBarLoading();
      }
    });
  },
  getServiceType: function () {
    var _this = this;
    wx.request({
      url: app._server + '/public/api/repair/get_repair_type',
      success: function(res) {
        if(res.data && res.data.status === 200){
          var list = res.data.data, serviceTypeRange = [];
          for(var key in list){
            if(list.hasOwnProperty(key)){ 
              serviceTypeRange.push(key);
            }
          }
          _this.setData({
            serviceTypeList: list,
            serviceTypeRange: serviceTypeRange
          });
          if(_this.data.serviceTypeRange.length && _this.data.serviceAreaRange.length){  
            _this.setData({
              remind: ''
            });
          }
        }else{
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }
      },
      fail: function(res) {
        app.showErrorModal(res.errMsg);
        _this.setData({
          remind: '网络错误'
        });
      }
    });
  },
  getServiceArea: function () {
    var _this = this;
    wx.request({
      url: app._server + '/public/api/repair/get_repair_areas',
      success: function(res) {
        if(res.data && res.data.status === 200){
          var list = res.data.data;
          var serviceAreaRange = list.map(function(e,i){
            return e.Name;
          });
          _this.setData({
            serviceAreaList: list,
            serviceAreaRange: serviceAreaRange
          });
          if(_this.data.serviceTypeRange.length && _this.data.serviceAreaRange.length){  
            _this.setData({
              remind: ''
            });
          }
        }else{
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }
      },
      fail: function(res) {
        app.showErrorModal(res.errMsg);
        _this.setData({
          remind: '网络错误'
        });
      }
    });
  },
  listenerServiceType: function(e) {
    var index = e.detail.value;
    var theServiceTypeList = this.data.serviceTypeList[this.data.serviceTypeRange[index]];
    var serviceObjectRange = theServiceTypeList.map(function(e, i){
      return e.Name;
    });
    this.setData({
      serviceTypeValue: index,
      serviceObjectValue: false,
      serviceObjectRange: serviceObjectRange
    });
  },
  listenerServiceObject: function(e) {
    if(!this.data.serviceTypeValue){
      app.showErrorModal('请先选择服务类型', '提醒');
      return false;
    }
    var index = e.detail.value;
    var theServiceTypeList = this.data.serviceTypeList[this.data.serviceTypeRange[this.data.serviceTypeValue]];
    this.setData({
      serviceObjectValue: index,
      'formData.CategoryId': theServiceTypeList[index].CategId,
      'formData.SpecificId': theServiceTypeList[index].Id
    });
  },
  listenerServiceArea: function(e) {
    this.setData({
      serviceAreaValue: e.detail.value,
      'formData.AddressId': this.data.serviceAreaList[e.detail.value].Id
    });
  },
  listenerAddress: function(e) {
    this.setData({
      'formData.Address': e.detail.value
    });
  },
  listenerTel: function(e) {
    this.setData({
      'formData.Phone': e.detail.value
    });
    if(e.detail.value.length >= 11){
      wx.hideKeyboard();
    }
  },
  listenerTitle: function(e) {
    this.setData({
      'formData.Title': e.detail.value
    });
  },
  listenerTextarea: function(e) {
    this.setData({
      'formData.Content': e.detail.value
    });
  },
  submitApply: function(e) {
    var _this = this,
        formData = _this.data.formData;
    _this.setData({
        showError: true
    }); 
    // 验证表单
    if(!formData.CategoryId || !formData.SpecificId || !formData.AddressId || !formData.Phone || !formData.Address || formData.Phone.length !== 11 || !formData.Title || !formData.Content){
      return false;
    }
    wx.showModal({
      title: '提示',
      content: '是否确认提交申请？',
      success: function(res) {
        if (res.confirm) {
          formData.openid = app._user.openid;
          wx.request({
            url: app._server + '/public/api/repair/submit',
            method: 'POST',
            data: app.key(formData),
            success: function(res) {
              if(res.data && res.data.status === 200){
                wx.showToast({
                  title: '提交成功',
                  icon: 'success',
                  duration: 2000
                });
                wx.navigateBack();
              }else{
                var errorMessage = (res.data.data && res.data.data.reason) || res.data.message;
                app.showErrorModal(errorMessage);
              }
            },
            fail: function(res) {
              app.showErrorModal(res.errMsg);
            }
          });
        }
      }
    });

  },

  // //拍照上传
  // upImg: function () {
  //   var that = this;
  //   wx.chooseImage({
  //     count: 9, // 默认9
  //     sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
  //     sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
  //     success: function (res) {

  //       wx.showNavigationBarLoading()
  //       that.setData({
  //         loading: false
  //       })
  //       var urlArr = that.data.urlArr;
  //       // var urlArr={};
  //       var tempFilePaths = res.tempFilePaths;
  //       var images = that.data.images;

  //       that.setData({
  //         images: images.concat(tempFilePaths)
  //       });
  //       var imgLength = tempFilePaths.length;
  //       if (imgLength > 0) {
  //         var newDate = new Date();
  //         var newDateStr = newDate.toLocaleDateString();
  //         var j = 0;
  //         //如果想顺序变更，可以for (var i = imgLength; i > 0; i--)
  //         for (var i = 0; i < imgLength; i++) {
  //           var tempFilePath = [tempFilePaths[i]];
  //           var extension = /\.([^.]*)$/.exec(tempFilePath[0]);
  //           if (extension) {
  //             extension = extension[1].toLowerCase();
  //           }
  //           var name = newDateStr + "." + extension;//上传的图片的别名 
  //           wx.uploadFile({
  //             url: app._server + '/public/api/repair/upload',
  //             filePath: tempFilePaths[i],
  //             name: 'upload_repair_pic',
  //             method: 'POST',
  //             formData: {
  //               'imgIndex': i
  //             },
  //             header: {
  //               "Content-Type": "multipart/form-data"
  //             },
  //             success: function (res) {
  //               wx.hideNavigationBarLoading();
  //               i++; 
  //               console.log(res.data);
  //               var data = JSON.parse(res.data);
  //               console.log(data);
  //               var url = data.url;
  //               console.log(url);
  //               urlArr.push({ url }); 
  //               that.setData({
  //                 urlArr: urlArr,
  //                 loading: true,
  //                 'formData.ImgUrl': urlArr
  //               });

  //             },fail: function(res){
  //               wx.showModal({
  //                 title: '错误提示',
  //                 content: '上传图片失败',
  //                 showCancel: false
  //               })  
  //             }
  //           });     
  //           // var file = new Bmob.File(name, tempFilePath);
  //           // file.save().then(function (res) {
  //           //   wx.hideNavigationBarLoading()
  //           //   var url = res.url();
  //           //   console.log("第" + i + "张Url" + url);
  //           //   urlArr.push({ url });
  //           //   j++;
  //           //   console.log(j, imgLength);
  //           //   that.setData({
  //           //     urlArr: urlArr,
  //           //     loading: true
  //           //   });
  //           // },
  //           //   function (error) {
  //           //     console.log(error)
  //           //   });
  //         }
  //       }
  //     }
  //   })
  //   //console.log(that.data.urlArr)
  // },

  delete: function (e) {
    var _this = this;
    // 获取本地显示的图片数组
    var index = e.currentTarget.dataset.index;
    var images = _this.data.images;
    var urlArr = _this.data.urlArr;
    urlArr.splice(index, 1);
    images.splice(index, 1);
    _this.setData({
      images: images,
      urlArr: urlArr
    });
  },

  //七牛云上传
  choosePhoto: function () {
    var _this = this;
    wx.showModal({
      title: '提示',
      content: '上传图片需要消耗流量，是否继续？',
      confirmText: '继续',
      success: function (res) {
        if (res.confirm) {
          wx.chooseImage({
            count: 4,
            sourceType: ['album', 'camera'],
            success: function (res) {
              var tempFilePaths = res.tempFilePaths, imgLen = tempFilePaths.length;
              _this.setData({
                uploading: true,
                imgLen: _this.data.imgLen + imgLen
              });
              tempFilePaths.forEach(function (e) {
                _this.uploadImg(e);
              });
            }
          });
        }
      }
    });
  },
  uploadImg: function (path) {
    var _this = this;
    if (app.g_status) {
      app.showErrorModal(app.g_status, '上传失败');
      return;
    }
    wx.showNavigationBarLoading();
    // 上传图片
    wx.uploadFile({
      url: 'https://upload-z2.qiniup.com',
      header: {
        'Content-Type': 'multipart/form-data'
      },
      filePath: path,
      name: 'file',
      formData: {
        token: _this.data.qiniu
      },
      success: function (res) {
        var data = JSON.parse(res.data);
        if (data.key) {
          _this.setData({
            imgs: _this.data.imgs.concat('http://yibancdn.ohao.ren/' + data.key),
            'formData.ImgUrl': _this.data.imgs.concat('http://yibancdn.ohao.ren/' + data.key)
          });
        }
        if (_this.data.imgs.length === _this.data.imgLen) {
          _this.setData({
            uploading: false
          });
        }
      },
      fail: function (res) {
        _this.setData({
          imgLen: _this.data.imgLen - 1
        });
      },
      complete: function () {
        wx.hideNavigationBarLoading();
      }
    });
  },
  previewPhoto: function (e) {
    var _this = this;
    //预览图片
    if (_this.data.uploading) {
      app.showErrorModal('正在上传图片', '预览失败');
      return false;
    }
    wx.previewImage({
      current: _this.data.imgs[e.target.dataset.index],
      urls: _this.data.imgs
    });
  },

  
});

