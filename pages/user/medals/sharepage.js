const style = {
  container: {
    position: 'relative',
    width: 300,
    height: 600,
  },
  sname: {
    position: 'absolute',
    top: 25,
    left: 10,
    fontSize: 16,
    color: '#eb0a0d',
    textAlign: 'left',
    verticalAlign: 'middle',
    width: 200,
    height: 50,
  },
  sdis: {
    position: 'absolute',
    top: 50,
    left: 10,
    fontSize: 16,
    color: '#eb0a0d',
    textAlign: 'left',
    verticalAlign: 'middle',
    width: 200,
    height: 50,
  },
  slogan: {
    position: 'absolute',
    top: 75,
    left: 10,
    fontSize: 16,
    color: '#eb0a0d',
    textAlign: 'left',
    verticalAlign: 'middle',
    width: 200,
    height: 50,
  },
  smodal: {
    position: 'absolute',
    bottom: 120,
    width: 100,
    height: 100,
    backgroundColor: '#00000000',
  },
  srank: {
    position: 'absolute',
    bottom: 0,
    left: 35,
    width: 200,
    height: 20,
    fontSize: 8,
    color: '#eb0a0d',
    textAlign: 'right',
    verticalAlign: 'middle',
  },
  qrcode: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 60,
    height: 60,
    backgroundColor: '#00000000',
  },
  simg: {
    width: 300,
    height: 600,
    position: 'absolute',
  }
}

const poster = (nickname, bksrc, msrc, dis, rank, bias) => {
  let r = rank - bias
  const wxml = `
  <view class="container">
    <image class="simg"
      src="${bksrc}"/>
    <text class="sname">我是${nickname}</text>
    <text class="sdis">我已完成课外锻炼${dis}公里</text>
    <text class="slogan">我在五四等你来！</text>
    <image class="smodal"
      src="${msrc}"/>
    <image class="qrcode"
      src="https://kwdl.pku.edu.cn/storage/qrcode.png"/>
    <text class="srank">我是第${r}个徽章点亮者，扫码点亮同款徽章</text>
  </view>
  `

  return {
    wxml,
    style
  };
}

module.exports = {
  poster,
}