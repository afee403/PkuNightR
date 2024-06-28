// pages/user/user.js
const app = getApp();
import Notify from '@vant/weapp/notify/notify';
import Dialog from '@vant/weapp/dialog/dialog';
import Toast from '@vant/weapp/toast/toast';
const medals_All = require('../../utils/medals_all');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {
      img: "/imgs/default/girl.jpg"
    },  //用户数据
    unreadMessagesNum: 0, //未读信息
    isUnsigned: true,  //未注册
    medals: [],
    medals_all: [],
    isShowSettingMenu: false, //设置菜单
    isShowProtocol: false,    //用户协议
    cacheSize: '0kB',         //缓存
    isShowloading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化页面数据
    this.initData();
    wx.startPullDownRefresh();
    console.log("uesrload");
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.initData();
    // app.checkUser()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.initData();
    wx.startPullDownRefresh();
    console.log("uesrshow");
  },

  onHide: function () {
    // this.initData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.initData();
  },

  initData: function() {
    // 初始化用户数据
    // let user = that.getUserInfoFromLocal();
    //初始化：获取用户数据
    this.setData({ medals_all: medals_All });
    this.getUserData();
    //初始化：缓存数据
    this.setCacheSize();
  },

  /**
   * 跳转
   */
  //跳转到用户编辑页面
  goToEdit: function(){
    let that = this;
    let user = that.data.user;
    wx.navigateTo({
      url: 'edit/edit',
    });
  },

  //从服务器获取：判断是否注册、本地缓存
  getUserData: function(){
    let that = this;
    that.setData({
        isShowloading: true
    });
    app.getOpenid().then(res => {
      let openid = res;
      wx.request({
        url: app.config.getHostUrl() + '/api/user/getUser',
        method: 'post',
        data: {
          openid: openid
        },
        success: function (res) {
          if (res.statusCode == 200) {
            if (res.data.isSuccess) {
              that.updateCurrentUser(res.data.data);
              that.setData({isUnsigned: false});
              wx.setStorageSync('user', JSON.stringify(res.data.data));
              wx.setStorageSync('isunsigned', JSON.stringify(that.data.isUnsigned));
              // 获取勋章称号
              that.requestData(res.data.data.rid).then((result)=>{
                  that.setData({
                      medals: that.parseMedals(result),
                      isShowloading: false
                  })
              })
              // Notify({ type: 'success', message: "刷新成功" });
            } else {
              // 未注册情况
              that.setData({isUnsigned: true})
              wx.setStorageSync('isunsigned', JSON.stringify(that.data.isUnsigned));
              Notify({ type: 'danger', message: "您还未注册" });
            }
          } else {
            // 服务器故障
          }
        },
        fail: function (res) {
          // 请求错误
        },
        complete: function (){
          that.setData({
              isShowloading: false
          });
          app.stopRefresh();  //停止刷新状态的显示
        }
      })
    })
  },

  getLoca() {
    wx.getLocation({
      type: "wgs84",
      isHighAccuracy: true,
      success (res) {
      },
      fail (res) {
        wx.showModal({
          title: '提示',
          content: '位置信息获取失败',
          success (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    })
  },

  /**
   * 注册并获取用户信息
   */
  getUserInfo: function(e){
    let that = this;
    wx.showLoading({
      title: '验证中...',
    })
    this.getLoca();
    app.getOpenid().then(  //获取openid，不需要授权
      (data) => {
        let userData = {
          openid: data,   //openid
          nickname: e.detail.userInfo.nickName,  //昵称
          sex: e.detail.userInfo.gender,  //性别
          img: e.detail.userInfo.avatarUrl  //头像
        };
        //注册
        wx.request({
          url: app.config.getHostUrl()+'/api/main/wxAuth',
          method: 'post',
          data: userData,
          success: (res) => {
            wx.hideLoading()
            if(res.data.isSuccess){
              //注册成功处理逻辑
              console.log(res.data)
              // 获取勋章称号
              // that.getUserAll(res.data.data.rid);
              that.setData({
                isUnsigned: false
              });
              wx.setStorageSync('isunsigned', JSON.stringify(that.data.isUnsigned));
              let user = {...res.data.data};
              delete user.honors;
              delete user.medals;
              that.updateCurrentUser(user);
              wx.setStorageSync('user', JSON.stringify(user));
              wx.reLaunch({
                url: '/pages/user/user',
                success() {
                  wx.navigateTo({
                    url: '/pages/user/edit/edit',
                  });
                }
              })
            }else{
              // 注册失败
              wx.hideLoading()
              wx.showModal({
                title: '错误',
                content: '注册失败，请稍后再是',
                complete: (res) => {}
              })
              console.log(res.data.msg)
            }
          },
          fail: (res) => {
            wx.hideLoading()
            // 请求失败
            wx.showModal({
              title: '错误',
              content: '注册失败，请稍后再是',
              complete: (res) => {}
            })
          }
        })
    });
  },

  // 从本地获取用户数据
  getUserInfoFromLocal: function () {
    let user = wx.getStorageSync('user');
    if (user) {
      return JSON.parse(user);
    } else return false;
  },

  // 更新用户显示数据
  updateCurrentUser: function (data) {
    if (data) {
      this.setData({ user: data });
    }
  },


  // 获取勋章称号等数据
  getUserAll: function () {
    let that = this;
    let user = that.data.user;
    let rid = user.rid
    wx.request({
      url: app.config.getHostUrl() + '/api/user/getUserAll',
      method: 'post',
      data: {
        rid: rid
      },
      success: function (res) {
        if (res.statusCode == 200) {
          if (res.data.isSuccess) {
            that.setData({
              medals_count: res.data.data.medals.length,
              honors: res.data.data.honors instanceof Array ? res.data.data.honors[0] : res.data.data.honors,
              medals: that.parseMedals(res.data.data.medals),
            });
          }
        } else {
          // 服务器故障
        }
      },
      fail: function (res) {
        // 请求错误
      }
    })
  },


//获取个人勋章数据
requestData(rid) {
  return new Promise((resolve, reject)=>{
      wx.request({
          url: app.config.getHostUrl()+'/api/user/getMedal',
          data: { rid },
          method: 'POST',
          success: (result)=>{
              if(result.data.isSuccess){
                  resolve(result.data.data);
              }else{
                  reject(result.data.msg);
              }
          },
          fail: ()=>{},
          complete: ()=>{}
      });
  })
},

// 处理勋章数据
parseMedals(medals) {

  if(medals == [] || medals.length == undefined) {
    return medals;
  }
  else {
    let nmedals = [];
    for (let i = 0; i < medals.length; i++) {
        // if (medals[i] == undefined) continue;
        let outer = medals[i];
        let item = [outer];
        nmedals.push(item);
        for (let k = 0; k < this.data.medals_all.length; k++){
            if (this.data.medals_all[k][0].meid == item[0].meid) {
              this.data.medals_all[k][0].type = 1;
              this.data.medals_all[k][0].created_at = item[0].created_at;
              this.data.medals_all[k][0].rank = item[0].linkid;
              break;
            }
        } 
    }
    return nmedals;
  }
},


  /** 
   * 设置方法
   */
  // 关闭一些弹窗
  onClose: function(){
    this.setData({
      isShowSettingMenu: false,  // 关闭菜单弹窗
      isShowProtocol: false,     // 关闭用户协议
    })
  },

  // 显示设置菜单
  showSettingMenu: function(){
    this.setData({
      isShowSettingMenu: true
    })
  },

  // 展示用户协议
  showProtocol: function(){
    this.setData({
      isShowProtocol: true
    })
  },

  // 查询并设置缓存数据
  setCacheSize: function(){
    let that = this;
    wx.getStorageInfo({
      success (res) {
        that.setData({
          cacheSize: res.currentSize+"KB"
        })
        // console.log(res.limitSize)
      }
    })
  },

  // 清除缓存
  cleanCache: function(){
    let that = this;
    Dialog.confirm({
      title: '提示',
      zIndex: 200,
      message: '清除缓存数据，只会清除您本地的数据，并不会删除您在我们服务器上的数据',
      confirmButtonText: '取消',
      cancelButtonText: '确认'
    }).then(() => {
      // on confirm
    }).catch(() => {
      // on cancel
      wx.clearStorageSync();
      that.setCacheSize();
    });
  },

  getUpdate() {
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

  //检查更新
  checkUpdate() {
    this.getUpdate();
    Toast.loading({
        mask: false,
        duration: 1500,
        message: '检测中...',
      });
    setTimeout(()=>{
        Toast({
            duration: 2000,
            message: '当前已是最新版本'
        });
    }, 1800);
  },

  // 注销账号
  deleteUser() {
    let that = this;
    Dialog.confirm({
        title: '危险操作',
        zIndex: 200,
        message: '该操作不可撤销，一旦确认，将从本系统中删除您的所有数据，请谨慎操作',
        confirmButtonText: '取消',
        cancelButtonText: '确认'
    })
    .then(() => {

    })
    .catch(()=>{
        Dialog.confirm({
            title: '再次确认',
            zIndex: 200,
            message: '确认要注销您的账户，并清除您所有的数据吗？',
            confirmButtonText: '取消',
            cancelButtonText: '确认'
        })
        .then(() => {
        
        })
        .catch(()=>{
            wx.request({
                url: app.config.getHostUrl()+'/api/user/doUnset',
                data: {
                    rid: that.data.user.rid
                },
                method: 'POST',
                success: (result)=>{
                    
                },
                fail: ()=>{},
                complete: ()=>{}
            });
            this.setData({user: {img: "/imgs/default/girl.jpg"}, medals_all: medals_All});
            wx.clearStorageSync();
            that.setCacheSize();
        })
    })
  }
})