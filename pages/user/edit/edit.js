// pages/user/edit/edit.js
import Notify from '@vant/weapp/notify/notify';
const app = getApp();
//获取到image-cropper实例
let cropper = null;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isShowCropper: false,
        isShowPicker: false,
        imgsrc: '',  //裁剪原图
        width: 250,//裁剪框宽度
        height: 250,//裁剪框高度

        user: {},
        pickerindex: 0,
        pkuid_new: null,
        pkuid_old: null,
        userOld: "",  //原始数据，用户判断是否更新。对象格式属于引用数据，会同时改变
        imgNew: null, //裁剪好的图，通过和原图是否同地址 判断是否换了头像
        imgOld: null, //原来的头像
    },
    

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // console.log(options)
        let that = this;
        this.getUserS();
        cropper = this.selectComponent("#image-cropper");
    },

    onShow: function() {
      this.getUserS();
    },

    // 获取用户信息
    getUserS: function(){
      let that = this
      let data = wx.getStorageSync('user')
      console.log(data)
      data = JSON.parse(data)
      console.log(data)
      that.setData({ 
          user: data,
          userOld: JSON.stringify(data), 
          pkuid_old: data.pkuid,
          imgOld: data.img
      });
    },
    
    /**
     * 图片裁剪功能
     */
    // 选择图片
    startChoose(){
        let that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: (res)=>{
                console.log(res)
                //开始裁剪
                that.setData({
                    imgsrc: res.tempFilePaths[0],
                    isShowCropper: true
                });
                wx.showLoading({
                    title: '加载中'
                })
            },
            fail: (res)=>{
                console.log(res.errMsg)
            }
        });
    },
    // 初始化完成
    cropperload(e){
        // console.log("cropper初始化完成");
    },
    // 加载图片完成
    loadimage(e){
        // console.log("图片加载完成",e.detail);
        wx.hideLoading();
        console.log(cropper)
        //重置图片角度、缩放、位置
        cropper.imgReset();
    },
    // 裁剪图片
    clickcut(e) {
        // console.log(e.detail);
        //点击裁剪框阅览图片
        // wx.previewImage({
        //     current: e.detail.url, // 当前显示图片的http链接
        //     urls: [e.detail.url] // 需要预览的图片http链接列表
        // })
        let user = this.data.user;
        user.img = e.detail.url;
        this.setData({
            user,
            imgNew: e.detail.url,
            isShowCropper: false
        })
    },

    //还原头像
    resetImg(){
        let user = this.data.user;
        user.img = this.data.imgOld;
        this.setData({
            user,
            imgNew: null
        })
    },


    //保存修改
    save(){
        let that = this; 
        let user = this.data.user;
        if (this.data.pkuid_old != null && user.pkuid!=this.data.pkuid_old) {
          Notify({ type: 'warning', message: '学号修改失败，请联系管理员' });
        }
        else {
          if(this.data.imgNew!=null && this.data.imgNew!=this.data.imgOld){ //修改了头像
              wx.showLoading({
                  title: '上传头像中...'
              })
              this.uploadImg(this.data.imgNew)
                  .then((res)=>{
                      wx.showLoading({
                          title: '保存中...'
                      })
                      user.img = res.url;
                      if (user.pkuid!=this.data.pkuid_old) {
                        wx.showModal({
                          title: '提示',
                          content: '学号用于后续活动奖励认证，绑定后不支持自行修改',
                          success (res) {
                            if (res.confirm) {
                              that.saveUser(user);
                              console.log('用户点击确定')
                            } else if (res.cancel) {
                              that.setData({user: JSON.parse(that.data.userOld)});
                              console.log('用户点击取消')
                            }
                          }
                        })
                      }
                      else {
                        this.saveUser(user);
                      } 
                  })
                  .catch((res)=>{
                      wx.hideLoading();
                      console.log('头像上传失败：', res)
                  })
          }else{
            if (user.pkuid!=this.data.pkuid_old) {
              wx.showModal({
                title: '提示',
                content: '学号用于后续活动奖励认证，绑定后不支持自行修改',
                success (res) {
                  if (res.confirm) {
                    that.saveUser(user);
                    console.log('用户点击确定')
                  } else if (res.cancel) {
                    that.setData({user: JSON.parse(that.data.userOld)});
                    that.eventChannel.emit('whenUpdated', that.data.user);
                    console.log('用户点击取消')
                  }
                }
              })
            }
            else {
              this.saveUser(user);
            }  
          }
        }
    },
    //上传头像
    uploadImg(imgPath){
        return new Promise((resolve, reject)=>{
            wx.uploadFile({
                url: app.config.getHostUrl()+'/api/user/uploadImg',
                filePath: imgPath,
                name: 'img',
                success(res) {
                    let rd = JSON.parse(res.data);
                    if(rd.isSuccess){
                        resolve(rd.data);
                    }else{
                        reject(rd.msg)
                    }
                },
                fail(res) {
                    reject(res.errMsg)
                }
            });
        })
    },
    //保存用户
    saveUser(user){
        wx.showLoading({
          title: '上传中...',
        })
        if(JSON.stringify(this.data.user) != this.data.userOld){
            wx.request({
                url: app.config.getHostUrl()+'/api/user/doUpdate',
                data: user,
                method: 'post',
                success: (res) => {
                    if(res.data.isSuccess){
                        wx.hideLoading();
                        Notify({ type: 'success', message: res.data.msg });
                        wx.setStorageSync('user', res.data.data);
                        setTimeout(function(){
                            wx.navigateBack();
                        }, 1200);
                    }else{
                        setTimeout(function(){
                          wx.hideLoading()
                          Notify({ type: 'danger', message: "保存失败，请重试" });
                        }, 1200);
                        this.getUserS();
                    }
                },
                fail: (res)=>{
                    Notify({ type: 'danger', message: "保存失败，请重试" });
                    wx.hideLoading();
                    setTimeout(function(){
                        wx.navigateBack();
                    }, 1200);
                }
            });
        }else{
            wx.hideLoading();
            Notify({ type: 'warning', message: '您未做任何修改哦' });
        }
    },

    //输入框
    onFieldChange(e){
        let user = this.data.user;
        user[e.currentTarget.dataset.who] = e.detail;
        this.setData({ user });
    },
    onFieldChange_pkuid(e){
      let user = this.data.user;
      user[e.currentTarget.dataset.who] = e.detail;
      this.setData({ user });
      this.setData({pkuid_new: true});
  },
    onFieldConfirm(e){
        let user = this.data.user;
        user[e.currentTarget.dataset.who] = e.detail;
        this.setData({ user });
    },
    onFieldConfirm_pkuid(e){
      let user = this.data.user;
      user[e.currentTarget.dataset.who] = e.detail;
      this.setData({ user });
      this.setData({pkuid_new: true});
  },
    // pickerChange(e) {
    //     let user = this.data.user;
    //     user.team = e.detail.value;
    //     this.setData({ user, isShowPicker: false });
    // },
    onConfirm(e) {
        let user = this.data.user;
        this.setData({ user, isShowPicker: false });
    },
    onCancel() {
        this.setData({ isShowPicker: false });
    }
})