const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: "0.0.0.0", // すべてのIPアドレスにバインド
    port: 8080, // サーバーのポートを指定（必要に応じて変更）
    open: false, // 自動でブラウザを開かない（必要に応じてtrueに変更可能）
    allowedHosts: "all", // 他のホストからのアクセスを許可
  },
});
