// 渲染层：负责所有 DOM 更新

export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

export function showLoading() {
  document.getElementById("main").innerHTML = `
    <div class="state">
      <div class="spinner"></div>
      <h2>正在加载数据…</h2>
      <p>从 Google Sheets 拉取最新地点信息</p>
    </div>`;
  document.getElementById("countBadge").innerHTML = "";
}

export function showError(msg) {
  document.getElementById("main").innerHTML = `
    <div class="state">
      <div class="state-icon">⚠️</div>
      <h2>加载失败</h2>
      <p>${escapeHtml(msg)}</p>
    </div>`;
}

export function renderCards(places) {
  const main = document.getElementById("main");
  const badge = document.getElementById("countBadge");

  if (places.length === 0) {
    badge.innerHTML = "";
    main.innerHTML = `
      <div class="state">
        <div class="state-icon">🗺️</div>
        <h2>没有找到匹配的地点</h2>
        <p>请尝试其他关键词</p>
      </div>`;
    return;
  }

  badge.innerHTML = `共 <strong>${places.length}</strong> 个地点`;

  const grid = document.createElement("div");
  grid.className = "grid";

  places.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${Math.min(i * 0.05, 0.4)}s`;

    card.innerHTML = `
      <div class="card-header">
        <div class="card-number">${i + 1}</div>
        <div class="card-name">${escapeHtml(p.name)}</div>
      </div>
      ${p.address ? `
      <div class="card-address">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${escapeHtml(p.address)}
      </div>` : ""}
      ${p.comment ? `
      <div class="card-divider"></div>
      <div>
        <div class="card-comment-label">备注</div>
        <div class="card-comment">${escapeHtml(p.comment)}</div>
      </div>` : ""}
    `;
    grid.appendChild(card);
  });

  main.innerHTML = "";
  main.appendChild(grid);
}
