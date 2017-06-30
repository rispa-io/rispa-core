module.exports = {
  presets: [
    require.resolve('babel-preset-react'),
    require.resolve('babel-preset-es2015'),
    require.resolve('babel-preset-es2016'),
    require.resolve('babel-preset-es2017'),
  ],

  plugins: [
    require.resolve('babel-plugin-transform-runtime'),
    require.resolve('babel-plugin-add-module-exports'),
    require.resolve('babel-plugin-transform-decorators-legacy'),
    require.resolve('babel-plugin-transform-react-display-name'),
    require.resolve('babel-plugin-transform-object-rest-spread'),
    require.resolve('babel-plugin-transform-class-properties'),
    require.resolve('babel-plugin-dynamic-import-webpack'),
  ],

  ignore: /node_modules\/(?!@rispa)/,
}
