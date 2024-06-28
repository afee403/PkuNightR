const app = getApp();
const medals_All = require('../../../utils/medals_all');
//const { wxml, style } = require('./sharepage');
const Poster = require('./sharepage')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        bias: 0,
        rank: 0,
        distance: 1.0,
        ispop: false,
        isfield: false,
        isShowloading: true,
        medal: [],
        medals_all: [],
        user: {},
        medal_data: "",
        time_at_now: null,
        time_start: null,
        time_end: null,
        is_time: false,
        is_place: false,
        xx: null,
        yy: null,
        width: null,
        height: null,
        src:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (option) {
        this.widget = this.selectComponent(".widget");
        let user_info = JSON.parse(wx.getStorageSync('user'));
        this.setData({ user: user_info});
        this.setData({ medals_all: medals_All });
        this.requestData(this.data.user.rid)
        let medal_meid;
        if (option != null) {
          this.setData({ medal_data: option.medal});
          medal_meid = JSON.parse(option.medal);
          wx.setStorageSync('meid', JSON.stringify(medal_meid));
        }
        else {
          medal_meid = wx.getStorageSync('meid');
        }
        for (let k = 0; k < this.data.medals_all.length; k++) {
          if (this.data.medals_all[k][0].meid == medal_meid) {
            this.setData({medal: this.data.medals_all[k]});
            break;
          }
        }
        this.setData({
          time_start: this.formatDate(this.data.medal[0].getable),
          time_end: this.formatDate(this.data.medal[0].ungetable),
          rank: this.data.medal[0].rank,
          bias: this.data.medal[0].bias
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    onshow: function() {
      wx.getLocation({
        type: "wgs84",
        isHighAccuracy: true,
        success (res) {
          const latitude = res.latitude
          const longitude = res.longitude
          that.setData({xx: longitude, yy: latitude})
        },
        fail (res) {
          wx.showModal({
            title: '提示',
            content: '未获得位置信息',
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

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
      if(medals == []) return medals;
      let nmedals = [];
      for (let i = 0; i < medals.length; i++) {
          // if (medals[i] == undefined) continue;
          let outer = medals[i];
          let item = [outer];
          nmedals.push(item);
          for (let k = 0; k < this.data.medals_all.length; k++){
              if (this.data.medals_all[k][0].mkey == item[0].mkey) {
                this.data.medals_all[k][0].type = 1;
                this.data.medals_all[k][0].created_at = item[0].created_at;
                break;
              }
          } 
      }
      return nmedals;
    },

    exgetMedal() {
      let that = this;
      let user = that.data.user;
      if(this.data.user.pkuid != null) {
        this.setData({time_at_now: Date.parse(new Date())});
        if (this.data.time_at_now > that.data.medal[0].getable && this.data.time_at_now < that.data.medal[0].ungetable) {
          this.setData({is_time: true});
        }
        wx.getLocation({
          type: "wgs84",
          isHighAccuracy: true,
          success (res) {
            const latitude = res.latitude
            const longitude = res.longitude
            that.setData({xx: longitude, yy: latitude})
            if (that.data.xx >= 116.3065 && that.data.xx <= 116.314480) {
              if (that.data.yy >= 39.9856 && that.data.yy <= 39.988392) {
                that.setData({is_place: true})
              }
            }
          },
          fail (res) {
            wx.showModal({
              title: '提示',
              content: '未获得位置信息',
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
        wx.hideLoading()
        setTimeout(function() {
          if (false||(that.data.is_place && that.data.is_time)) {
            return new Promise((resolve, reject)=>{
              wx.request({
                  url: app.config.getHostUrl()+'/api/user/lightMedal',
                  data: { 
                    "rid": that.data.user.rid,
                    "meid": that.data.medal[0].meid
                  },
                  method: 'POST',
                  success: (result)=>{
                      if(result.data.isSuccess){
                          resolve(result.data.data);
                          that.data.medal[0].type = 1;
                          that.data.medal[0].rank = result.data.data.linkid;
                          that.data.medal[0].created_at = result.data.data.created_at;
                      }else{
                          reject(result.data.msg);
                      }
                      wx.showModal({
                        title: '徽章已点亮，生成分享海报',
                        complete: (res) => {
                          wx.redirectTo({
                            url: '/pages/user/medals/medals?medal='+that.data.medal_data,
                          })
                        }
                      })
                  },
                  fail: ()=>{
                    wx.showModal({
                      title: '请稍后再试',
                      complete: (res) => {}
                    })
                  },
                  complete: ()=>{
                  }
              });
            })
          }
          else {
            wx.showModal({
              title: '提示',
              content: '未在可点亮时间或指定地点',
              success (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }
        }, 500)
      }
      else {
        wx.showModal({
          title: '提示',
          content: '对不起，请先绑定您的学号',
          success (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../edit/edit',
              });
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    },

    // 获取徽章
    getMedal() {
      let that = this
      wx.showLoading({
        title: '验证中...',
      })
      setTimeout(function(){
        that.exgetMedal()
      }, 300)
    },
    //时间戳转换方法    date:时间戳数字
    formatDate(date) {
      var date = new Date(date);
      var YY = date.getFullYear() + '-';
      var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
      var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
      var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
      var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
      var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
      return YY + MM + DD +" "+hh + mm + ss;
    },

    onClose() {
      this.setData({ispop: false})
    },

    makeShare() {
      const p1 = this.widget.renderToCanvas(Poster.poster(this.data.user.nickname, this.data.medal[0].img3, this.data.medal[0].img1, this.data.distance, this.data.rank, this.data.bias))
      p1.then((res) => {
        this.container = res
        console.log('container', res.layoutBox)
      
      const p2 = this.widget.canvasToTempFilePath()
      p2.then(res => {
        this.setData({
          src: res.tempFilePath,
          width: this.container.layoutBox.width,
          height: this.container.layoutBox.height
          })
        wx.hideLoading()
        })
      }) 
    },

    saveShare() {
      wx.saveImageToPhotosAlbum({
        filePath: this.data.src,
        success(res) {
          console.log(res);
          wx.showToast({
              title: "保存成功，可以去朋友圈分享啦",
              icon: "success",
              duration: 2000,
          });
        },
        //被拒绝后的操作
        fail(res) {
          console.log(res);
          wx.showModal({
              title: "提示",
              content: "保存失败，稍后再试",
          });
        },
      })
    },

    // 生成分享海报
    shareMedal() {
      let that = this
      wx.showModal({
       editable: true,
       title: '请输入夜奔里程',
       placeholderText: '1.0~9.9',
       complete: (res) => {
         if (res.cancel) {
           console.log('用户点击了取消')
         }
         if (res.confirm) {
           console.log('用户点击了确定')
           let dis = Number(res.content)
           if (dis == NaN) {
            wx.showToast({
              title: '请输入正确数字',
              icon: 'error'
            })
           }
           else if (res.content>= 1.0 && res.content<= 9.9) {
            that.setData({distance: dis})
            that.setData({ispop: true})
            wx.showLoading({
              title: '生成中...',
            })
            that.makeShare()
           }
           else {
            wx.showToast({
              title: '输入不在范围',
              icon: 'error'
            })
           }
         }
       }
     })
    }
})