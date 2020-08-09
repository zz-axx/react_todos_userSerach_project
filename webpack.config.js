//引入Node中内置的path模块用于解析路径
const {
	resolve
} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
	CleanWebpackPlugin
} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	//入口配置
	entry: './src/index.js',

	//输出配置
	output: {
		path: resolve(__dirname, "dist"),
		filename: "index.js",
		publicPath: '/'
	},

	//工作模式
	mode: 'development',

	//配置各种loader
	module: {
		rules: [
			//ES6 ==> ES5
			{
				test: /\.jsx?$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env', //ES6 ==> ES5
							'@babel/preset-react' //jsx===>js
						],
						plugins: [
							'@babel/plugin-proposal-class-properties'
						],
					}
				}
			},
			//处理css文件
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			//处理图片资源,url-loader底层用到了file-loader
			{
				test: /\.(png|jpg|gif)$/,
				use: [{
					loader: 'url-loader',
					options: {
						limit: 8192, //8KB以下的图片转为base64
						name: '[hash:8].[ext]'
					}
				}]
			},
			//处理其他文件
			{
				test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
				loader: 'file-loader'
			}
		]
	},

	//配置插件
	plugins: [
		new HtmlWebpackPlugin({
			template: './public/index.html'
		}),
		new CleanWebpackPlugin(),
		new CopyPlugin([{
			from: resolve(__dirname, 'public'),
			to: resolve(__dirname, 'dist'),
			ignore: ['index.html']
		}])
	],

	//配置source-map
	devtool: 'cheap-module-eval-source-map', //定位出错所在的原始代码行

	//配置dev-server
	devServer: {
		port: 8080, //服务启动的端口
		open: true, //是否自动打开浏览器
		proxy: {
			'/api': { //这个/api其实是为了告诉代理，以后什么样的请求，需要给我代理转发
				target: 'http://localhost:3000',
				//转发的目标地址，不需要路径，因为转发的时候会把发送请求的路径默认频道目标后面
				//我们发http://localhost:8080/api/users/info
				//最终转发的目标会变为http://localhost:4000/api/users/info

				pathRewrite: {
					'^/api': ''
				},
				//真正的目标地址应该是http://localhost:4000/users/info
				//这一行在干的活就是把/api去掉，不就是真正的目标地址？
				changeOrigin: true, // 支持跨域, 如果协议/主机也不相同, 必须加上
			}
		},
		historyApiFallback: true, // 任意的 404 响应都被替代为 index.html 备胎
	},

	//配置省略后缀
	resolve: {
		extensions: [".js", '.jsx', ".json"], //解决导入省略后缀名称
		alias: { //配置短路径
			'@': resolve(__dirname, 'src') //取别名，让@代替根路径下的src，即：'/src'
		}
	}

}