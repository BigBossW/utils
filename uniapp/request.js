//let ip = "http://192.168.0.203:50020/"
import {
  address
} from "../config/http.js"
import * as log from "./log.js"
import {
  dateFormatYTDHMS
} from "@/filters/index.js"
let ip = address
const request = (param = {}) => {
  let header = {
    "App-Language":uni.getLocale(), //自定义请求头
    ...param.header
  }
  return new Promise((resolve, reject) => {
    if (param.loading) {
      uni.showLoading({
        mask: true
      });
    }
    let time1 = dateFormatYTDHMS(new Date().getTime()) //操作时间 
    uni.request({
      url: ip + param.url,
      method: param.method || {},
      header: header,
      data: param.data || {},
      success: (response) => {
        let time2 = dateFormatYTDHMS(new Date().getTime()) //操作时间 
        if (param.loading) {
          uni.hideLoading();
        }
        if (response.statusCode == 200) {
          resolve(response)
        } else {
          reject(response)
          if (param.hint !== false) {
            showToast("Code:"+response.data.code+","+response.data.msg)
          }

        }
        if(param.log !== false){
          log.httpLog({
            "record_type": 2, //1.操作记录 2.接口请求记录 3.uniapp运行错误
            "url_desc": param.desc || "", //接口描述
            "url": ip + param.url, //"接口地址"
            "req_time": time1, //请求时间
            "resp_time": time2, //响应时间
            "resp_status": "正常", //响应状态
            "remarks": "",
          })
        }
      },
      fail: error => {
        let time2 = dateFormatYTDHMS(new Date().getTime()) //操作时间 
        uni.hideLoading();
        reject(error)
        if (param.hint !== false) {
          //showError(error)
          //showToast(error.errMsg)
        }
        if(param.log !== false){
          log.httpLog({
            "record_type": 2, //1.操作记录 2.接口请求记录 3.uniapp运行错误
            "url_desc": param.desc || "", //接口描述
            "url": ip + param.url, //"接口地址"
            "req_time": time1, //请求时间
            "resp_time": time2, //响应时间
            "resp_status": "正常", //响应状态
            "remarks": "",
          })
        }
      }
    })
  })
}

const showToast = (error) => {

  uni.showToast({
    title: error,
    icon: 'none',
    duration: 3000,
    complete: function() {
      setTimeout(function() { //保证2s后消息提示框被关闭
        uni.hideToast();
      }, 3000);
    }
  });
}

const showError = (error) => {
  let errorMsg = ''
  switch (error) {
    case 400:
      errorMsg = '缺少参数'
      break
    case 401:
      errorMsg = '未授权，请登录'
      break
    case 403:
      errorMsg = '跨域拒绝访问'
      break
    case 404:
      errorMsg = `请求地址错误`
      break
    case 405:
      errorMsg = ` 不允许此方法`
      break
    case 408:
      errorMsg = '请求超时'
      break
    case 500:
      errorMsg = '服务器内部错误'
      break
    case 501:
      errorMsg = '服务未实现'
      break
    case 502:
      errorMsg = '服务器无效响应'
      break
    case 503:
      errorMsg = '服务不可用'
      break
    case 504:
      errorMsg = '网关超时'
      break
    case 505:
      errorMsg = 'HTTP版本不受支持'
      break
    default:
      errorMsg = error
      break
  }

  if (error) {
    uni.showToast({
      title: error + ':' + errorMsg,
      icon: 'none',
      duration: 3000,
      complete: function() {
        setTimeout(function() { //保证2s后消息提示框被关闭
          uni.hideToast();
        }, 3000);
      }
    });
  }
}

function submitLog(param) {
  uni.request({
    url: ip + "api/custom/front_end_record",
    method: "POST",
    data: param,
    success(res) {
      console.log(res);
    },
    fail(err) {
      console.log(err);
    }
  })
}

export default request
