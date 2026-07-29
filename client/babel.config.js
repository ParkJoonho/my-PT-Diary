const path = require('node:path');

const envPluginPath = path.join(
  path.dirname(require.resolve('@granite-js/plugin-env/package.json')),
  'dist/plugins/babel.cjs',
);

module.exports = (api) => {
  const isTest = api.env('test');

  return {
    plugins: isTest ? [envPluginPath] : [],
    presets: ['babel-preset-granite'],
  };
};
