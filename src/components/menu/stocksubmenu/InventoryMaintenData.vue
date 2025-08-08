<template>
  <div class="container">
    <!-- フィルタコンテナ -->
    <div class="filter-container">
      <!-- <div class="filter-item">
        <label for="arrival-date">棚卸作業日</label>
        <input type="date" id="arrival-date" class="filter-input" v-model="filters.arrivalDate" />
      </div> -->

      <div class="filter-item">
        <label for="arrival-date">棚卸作業日</label>
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

      <!-- ボタン -->
      <button class="search-button" @click="handleProgressCheck">
        <Finished class="icon" />
        実績確認
      </button>

      <button class="confirmed" @click="achievements">
        <DocumentChecked class="icon" />
        棚卸データ作成
      </button>
    </div>

    <!-- 表格容器 -->
    <div class="table-container">
      <el-table
        :data="paginatedData"
        style="width: 100%"
        height="600"
        border
        @selection-change="handleSelectionChange"
        row-class-name="BackgroundColor"
      >
        <!-- チェックボックス列 -->
        <el-table-column type="selection" width="55" fixed="left" />
        <!-- データ列 -->
        <el-table-column prop="syohincd" label="商品CD" width="120" />
        <el-table-column prop="syohinmei" label="商品名" width="250" />
        <el-table-column prop="roto1" label="棚卸賞味" width="150" />
        <el-table-column prop="irisu" label="入数" width="60" />
        <el-table-column prop="checkkesu" label="棚卸ケース" width="100" />
        <el-table-column prop="checkbara" label="棚卸バラ" width="100" />
        <el-table-column prop="location" label="ロケーション" width="120" />
        <el-table-column prop="supplier" label="サプライヤ様" width="200" />
        <el-table-column prop="status" label="ステータス" width:auto />
      </el-table>
    </div>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[100, 200, 500]"
      :total="progressTableData.length"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
  import { Finished, DocumentChecked } from '@element-plus/icons-vue';
  import { ref } from 'vue';
  import axios from 'axios';
  import { onMounted } from 'vue';
  import { useAuthStore } from '@/stores/auth'; // 認証ストアからセンターコードを取得
  import { computed } from 'vue';

  const progressTableData = ref([]);
  // 検索条件
  const filters = ref({
    arrivalDate: '',
    tokuisaki: '',
  });
  const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

  const api = axios.create({ baseURL: API_BASE_URL });

  const formatDateToSlash = (date) => {
    return date.replace(/-/g, '/');
  };

  const selectedRows = ref([]); // チェックされた行データを保持
  // ログイン時のセンターコードを取得
  const authStore = useAuthStore();
  const centercd = authStore.centerId; // ログイン中のセンターコード

  // 得意先リストデータ
  const tokuisakiList = ref([]);

  // チェックボックス選択時のイベント
  const handleSelectionChange = (rows) => {
    selectedRows.value = rows;
  };

  const currentPage = ref(1);
  const pageSize = ref(500);

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return progressTableData.value.slice(start, end);
  });

  const handleSizeChange = (newSize) => {
    pageSize.value = newSize;
    currentPage.value = 1;
  };

  const handlePageChange = (newPage) => {
    currentPage.value = newPage;
  };

  // 得意先リストをバックエンドから取得する関数
  const fetchTokuisakiList = async () => {
    try {
      const response = await api.get('/M_TOKUISAKI/getByCenter', {
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

  // ページ遷移時にデータを取得
  onMounted(() => {
    fetchTokuisakiList();
  });

  const handleProgressCheck = async () => {
    if (!filters.value.arrivalDate || !filters.value.tokuisaki) {
      alert('検索条件を選択してください');
      return;
    }

    // const formattedDate = (() => {
    //   const [year, month, day] = filters.value.arrivalDate.split('-');
    //   return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
    // })();

    const centercd = authStore.centerId;

    try {
      const response = await api.post('/tTanaoroshiCheckT/adjustmentdata', {
        // kisandata: formattedDate,
        kisandata: filters.value.arrivalDate,
        tokuisakicd: filters.value.tokuisaki,
        centercd: centercd,
      });

      const detailsData = response.data;

      progressTableData.value = detailsData.length
        ? detailsData.map((item) => ({
            syohincd: item.syohincd,
            syohinmei: item.syohinmei,
            irisu: item.irisu1,
            roto1: item.checktaste,
            roto2: item.roto1,
            kesu: item.kesu,
            bara: item.bara,
            checkkesu: item.checkkesu,
            checkbara: item.checkbara,
            location: item.locationdata,
            supplier: item.sapuraiyanm,
            uuid: item.uuid,
            kisandata: item.kisandata,
            denbyodata: item.denbyodata,
            status: item.createstatus || '',
          }))
        : [];
    } catch (error) {
      console.error('データ送信に失敗しました:', error);
      alert('データの取得に失敗しました');
    }
  };

  /**
   * SKデータ作成時の重複チェック処理の機能外し、
   * アプリ側棚卸した商品は自動取消処理を回していますので、重複棚卸は発生しません、
   * そのため、重複チェックのコードはコメントアウトしています。
   *
   */
  //const seenCombinations = new Set(); // 商品コード + ロットの組み合わせを記録

  const achievements = async () => {
    if (!selectedRows.value || selectedRows.value.length === 0) {
      alert('データがありません。');
      return;
    }

    // 調整出庫使う日付、当日
    const getTodayFormatted = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    };

    // 調整入庫使う日付、前日
    const getYesterdayDashed = () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const year = yesterday.getFullYear();
      const month = String(yesterday.getMonth() + 1).padStart(2, '0');
      const day = String(yesterday.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`; // 例：2025-06-16（必要なら）
    };

    // CSVヘッダー
    const headers = [
      '取込データ区分',
      '得意先コード',
      '客先伝票番号',
      '伝票日付',
      '起算日',
      '伝票区分',
      '入出庫先コード',
      '入出庫先名',
      '入出庫先部署名',
      '入出庫先郵便番号',
      '入出庫先住所１',
      '入出庫先住所２',
      '入出庫先電話番号',
      '荷送人コード',
      '個口数',
      '車番',
      '乗務員コード',
      '扱便コード',
      '摘要１',
      '摘要２',
      '摘要３',
      'フリー項目１',
      'フリー項目２',
      'フリー項目３',
      '客先伝票行番号',
      '商品コード',
      'ロット１',
      'ロット２',
      'ロット３',
      'ロット４',
      'ロット５',
      'ロット６',
      'ロット７',
      'ロット８',
      'ロット９',
      'ロット１０',
      '品名',
      '数量１',
      '数量２',
      '数量３',
      '備考',
      '商品管理区分',
      '入数１',
      '入数２',
      '数量使用区分',
      '単位名１',
      '単位名２',
      '単位名３',
      '単位重量１',
      '単位重量２',
      '単位重量３',
      '単位容積１',
      '単位容積２',
      '単位容積３',
      '荷姿１縦',
      '荷姿２縦',
      '荷姿３縦',
      '荷姿１横',
      '荷姿２横',
      '荷姿３横',
      '荷姿１高さ',
      '荷姿２高さ',
      '荷姿３高さ',
      '端数繰上数１',
      '端数繰上数２',
      '保管料計算区分',
      '入庫料計算区分',
      '出庫料計算区分',
      '在庫金額計算区分',
      '積数端数処理区分',
      '積数端数処理桁数',
      '保管積数端数処理方法区分',
      '荷役積数端数処理方法区分',
      '定貫係数',
      '定貫数',
      '重量計算区分',
      '容積計算区分',
      '課税区分',
      '自動削除フラグ',
      '保管単価',
      '入庫単価',
      '出庫単価',
      '在庫単価',
    ];

    // CSVデータ構築
    const csvContent = [
      '\uFEFF' + headers.join(','), // BOM付きヘッダー
      ...selectedRows.value.map((row) =>
        [
          'P_NYUKO', // 取込データ区分（固定値）
          filters.value.tokuisaki, // 得意先コード
          row.kyadenno, // 客先伝票番号
          getYesterdayDashed(), // 伝票日付
          getYesterdayDashed(), // 起算日
          '09',
          '',
          '',
          '',
          '',
          '',
          '', // 空白列
          '',
          '',
          '',
          '',
          '',
          '',
          '', // 空白列
          '',
          '',
          '',
          '',
          '',
          '', // 客先伝票行番号
          row.syohincd, // 商品コード
          row.roto1 ? formatDateToSlash(row.roto1) : '', // ロット１
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '', // ロット２～ロット１０
          row.syohinmei, // 品名
          row.checkkesu, // 数量１
          row.checkbara, // 数量１
          // 0,                        // 数量１
          // row.kesu * row.irisu + row.bara, // 数量２: kesu * irisu + bara
          '', // 数量３
          row.location ? row.location.replace(/\r?\n|\r/g, ' ') : '', // 備考
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          // 空白列
        ].join(',')
      ),
    ].join('\n');
    // 選択された得意先コードから得意先名を取得
    const selectedTokuisaki = tokuisakiList.value.find(
      (tokuisaki) => tokuisaki.tokuisakicd === filters.value.tokuisaki
    );

    // 得意先名を取得（見つからない場合はデフォルト値）
    const tokuisakinm = selectedTokuisaki ? selectedTokuisaki.tokuisakinm : '得意先未設定';

    // CSVファイルのダウンロード処理
    const fileName = `${filters.value.arrivalDate.replace(/-/g, '')}_${tokuisakinm}_棚卸NKDATA.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const skHeaders = [
      '取込データ区分',
      '得意先コード',
      '客先伝票番号',
      '伝票日付',
      '納入日',
      '伝票区分',
      '入出庫先コード',
      '入出庫先名',
      '入出庫先部署名',
      '入出庫先郵便番号',
      '入出庫先住所１',
      '入出庫先住所２',
      '入出庫先電話番号',
      '荷送人コード',
      '個口数',
      '車番',
      '乗務員コード',
      '扱便コード',
      '摘要１',
      '摘要２',
      '摘要３',
      'フリー項目１',
      'フリー項目２',
      'フリー項目３',
      '客先伝票行番号',
      '商品コード',
      'ロット１',
      'ロット２',
      'ロット３',
      'ロット４',
      'ロット５',
      'ロット６',
      'ロット７',
      'ロット８',
      'ロット９',
      'ロット１０',
      '品名',
      '数量１',
      '数量２',
      '数量３',
      '備考',
    ];

    // const seenCombinations = new Set(); // ← もう不要なので削除

    const skCsvContent = [
      '\uFEFF' + skHeaders.join(','), // BOM付きヘッダー
      ...selectedRows.value
        // .filter(...) ← この行を削除
        // 直接 map で全データを変換
        .map((row) =>
          [
            'P_SHUKO', // 取込データ区分（固定値）
            filters.value.tokuisaki, // 得意先コード
            '', // 客先伝票番号
            getTodayFormatted(), // 伝票日付
            getTodayFormatted(), // 納入日
            11,
            '',
            '',
            '',
            '',
            '',
            '', // 入出庫先情報空欄
            '',
            '',
            '',
            '',
            '',
            '',
            '', // フリー項目まで空欄
            '',
            '',
            '',
            '',
            '',
            '', // 客先伝票行番号
            row.syohincd, // 商品コード
            row.roto1 ? formatDateToSlash(row.roto2) : '', // ロット1
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '', // ロット2〜10
            row.syohinmei, // 品名
            row.kesu, // 数量1
            row.bara, // 数量2
            '', // 数量3
            '', // 備考
          ].join(',')
        ),
    ].join('\n');

    const skFileName = `${filters.value.arrivalDate.replace(
      /-/g,
      ''
    )}_${tokuisakinm}_棚卸SKDATA.csv`;
    const skBlob = new Blob([skCsvContent], { type: 'text/csv;charset=utf-8;' });
    const skLink = document.createElement('a');
    skLink.href = URL.createObjectURL(skBlob);
    skLink.setAttribute('download', skFileName);
    document.body.appendChild(skLink);
    skLink.click();
    document.body.removeChild(skLink);

    alert('CSVダウンロードが完了しました。');
    // ✅ ステータス更新処理を追加
    try {
      const uuidList = selectedRows.value.map((row) => row.uuid);

      await api.post('/tTanaoroshiCheckT/updateStatus', {
        centercd: authStore.centerId,
        uuidList: uuidList,
        createstatus: '作成済',
      });
      console.log('ステータス更新完了');
    } catch (error) {
      console.error('ステータス更新失敗:', error);
      alert('ステータス更新に失敗しました。');
    }
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
  .filter-input,
  .filter-select {
    padding: 8px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  /* ボタンのスタイル */
  .search-button,
  .difference,
  .confirmed {
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
