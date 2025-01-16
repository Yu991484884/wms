<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-section">
        <img src="@/assets/ryutsu.png" alt="Logo" class="logo" />
        <h2>ようこそ<br />for Hokuoh</h2>
      </div>
      <form @submit.prevent="login" class="login-form">
        <div class="footer">
          <select v-model="connectionType" class="connection-select">
            <option value="005">岩槻センター</option>
            <option value="001">大宮センター</option>
            <option value="003">浮島センター</option>
            <option value="004">厚木センター</option>
          </select>
        </div>
        <div class="input-group">
          <i class="icon user-icon"></i>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="ユーザーID"
            required
          />
        </div>
        <div class="input-group">
          <i class="icon lock-icon"></i>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="パスワード"
            required
          />
        </div>
        <button type="submit" class="login-button">ログイン</button>
      </form>
      <footer>
        <p>Produced by 北王流通株式会社</p>
        <small>
          ※ログインパスワードをお忘れの方は
          <a href="#">こちら</a>
          よりお問い合わせください。
        </small>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth"; 



const router = useRouter();
const username = ref("");
const password = ref("");
const connectionType = ref("ssl");

// const login = async () => {
//   try {
//     // const authStore = useAuthStore(); // Piniaのインスタンスを取得
//     // const response = await axios.post("https://www.hokuohylogi.com/user/weblogin", {
//     //   centercd: connectionType.value,
//     //   id: username.value,
//     //   password: password.value,
//     const authStore = useAuthStore(); // Piniaのインスタンスを取得
//     const response = await axios.post("http://192.168.10.119:8091/user/weblogin", {
//       centercd: connectionType.value,
//       id: username.value,
//       password: password.value,
    
//     });

//     if (response.data === "success") {
//       authStore.login(); // ログイン成功時にPiniaの状態を更新
//       router.push("/ryukostatus"); // 次の画面へ遷移
//     } else {
//       alert("センタCD、ユーザーIDまたはパスワードが間違っています");
//     }
//   } catch (error) {
//     console.error("ログイン中にエラーが発生しました:", error);
//     alert("サーバーに接続できませんでした");
//   }
// };
const login = async () => {
  try {
    const authStore = useAuthStore(); // Piniaのインスタンスを取得
    const response = await axios.post("http://192.168.10.119:8091/user/weblogin", {
      centercd: connectionType.value,
      id: username.value,
      password: password.value,
    });

    if (response.data === "success") {
      // ログイン成功時にセンターコードを保存
      authStore.centerId = connectionType.value; // センターコードを保存
      authStore.userId = username.value; // ユーザーIDも保存
      authStore.login(); // ログイン状態を更新
      router.push("/ryukostatus"); // 次の画面へ遷移
    } else {
      alert("センタCD、ユーザーIDまたはパスワードが間違っています");
    }
  } catch (error) {
    console.error("ログイン中にエラーが発生しました:", error);
    alert("サーバーに接続できませんでした");
  }
};


</script>

<style scoped>
/* 全体のレイアウト */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #9cc9c1, #342d7e); /* グラデーション背景 */
}

.login-box {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

/* ロゴセクション */
.logo-section {
  margin-bottom: 30px;
}

.logo {
  width: 120px;
  height: auto;
  margin-bottom: 10px;
}

h2 {
  font-size: 1.4rem;
  color: #4a4a4a;
  font-weight: 600;
}

/* 入力グループ */
.input-group {
  position: relative;
  margin-bottom: 20px;
  width: 345px;
}

.icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 18px;
}

input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

input:focus {
  border-color: #33b48d;
  outline: none;
  background: #fff;
}

/* ボタン */
.login-button {
  width: 100%;
  padding: 12px;
  background-color: #5a40f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
}

.login-button:hover {
  background-color: #4535d1;
}

/* フッター */
.footer {
  margin: 10px 0 20px;
}

.connection-select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #f9f9f9;
}

/* テキストとリンク */
footer p,
footer small {
  color: #aaa;
  font-size: 0.8rem;
}

footer a {
  color: #5a40f6;
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}

/* アイコンスタイル */
.user-icon::before {
  content: "👤";
}

.lock-icon::before {
  content: "🔒";
}
</style>
