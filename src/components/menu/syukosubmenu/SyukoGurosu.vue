<template>
  <div class="container">
    <!-- フィルタコンテナ -->
    <div class="filter-container">
      <div class="filter-item">
  <label for="arrival-date">出庫予定日</label>
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
<div class="filter-item">
  <label for="product-code">バッチNo</label>
  <select id="denpyokubun" class="filter-select" v-model="filters.denpyokubun">
    <option value=""></option>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>

  </select>
</div>

      <!-- ファイル選択 -->
      <input
        type="file"
        ref="fileInput"
        @change="handleFileChange"
        accept=".csv"
        style="display: none"
      />

    </div>

        <!-- ボタン追加部分 -->
        <div class="button-container">
  <div class="table-header">
    <span>合計: {{ rowCount }} 行</span>
  </div>
  <div class="button-group">
    <button class="header-button search-button" @click="searchData">照会</button>
    <button class="header-button print-all-button" @click="print">帳票印刷</button>
  </div>
</div>
    <!-- 表格容器 -->
    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" height="500" border @selection-change="handleSelectionChange" row-class-name="BackgroundColor" >
        <!-- チェックボックス列 -->
        <el-table-column type="selection" width="55" fixed="left" />

        <!-- データ列 -->
        <el-table-column prop="deliverydate" label="届け日" width="100" />
        <el-table-column prop="batchno" label="バッチ№" width="100" />
        <el-table-column prop="temperature" label="温度帯" width="120" />
        <el-table-column prop="syohincd" label="商品CD" width="120" />
        <el-table-column prop="syohinmei" label="商品名" width="auto" />
        <el-table-column prop="expiration" label="賞味期限" width="90" />
        <el-table-column prop="irisu" label="入数" width="60" />
        <el-table-column prop="kesu" label="ケース" width="70" />
        <el-table-column prop="bara" label="バラ" width="60" />
   

        <!-- ボタン列 -->
        <el-table-column label="操作区分" fixed="right" width="150">
          <template #default="scope">
            <button class="action-button edit-button" @click="editRow(scope.row)">編集</button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- モーダルウィンドウ -->
    <div v-if="successModalVisible" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>完成</h2>
        </div>
        <div class="modal-body">
          <p></p>
        </div>
        <div class="modal-footer">
          <button class="close-button" @click="closeModal">OK</button>
        </div>
      </div>
    </div>
  </div>

</template>



<script setup>
import axios from "axios";
import { ref } from "vue";

const fileInput = ref(null);
const successModalVisible = ref(false); // モーダル表示状態を管理
const selectedRowData = ref({}); // 子ビューに表示する選択された行データ
const isChildViewVisible = ref(false); // 子ビューの表示状態

// 検索条件
const filters = ref({
  arrivalDate: "",
  tokuisaki: "",
  denpyokubun: "",
});


const denpyokubunMap = {
  "51": "通常入庫",
  "52": "返品入庫",
  "53": "仮入庫",
  "54": "予定外入庫",
};

const tokuisakicdMap = {
     "2040907": "岩槻)ギフト",
    "1000482": "㈱久世(クリエイトG）",
    "1000486": "株式会社梅の花",
    "1000489": "グローバルキッチン株式会社",
};

const eigyosyocdMap = {
  "0005": "岩槻センター",
  "0006": "大宮センター",
  "0007": "浮島センター",
  "0008": "厚木センター",
};

// 表データ
const tableData = ref([]);
const selectedRows = ref([]); // 選択された行を保存する配列

// 選択された行を取得する処理
const handleSelectionChange = (rows) => {
  selectedRows.value = rows.map((row) => row.ryukono); // `ryukono`だけ保存
};


// 一括削除処理
const print = async () => {
  if (selectedRows.value.length === 0) {
    alert("印刷の行を選択してください。");
    return;
  }
};
const rowCount = ref(0);
// 検索処理
const searchData = async () => {
  if (!filters.value.arrivalDate || !filters.value.tokuisaki || !filters.value.denpyokubun) {
    alert("全ての検索条件を入力してください。");
    return;
  }

  // `arrivalDate` を `yyyy/MM/dd` に変換
  const formattedDate = filters.value.arrivalDate.replace(/-/g, "/");

  const apiUrl = "https://www.hokuohylogi.com/receiving/search";
  const params = {
    arrivalDate: formattedDate,
    tokuisaki: filters.value.tokuisaki,
    denpyokubun: filters.value.denpyokubun,
  };

  try {
    const response = await axios.get(apiUrl, { params });
    if (response.data && Array.isArray(response.data)) {
      tableData.value = response.data.map((item) => ({
        denpyokubun: denpyokubunMap[item.datakubun] || item.datakubun || "",
        tokuisaki: tokuisakicdMap[item.tokuisakicd] || item.tokuisakicd || "",
        center: eigyosyocdMap[item.eigyosyocd] || item.eigyosyocd || "",
        syohincd: item.syohincd || "",
        syohinmei: item.syohinmei || "",
        nyukoyoteisu: item.nyukoyoteisu || "",
        irisu: item.irisu1 || "",
        supplier: item.mekasama || "",
        ryukono: item.ryukono || "",
      }));

      // 行数を更新
      rowCount.value = tableData.value.length;
     
    } else {
      alert("該当するデータがありません。");
      tableData.value = [];
      rowCount.value = 0; // 行数をリセット
    }
  } catch (error) {
    console.error("検索エラー:", error);
    alert("データの取得に失敗しました");
    tableData.value = [];
    rowCount.value = 0; // 行数をリセット
  }
};

