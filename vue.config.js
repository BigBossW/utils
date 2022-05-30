/*
 * @Author: wjz
 * @Date: 2022-02-24 13:43:07
 * @LastEditors: wjz
 * @LastEditTime: 2022-03-15 15:39:48
 * @FilePath: /cleanrobot_operation_maintenance_vehicle_mounted/vue.config.js
 */
const { defineConfig } = require('@vue/cli-service')

const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

const CompressionPlugin = require('compression-webpack-plugin');

module.exports = defineConfig({
  publicPath: './',
  outputDir: 'dist',//打包后的目录名称
  // assetsDir: './assets',//静态资源目录名称
  indexPath: 'index.html', //入口文件
  productionSourceMap: false,  //去掉打包的时候生成的map文件
  lintOnSave: true, // 语法校验 配置
  filenameHashing: false, // 对js的文件引用都变成了hash之后的文件名
  transpileDependencies: true, //避免构建后的代码中出现未转译的第三方依赖
  // devServer: {

  //   //host: '127.0.0.1',
  //   open: true,
  // },
  chainWebpack: config => { // Webpack启动配置
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'Robot' // 修改默认title
        return args
      })
  },
  configureWebpack:(config)=>{
    return{
      plugins: [
        // AutoImport({
        //   resolvers: [ElementPlusResolver({ //过滤loading-directive.css 防止因此文件找不到导致无法编译的问题
        //     importStyle: 'css',
        //     exclude: new RegExp(/^(?!.*loading-directive).*$/)
        //   })],
        // }),
        Components({
          resolvers: [ElementPlusResolver()],
        }),
        new CompressionPlugin({ 
          algorithm: 'gzip',
          test: /\.(js|css)$/,// 匹配文件名
          threshold: 10240, // 对超过10k的数据压缩
          deleteOriginalAssets: false, // 删除源文件
          minRatio: 0.8 // 压缩比
        })
      ]
    }
  }
})
