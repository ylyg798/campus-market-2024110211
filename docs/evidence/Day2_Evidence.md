# Day2 Evidence - 页面骨架与路由导航

## 1. 今日完成内容

Day2 主要完成了页面骨架扩展、路由导航系统搭建和公共布局组件设计三大任务：

**页面骨架扩展：**
- 在 src/views/ 目录下创建了 8 个业务页面：HomeView.vue、TradeView.vue、LostFoundView.vue、GroupBuyView.vue、ErrandView.vue、PublishView.vue、MessageView.vue、UserCenterView.vue
- 每个页面包含基本的 `<template>`、`<script setup>` 和 `<style scoped>` 结构
- 页面内容符合各自业务场景（二手交易、失物招领、拼单搭子、跑腿委托等）

**路由导航系统：**
- 在 src/router/index.ts 中配置了完整的路由表
- 路由路径使用语义化命名（kebab-case）：/trade、/lost-found、/group-buy、/errand、/publish、/message、/user
- 每个路由包含 name 和 title meta 信息，便于后续导航高亮和页面标题管理

**公共布局组件：**
- 创建了 AppLayout.vue：整体页面布局容器，包含 Header 和 RouterView
- 创建了 AppHeader.vue：顶部导航区域，包含品牌信息和导航组件
- 创建了 AppNav.vue：导航菜单组件，使用 router-link 实现页面跳转
- 修改了 App.vue：使用 `<AppLayout />` 统一布局，替代原有的直接内容渲染

**UI 优化：**
- 将所有 emoji 图标替换为 @lucide/vue 提供的简约向量图标
- 定义了 design-system.css 全局样式文件，包含颜色系统、字体规范、组件风格等 UI 设计规范

## 2. 页面与路由清单

| 页面名称 | 路由路径 | 文件位置 |
|---|---|---|
| 首页 | / | src/views/HomeView.vue |
| 二手交易 | /trade | src/views/TradeView.vue |
| 失物招领 | /lost-found | src/views/LostFoundView.vue |
| 拼单搭子 | /group-buy | src/views/GroupBuyView.vue |
| 跑腿委托 | /errand | src/views/ErrandView.vue |
| 发布信息 | /publish | src/views/PublishView.vue |
| 消息中心 | /message | src/views/MessageView.vue |
| 个人中心 | /user | src/views/UserCenterView.vue |

## 3. AI 协作记录

**使用的 AI 工具：**
- Trae AI（内置 AI Coding 助手）

**核心提示词示例：**
- "创建页面文件：在 src/views 目录下创建 HomeView.vue、TradeView.vue、LostFoundView.vue..."
- "配置路由文件：检查项目中是否存在 src/router/index.ts..."
- "设计公共布局组件：在 src/components 目录下创建 AppLayout.vue、AppHeader.vue、AppNav.vue"
- "所有的图标都使用简约的向量图标"
- "将所有 emoji 图标替换为 @lucide/vue 提供的 Lucide Icons"

**AI 生成的内容：**
- 8 个页面骨架的初始代码结构
- 路由配置文件 src/router/index.ts 的完整路由表
- 公共布局组件 AppLayout.vue、AppHeader.vue、AppNav.vue 的组件代码
- Lucide 图标的导入和替换方案

**人工修改或确认的内容：**
- 检查页面名称是否与文件名对应，确保路由路径与页面一一对应
- 修正了 MessageView.vue 文件名问题（原名为 MessagesView.vue，不符合统一命名规范）
- 修正了路由配置中的组件引用路径错误
- 修正了 TypeScript 类型错误，包括 User 类型定义、API 响应处理等
- 修正了 App.vue 中的顶部导航 logo 图标删除需求
- 检查并修复了页面启动错误（如 marketStore.marketList 空值判断问题）

## 4. 遇到的问题与解决方法

**问题 1：路由路径与 Day2 要求不符**
- 问题描述：原路由使用 /messages 作为消息中心路径，而 Day2 要求使用 /message
- 解决方法：修改路由配置，将路径从 /messages 改为 /message，并确保组件引用正确

**问题 2：缺少 Day2 要求的页面**
- 问题描述：原项目缺少 ListView.vue 和 BoardView.vue，而用户要求 7 大页面骨架
- 解决方法：创建了缺失的页面文件，并在路由中正确配置

**问题 3：页面启动错误**
- 问题描述：HomeView.vue 中 stats 计算属性访问 marketStore.marketList.length 时报错 "Cannot read properties of undefined (reading 'length')"
- 解决方法：在计算属性中添加空值判断 `const list = marketStore.marketList || []`，确保在数据未加载时不会报错

**问题 4：emoji 图标影响视觉效果**
- 问题描述：页面中存在 emoji 图标，不符合"简约向量图标"的设计要求
- 解决方法：安装 @lucide/vue 图标库，将所有 emoji 替换为 Lucide 向量图标（如将 "👁️" 替换为 `<Eye :size="14" />`）

**问题 5：Lucide 图标库安装错误**
- 问题描述：安装 lucide-vue-next 时收到 deprecated 警告
- 解决方法：卸载 lucide-vue-next，安装官方推荐的 @lucide/vue

## 5. 今日反思

通过 Day2 的学习与实践，我深刻理解了**页面骨架**、**路由导航**和**公共布局**对后续开发的重要作用。页面骨架提供了一致的结构规范，让不同业务页面具有统一的代码组织形式；路由导航建立了页面之间的跳转通道，使得用户能够在不同功能模块间流畅切换，同时为后续权限控制、导航高亮、页面标题管理等扩展功能奠定了基础；公共布局组件则避免了代码重复，确保了整个应用视觉风格的一致性。

在 AI 协作方面，AI 能够快速生成符合规范的初始代码，大幅提升了开发效率。但我也意识到不能完全依赖 AI，需要人工检查页面命名、路由配置、类型定义等细节，确保代码质量。特别是在路由路径、组件引用等关键环节，AI 生成的代码可能存在不一致或错误，需要开发者仔细核对并修正。此外，AI 生成的代码有时过于复杂或不符合项目规范（如过度使用 emoji），需要根据实际需求进行简化或替换。

---

*记录时间：2026-06-28*
