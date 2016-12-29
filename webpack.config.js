var path = require('path');
var webpack = require('webpack');
var helpers = require('./config/helpers');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

// var appRoot = 
var scripts = ['./node_modules/lodash/lodash.min.js','./node_modules/jquery/dist/jquery.min.js'];

module.exports = {
  devtool: 'source-map',
  debug: true,

  entry: {
        'styles': ['./src/styles/minima.less'],
    'scripts': scripts,
    'angular2': [
      'rxjs',
      'reflect-metadata',
      '@angular/core'
    ],
    'app': './src/main',

  },

  output: {
    path: __dirname + '/build/',
    publicPath: './',
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
      },
      // load global scripts using script-loader
       { include: [/lodash/,/jquery/], test: /\.js$/, loader: 'script-loader' },
       { test: /\.json$/, loader: 'json-loader' },
      { test: /\.(jpg|png|gif)$/, loader: 'url-loader?limit=10000' },
      // { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.(otf|woff|ttf|svg)$/, loader: 'url?limit=10000' },
      { test: /\.woff2$/, loader: 'url?limit=10000&mimetype=font/woff2' },
      { test: /\.eot$/, loader: 'file' }
    ]
  },

  plugins: [
     new HtmlWebpackPlugin({
                template: 'src/app/index.html',
                chunksSortMode: 'dependency'
            }),
     new CommonsChunkPlugin({ name: ['styles', 'scripts', 'app'].reverse() }),
    //new CommonsChunkPlugin({ name: 'angular2', filename: 'angular2.js', minChunks: Infinity }),
    //new CommonsChunkPlugin({ name: 'common',   filename: 'common.js' }),
    // new CommonsChunkPlugin({ name: 'styles', filename: 'styles.js'  }),
    // new CommonsChunkPlugin({ name: 'scripts', filename: 'scripts.js' }),
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
