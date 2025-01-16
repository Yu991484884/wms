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
    <option v-for="tokuisaki in tokuisakiList" :key="tokuisaki.tokuisakicd" :value="tokuisaki.tokuisakicd">
      {{ tokuisaki.tokuisakinm }}
    </option>
  </select>
</div>

      <div class="filter-item">
        <label for="product-code">進捗区分</label>
        <select id="denpyokubun" class="filter-select" v-model="progressFilters.denpyokubun">
          <option value=""></option>
          <option value="51">未検品</option>
          <option value="52">検品済</option>
          <option value="53">格納済</option>
        </select>
      </div>

    <!-- ボタン -->
     <button class="search-button" @click="handleProgressCheck"><Search class="icon" /> 進捗確認 </button>
      <!-- ボタン -->
      <button class="downloadbutton" @click="handleDownload">
        <Download class="icon" /> ダウンロード
      </button>
    </div>

    <!-- 新しい三列テーブル -->
    <div class="summary-table-container">
            <el-table :data="summaryTableData" stripe style="width: auto">
              <el-table-column prop="uninspected" label="未検品" width="100">
        <template v-slot="scope">
          <div :style="{ backgroundColor: '#fce4ec', padding: '5px' }">
            {{ scope.row.uninspected }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="inspected" label="検品済" width="100">
        <template v-slot="scope">
          <div :style="{ backgroundColor: '#e8f5e9', padding: '5px' }">
            {{ scope.row.inspected }}
          </div>
        </template>
      </el-table-column>

<el-table-column prop="stored" label="格納済" width="100">
  <template v-slot="scope">
    <div :style="{ backgroundColor: '#e3f2fd', padding: '5px' }">
      {{ scope.row.stored }}
    </div>
  </template>
</el-table-column>
      </el-table>
    </div>

    <!-- 表格容器 -->
    <div class="table-container">
      <el-table :data="progressTableData" style="width: 100%" height="500" border @selection-change="handleSelectionChange" row-class-name="BackgroundColor" >
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
        <el-table-column prop="supplier" label="サプライヤ様" width="auto" />

        <!-- ボタン列 -->
        <el-table-column 
            label="操作区分" 
            fixed="right" 
            width="auto"
          >
            <template #default="scope">
              <button v-show="isEditButtonVisible" class="action-button edit-button" @click="editRow(scope.row)">編集</button>
            </template>
          </el-table-column>

      </el-table>
    </div>
      <!-- モーダルウィンドウ -->
      <div v-if="successModalVisible" class="modal-overlay">
            <div class="modal">
              <div class="modal-header">
                <h2>通知</h2>
              </div>
              <div class="modal-body">
                <p>{{ modalMessage }}</p>
              </div>
              <div class="modal-footer">
                <button class="close-button" @click="closeModal">OK</button>
              </div>
            </div>
      </div>

      
      <div v-if="isChildViewVisible" class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h2>検品済商品編集</h2>
    </div>
    <div class="modal-body">
      <!-- 編集フィールド -->
      <div class="field">
        <label for="syohincd">商品CD:</label>
        <input id="syohincd" v-model="selectedRowData.syohincd" class="modal-input" disabled/>
      </div>
      <div class="field">
        <label for="syohinmei">商品名:</label>
        <input id="syohinmei" v-model="selectedRowData.syohinmei" class="modal-input" disabled/>
      </div>
      <div class="field">
        <label for="nyukoyoteisu">入庫予定数:</label>
        <input id="nyukoyoteisu" type="number" v-model="selectedRowData.nyukoyoteisu" class="modal-input" disabled/>
      </div>
      <div class="field">
        <label for="irisu">入数:</label>
        <input id="irisu" type="number" v-model="selectedRowData.irisu" class="modal-input" disabled/>
      </div>
      <div class="field">
        <label for="expirationdate">賞味期限:</label>
        <input id="expirationdate" type="date" v-model="selectedRowData.expirationdate" class="modal-input" />
      </div>
      <div class="field">
        <label for="kesu">ケース:</label>
        <input id="kesu" type="number" v-model="selectedRowData.kesu" class="modal-input" />
      </div>
      <div class="field">
        <label for="bara">バラ:</label>
        <input id="bara" type="number" v-model="selectedRowData.bara" class="modal-input" />
      </div>
      <div class="field">
        <label for="location">ロケーション:</label>
        <input id="location" type="text" v-model="selectedRowData.location" class="modal-input" />
      </div>
      <div class="field">
        <label for="supplier">サプライヤ様:</label>
        <input id="supplier" v-model="selectedRowData.supplier" class="modal-input" disabled/>
      </div>
    </div>
    <div class="modal-footer">
      <button class="action-button confirm-button" @click="handleSave">確定</button>
      <button class="action-button cancel-button" @click="closeChildView">キャンセル</button>
    </div>
  </div>
</div>


  </div>

</template>

<script setup>
import { Search } from "@element-plus/icons-vue";
import { ref } from "vue";
import axios from "axios";
import { onMounted} from "vue";
import { useAuthStore } from "@/stores/auth"; // 認証ストアからセンターコードを取得

// 状態管理
const successModalVisible = ref(false); // モーダルの表示状態
const modalMessage = ref(""); // モーダルのメッセージ
const isChildViewVisible = ref(false); // 子ビューの表示状態
const selectedRowData = ref({}); // 子ビューに表示する選択された行データ

const editRow = (row) => {
  selectedRowData.value = { ...row,originalExpirationDate: row.expirationdate,  }; // 行データをコピーして選択
  isChildViewVisible.value = true; // 子ビューを表示
};
const isEditButtonVisible = ref(false); // 編集ボタン表示状態

// ログイン時のセンターコードを取得
const authStore = useAuthStore();
const centercd = authStore.centerId; // ログイン中のセンターコード

// 得意先リストデータ
const tokuisakiList = ref([]);


// 得意先リストをバックエンドから取得する関数
const fetchTokuisakiList = async () => {
  try {
    const response = await axios.get("https://www.hokuohylogi.com/M_TOKUISAKI/getByCenter", {
      params: { centercd }, // センターコードを送信
    });

    if (response.data && Array.isArray(response.data)) {
      tokuisakiList.value = response.data; // 得意先リストを保存
    } else {
      console.error("得意先データが不正です:", response.data);
    }
  } catch (error) {
    console.error("得意先データの取得中にエラーが発生しました:", error);
    alert("得意先データの取得に失敗しました。再試行してください。");
  }
};

// ページ遷移時にデータを取得
onMounted(() => {
  fetchTokuisakiList();
});


// 既存の検索条件
const filters = ref({
  arrivalDate: "",
  tokuisaki: "",
});

// 新しい検索条件
const progressFilters = ref({
  arrivalDate: "",
  tokuisaki: "",
  denpyokubun: "",
});

// サマリーテーブルデータ
const summaryTableData = ref([
  { uninspected: "", inspected: "", stored: "" },
]);

// 進捗詳細テーブルデータ
const progressTableData = ref([]);
const selectedRows = ref([]); // 選択された行

// 選択された行の更新
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

const handleSave = async () => {
  try {
     // const apiUrl = "https://www.hokuohylogi.com/shelving/update";
    const apiUrl = "https://www.hokuohylogi.com/shelving/update";

    // ログイン時のセンターコードを取得
    const centercd = authStore.centerId;

    // expirationDateをISO形式で送信
    const payload = {
      centercd, // センターコードを追加
      ryukono: selectedRowData.value.ryukono,
      originalExpirationDate: new Date(selectedRowData.value.originalExpirationDate)
        .toISOString()
        .split("T")[0],
      expirationDate: new Date(selectedRowData.value.expirationdate)
        .toISOString()
        .split("T")[0],
      kesu: selectedRowData.value.kesu,
      bara: selectedRowData.value.bara,
      location: selectedRowData.value.location,
    };

    console.log("送信データ:", payload);

    const response = await axios.put(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 成功時の処理
    alert(response.data); // バックエンドのレスポンスを表示
    closeChildView();
    handleProgressCheck(); // テーブルデータの更新
  } catch (error) {
    console.error("データ送信中にエラーが発生しました:", error);
    alert("データ送信中にエラーが発生しました。再試行してください。");
  }
};

// ダウンロード処理

const handleDownload = () => {
  if (selectedRows.value.length === 0) {
    alert("ダウンロードするデータを選択してください。");
    return;
  }

  // CSVヘッダー
  const headers = [
    "商品CD",
    "商品名",
    "入庫予定数",
    "入数",
    "賞味期限",
    "ケース",
    "バラ",
    "ロケーション",
    "サプライヤ様",
  ];

  // CSVデータの組み立て
  const csvContent = [
    "\uFEFF" + headers.join(","), // BOM + ヘッダー行 (1行目)
    ...selectedRows.value.map((row) =>
      [
        row.syohincd,
        row.syohinmei,
        row.nyukoyoteisu,
        row.irisu,
        row.expirationdate,
        row.kesu,
        row.bara,
        row.location,
        row.supplier,
      ].join(",")
    ),
  ].join("\n"); // 各行を改行で結合

  // ファイル名の動的生成
  const formattedDate = filters.value.arrivalDate?.replace(/-/g, "") || "未設定";
  const tokuisakiName = document.querySelector(
    `#tokuisaki option[value="${filters.value.tokuisaki}"]`
  )?.innerText || "未設定";
  const progressName = document.querySelector(
    `#denpyokubun option[value="${progressFilters.value.denpyokubun}"]`
  )?.innerText || "未設定";
  const fileName = `${formattedDate}_${tokuisakiName}_${progressName}.csv`;

  // CSVファイルを生成してダウンロード
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const closeChildView=()=>{
  isChildViewVisible.value=false;
}

// モーダルを閉じる
const closeModal = () => {
  successModalVisible.value = false;
};


// 既存の進捗確認データ取得
const fetchProgressSummary = async (filters) => {
  try {
    // ログイン時のセンターコードを取得
    const centercd = authStore.centerId;

    // フィルタにセンターコードを追加
    const updatedFilters = { ...filters, centercd };

    // リクエスト送信
    // const response = await axios.get("https://www.hokuohylogi.com/progress/summary", {
      const response = await axios.get("https://www.hokuohylogi.com/progress/summary", {
      params: updatedFilters,
    });

    return response.data;
  } catch (error) {
    console.error("進捗データの取得に失敗しました:", error);
    return { uninspected: "", inspected: "", stored: "" };
  }
};


// 新規の進捗詳細データ取得
const fetchProgressDetails = async (progressFilters) => {
  try {
    // ログイン時のセンターコードを取得
    const centercd = authStore.centerId;

    // フィルタにセンターコードを追加
    const updatedProgressFilters = { ...progressFilters, centercd };

    // リクエスト送信
    // const response = await axios.get("https://www.hokuohylogi.com/progress/details", {
      const response = await axios.get("https://www.hokuohylogi.com/progress/details", {
      params: updatedProgressFilters,
    });

    return response.data;
  } catch (error) {
    console.error("進捗詳細データの取得に失敗しました:", error);
    return [];
  }
};


const handleProgressCheck = async () => {
  try {
    // 入力チェック: denpyokubun が空の場合はアラートを出してリクエストを中断
    if (!progressFilters.value.denpyokubun|| !filters.value.tokuisaki || !filters.value.arrivalDate) {
      alert("検索条件を選択してください");
      return;
    }

    // 日付フォーマット修正
    const formattedDate = filters.value.arrivalDate
      ? filters.value.arrivalDate.replace(/-/g, '/').replace('/0', '/')
      : "";

    // `progressFilters`の値を設定
    progressFilters.value.arrivalDate = formattedDate;
    progressFilters.value.tokuisaki = filters.value.tokuisaki;

    // 既存の進捗確認リクエスト
    const summaryData = await fetchProgressSummary({
      arrivalDate: formattedDate,
      tokuisaki: filters.value.tokuisaki,
    });

    // サマリーデータを更新
    summaryTableData.value = [
      {
        uninspected: summaryData.uninspected || 0,
        inspected: summaryData.inspected || 0,
        stored: summaryData.stored || 0,
      },
    ];

    // 新しい進捗詳細リクエスト
    const detailsData = await fetchProgressDetails(progressFilters.value);

     // データが存在し、進捗区分が検品済の場合のみ編集ボタンを表示
     isEditButtonVisible.value = progressFilters.value.denpyokubun === "53" && detailsData.length > 0;
    // サーバーからのレスポンスデータをマッピング
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
          ryukono:item.ryukono,
        }))
      : [];

    // データがない場合の通知
    if (!detailsData.length) {
      alert("予定データはありません。");
    }
  } catch (error) {
    console.error("データ取得中にエラーが発生しました:", error);
    alert("データ取得中にエラーが発生しました。再試行してください。");
  }
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
  gap: 40px;
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
.downloadbutton {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #ff5b5b;
  color: #fff;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}


/* ボタンをインラインで並べる */
.filter-container > .search-button .downloadbutton{
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
  color: #333;
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

.delete-button {
  background-color: #ff5b5b;
  color: #fff;
}

.delete-button:hover {
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

.modal-header {
  padding-bottom: 10px;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal-body p {
  margin: 20px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  border-top: 1px solid #eaeaea;
  padding-top: 10px;
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
.delete-all-button:focus {
  outline: none; /* フォーカス時のアウトラインを削除 */
  box-shadow: none; /* 不要な影を削除 */
}

.delete-all-button:active {
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

/* サマリーテーブルのスタイル */
.summary-table-container {
  margin: 20px;
  display: flex;
  justify-content: flex-end; /* 右寄せにする */
}

/* テーブル全体スタイル */
.table-container {
  margin-top: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #78a7a4;
  overflow: hidden;
}
.summary-table-container el-table {
  width: 540px !important; /* 必要な幅を指定 (180px x 3列) */
}

.BackgroundColor {
  background-color: #fff9c4; /* 黄色の背景色 */
}
::v-deep(.BackgroundColor) {
  background-color: #e2f3f7; /* 黄色の背景色 */
}

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
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-header h2 {
  margin: 0 0 10px;
}

.modal-body .field {
  margin-bottom: 10px;
  font-size: 14px;
}

.modal-body .field label {
  font-weight: bold;
  margin-right: 10px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
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
  background-color: #b3b3b3;
}

.cancel-button {
  background-color: #ccc;
  color: #333;
  transition: background-color 0.3s;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 15px; /* 各フィールド間の間隔 */
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

html, body {
  height: 100%;
  overflow: hidden;
}
.container {
  height: 90%;
  overflow-y: auto;
}

</style>
