/*
 * @Author: wjz
 * @Date: 2021-05-07 09:30:38
 * @LastEditors: wjz
 * @LastEditTime: 2022-05-11 16:49:46
 * @FilePath: /cleanrobot_operation_maintenance_vehicle_mounted/api.config.js
 */

/**
 * api地址配置管理
 */

let address = process.env.NODE_ENV == 'production' ? /* "192.168.0.3" */window.location.hostname :"192.168.2.10" //"192.168.1.231"
let network = { 
  graceVehicle:{ //平台配置
    port:'4405',
    protocol:"http:"
  }, 
  vehicle:{ //车载服务配置
    port:'62004',
    protocol:"http:"
  },
  videoWS:{ //车载视频服务配置
    port:'62003',
    protocol:"ws:"
  },
  vehicleApp:{ //车载app服务配置
    port:'62002',
    protocol:"http:"
  }
}
Object.keys(network).forEach(key => {
	network[key].origin = `${network[key].protocol}//${network[key].address?network[key].address:address}:${network[key].port}`
})
network.address = address 
// console.log(network);

export default network