<template>
  <div class="container">
    <!-- フィルタコンテナ -->
    <div class="filter-container">
      <!-- <div class="filter-item">
        <label for="arrival-date">作業日</label>
        <input type="date" id="arrival-date" class="filter-input" v-model="filters.arrivalDate" />
      </div> -->

      <div class="filter-item">
        <label for="arrival-date">作業日</label>
        <el-date-picker
          v-model="filters.arrivalDate"
          type="date"
          placeholder="作業日を選択"
          format="YYYY/MM/DD"
          value-format="YYYY/MM/DD"
          id="arrival-date"
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

      <div class="filter-item">
        <label for="product-code">進捗区分</label>
        <select id="denpyokubun" class="filter-select" v-model="progressFilters.denpyokubun">
          <option value=""></option>
          <option value="51">未作業</option>
          <option value="52">移動済</option>
        </select>
      </div>

      <!-- ボタン -->
      <button class="search-button" @click="handleProgressCheck">
        <Search class="icon" />
        進捗確認
      </button>
      <!-- ボタン -->
      <button class="downloadbutton" @click="handleDownload">
        <Download class="icon" />
        ダウンロード
      </button>
    </div>

    <!-- 新しい三列テーブル -->
    <div class="summary-table-container">
      <el-table :data="summaryTableData" stripe style="width: auto">
        <el-table-column prop="uninspected" label="未作業行" width="100">
          <template v-slot="scope">
            <div :style="{ backgroundColor: '#fce4ec', padding: '5px' }">
              {{ scope.row.uninspected }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="inspected" label="移動済行" width="100">
          <template v-slot="scope">
            <div :style="{ backgroundColor: '#e8f5e9', padding: '5px' }">
              {{ scope.row.inspected }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 表格容器 -->
    <el-table
      :data="paginatedProgressData"
      style="width: 100%"
      height="500"
      border
      @selection-change="handleSelectionChange"
      row-class-name="BackgroundColor"
    >
      <!-- チェックボックス列 -->
      <el-table-column type="selection" width="55" fixed="left" />
      <el-table-column prop="syohincd" label="商品CD" width="150" />
      <el-table-column prop="syohinmei" label="商品名" width="600" />
      <el-table-column prop="irisu1" label="入数" width="60" />
      <el-table-column prop="kesu" label="ケース" width="70" />
      <el-table-column prop="bara" label="バラ" width="60" />
      <el-table-column prop="locationdata" label="ロケーション" width="200" />
      <el-table-column prop="sapuraiyanm" label="サプライヤ様" width="auto" />
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[100, 200, 500]"
      :total="progressTableData.length"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />

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
  </div>
</template>

<script setup>
  import { Search } from '@element-plus/icons-vue';
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useAuthStore } from '@/stores/auth';
  import { computed } from 'vue';

  // ページネーション状態
  const currentPage = ref(1);
  const pageSize = ref(100);

  // 表示するページのデータ（computedでフィルタ）
  const paginatedProgressData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return progressTableData.value.slice(start, end);
  });

  // const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

  // const api = axios.create({ baseURL: API_BASE_URL });

  const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
  };

  const handlePageChange = (val) => {
    currentPage.value = val;
  };

  // ログインユーザー情報
  const authStore = useAuthStore();
  const centercd = authStore.centerId;

  // ▼ フィルター・データ管理
  const filters = ref({ arrivalDate: '', tokuisaki: '' });
  const progressFilters = ref({ arrivalDate: '', tokuisaki: '', denpyokubun: '' });
  const tokuisakiList = ref([]);
  const summaryTableData = ref([{ uninspected: '', inspected: '' }]);
  const progressTableData = ref([]);
  const selectedRows = ref([]);

  // ▼ UI状態管理
  const successModalVisible = ref(false);
  const modalMessage = ref('');
  const isEditButtonVisible = ref(false);

  // ▼ 得意先リスト取得
  const fetchTokuisakiList = async () => {
    try {
      const response = await axios.get('https://www.hokuohylogi.com/M_TOKUISAKI/getByCenter', {
        params: { centercd },
      });
      if (Array.isArray(response.data)) tokuisakiList.value = response.data;
      else console.error('得意先データが不正:', response.data);
    } catch (error) {
      console.error('得意先取得失敗:', error);
      alert('得意先データの取得に失敗しました。');
    }
  };

  // ▼ サマリーデータ取得
  const fetchProgressSummary = async (filterParams) => {
    try {
      const updated = { ...filterParams, centercd };
      const response = await axios.get(
        'https://www.hokuohylogi.com/tLocationTFinish/progressSummary',
        {
          params: updated,
        }
      );
      return response.data;
    } catch (error) {
      console.error('進捗サマリー取得失敗:', error);
      return { uninspected: '', inspected: '' };
    }
  };

  // ▼ 詳細データ取得
  const fetchProgressDetails = async (filterParams) => {
    try {
      const updated = { ...filterParams, centercd };
      const response = await axios.get(
        'https://www.hokuohylogi.com/tLocationTFinish/progressDetails',
        {
          params: updated,
        }
      );
      return response.data;
    } catch (error) {
      console.error('進捗詳細取得失敗:', error);
      return [];
    }
  };

  // ▼ 行選択イベント
  const handleSelectionChange = (selection) => {
    selectedRows.value = selection;
  };

  // ▼ モーダルを閉じる
  const closeModal = () => {
    successModalVisible.value = false;
  };

  // ▼ 検索ボタン：進捗確認
  const handleProgressCheck = async () => {
    const { arrivalDate, tokuisaki } = filters.value;
    const { denpyokubun } = progressFilters.value;

    if (!arrivalDate || !tokuisaki || !denpyokubun) {
      alert('検索条件を選択してください');
      return;
    }

    const date = new Date(arrivalDate);
    const pad = (n) => n.toString().padStart(2, '0');
    const formattedDate = `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(
      date.getDate()
    )}`;

    // フィルター統合更新
    progressFilters.value.arrivalDate = formattedDate;
    progressFilters.value.tokuisaki = tokuisaki;

    // サマリー取得
    const summaryData = await fetchProgressSummary({
      arrivalDate: formattedDate,
      tokuisaki,
      denpyokubun,
    });

    summaryTableData.value = [
      {
        uninspected: summaryData.uninspected || 0,
        inspected: summaryData.inspected || 0,
      },
    ];

    // 詳細取得
    const detailsData = await fetchProgressDetails({
      arrivalDate: formattedDate,
      tokuisaki,
      denpyokubun,
    });

    isEditButtonVisible.value = denpyokubun === '53' && detailsData.length > 0;

    progressTableData.value = detailsData.length
      ? detailsData.map((item) => {
          if (denpyokubun === '51') {
            return {
              syohincd: item.syohincd,
              syohinmei: item.syohinmei,
              irisu1: item.irisu1,
              kesu: item.kesu,
              bara: item.bara,
              locationdata: item.locationdata,
              sapuraiyanm: item.sapuraiyanm,
            };
          } else if (denpyokubun === '52') {
            return {
              syohincd: item.syohincd,
              syohinmei: item.syohinmei,
              irisu1: item.irisu1,
              kesu1: item.kesu,
              bara1: item.bara,
              kesu: item.ido_kesu,
              bara: item.ido_bara,
              locationdata: item.ido_location,
              sapuraiyanm: item.sapuraiyanm,
            };
          }
          return {};
        })
      : [];

    if (!detailsData.length) {
      alert('予定データはありません。');
    }
  };

  const handleDownload = () => {
    if (selectedRows.value.length === 0) {
      alert('出力対象が選択されていません。');
      return;
    }

    const date = filters.value.arrivalDate;
    const tokuisakiCd = filters.value.tokuisaki;
    const denpyokubunVal = progressFilters.value.denpyokubun;

    // 日付フォーマット: YYYYMMDD
    const formattedDate = date?.replace(/[-/]/g, '') || '未選択日';

    // 得意先名の取得
    const selectedTokuisaki = tokuisakiList.value.find((t) => t.tokuisakicd === tokuisakiCd);
    const tokuisakiName =
      selectedTokuisaki?.tokuisakinm?.replace(/[\\/:*?"<>|]/g, '') || '未選択得意先';

    // 進捗区分名の取得
    const denpyokubunLabel =
      denpyokubunVal === '51' ? '未作業' : denpyokubunVal === '52' ? '移動済' : '不明区分';

    const filename = `${formattedDate}_${tokuisakiName}_${denpyokubunLabel}.csv`;

    // ヘッダー
    const header = [
      '商品CD',
      '商品名',
      '入数',
      '移動後ケース',
      '移動後バラ',
      '移動前ケース',
      '移動前バラ',
      'ロケーション',
      'サプライヤ様',
    ];
    const csvRows = [header.join(',')];

    // データ行
    selectedRows.value.forEach((row) => {
      const line = [
        `"${row.syohincd || ''}"`,
        `"${row.syohinmei || ''}"`,
        `${row.irisu1 ?? ''}`,
        `${row.kesu ?? ''}`,
        `${row.bara ?? ''}`,
        `${row.kesu1 ?? ''}`,
        `${row.bara1 ?? ''}`,
        `"${row.locationdata || ''}"`,
        `"${row.sapuraiyanm || ''}"`,
      ].join(',');
      csvRows.push(line);
    });

    // BOM付きCSV生成
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // ダウンロードリンク生成
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 初期処理
  onMounted(() => {
    fetchTokuisakiList();
  });
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
  .filter-container > .search-button .downloadbutton {
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
  html,
  body {
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

  html,
  body {
    height: 100%;
    overflow: hidden;
  }
  .container {
    height: 90%;
    overflow-y: auto;
  }
</style>
