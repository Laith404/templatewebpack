const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ImageminPlugin = require("imagemin-webpack");

const dev = process.env.NODE_ENV === 'development';
const prod = !dev;

const filename = (ext) => dev ? `[name].${ext}` : `[name].min.${ext}`;

const plugins = () => {
  const  bPlugins = [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname,'app/index.html'),
      filename: 'index.html',
      title: 'Development',
      minify: {
        collapseWhitespace: prod
      }
    }),
    new MiniCssExtractPlugin({
      filename: `./css/${filename('css')}`,
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {from: path.resolve(__dirname,'app/assets') , to: path.resolve(__dirname,'dist')}
      ]
    }),
  ];

  if(prod) {
    bPlugins.push(
      new ImageminPlugin({
        bail: false,
        cache: true,
        imageminOptions: {
          plugins: [
            ["gifsicle", { interlaced: true }],
            ["jpegtran", { progressive: true }],
            ["optipng", { optimizationLevel: 5 }],
            [
              "svgo",
              {
                plugins: [
                  {
                    removeViewBox: false
                  }
                ]
              }
            ]
          ]
        }
      })
    )
  }
  return bPlugins;
}
module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, 'app'),
  entry: './components.js',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
    open: true,
    compress: true,
    hot: true,
    port: 5050,
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: dev,
            },
          },
          'css-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => {
              return path.relative(path.dirname(resourcePath), context) + '/';
            },
            },
            
          },
          
          "css-loader",
          "sass-loader"
        ],
      },
      {
        test: /\.(?:|png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator:{
              filename: `img/[name][ext]`,
          },
      },
      {
        test: /\.(?:|eot|ttf|woff|woff2)$/,
        type: 'asset/resource',
        generator:{
              filename: `fonts/[name][ext]`,
          },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },

  plugins: plugins(),

  output: {
    filename: `./js/${filename('js')}`,
    path: path.resolve(__dirname, 'dist'),
    publicPath: ''
  },
};