// 数据层：负责从 Google Sheets 拉取数据（JSONP 方式绕过 CORS）
import { renderCards, showLoading, showError } from './render.js';

export const SHEET_ID = "13G_un_CFKUWDKYcm-xqkNQFKjq4zOuT_EElGb_1RhJg";

let allPlaces = [];

// 用 getter 暴露数据，避免直接导出可变数组引用
export function getPlaces() {
  return allPlaces;
}

// window._sheetCallback 必须挂在 window 上，因为 Google JSONP 响应直接按名调用它
window._sheetCallback = function (data) {
  // 先清除超时计时器（移到回调开头，防止脚本加载成功但回调未触发的边界情况）
  if (window._sheetTimer) {
    clearTimeout(window._sheetTimer);
    window._sheetTimer = null;
  }

  try {
    const rows = data.table.rows || [];
    if (rows.length < 2) throw new Error("表格中暂无数据");

    const headerRow = rows[0].c || [];
    const cols = headerRow.map(cell =>
      cell && cell.v != null ? String(cell.v).trim().toLowerCase() : ""
    );

    allPlaces = rows.slice(1).map(row => {
      const obj = {};
      cols.forEach((col, i) => {
        if (!col) return;
        obj[col] = (row.c && row.c[i] && row.c[i].v != null)
          ? String(row.c[i].v).trim()
          : "";
      });
      return obj;
    }).filter(r => r.name);

    if (allPlaces.length === 0) throw new Error("表格中暂无数据");
    renderCards(allPlaces);
  } catch (e) {
    showError(e.message);
  }
};

export function fetchData() {
  showLoading();

  // 超时保护：5 秒内没响应则报错
  window._sheetTimer = setTimeout(
    () => showError("请求超时，请检查网络或表格是否公开"),
    5000
  );

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=responseHandler:_sheetCallback;out:json`;
  const script = document.createElement("script");
  script.src = url;
  script.onerror = () => {
    clearTimeout(window._sheetTimer);
    window._sheetTimer = null;
    showError("无法加载数据，请确认表格已设为「知道链接的人均可查看」");
  };
  document.head.appendChild(script);
}
