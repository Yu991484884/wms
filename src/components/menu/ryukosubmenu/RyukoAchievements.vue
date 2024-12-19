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
          <option value="1000481">三井物産流通グループ㈱（IKBC）</option>
          <option value="1000486">三井物産流通グループ㈱</option>
          <option value="1000482">㈱久世(クリエイトG）</option>
          <option value="1000483">株式会社梅の花</option>
          <option value="1000484">グローバルキッチン株式会社</option>
          <option value="1000485">小口用得意先</option>
        </select>
      </div>

     <!-- ボタン -->
       <button class="search-button" @click="handleProgressCheck"><Finished class="icon" /> 実績確認 </button>

      <button class="confirmed" @click="achievements">
        <DocumentChecked class="icon" /> 入庫実績作成
      </button>
    </div>

    <!-- 表格容器 -->
    <div class="table-container">
      <el-table :data="progressTableData" style="width: 100%" height="600" border @selection-change="handleSelectionChange" row-class-name="BackgroundColor" >
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
</div>

</template>

<script setup>
import { Finished,DocumentChecked } from "@element-plus/icons-vue";
import { ref } from "vue";
import axios from "axios";

const progressTableData = ref([]);
// 検索条件
const filters = ref({
  arrivalDate: "",
  tokuisaki: "",
});

const formatDateToSlash = (date) => {
  return date.replace(/-/g, "/");
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
      "https://www.hokuohylogi.com/ryukodata/achievements",
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
          kisandata:item.kisandata,
          denbyodata:item.denbyodata,
        }))
      : [];
  } catch (error) {
    console.error("データ送信に失敗しました:", error);
    alert("データの取得に失敗しました");
  }
};
const achievements = () => {
  if (!progressTableData.value || progressTableData.value.length === 0) {
    alert("データがありません。");
    return;
  }

  // CSVヘッダー
  const headers = [
    "取込データ区分", "得意先コード", "客先伝票番号", "伝票日付", "起算日", "伝票区分",
    "入出庫先コード", "入出庫先名", "入出庫先部署名", "入出庫先郵便番号", "入出庫先住所１",
    "入出庫先住所２", "入出庫先電話番号", "荷送人コード", "個口数", "車番", "乗務員コード",
    "扱便コード", "摘要１", "摘要２", "摘要３", "フリー項目１", "フリー項目２", "フリー項目３",
    "客先伝票行番号", "商品コード", "ロット１", "ロット２", "ロット３", "ロット４", "ロット５",
    "ロット６", "ロット７", "ロット８", "ロット９", "ロット１０", "品名", "数量１", "数量２",
    "数量３", "備考", "商品管理区分", "入数１", "入数２", "数量使用区分", "単位名１", "単位名２",
    "単位名３", "単位重量１", "単位重量２", "単位重量３", "単位容積１", "単位容積２", "単位容積３",
    "荷姿１縦", "荷姿２縦", "荷姿３縦", "荷姿１横", "荷姿２横", "荷姿３横", "荷姿１高さ",
    "荷姿２高さ", "荷姿３高さ", "端数繰上数１", "端数繰上数２", "保管料計算区分", "入庫料計算区分",
    "出庫料計算区分", "在庫金額計算区分", "積数端数処理区分", "積数端数処理桁数",
    "保管積数端数処理方法区分", "荷役積数端数処理方法区分", "定貫係数", "定貫数", "重量計算区分",
    "容積計算区分", "課税区分", "自動削除フラグ", "保管単価", "入庫単価", "出庫単価", "在庫単価",
  ];

  // CSVデータ構築
  const csvContent = [
    "\uFEFF" + headers.join(","), // BOM付きヘッダー
    ...progressTableData.value.map((row) => [
      "P_NYUKO",                // 取込データ区分（固定値）
      filters.value.tokuisaki,  // 得意先コード
      "",                       // 客先伝票番号
      row.denbyodata,           // 伝票日付
      row.kisandata,            // 起算日
      "", "", "", "", "", "", "", // 空白列
      "", "", "", "", "", "", "", // 空白列
      "", "", "", "", "","",          // 客先伝票行番号
      row.syohincd,             // 商品コード
      row.expirationdate ? formatDateToSlash(row.expirationdate) : "",       // ロット１
      "", "", "", "", "", "", "", "", "",  // ロット２～ロット１０
      row.syohinmei,            // 品名
      0,                        // 数量１
      row.kesu * row.irisu + row.bara, // 数量２: kesu * irisu + bara
      "",                       // 数量３
      row.location,             // 備考
      "", "", "", "", "", "", "", "", "", "", // 空白列
    ].join(","))
  ].join("\n");

  // CSVファイルのダウンロード処理
  const fileName = `入庫実績_${filters.value.arrivalDate.replace(/-/g, "")}.csv`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert("CSVダウンロードが完了しました。");
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