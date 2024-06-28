const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperArr: [],
    list: [],
    block: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //this.getSwiper();
    this.getList();
    this.getBlock();
    this.checkInfo();
  },

  
  // 获取轮播列表
  getSwiper() {
    let that = this;
    wx.request({
      url: app.config.getHostUrl() + '/api/pub/getSwipper',
      success: (res) => {
        if (res.data.isSuccess) {
          res.data.data.forEach(e => {
            e.imgLink = "listDetail/listDetail?acid=" + e.acid
          })
          that.setData({
            swiperArr: res.data.data
          })
        }
      },
    });
  },
  // 获取活动
  getList() {
    let that = this;
    wx.request({
      url: app.config.getHostUrl() + '/api/pub/getList',
      header: {
        "Content-Type": "application/json"
      },
      data: {
        "pageindex": 0,
        "pagesize": 5
      },
      method: "POST",
      success: (res) => {
        if (res.data.isSuccess) {
          res.data.data.activitys.forEach(e => {
            e.imgLink = "listDetail/listDetail?acid=" + e.acid
          })
          that.setData({
            list: res.data.data.activitys
          })
        }
      },
    });
  },
  // 获取展示
  getBlock() {
    let that=this;
    wx.request({
      url: app.config.getHostUrl() + '/api/pub/getCourses',
      success: (res) => {
        if (res.data.isSuccess) {
          res.data.data.forEach(e => {
            e.imgLink = "blockDetail/blockDetail?rcid=" + e.rcid
          })
          that.setData({
            block: res.data.data
          })
        }
      }
    })
  },
  
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.checkInfo();
    this.checkUpdate();
    this.getList();
    this.getBlock();
    app.stopRefresh();
  },

  checkUpdate() {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败',
        showCancel: false
      })
    })
  },

  /*
   * 检查个人信息是否填写完善
   */
  checkInfo() {
    let check = true;
    let uinfo = wx.getStorageSync('user')
    //console.log(uinfo)
    if (uinfo) {
      let info = JSON.parse(uinfo)
      //console.log(info)
      if (!info.pkuid) {
        check = false;
      }
    }
    if (!check) {
      wx.showModal({
        title: '个人资料未填写',
        content: '请先前往个人页面完善您的信息',
        complete: (res) => {
          if (res.cancel) {
            console.log("cancel");
          }
          if (res.confirm) {
            console.log("confirm");
            wx.switchTab({
              url: '/pages/user/user',
            })
          }
        }
      })
    }
  }

})