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

      <button class="search-button" @click="generateCsvLocally">
        <Paperclip class="icon" />
        実績出力
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
        <el-table-column prop="tokuisakicd" label="得意先CD" width="150" />
        <el-table-column prop="ryusyukosakinm" label="得意先名" width="300" />
        <el-table-column prop="syohincd" label="商品CD" width="120" />
        <el-table-column prop="syohinmei" label="商品名" width="500" />
        <el-table-column prop="irisu1" label="入数" width="60" />
        <el-table-column prop="suryo1" label="移動予定数" width="100" />
        <el-table-column prop="locationdata" label="オーバーロケ" width="120" />
        <el-table-column prop="updatedby" label="作業員CD" width="auto" />
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
  </div>
</template>

<script setup>
  import { Paperclip } from '@element-plus/icons-vue';
  import axios from 'axios';
  import { ref } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { onMounted } from 'vue';
  import { computed } from 'vue';

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

  // const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

  // const api = axios.create({ baseURL: API_BASE_URL });

  const formatDateToYMD = (str) => {
    if (!str) return '';
    const [y, m, d] = str.split('/');
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const handlePageChange = (newPage) => {
    currentPage.value = newPage;
  };

  const noDataModalVisible = ref(false);

  const authStore = useAuthStore();

  const filters = ref({
    syohinmei: '',
    locationdata: [],
    workdata: '',
    tokuisaki: '',
  });

  const tableData = ref([]);
  const selectedRows = ref([]);

  const handleSelectionChange = (rows) => {
    selectedRows.value = rows;
  };
  currentPage.value = 1; // 検索時に1ページ目に戻す

  const centercd = authStore.centerId; // ログイン中のセンターコード
  // 得意先リストデータ
  const tokuisakiList = ref([]);

  // 得意先リストをバックエンドから取得する関数
  const fetchTokuisakiList = async () => {
    try {
      const response = await axios.get('https://www.hokuohylogi.com/M_TOKUISAKI/getByCenter', {
        params: { centercd }, // センターコードを送信
      });

      if (response.data && Array.isArray(response.data)) {
        tokuisakiList.value = response.data; // 得意先リストを保存
      } else {
        console.error('得意先データが不正です:', response.data);
      }
    } catch (error) {
      console.error('得意先データの取得中にエラーが発生しました:', error);
      alert('得意先データの取得に失敗しました。再試行してください。');
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

    if (!workDate || !selectedTokuisakiCd) {
      alert('作業日と得意先を選択してください。');
      return;
    }

    const formattedDate = formatDateToYMD(workDate);
    const centercd = authStore.centerId;

    try {
      const response = await axios.get(
        'https://www.hokuohylogi.com/tRefillT/getByDateAndCustomer',
        {
          params: {
            date: formattedDate,
            tokuisakicd: selectedTokuisakiCd,
            centercd: centercd, // ✅ 必須：DB自動切り替えのため
          },
        }
      );
      const selectedTokuisaki = tokuisakiList.value.find(
        (item) => item.tokuisakicd === selectedTokuisakiCd
      );

      if (Array.isArray(response.data)) {
        tableData.value = response.data.map((item) => ({
          uuid: item.uuid,
          tokuisakicd: item.tokuisakicd || '',
          ryusyukosakinm: selectedTokuisaki.tokuisakinm || '',
          syohincd: item.syohincd || '',
          syohinmei: item.syohinmei || '',
          irisu1: item.irisu1 || 0,
          suryo1: item.suryo1 || 0,
          locationdata: item.locationdata || '',
          updatedby: item.updatedBy || '',
        }));
        rowCount.value = tableData.value.length;
        if (rowCount.value === 0) noDataModalVisible.value = true;
      } else {
        tableData.value = [];
        rowCount.value = 0;
        alert('該当データがありません。');
      }
    } catch (error) {
      console.error('補充データ取得エラー:', error);
      alert('データ取得に失敗しました。');
    }
  };

  const generateCsvLocally = () => {
    if (selectedRows.value.length === 0) {
      alert('出力対象が選択されていません。');
      return;
    }

    const selectedTokuisaki = tokuisakiList.value.find(
      (item) => item.tokuisakicd === filters.value.tokuisaki
    );

    const formattedDate = filters.value.workdata?.replaceAll('/', '') || '未選択日';
    const tokuisakiName =
      selectedTokuisaki?.tokuisakinm?.replace(/[\\/:*?"<>|]/g, '') || '未選択得意先';
    const filename = `${formattedDate}_${tokuisakiName}_補充予定実績.csv`;

    const header = [
      '得意先CD',
      '得意先名',
      '商品CD',
      '商品名',
      '入数',
      '移動予定数',
      'オーバーロケ',
    ];

    const csvRows = [header.join(',')];

    selectedRows.value.forEach((row) => {
      const line = [
        `"${row.tokuisakicd || ''}"`,
        `"${row.ryusyukosakinm || ''}"`,
        `"${row.syohincd || ''}"`,
        `"${row.syohinmei || ''}"`,
        `${row.irisu1 ?? ''}`,
        `${row.suryo1 ?? ''}`,
        `"${row.locationdata || ''}"`,
      ].join(',');
      csvRows.push(line);
    });

    const csvContent = '\uFEFF' + csvRows.join('\n'); // UTF-8 BOM付き
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
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
  html,
  body {
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
