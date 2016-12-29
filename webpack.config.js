var path = require('path');
var webpack = require('webpack');
var helpers = require('./config/helpers');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  debug: true,

  entry: {
    'angular2': [
      'rxjs',
      'reflect-metadata',
      '@angular/core'
    ],
    'app': './src/main',
    'styles': ['./src/styles/minima.less']
  },

  output: {
    path: __dirname + '/build/',
    publicPath: 'build/',
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    extensions: ['','.ts','.js','.json', '.css', '.html', '.less']
  },

  module: {
    loaders: [
      {
        test: /\.ts$/,
        loaders: ['awesome-typescript-loader', 'angular2-template-loader'],
        exclude: [ /node_modules/ ]
      },
       {
        test: /\.html$/,
        loader: 'raw-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        loader: 'file?name=assets/[name].[hash].[ext]'
      },
      {
        test: /\.css$/,
        exclude: helpers.root('src', 'app'),
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
      },
      {
        test: /\.css$/,
        include: helpers.root('src', 'app'),
        loader: 'raw'
      },
      {
        test: /\.less$/,
        exclude: [ /node_modules/, /styles/ ],
       loaders: ['raw-loader',  'less-loader']
      },
      {
        test: /\.less$/,
        include: [ /styles/ ],
       loaders: ['style-loader','css-loader',  'less-loader']
      }
    ]
  },

  plugins: [
     new HtmlWebpackPlugin({
                template: 'src/app/index.html',
                chunksSortMode: 'dependency'
            }),
    new CommonsChunkPlugin({ name: 'angular2', filename: 'angular2.js', minChunks: Infinity }),
    new CommonsChunkPlugin({ name: 'common',   filename: 'common.js' }),
    new ExtractTextPlugin('app.bundle.css')
  ],
  target:'node-webkit',

   // we need this due to problems with es6-shim
    node: {
        global: true,
        progress: false,
        crypto: 'empty',
        module: false,
        clearImmediate: false,
        setImmediate: false
    }
};
