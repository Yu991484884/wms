<template>
  <div class="container">
    <!-- フィルタコンテナ -->
    <div class="filter-container">
      <div class="filter-item">
        <label for="arrival-date">入庫予定日</label>
        <input
          type="date"
          id="arrival-date"
          class="filter-input"
          v-model="filters.arrivalDate"
        />
      </div>
      <div class="filter-item">
        <label for="order-number">得意先</label>
        <select id="tokuisaki" class="filter-select" v-model="filters.tokuisaki">
          <option value=""></option>
          <option value="2040907">岩槻)ギフト</option>
          <option value="1000482">㈱久世(クリエイトG）</option>
          <option value="1000486">株式会社梅の花</option>
          <option value="1000489">グローバルキッチン株式会社</option>
        </select>
      </div>

     <!-- ボタン -->
       <button class="search-button" @click="handleProgressCheck"><Finished class="icon" /> 入庫確認 </button>
      <!-- ボタン -->
      <button class="difference" @click="difference">
        <MagicStick class="icon" /> 予実差分
      </button>

      <button class="confirmed" @click="showConfirmationBox">
        <DocumentChecked class="icon" /> 入庫確定
      </button>
    </div>

    <!-- 表格容器 -->
    <div class="table-container">
      <el-table :data="progressTableData" style="width: 100%" height="600" border @selection-change="handleSelectionChange" row-class-name="BackgroundColor" >
        <!-- チェックボックス列 -->
        <el-table-column type="selection" width="55" fixed="left" />
        <!-- データ列 -->
        <el-table-column prop="syohincd" label="商品CD" width="120" />
        <el-table-column prop="syohinmei" label="商品名" width="300" />
        <el-table-column prop="nyukoyoteisu" label="入庫予定数" width="100" />
        <el-table-column prop="irisu" label="入数" width="60" />
        <el-table-column prop="expirationdate" label="賞味期限" width="120" />
        <el-table-column prop="kesu" label="ケース" width="70" />
        <el-table-column prop="bara" label="バラ" width="60" />
        <el-table-column prop="location" label="ロケーション" width="120" />
        <el-table-column prop="supplier" label="サプライヤ様" width:auto />

      </el-table>
    </div>
    <!-- 確認モーダル -->
        <el-dialog v-model="isModalVisible" title="確認" center width="30%">
          <div class="confirmation-box">
        <p><strong>入庫日:</strong> <span>{{ filters.arrivalDate || "未設定" }}</span></p>
        <p><strong>得意先:</strong> <span>{{ getSelectedTokuisakiName(filters.tokuisaki) || "未設定" }}</span></p>
        <p>上記で入庫確定してよろしいですか？</p>
      </div>
      <div class="modal-buttons" style="text-align: center; margin-top: 20px;">
        <button class="modal-button yes" @click="confirmEntry">はい</button>
        <button class="modal-button no" @click="isModalVisible = false">いいえ</button>
      </div>
    </el-dialog>

    
</div>

</template>

<script setup>
import { Finished,DocumentChecked,MagicStick } from "@element-plus/icons-vue";
import { ref } from "vue";
import axios from "axios";

// モーダルの表示/非表示
const isModalVisible = ref(false);

const selectedRows = ref([]); // 選択された行
const progressTableData = ref([]);
// 検索条件
const filters = ref({
  arrivalDate: "",
  tokuisaki: "",
});

const formatDateToSlash = (date) => {
  return date.replace(/-/g, "/");
};



// モーダル表示
const showConfirmationBox = () => {
  if (!filters.value.arrivalDate || !filters.value.tokuisaki) {
    alert("入庫日と得意先を選択してください。");
    return;
  }
  
    // テーブルデータが空の場合のチェック
    if (!progressTableData.value || progressTableData.value.length === 0) {
    alert("入庫確定データがありません。");
    return;
  }
  isModalVisible.value = true;
};

// 得意先名を取得する関数
const getSelectedTokuisakiName = (value) => {
  const options = {
    "2040907": "岩槻)ギフト",
    "1000482": "㈱久世(クリエイトG）",
    "1000486": "株式会社梅の花",
    "1000489": "グローバルキッチン株式会社",
  };
  return options[value] || "";
};

// 「はい」ボタンの処理
const confirmEntry = async () => {
  const formattedDate = formatDateToSlash(filters.value.arrivalDate);
  try {
    const response = await axios.post("https://www.hokuohylogi.com/ryukodata/confirm", {
      kisandata: formattedDate, // スラッシュ形式に変換
      tokuisaki: filters.value.tokuisaki,
    });
      
    response.data; //暫定的に
    alert("入庫が確定しました。");
  } catch (error) {
    console.error("入庫確定に失敗しました:", error);
    alert("入庫確定に失敗しました。");
  } finally {
    isModalVisible.value = false;
  }
};

const handleProgressCheck = async () => {
  // 入力内容の確認
  if (!filters.value.arrivalDate || !filters.value.tokuisaki) {
    alert("検索条件を選択してください");
    return;
  }

  const formattedDate = formatDateToSlash(filters.value.arrivalDate);

  try {
    // バックエンドへデータ送信
    const response = await axios.post(
      "https://www.hokuohylogi.com/shelving/achievements",
      {
        kisandata: formattedDate, // スラッシュ形式に変換
        tokuisakicd: filters.value.tokuisaki,
      }
    );

    // レスポンス処理（データフォーマット変更）
    const detailsData = response.data;

    progressTableData.value = detailsData.length
      ? detailsData.map((item) => ({
          syohincd: item.syohincd,
          syohinmei: item.syohinmei,
          nyukoyoteisu: item.nyukoyoteisu,
          irisu: item.irisu1,
          expirationdate: item.expirationdate,
          kesu: item.kesu,
          bara: item.bara,
          location: item.location,
          supplier: item.mekasama,
          ryukono: item.ryukono,
        }))
      : [];
  } catch (error) {
    console.error("データ送信に失敗しました:", error);
    alert("データの取得に失敗しました");
  }
};

// チェックボックス選択時のイベント
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const difference = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    alert("ダウンロードするデータを選択してください。");
    return;
  }

  // ryukonoごとに重複排除 & 格納総数・サプライヤ様の更新
  const ryukonoMap = new Map();

  selectedRows.value.forEach((row) => {
    const key = row.ryukono;

    // 格納総数の計算: kesu * irisu + bara
    const total = (Number(row.kesu) || 0) * (Number(row.irisu) || 0) + (Number(row.bara) || 0);

    if (!ryukonoMap.has(key)) {
      ryukonoMap.set(key, {
        ...row,
        total, // 格納総数初期化
        supplier: row.supplier || "", // サプライヤ様初期化
      });
    } else {
      const existing = ryukonoMap.get(key);
      existing.total += total; // 格納総数加算

      // サプライヤ様が空白の場合は更新
      if (!existing.supplier && row.mekasama) {
        existing.supplier = row.mekasama;
      }

      ryukonoMap.set(key, existing);
    }
  });

  // 重複排除したデータを整形
  const uniqueRows = Array.from(ryukonoMap.values()).map((row) => ({
    syohincd: row.syohincd,       // 商品CD
    syohinmei: row.syohinmei,     // 商品名
    nyukoyoteisu: row.nyukoyoteisu, // 入庫予定数
    irisu: row.irisu,            // 入数
    total: row.total,             // 格納総数
    gosa: row.total - row.nyukoyoteisu, // 誤差
    supplier: row.supplier || "不明",   // サプライヤ様
  }));

  // CSVヘッダー (順番: 商品CD, 商品名, 入庫予定数, 入数, 格納総数, 誤差, サプライヤ様)
  const headers = [
    "商品CD",
    "商品名",
    "入庫予定数",
    "入数",
    "格納総数",
    "誤差",
    "サプライヤ様",
  ];

  // CSVデータの組み立て
  const csvContent = [
    "\uFEFF" + headers.join(","), // BOM + ヘッダー行 (1行目)
    ...uniqueRows.map((row) =>
      [
        row.syohincd,      // 商品CD
        row.syohinmei,     // 商品名
        row.nyukoyoteisu,  // 入庫予定数
        row.irisu,         // 入数
        row.total,         // 格納総数
        row.gosa,          // 誤差
        row.supplier,      // サプライヤ様
      ].join(",")
    ),
  ].join("\n"); // 各行を改行で結合

  // ファイル名の動的生成
  const formattedDate = filters.value.arrivalDate?.replace(/-/g, "") || "未設定";
  const tokuisakiName = document.querySelector(
    `#tokuisaki option[value="${filters.value.tokuisaki}"]`
  )?.innerText || "未設定";
  const fileName = `${formattedDate}_${tokuisakiName}_格納差分.csv`;

  // CSVファイルを生成してダウンロード
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
/* 主容器样式 */
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
  height: 90%;
  overflow-y: auto;
}

