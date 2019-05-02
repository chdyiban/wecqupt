// pages/core/ss/ss.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalName: '',
    modalTitle: '',
    modalContent: '',
    myPanel:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this

    //渲染个人面板
    _this.setData({
      //根据API进行渲染
      myPanel:{
        name:'张三',
        dormitory: '16#1101',
        roommates: ['张大华','李一一','王宝强','赵土豪','屎进'],
      },
      listPanel:[
        {
          id: 59,
          date:'2019-05-19',
          score:'C',
          remark:'脏乱差',
        }, {
          id: 58,
          date: '2019-05-18',
          score: 'C',
          remark: '门窗洗手池不干净',
        }, {
          id: 57,
          date: '2019-05-17',
          score: 'A',
        }
      ],
    })
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

  },


  showQuestionModal: function(){
    var _this = this
    _this.setData({
      modalName: 'question',
      modalTitle: '宿舍号错误或有其他疑问',
      modalContent: '请加QQ群：704834760，\n或致电社区中心宿舍管理科：029-83135054',
    })
  },
  hideModal: function(){
    var _this = this
    _this.setData({
      modalName: '',
      modalTitle: '',
      modalContent: '',
    })
  }

})