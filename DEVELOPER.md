# Developer Guide — 旅行地点看板

本文档面向需要维护或继续开发本项目的开发者。

---

## 架构概述

这是一个**零依赖、无构建**的纯前端项目，使用 ES6 Modules 组织代码。整体遵循简单的 **三层架构**：

```
数据层 (api.js)  →  视图层 (render.js)  ←  控制层 (main.js)
                              ↑
                         主题层 (theme.js)  [独立运行]
```

- **api.js** 负责从 Google Sheets 拉取数据，解析后存入内存，并主动调用渲染层
- **render.js** 只关心"如何把数据变成 DOM"，不做任何数据处理
- **main.js** 是胶水层，绑定搜索事件，启动数据拉取
- **theme.js** 完全独立，在 `<head>` 中同步执行以避免主题闪烁

---

## 模块详解

### `js/api.js` — 数据层

**职责：** 通过 JSONP 从 Google Sheets 获取数据，解析为统一格式，存储为模块内私有变量。

**关键实现：**

```js
// JSONP 请求 URL 格式
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=responseHandler:_sheetCallback;out:json`;
```

- Google Visualization Query API 返回的不是纯 JSON，而是 `_sheetCallback({...})` 形式的 JSONP，因此回调函数必须挂在 `window` 上
- 数据结构：`data.table.rows[0]` 是表头行，`rows[1..]` 是数据行，每行的 `c[i].v` 是单元格值
- 使用 `getPlaces()` getter 暴露数据（避免外部直接修改数组引用）
- 5 秒超时保护，防止网络问题导致页面卡住

**数据解析逻辑：**

```
Google Sheets 原始格式                   解析后格式
rows[0].c[i].v  → 列名（小写）           [{ name: "...", address: "...", comment: "..." }, ...]
rows[1..].c[i].v → 值
```

---

### `js/render.js` — 视图层

**职责：** 所有 DOM 操作都集中在这里，对外暴露三个函数。

| 函数 | 用途 |
|------|------|
| `showLoading()` | 显示加载中状态（spinner + 文字） |
| `showError(msg)` | 显示错误状态 |
| `renderCards(places)` | 渲染地点卡片网格 |

**安全注意：** 所有来自外部数据的字符串都通过 `escapeHtml()` 处理，防止 XSS：

```js
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;  // 浏览器自动转义
  return div.innerHTML;
}
```

**卡片动画：** 每张卡片有 `animation-delay`，最大累积 0.4s，避免大量数据时延迟过长：
```js
card.style.animationDelay = `${Math.min(i * 0.05, 0.4)}s`;
```

---

### `js/main.js` — 控制层（入口）

**职责：** 最精简的胶水层，只做两件事：

1. 监听搜索框 `input` 事件，调用 `getPlaces()` 过滤后重新渲染
2. 调用 `fetchData()` 启动数据加载

搜索逻辑：对 `name`、`address`、`comment` 三个字段做大小写不敏感的包含匹配。

---

### `js/theme.js` — 主题层

**职责：** 深色模式的初始化和切换。

**为什么用普通 `<script>` 而非 ES Module？**

主题必须在 DOM 渲染前应用，以防止页面从浅色闪变为深色。ES Module 是异步加载的，无法保证执行时机；普通 `<script>` 在 `<head>` 中同步执行，可在 `<body>` 渲染前设置类名。

**主题优先级（从高到低）：**
1. 用户手动切换的偏好（存于 `localStorage["travel-board-dark"]`）
2. 系统 `prefers-color-scheme: dark`
3. 默认浅色模式

**防闪烁机制：**
```
<head> 执行 theme.js
  → 读取 localStorage / 系统偏好
  → 在 <html> 上设 dark-init 类
  → DOMContentLoaded 后将 dark-init 转移到 <body>.dark
  → 移除 <html> 上的 dark-init