/* 余白と間隔の調整 */
.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 80px;
  background-color: #a7e4e4ea;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  align-items: center;
  justify-content: flex-start;
}

/* フィルタアイテム */
.filter-item {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

/* 入力ボックスとセレクトボックスのスタイル */
.filter-input, .filter-select {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* ボタンのスタイル */
.search-button, .difference,.confirmed {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #fff;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.search-button {
  background-color: #33b48d;
}

.search-button:hover {
  background-color: #28a076;
}

.difference {
  background-color: #ff5b5b;
}

.confirmed {
  background-color: #4aafee;
}

.difference:hover {
  background-color: #e64949;
}

.confirmed:hover {
  background-color: #4aafee;
}

/* テーブルコンテナのスタイル */
.table-container {
  margin-top: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  overflow: hidden;
}

/* テーブル行の背景色 */
.BackgroundColor {
  background-color: #fff9c4;
}

::v-deep(.BackgroundColor) {
  background-color: #e2f3f7;
}
/* アイコンのサイズ調整 */
.icon {
  font-size: 16px; /* アイコンサイズを調整 */
  width: 16px; /* 必要に応じて幅も調整 */
  height: 16px; /* 必要に応じて高さも調整 */
}

/* 確認タイトルを太字、大きくする */
.el-dialog__title {
  font-weight: bold;
  font-size: 20px; /* タイトルサイズ調整 */
  text-align: center;
}

/* 確認ボックス内の行スタイル */
.confirmation-box {
  display: flex;
  flex-direction: column;
  align-items: center; /* 全体を中央揃え */
  font-size: 16px;
  line-height: 2;
}

.confirmation-box p {
  display: flex;
  justify-content: flex-start; /* 左揃え */
  width: 100%; /* 幅を100%に */
  max-width: 300px; /* 最大幅を設定 */
}

.confirmation-box p strong {
  display: inline-block;
  width: 80px; /* ラベル部分の固定幅 */
  text-align: left; /* ラベルを左揃え */
  font-weight: bold;
}

.confirmation-box p span {
  flex: 1; /* 値を左揃えで表示 */
}
.modal-button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-button.yes {
  background-color: #33b48d;
  color: white;
}

.modal-button.no {
  background-color: #ff5b5b;
  color: white;
}

.modal-button.yes:hover {
  background-color: #28a076;
}

.modal-button.no:hover {
  background-color: #e64949;
}

</style>