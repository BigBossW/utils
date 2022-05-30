/*
 * @Author: wjz 
 * @Date: 2021-01-29 17:16:13 
 * @Last Modified by: wjz
 * @Last Modified time: 2021-08-19 14:26:34
 */
import * as Cookies from 'js-cookie'
import netWork from "../../api.config.js"
import router from '@/router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const instance = axios.create({
  withCredentials: false,
  //baseURL: netWork.cloud.origin,//process.env.VUE_APP_BASE_API, 
  timeout: 500000,
  headers: {
    'Content-Type': 'application/json',
    //'authorization':JSON.parse(Cookies.get("user") || JSON.stringify({token:"",name:""})).token//user.token
  },
  // paramsSerializer: function(params) {
  //   return JSON.stringify(params, {arrayFormat: 'brackets'})
  // },
});

//请求拦截器
instance.interceptors.request.use(config => {
  // let user = JSON.parse(Cookies.get("user") || JSON.stringify({ token: "", name: "" })) //读取cookies中的数据 
  let user = JSON.parse(sessionStorage.getItem('user') || JSON.stringify({ token: "", name: "" }))
  config.headers['authorization'] = user.token
  return config;
}, error => {
  return Promise.reject(error);
})

// 添加响应拦截器
instance.interceptors.response.use(response => { //请求成功
  if (response.status !== 200) {
    ElMessage.error(response.status + ':' + response.data.msg)
  }
  return response;
}, err => { //请求失败
  console.log(err);
  if (err && err.response) {
    console.log(err.response)
    switch (err.response.status) {
      case 400:
        err.message = err.response.data.msg || '访问错误'
        break;
      case 401:
        err.message = '未授权，请重新登录'
        router.replace('/login');
        break;
      case 403:
        err.message = '拒绝访问'
        break;
      case 404:
        err.message = '访问错误,未找到该资源'
        break;
      case 405:
        err.message = '请求方法未允许'
        break;
      case 408:
        err.message = '访问超时'
        break;
      case 500:
        err.message = '服务器端错误'
        break;
      case 501:
        err.message = '网络未实现'
        break;
      case 502:
        err.message = '网络错误'
        break;
      case 503:
        err.message = '服务不可用'
        break;
      case 504:
        err.message = '网络超时'
        break;
      case 505:
        err.message = 'http版本不支持该请求'
        break;
      default:
        err.message = `错误${err.response.status}`
    }
  }

  ElMessage.error({
    message: err.message,
    type: 'error'
  });
  return Promise.reject(err.response);
});

export default instance;

