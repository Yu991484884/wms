<template>
  <div style="width: 100%; height: 100vh">
    <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="100%" />
    <div v-else>PDFを読み込み中...</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const pdfUrl = ref("");

onMounted(async () => {
  const uuids = route.query.uuids;
  if (!uuids) return;

  try {
    const response = await axios.post(
      "http://192.168.10.127:8091/tLocationT/printPdf",
      uuids.split(","), // 複数UUID対応
      {
        params: { centercd: "TEST" }, // ← 必要に応じて変更
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    pdfUrl.value = URL.createObjectURL(blob);
  } catch (err) {
    console.error("PDF取得失敗", err);
  }
});
</script>
