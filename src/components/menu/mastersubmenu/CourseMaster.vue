<template>
  <div>
    <h1>コースマスタ</h1>
    <p>コースマスタに関する内容がここに表示されます。</p>
    <button @click="handleUpdate">更新</button>
    <button @click="handleSave">保存</button>
    <button @click="handleSearch">検索</button>
    <button @click="handleDelete">削除</button>
  </div>
</template>

<script setup>
function handleUpdate() {
  alert('更新ボタンがクリックされました！');
}

function handleSave() {
  alert('保存ボタンがクリックされました！');
}

function handleSearch() {
  alert('検索ボタンがクリックされました！');
}

function handleDelete() {
  alert('削除ボタンがクリックされました！');
}
</script>

<style scoped>
h1 {
  font-size: 24px;
  color: #333;
}
p {
  font-size: 16px;
  color: #555;
}
button {
  margin-top: 10px;
  margin-right: 10px;
  padding: 8px 16px;
  font-size: 14px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
</style>