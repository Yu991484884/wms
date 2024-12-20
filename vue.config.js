const { defineConfig } = require('@vue/cli-service');
const path = require("path");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: "0.0.0.0", // すべてのIPアドレスにバインド
    port: 8080, // サーバーのポートを指定（必要に応じて変更）
    open: false, // 自動でブラウザを開かない（必要に応じてtrueに変更可能）
    allowedHosts: "all", // 他のホストからのアクセスを許可
  },
  chainWebpack: (config) => {
    config.plugin("copy").tap(([options]) => {
      options.patterns.push({
        from: path.resolve(__dirname, "_redirects"), // プロジェクトのルートから_redirectsを取得
        to: path.resolve(__dirname, "dist"), // distフォルダにコピー
        toType: "dir",
      });
      return [options];
    });
  },
});
