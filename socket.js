/*
 * @Author: wjz 
 * @Date: 2021-04-21 21:11:05 
 * @Last Modified by: wjz
 * @Last Modified time: 2021-06-25 14:48:01
 */
/**
 * @description socket封装
 */
export default class Socket {

  ws = null; // websocket 对象
  #alive = false //连接状态
  #params = null //参数
  #reconnect_timer = null //重连计时器
  #heart_timer = null //心跳计时器
  #reconnect_count = 0 //重连次数
  // 信息onmessage缓存方法
  #message_func = null
  heartBeat = 100000 // 心跳时间
  heartMsg = 'hello' // 心跳信息
  //是否自动重连
  reconnect = false
  //重连间隔时间
  reconnectTime = 5000
  //重连次数
  reconnectTimes = 50
  constructor(params) {
    this.#params = params
    this.init()
  }
  init() {
    //重中之重，不然重连的时候会越来越快
    // clearTimeout(this.#reconnect_timer)
    clearInterval(this.#heart_timer)

    //取出所有参数
    let params = this.#params
    
    //设置连接路径
    let { url, port } = params
    let global_params = ['heartBeat', 'heartMsg', 'reconnect', 'reconnectTime', 'reconnectTimes']

    //定义全局变量
    Object.keys(params).forEach(key => {
      if (global_params.indexOf(key) !== -1) {
        this[key] = params[key]
      }
    })

    //连接路径 拼接
    let ws_url = port ? url + ':' + port : url

    // this.ws = null //删除ws对象重新连接
    if (this.ws) {
      this.ws.close(); //先关闭连接
    }
    delete this.ws
    this.ws = new WebSocket(ws_url)

    // //默认绑定事件
    this.ws.onopen = (e) => {
      //设置状态为开启
      //console.log("连接",this.#reconnect_count) 
      this.#alive = true
      clearTimeout(this.#reconnect_timer) //清除重连计时器
      this.#reconnect_timer = null;
      //this.#reconnect_count = 0 //重连次数清零
    }

    //断开连接
    this.ws.onclose = () => {
      this.#alive = false //连接状态为断开
      //自动重连开启  +  不在重连状态下
      console.log("连接失败")
      if (true == this.reconnect) {
        /* 断开后立刻重连 */
        if (this.#reconnect_count === 0) {
          this.#reconnect_count++ //累加重连次数
          this.init()
        } else {
          this.onreconnect()
        }
      }
    }
  }
  //重连
  onreconnect() {
    if (this.#reconnect_timer !== null) {
      return //存在延时器直接退出 让延时器调用连接
    } else {
      //重连定时器 链接失败后延时n秒重新链接
      this.#reconnect_timer = setTimeout(() => {
        this.#reconnect_count++ //累加重连次数
        if (this.#reconnect_count > this.reconnectTimes) {
          clearTimeout(this.#reconnect_timer) //清除重连计时器
          return
        }
        this.init()
      }, this.reconnectTime)
    }
  }

  /* 心跳事件 */
  onheartbeat(func) {
    //在连接状态下
    if (true == this.#alive) {
      /* 心跳计时器 */
      this.#heart_timer = setInterval(() => {
        //发送心跳信息
        this.send(this.heartMsg)
        func ? func(this) : false
      }, this.heartBeat)
    }
  }

  // 发送消息 
  send(text) {
    console.log(text,this.#alive)
    if (true == this.#alive) {
      text = typeof text == 'string' ? text : JSON.stringify(text)
      this.ws.send(text)
    }
  }
  // 断开连接
  close() {
    //if (true == this.#alive) {
    //主动断开不重连
    this.ws.close()
    this.reconnect = false //关闭重连
    //}
  }
  //接受消息 all全部消息数据 部分消息数据
  onmessage(func, all = false) {
    this.ws.onmessage = data => {
      this.#message_func = func
      func(!all ? data.data : data)
    }
  }

  //websocket连接成功事件
  onopen(func) {
    this.ws.onopen = event => {
      this.#alive = true
      console.log("连接",this.#reconnect_count) 
      clearTimeout(this.#reconnect_timer) //清除重连计时器
      this.#reconnect_timer = null;
      this.#reconnect_count = 0 //重连次数清零
      func(event)

    }
  }
  //websocket关闭事件
  onclose(func) {
    this.ws.onclose = event => {
      this.#alive = false //连接状态为断开
      // //自动重连开启  +  不在重连状态下
      // if (true == this.reconnect) {
      //   /* 断开后立刻重连 */
      //   if (this.#reconnect_count === 0) {
      //     this.#reconnect_count++ //累加重连次数
      //     //this.init()
      //   } else {
      //     //this.onreconnect()
      //   }
      // }
      func ? func(event) : false
    }
  }
  //websocket错误事件
  onerror(func) {
    this.ws.onerror = event => {
      func ? func(event) : false
    }
  }
}
