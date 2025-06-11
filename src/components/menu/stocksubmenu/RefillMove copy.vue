<template>
  <div class="container">

    <!-- フィルタコンテナ -->
    <div class="filter-container">


<div class="filter-item">
  <label for="workdate">作業日</label>
  <el-date-picker
    v-model="filters.workdata"
    type="date"
    placeholder="作業日を選択"
    format="YYYY/MM/DD"
    value-format="YYYY/MM/DD"
    id="workdate"
    class="filter-input"
  />
</div>

      <div class="filter-item">
  <label for="order-number">得意先</label>
<select id="tokuisaki" class="filter-select" v-model="filters.tokuisaki">
  <option value=""></option>
  <option
    v-for="tokuisaki in tokuisakiList"
    :key="tokuisaki.tokuisakicd"
    :value="tokuisaki.tokuisakicd"
  >
    {{ tokuisaki.tokuisakinm }}
  </option>
</select>
</div>


<div>
  <div class="filter-item">
    指定ロケ
  </div>
  <el-input
    v-model="filters.locationdata"
    clearable
    placeholder="ロケーション"
  />
</div>



<button class="search-button" @click="generatePdfLocally">
  <Printer class="icon" /> リスト印刷
</button>
    </div>

        <!-- ボタン追加部分 -->
        <div class="button-container">
  <div class="table-header">
    <span>合計: {{ rowCount }} 行</span>
  </div>
  <div class="button-group">
    <button class="header-button search-button" @click="searchData">指定条件検索</button>
  
  </div>
</div>
    <!-- 表格容器 -->
    <div class="table-container">
    
      <el-table
  :data="paginatedData"
  style="width: 100%"
  height="500"
  border
  @selection-change="handleSelectionChange"
  row-class-name="BackgroundColor"
>
        <!-- チェックボックス列 -->
        <el-table-column type="selection" width="55" fixed="left" />

        <!-- データ列 -->
        <el-table-column prop="tokuisaki" label="得意先" width="100" />
        <el-table-column prop="syohincd" label="商品CD" width="120" />
        <el-table-column prop="syohinmei" label="商品名" width="300" />
        <el-table-column prop="suryo2" label="在庫総バラ" width="100" />
        <el-table-column prop="expirationdate" label="賞味期限" width="120" />
        <el-table-column prop="locationdata" label="ロケーション" width="120" />
        <el-table-column prop="irisu" label="入数" width="60" />
        <el-table-column prop="kesu" label="ケース" width="70" />
        <el-table-column prop="bara" label="バラ" width="60" />
        <el-table-column prop="supplier" label="サプライヤ様" width="auto" />

      </el-table>
      <el-pagination
  v-model:current-page="currentPage"
  v-model:page-size="pageSize"
  :page-sizes="[100, 200, 500]"
  :total="tableData.length"
  layout="total, sizes, prev, pager, next, jumper"
  @size-change="handleSizeChange"
  @current-change="handlePageChange"
/>
    </div>

<!-- 検索結果なしモーダル -->
<div v-if="noDataModalVisible" class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h2>通知</h2>
    </div>
    <div class="modal-body">
      <p>指定条件のデータがありません。</p>
    </div>
    <div class="modal-footer">
      <button class="close-button" @click="noDataModalVisible = false">OK</button>
    </div>
  </div>
</div>

<!-- PDF プレビュー モーダル -->
<div v-if="showPdfPreview" class="modal-overlay">
  <div class="modal large-modal">
    <div class="modal-header">
      <h2>PDFプレビュー</h2>
    </div>
    <div class="modal-body" style="height: 600px;">
      <iframe :src="pdfBlobUrl" width="100%" height="100%" />
    </div>
    <div class="modal-footer">
      <button class="close-button" @click="showPdfPreview = false">閉じる</button>
    </div>
  </div>
</div>


  </div>

</template>

<script setup>
import { Printer } from '@element-plus/icons-vue' 
import axios from "axios";
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { onMounted} from "vue";
import { computed } from "vue";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import ipagFont from "@/assets/fonts/ipag-base64.js"; 
// import QRCode from "qrcode";
import JsBarcode from "jsbarcode";


