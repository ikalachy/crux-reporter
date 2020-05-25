var webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  context: __dirname,
  devtool: "source-map",
  entry: "./src/index.js",
  target: "node",
  node: { fs: "empty", child_process: "empty"  },
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  plugins: [
    new CopyPlugin(
      [
        { from: 'appsscript.json', to: '.' },
        { from: './static/chart.html', to: '.' }

      ],
    ),
    new BundleAnalyzerPlugin()
  ]
}