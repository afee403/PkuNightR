# PkunightR


## 一、功能设计

（1）夜奔活动：近期夜奔预告、往期夜奔精选

（2）个人中心：徽章墙、徽章查看、徽章点亮、资料编辑。

**目录结构：**

``` shell
├─.vscode           #VS Code配置，含'EasyLess'插件配置
├─components        #自定义公共组件
├─dist              #iVew-Weapp库
├─imgs              #图标、默认图片
├─pages
│  ├─pub            #夜奔活动
│  │  ├─blockDetail      #往期夜奔详细
│  │  ├─blockMore        #往期夜奔列表
│  │  ├─listDetail       #夜奔预告详细
│  │  └─listMore         #夜奔预告列表
│  └─user           #个人中心
│      ├─edit            #个人资料编辑
│      ├─modals          #徽章页面
├─theme             #主题定制
├─utils             #公共模块
└─voice             #音频文件
```

## 二、如何使用

提示：本小程序需要开通`wx.getLocation`接口权限。

### 2.1 克隆代码到本地

``` shell
git clone https://github.com/afee403/PkuNightR.git
```

### 2.2 安装依赖

在项目根目录执行：

``` shell
npm install
```

> 可能会报路径错误：根据报错创建指定目录


### 2.3 导入项目

微信开发者工具导入项目，填写自己的AppID（不能用测试号，后面需要申请插件，测试号无法申请）

### 2.4 构建npm

在微信开发者工具（必须npm install后才能构建npm）

​	点击「工具」-「构建npm」

### 2.5 自己搭建后端项目

### 2.6 构建后端项目

搭建好后端项目之后，编辑`config.js`中的配置

保存后，在开发者工具中点击编译运行（信任并运行）

## LICENSE

[MIT](LICENSE)
