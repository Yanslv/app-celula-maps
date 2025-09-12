module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin',
      // NOTE: 'react-native-reanimated/plugin' deve ser listado por último
    ],
  };
};