const currentPage = ref(1);
const pageSize = ref(500);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return tableData.value.slice(start, end);
});

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
};

const noDataModalVisible = ref(false);


const authStore = useAuthStore();

const filters = ref({
  syohinmei: "",
  locationdata: [],
  workdata: "",
  tokuisaki: ""

});

const generateCode39Base64 = (text) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, text, {
    format: "CODE39",
    width: 1.0,// ← 幅
    height: 20, // ← 高さ
    displayValue: false,
    margin: 0,
  });
  return canvas.toDataURL("image/png");
};

const generatePdfLocally = async () => {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.addFileToVFS("ipag.ttf", ipagFont);
  doc.addFont("ipag.ttf", "ipag", "normal");
  doc.addFont("ipag.ttf", "ipag", "bold");

  const marginLeft = 15;
  const marginRight = 15;
  const pageWidth = doc.internal.pageSize.getWidth();

  const rowsPerPage = 10;
  const totalRows = selectedRows.value.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const now = new Date();
  const formattedDateTime = now.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).replace(/\//g, "/");

  // const generateQrBase64 = async (text) => {
  //   try {
  //     return await QRCode.toDataURL(text, { margin: 1, width: 50 });
  //   } catch (err) {
  //     console.error("QRコード生成失敗", err);
  //     return null;
  //   }
  // };

  for (let i = 0; i < totalRows; i += rowsPerPage) {
    const currentPage = Math.floor(i / rowsPerPage) + 1;
    if (i > 0) doc.addPage();

    doc.setFont("ipag", "normal");
    doc.setFontSize(10);
    doc.text(formattedDateTime, marginLeft, 12);
    doc.text(`${currentPage}/${totalPages}`, pageWidth - marginRight - 20, 12);

    doc.setFont("ipag", "bold");
    doc.setFontSize(18);
    doc.text("補充商品リスト", pageWidth / 2, 22, { align: "center" });

    doc.setFont("ipag", "normal");
    doc.setFontSize(11);

    const pageRows = selectedRows.value.slice(i, i + rowsPerPage);
    // const qrImages = await Promise.all(pageRows.map(row => generateQrBase64(row.syohincd)));
    const barcodeImages = pageRows.map(row => generateCode39Base64(row.syohincd));
    const body = pageRows.map(() => ["", "", "", ""]);

    autoTable(doc, {
      startY: 30,
      margin: { left: marginLeft, right: marginRight },
      head: [["商品CD", "商品名", "正規ロケ", "商品JAN"]],
      body: body,
columnStyles: {
  0: { cellWidth: 45, halign: 'left' },   // 商品CD
  1: { cellWidth: 120, halign: 'left' },  // 商品名
  2: { cellWidth: 35, halign: 'left' },   // 作業ロケ
  3: { cellWidth: 60 }                    // バーコード
},
styles: {
  font: "ipag",
  fontSize: 10,
  cellPadding: 4,
  minCellHeight: 15.0,  // ← 行高さを固定
},
      headStyles: {
        fillColor: [200, 200, 200],
        fontStyle: "bold",
        fontSize: 12,
        halign: 'left'
      },
      theme: "grid",
didDrawCell: (data) => {
  if (data.section === 'body' && data.column.index === 3) {
    const imgData = barcodeImages[data.row.index];
    if (imgData) {
      const barcodeWidth = 20;
      const barcodeHeight = 10;
      const x = data.cell.x + (data.cell.width - barcodeWidth) / 2;
      const y = data.cell.y + (data.cell.height - barcodeHeight) / 2;
      doc.addImage(imgData, 'PNG', x, y, barcodeWidth, barcodeHeight);
    }
  } else if (data.section === 'body') {
    const realData = pageRows[data.row.index];
    if (!realData) return;  // ← ★ 安全チェックを追加

    let text = "";
    switch (data.column.index) {
      case 0: text = realData.syohincd || ""; break;
      case 1: text = realData.syohinmei || ""; break;
      case 2: text = realData.locationdata || ""; break;
    }

    if (data.column.index !== 3) {
      doc.text(text, data.cell.x + 2, data.cell.y + data.cell.height / 2 + 3);
    }
  }
}

    });
  }

  const pdfBlob = doc.output("blob");
  pdfBlobUrl.value = URL.createObjectURL(pdfBlob);
  showPdfPreview.value = true;
};