```

---

## CSS 架构

### `css/variables.css` — 设计令牌

所有颜色、间距、圆角等都定义为 CSS 变量，分为浅色（`:root`）和深色（`body.dark`）两套：

```css
:root {
  --bg: #f5f5f7;
  --card-bg: #ffffff;
  --text: #1d1d1f;
  /* ... */
}
body.dark {
  --bg: #1c1c1e;
  --card-bg: #2c2c2e;
  --text: #f5f5f7;
  /* ... */
}
```

**修改主题色只需改这一个文件。**

### 其他 CSS 文件

| 文件 | 职责 |
|------|------|
| `layout.css` | header、grid 布局、footer、响应式断点（≤600px） |
| `components.css` | card、button、搜索框、徽标（badge）样式 |
| `states.css` | `.state` 容器、`.spinner` 动画、卡片淡入动画 |

---

## 数据流（完整链路）

```
用户打开页面
  │
  ├─ theme.js（同步，<head>）
  │    └─ 读取偏好 → 设置初始主题
  │
  └─ main.js（DOMContentLoaded 后）
       ├─ 绑定搜索框事件
       └─ fetchData()
            ├─ showLoading()       → render.js 显示 spinner
            ├─ 插入 <script> 标签 → 向 Google Sheets 发 JSONP 请求
            └─ _sheetCallback(data)
                 ├─ 解析数据 → allPlaces[]
                 └─ renderCards(allPlaces) → render.js 渲染卡片
```

---

## 常见开发任务

### 修改数据源（替换 Google Sheet）

只需修改 `js/api.js` 第 4 行：

```js
export const SHEET_ID = "新的_Sheet_ID";
```

新表格第一行列名需包含 `name`（必须），`address` 和 `comment` 是可选字段。列名大小写不敏感（代码会自动转小写）。

---

### 添加新数据字段（如"评分"）

**Step 1：** 在 Google Sheets 表头添加新列，例如 `rating`

**Step 2：** `api.js` 无需修改，解析时会自动读取所有列

**Step 3：** 在 `js/render.js` 的 `renderCards()` 中，在卡片 HTML 模板内添加对应字段：

```js
${p.rating ? `
<div class="card-rating">评分：${escapeHtml(p.rating)}</div>` : ""}
```

**Step 4：** 在 `css/components.css` 中为 `.card-rating` 添加样式

---

### 修改搜索逻辑

搜索逻辑位于 `js/main.js`：

```js
const filtered = getPlaces().filter(p =>
  (p.name    || "").toLowerCase().includes(q) ||
  (p.address || "").toLowerCase().includes(q) ||
  (p.comment || "").toLowerCase().includes(q)
  // 在这里添加新字段的搜索
);
```

---

### 修改加载超时时间

`js/api.js` 第 52 行：

```js
window._sheetTimer = setTimeout(
  () => showError("请求超时，请检查网络或表格是否公开"),
  5000  // 改为你需要的毫秒数
);
```

---

### 调整卡片动画

`js/render.js` 中的卡片延迟：
```js
card.style.animationDelay = `${Math.min(i * 0.05, 0.4)}s`;
//                                        ↑ 每张卡片间隔  ↑ 最大延迟上限
```

动画本身定义在 `css/states.css` 的 `@keyframes fadeInUp`。

---

## 已知限制与注意事项

| 限制 | 说明 |
|------|------|
| **JSONP 安全性** | JSONP 会执行远端返回的 JS，理论上若 Google 被攻击则有风险。实际上 Google 服务足够可信，且只读取公开数据，风险极低。 |
| **表格必须公开** | Google Sheets 必须设为「知道链接的人均可查看」，否则 JSONP 请求返回 401 |
| **无分页** | 所有数据一次性加载，数据量极大时（>1000 行）可能影响渲染性能 |
| **无状态管理库** | 项目故意保持零依赖，如需复杂交互建议引入 Vue/React |
| **本地无法直接双击打开** | 必须通过 HTTP Server 运行（ES Module 限制） |
| **列名大小写** | Google Sheets 列名会被转为小写，代码中使用 `p.name`、`p.address` 等访问 |

---

## 部署 Checklist

- [ ] Google Sheets 已设为「知道链接的人均可查看」
- [ ] `js/api.js` 中的 `SHEET_ID` 已更新
- [ ] 本地通过 HTTP Server 验证数据正常加载
- [ ] 搜索功能正常
- [ ] 深色模式正常切换且刷新后保持
- [ ] 移动端布局正常（≤600px 宽）
- [ ] 推送到 `main` 分支，GitHub Pages 自动部署
- [ ] 访问 `https://<用户名>.github.io/<仓库名>/` 验证线上版本
