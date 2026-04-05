const btn = document.getElementById("pingBtn");
const status = document.getElementById("status");

btn.addEventListener("click", () => {
  const now = new Date().toLocaleString("zh-CN");
  status.textContent = `按钮可用，前端脚本正常。时间：${now}`;
});
