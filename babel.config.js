module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "usage",
          corejs: 3,
        },
      ],
      "@babel/preset-typescript",
    ],
    plugins: ["@babel/plugin-transform-runtime"],
    comments: false,
    exclude: [/(\/|\\)core-js(\/|\\)/],
  };
};
