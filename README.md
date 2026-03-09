# 旅行地点看板 · Travel Destination Board

一个基于 Google Sheets 的旅行地点展示应用，支持实时搜索和深色模式。

> A lightweight travel destination board powered by Google Sheets, with real-time search and dark mode support.

---

## 在线访问

**[https://dannyzhd.github.io/Travel_website/](https://dannyzhd.github.io/Travel_website/)**

---

## 功能特性

- **实时搜索** — 按地点名称、地址或备注即时过滤
- **深色模式** — 可切换浅色/深色主题，偏好自动记忆（支持系统主题检测）
- **响应式布局** — 自适应桌面和移动端，卡片式网格展示
- **动态数据** — 直接读取 Google Sheets，无需后端，修改表格即刻生效
- **加载状态** — 带动画的加载提示和友好的错误信息

---

## 数据配置

数据来源于 Google Sheets 表格，格式如下：

| name（必填）| address（可选）| comment（可选）|
|------------|--------------|----------------|
| 天空之城    | 日本岐阜县    | 云雾缭绕，适合秋季 |
| 马丘比丘   | 秘鲁库斯科    | 印加帝国遗址    |

**配置步骤：**

1. 创建一个 Google Sheets 表格，第一行填写列名（`name`、`address`、`comment`）
2. 点击右上角「分享」→「知道链接的人」→「查看者」，获取公开链接
3. 复制表格 URL 中的 Sheet ID（`/spreadsheets/d/` 和 `/edit` 之间的字符串）
4. 打开 `js/api.js`，将第 4 行的 `SHEET_ID` 替换为你自己的 ID：

```js
export const SHEET_ID = "你的_Google_Sheet_ID";
```

---

## 本地运行

本项目无需构建工具，但浏览器限制 `file://` 协议下的 ES Module 加载，需通过本地 HTTP Server 运行。

**方式一：Python**
```bash
python3 -m http.server 8080
# 访问 http://localhost:8080
```

**方式二：Node.js**
```bash
npx serve .
# 访问终端提示的地址
```

**方式三：VS Code**
安装 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 插件，右键 `index.html` → Open with Live Server。

---

## 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 进入仓库 **Settings → Pages**
3. Source 选择 `Deploy from a branch`，Branch 选择 `main`，目录选 `/ (root)`
4. 保存后等待 1-2 分钟，访问 `https://<用户名>.github.io/<仓库名>/`

> 根目录的 `.nojekyll` 文件已确保 GitHub Pages 不会忽略 `_` 开头的文件。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端 | 原生 HTML5 / CSS3 / JavaScript (ES6 Modules) |
| 数据 | Google Sheets + Google Visualization Query API (JSONP) |
| 样式 | CSS 自定义属性（变量）实现主题系统 |
| 托管 | GitHub Pages |
| 构建工具 | 无（零依赖） |

---

## 项目结构

```
├── index.html          # 应用入口
├── css/
│   ├── variables.css   # 主题变量（颜色、间距）
│   ├── layout.css      # 页面布局和响应式
│   ├── components.css  # 卡片、按钮等组件样式
│   └── states.css      # 加载动画和错误状态
└── js/
    ├── main.js         # 入口：事件绑定、启动应用
    ├── api.js          # 数据层：Google Sheets JSONP 请求
    ├── render.js       # 视图层：DOM 渲染
    └── theme.js        # 主题层：深色模式切换和持久化
```
