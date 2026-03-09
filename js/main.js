// 入口：连接各模块，绑定事件，启动应用
import { fetchData, getPlaces } from './api.js';
import { renderCards } from './render.js';

document.getElementById("searchInput").addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) {
    renderCards(getPlaces());
    return;
  }
  const filtered = getPlaces().filter(p =>
    (p.name    || "").toLowerCase().includes(q) ||
    (p.address || "").toLowerCase().includes(q) ||
    (p.comment || "").toLowerCase().includes(q)
  );
  renderCards(filtered);
});

fetchData();