const editRow = (row) => {
  selectedRowData.value = { ...row,originalExpirationDate: row.expirationdate,  }; // 行データをコピーして選択
  isChildViewVisible.value = true; // 子ビューを表示
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const csvContent = e.target.result;
      const newBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const newFile = new File([newBlob], "modified.csv");

      const formData = new FormData();
      formData.append("file", newFile);

      const apiUrl = "https://www.hokuohylogi.com";

      await axios.post(`${apiUrl}/receiving/uploadCsv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // モーダルを表示
      successModalVisible.value = true;
    };

    reader.readAsText(file, "utf-8");
  } catch (error) {
    console.error("CSVファイルのアップロードに失敗しました", error);
    alert("CSVアップロードに失敗しました: " + error.message);
  } finally {
    event.target.value = null; // ファイル選択をリセット
  }
};

// モーダルを閉じる
const closeModal = () => {
  successModalVisible.value = false;
};
</script>

<style scoped>
/* 主容器样式 */
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* 余白と間隔の調整 */
.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background-color: #a7e4e4ea;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  align-items: center; /* 垂直方向の整列 */
  justify-content: flex-start; /* 左寄せで整列 */
}

/* アイコンのサイズ調整 */
.icon {
  font-size: 16px; /* アイコンサイズを調整 */
  width: 16px; /* 必要に応じて幅も調整 */
  height: 16px; /* 必要に応じて高さも調整 */
}

/* 单个过滤器项 */
.filter-item {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

/* 输入框样式 */
.filter-input {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 下拉框样式 */
.filter-select {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* ボタンの基本スタイル */
.search-button {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #33b48d;
  color: #fff;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.search-button:hover {
  background-color: #28a076;
}

/* ボタンのフォーカスと枠線を完全に制御 */
.print-all-button {
  background-color: #ff5b5b;
  color: #fff;
  border: none; /* 明示的に枠線を削除 */
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease; /* ホバー時の変化 */
  outline: none; /* 初期状態でアウトラインを削除 */
}

.print-all-button:hover {
  background-color: #e64949; /* ホバー時の色 */
}
/* ボタンをインラインで並べる */
.filter-container > .search-button {
  flex: 0 1 10%; /* 自然な幅に調整 */
  margin: 0 10px; /* ボタン間のスペース */
  text-align: center;
  padding: 10px 15px; /* ボタンの内側スペース */
}

/* 主要内容区域 */
.main-content {
  margin-top: 20px;
}

h1 {
  font-size: 24px;
  color: #333;
}

p {
  font-size: 16px;
  color: #555;
}

/* 行数とボタンを同じ行に配置 */
.button-container {
  display: flex;
  justify-content: space-between; /* 左右に配置 */
  align-items: center; /* 垂直方向で中央揃え */
  margin-bottom: 10px;
}

/* 行数のスタイル */
.table-header {
  font-size: 16px;
  font-weight: bold;
  color: #50a19b;
}

/* ボタングループのスタイル */
.button-group {
  display: flex;
  gap: 10px; /* ボタン間の余白 */
}

/* テーブル全体スタイル */
.table-container {
  margin-top: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  overflow: hidden;
  
}

/* テーブル内のボタン */
.action-button {
  margin: 0 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.edit-button {
  background-color: #33b48d;
  color: #fff;
}

.edit-button:hover {
  background-color: #28a076;
}

.print-button {
  background-color: #ff5b5b;
  color: #fff;
}

.print-button:hover {
  background-color: #e64949;
}

/* モーダル全般 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #ffffff;
  border-radius: 10px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  text-align: left;
  padding: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.modal-header {
  padding-bottom: 10px;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 20px;
}

.modal-body p {
  margin: 20px 0;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.close-button {
  background: #33b48d;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 20px;
  cursor: pointer;
  font-size: 14px;
}

.close-button:hover {
  background: #28a076;
}
.print-all-button:focus {
  outline: none; /* フォーカス時のアウトラインを削除 */
  box-shadow: none; /* 不要な影を削除 */
}

.print-all-button:active {
  transform: scale(0.98); /* 押された時の軽い縮小効果 */
}
html, body {
  height: 100%;
  overflow: hidden;
}
.container {
  height: 90%;
  overflow-y: auto;
}
.BackgroundColor {
  background-color: #fff9c4; /* 黄色の背景色 */
}
::v-deep(.BackgroundColor) {
  background-color: #e2f3f7; /* 黄色の背景色 */
}


.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.field label {
  font-weight: bold;
  width: 120px;
  text-align: right;
  color: #555;
}

.modal-input {
  flex-grow: 1;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  border-top: 1px solid #eaeaea;
  padding-top: 10px;
}

.action-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
}

.confirm-button {
  background-color: #33b48d;
  color: white;
  transition: background-color 0.3s;
}

.confirm-button:hover {
  background-color: #28a076;
}

.cancel-button {
  background-color: #ccc;
  color: #333;
  transition: background-color 0.3s;
}

.cancel-button:hover {
  background-color: #b3b3b3;
}

</style>
