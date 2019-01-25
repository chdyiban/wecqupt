const app = getApp();

Page({
  data: {
    line: 0,
    array: ['校本部乘车点 → 渭水校区', '明德中学 → 渭水校区', '雁塔北门 → 渭水校区', '渭水校区 → 校本部','渭水校区 → 明德门'],
    day: null,
    allLineData: [
    { "line": "0", "week_day": "0", "start_time": "08:20" }, { "line": "0", "week_day": "0", "start_time": "13:00" }, { "line": "0", "week_day": "1", "start_time": "07:10" }, { "line": "0", "week_day": "1", "start_time": "08:00" }, { "line": "0", "week_day": "1", "start_time": "09:00" }, { "line": "0", "week_day": "1", "start_time": "13:00" }, { "line": "0", "week_day": "1", "start_time": "14:30" }, { "line": "0", "week_day": "1", "start_time": "17:30" }, { "line": "1", "week_day": "0", "start_time": "08:00" }, { "line": "1", "week_day": "0", "start_time": "12:40" }, { "line": "1", "week_day": "1", "start_time": "07:00" }, { "line": "1", "week_day": "1", "start_time": "07:50" }, { "line": "1", "week_day": "1", "start_time": "08:50" }, { "line": "1", "week_day": "1", "start_time": "12:50" }, { "line": "1", "week_day": "1", "start_time": "14:20" }, { "line": "2", "week_day": "1", "start_time": "07:00" }, { "line": "2", "week_day": "1", "start_time": "12:50" }, { "line": "3", "week_day": "0", "start_time": "09:40" }, { "line": "3", "week_day": "0", "start_time": "12:20" }, { "line": "3", "week_day": "0", "start_time": "17:00", "extra": "如遇大型考试，此车另行安排" }, { "line": "3", "week_day": "1", "start_time": "08:30" }, { "line": "3", "week_day": "1", "start_time": "10:30" }, { "line": "3", "week_day": "1", "start_time": "10:40" }, { "line": "3", "week_day": "1", "start_time": "12:20" }, { "line": "3", "week_day": "1", "start_time": "12:30" }, { "line": "3", "week_day": "1", "start_time": "13:00" }, { "line": "3", "week_day": "1", "start_time": "16:00" }, { "line": "3", "week_day": "1", "start_time": "16:20" }, { "line": "3", "week_day": "1", "start_time": "17:10" }, { "line": "3", "week_day": "1", "start_time": "18:00", "extra": "该时刻含一趟仅到北客站" }, { "line": "3", "week_day": "1", "start_time": "21:40" }, { "line": "4", "week_day": "0", "start_time": "09:40" }, { "line": "4", "week_day": "0", "start_time": "12:20" }, { "line": "4", "week_day": "0", "start_time": "17:00", "extra": "如遇大型考试，此车另行安排" }, { "line": "4", "week_day": "1", "start_time": "10:30" }, { "line": "4", "week_day": "1", "start_time": "12:20" }, { "line": "4", "week_day": "1", "start_time": "16:10" }, { "line": "4", "week_day": "1", "start_time": "17:10" }, { "line": "4", "week_day": "1", "start_time": "18:00", "extra": "该时刻含一趟仅到北客站" }, { "line": "4", "week_day": "1", "start_time": "21:40" }
    ],
    lineData:[],
  },
  bindPickerChange: function (e) {
    var _this = this
    _this.setData({
      line: e.detail.value
    })
    _this.setLine()
  },
  changeDay: function(e){
    var _this = this
    this.setData({
      day:e.target.dataset.id
    })
    _this.setLine()
  },
  setLine:function(){
    var _this = this
    
    var tempLineData = []//清空校车数据
    var tempDay = null
    //校车数据周内与周末重复，在此之之分周内周末
    if(_this.data.day === '0' || _this.data.day === '6'){
      tempDay = '0'
    }else{
      tempDay = '1'
    }
    _this.data.allLineData.forEach(function(val,index){
      if (_this.data.line == val.line && tempDay == val.week_day){
        var tempStop = _this.data.array[_this.data.line]
        var tempStopArray = tempStop.toString().split(" ")
        val.start_pos = tempStopArray[0]
        val.end_pos = tempStopArray[tempStopArray.length - 1]
        tempLineData.push(val)
      }
    }) 
    _this.setData({
      lineData: tempLineData
    })
  },
  onLoad: function (options) {
    var _this = this
    var d = new Date()
    
    this.setData({
      day:d.getDay().toString()
    })
    _this.setLine()
  },
  onReady: function () {
  
  },
  onUnload: function () {
  
  },

  onReachBottom: function () {
  
  },
  onShareAppMessage: function () {
  
  }
})