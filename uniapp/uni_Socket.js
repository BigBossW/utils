/**
 * @description uniAppWebScoket封装
 * 
 */

export default class Socket {
  //状态标识，
  connentStatus = 0 // 0未连接/主动断开、1连接中、 2连接成功、3接收数据、4非主动断开、5错误
  socket = null
  constructor(option = {}) {
    //必需参数
    this.url = option.url //连接地址
    //可选参数
    this.header = option.header || {} //头部信息
    this.method = option.method || "GET" //默认是GET，有效值：OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    //this.protocols = option.protocols || [] //子协议数组
    //this.data = option.data || {} //连接时发送的数据
    this.heartRate = option.heartRate || false //心跳检测 默认关闭，开启时传入心跳包数据 可以是任何类型数据
    this._reconnection = option.reconnection == 0 ? 0 : option.reconnection || 2 //是否自动重连 非主动断开 需配置重连间隔，建议2-5秒
    this.message = option.message || function() {}
    //配置参数

    this.connectSocket()
  }
  //连接
  connectSocket() {
    this.connentStatus = 1 //标记为正在连接
    let param = {
      url: this.url,
      method: this.method,
      success: (e) => {}
    }
    // if (this.SocketTask) {
    //   // this.connentStatus = 0 //标记正常断开
    //   this.SocketTask.onClose()
    // }
    this.SocketTask = uni.connectSocket(param)
    //打开连接的监听
    this.SocketTask.onOpen(data => {
      //this.SocketTask = SocketTask; //连接对象赋值
      //标记为连接成功 
      this.connentStatus = 2;
      this.message({
        code: 2,
        msg: "连接成功",
        data
      }) //连接状态回调函数
      this.SocketTask.onMessage(data => {
        this.message({
          code: 3,
          msg: "连接成功，接收数据",
          data
        }) //连接状态回调函数
      })
      //断开连接监听
      this.SocketTask.onClose((data) => {
        // console.log("断开连接",data);
        if (this.connentStatus !== 0 && this.connentStatus !== 5) {
          this.connentStatus = 4 //标记非正常断开
          this.reconnection()
        }
        this.message({
          code: this.connentStatus, //状态标记
          msg: "关闭连接",
          data
        }) //连接状态回调函数
        
      });
    })
    //监听错误
    this.SocketTask.onError(data => {
      // console.log("连接错误",data);
      // if (this.connentStatus) {
        this.connentStatus = 5 //标记状态错误
        this.SocketTask.close({
          code:2000,
          reason:"发生错误主动关闭后再次连接"
        })
        this.message({
          code: 5,
          msg: "socket错误",
          data
        }) //连接状态回调函数
        this.reconnection()
      // }
    })
  }

  //重新自动连接
  reconnection() {
    // if (this._reconnection && (this.connentStatus == 0 || this.connentStatus == 5)) {
    if (Boolean(this._reconnection)) {
      let t = this._reconnection * 1000
      clearTimeout(this.socket) //先清除计时器
      this.socket = setTimeout(() => {
        this.connectSocket()
      }, t)
    }
  }
  //连接断开
  close() {
    clearTimeout(this.socket) //先清除计时器
    this.connentStatus = 0 //标记状态
    this.SocketTask.close({
      code:1000,
      reason:"主动关闭"
    })
  }
  //发送
  socketSend() {
    this.SocketTask.send()
  }
}