const tableData = ref([]);
const selectedRows = ref([]);
const showPdfPreview = ref(false);
const pdfBlobUrl = ref("");

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
};
currentPage.value = 1; // 検索時に1ページ目に戻す

const centercd = authStore.centerId; // ログイン中のセンターコード
// 得意先リストデータ
const tokuisakiList = ref([]);



// const printSelectedRows = async () => {
//   const uuidList = selectedRows.value.map(row => row.uuid);
//   if (uuidList.length === 0) {
//     alert("印刷対象が選択されていません。");
//     return;
//   }

//   try {
//     const response = await axios.post(
//       "http://192.168.10.127:8091/tLocationT/printPdf",
//       uuidList,
//       {
//         params: { centercd: authStore.centerId },
//         responseType: "blob",
//       }
//     );

//     const blob = new Blob([response.data], { type: "application/pdf" });
//     pdfBlobUrl.value = URL.createObjectURL(blob);
//     showPdfPreview.value = true;
//   } catch (error) {
//     console.error("PDF取得失敗:", error);
//     alert("PDFの取得に失敗しました。");
//   }
// };




const formatDate = (str) => {
  if (!str) return "";
  const [y, m, d] = str.split("/");
  if (!y || !m || !d) return "";
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

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

// onMountedで自動取得
onMounted(() => {
  fetchTokuisakiList();
});



const rowCount = ref(0);

const searchData = async () => {
  const workDate = filters.value.workdata;
  const selectedTokuisakiCd = filters.value.tokuisaki;
  const location = filters.value.locationdata; // ← 新規追加

  if (!workDate || !selectedTokuisakiCd) {
    alert("作業日と得意先とロケーションを選択してください。");
    return;
  }

  const selectedTokuisaki = tokuisakiList.value.find(
    (item) => item.tokuisakicd === selectedTokuisakiCd
  );

  if (!selectedTokuisaki) {
    alert("得意先情報が不正です。");
    return;
  }

  try {
    const response = await axios.get("https://www.hokuohylogi.com/tLocationT/searchByConditions", {
    //const response = await axios.get("http://192.168.10.127:8091/tLocationT/searchByConditions", {
      params: {
        workdata: workDate,
        tokuisakicd: selectedTokuisakiCd,
        locationdata: location, // ← APIへ送信する新パラメータ
        centercd: authStore.centerId,
      },
    });

    if (Array.isArray(response.data)) {
      tableData.value = response.data.map((item) => ({
        uuid: item.uuid,
        workdata: formatDate(item.workdata),
        tokuisaki: item.tokuisakicd || "",
        syohincd: item.syohincd || "",
        syohinmei: item.syohinmei || "",
        suryo2: item.suryo2 || "",
        expirationdate: formatDate(item.roto1),
        locationdata: item.locationdata || "",
        kesu: item.kesu || 0,
        bara: item.bara || 0,
        irisu: item.irisu1 || 0,
        supplier: item.sapuraiyanm || "",
        ryukono: item.ryukono || "",
      }));
      rowCount.value = tableData.value.length;
      if (rowCount.value === 0) noDataModalVisible.value = true;
    } else {
      alert("該当データがありません。");
      tableData.value = [];
      rowCount.value = 0;
    }
  } catch (error) {
    console.error("検索エラー:", error);
    alert("検索に失敗しました。");
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
  min-width: 150px;
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
.delete-all-button {
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

.delete-all-button:hover {
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
.el-pagination {
  margin-top: 20px;
  justify-content: center;
}
.modal-footer .confirm-button,
.modal-footer .cancel-button {
  width: 120px;
  height: 40px;
  font-size: 16px;
  border-radius: 6px;
  font-weight: bold;
}
.modal-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #eaeaea;
}

.large-modal {
  width: 100%;
  height: 100%;
  max-height: 90vh;
}
</style>
