// 暗色模式 — 必须是普通 script（非 ES module），放在 <head> 同步执行，防止主题闪烁
(function () {
  const DARK_KEY = "travel-board-dark";

  function applyDark(on) {
    document.body.classList.toggle("dark", on);
    const btn = document.getElementById("darkBtn");
    if (!btn) return;
    btn.innerHTML = on
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> 浅色模式`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> 深色模式`;
    localStorage.setItem(DARK_KEY, on ? "1" : "0");
  }

  // 初始化主题（在 DOM 渲染前执行，避免闪烁）
  const saved = localStorage.getItem(DARK_KEY);
  if (saved !== null) {
    document.documentElement.classList.toggle("dark-init", saved === "1");
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark-init");
  }

  // DOM 就绪后绑定按钮事件并应用主题
  document.addEventListener("DOMContentLoaded", function () {
    const isDark = document.documentElement.classList.contains("dark-init");
    document.documentElement.classList.remove("dark-init");
    applyDark(isDark);

    document.getElementById("darkBtn").addEventListener("click", function () {
      applyDark(!document.body.classList.contains("dark"));
    });
  });
})();
