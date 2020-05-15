var webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  context: __dirname,
  devtool: "source-map",
  entry: "./src/index.js",
  
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  plugins: [
    new CopyPlugin(
      [
        { from: 'appsscript.json', to: '.' }

      ],
    )
  ]
}