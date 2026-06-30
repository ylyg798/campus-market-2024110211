# Day3 Evidence - Mock 数据建模与列表渲染
## 1. 今日完成内容
Day3 主要完成了 Mock 数据建模、接口封装和列表渲染三大任务：
**Mock 数据建模：**
- 在 `mock/db.json` 中创建了四个核心业务数据集合：trades（二手交易）、lostFounds（失物招领）、groupBuys（拼单搭子）、errands（跑腿委托）
- 每类数据包含 5-10 条真实校园场景的模拟数据
**接口封装：**
- 在 `src/api/` 目录下创建了 http.ts（Axios 实例封装）
- 分别创建了 trade.ts、lostFound.ts、groupBuy.ts、errand.ts 四个业务 API 模块
- 定义了对应的 TypeScript 类型接口
**列表渲染：**
- 创建了 `src/components/EmptyState.vue` 空状态组件
- 更新了 TradeView.vue、LostFoundView.vue、GroupBuyView.vue、ErrandView.vue 四个核心页面
- 添加了 loading 状态管理，使用 try/finally 模式确保状态正确
- 使用 ItemCard 通用组件渲染列表数据
## 2. Mock 数据结构说明
| 数据集合 | 对应业务 | 主要字段 | 页面用途 |
|---|---|---|---|
| trades | 二手交易 | title、price、category、condition、location、publishTime、status | 展示二手商品列表 |
| lostFounds | 失物招领 | title、type、itemName、location、eventTime、status | 展示失物和招领信息 |
| groupBuys | 拼单搭子 | title、type、targetCount、currentCount、deadline、location | 展示拼单和搭子信息 |
| errands | 跑腿委托 | title、taskType、reward、from、to、deadline、status | 展示跑腿任务列表 |
## 3. 我的设计
在设计 Mock 数据字段时，我基于业务场景进行了以下思考：
**二手交易（trades）：**
- `price` 和 `condition`：这两个字段是二手交易的核心属性，买家需要了解价格和物品新旧程度
- `category`：用于分类筛选，如"数码设备""教材资料""生活用品"等
- `location`：方便买家确认交易地点
**失物招领（lostFounds）：**
- `type`：区分"丢失"和"拾获"两种类型，这是失物招领业务的核心区分
- `itemName`：明确物品名称，便于快速识别
- `eventTime`：丢失或拾获的时间，对失主和捡到者都很重要
**拼单搭子（groupBuys）：**
- `targetCount` 和 `currentCount`：显示拼单进度，帮助用户判断是否还有空位
- `deadline`：拼单有时效性，需要明确的截止时间
**跑腿委托（errands）：**
- `from` 和 `to`：明确起点和终点，这是跑腿任务的核心信息
- `reward`：酬劳是吸引接单者的关键因素
## 4. AI 设计
在本次 Day3 任务中，AI 工具主要帮助生成了以下内容：
**AI 生成的内容：**
- db.json 的基础数据结构，包括各数据集合的字段定义和部分示例数据
- API 模块的基础代码框架，包括接口函数和类型定义
- ItemCard.vue 和 EmptyState.vue 组件的基础模板
- 四个业务页面的列表渲染代码模板
**AI 生成内容中的不合理之处：**
- db.json 中的部分图片链接使用了 AI 生成图片的 API，这些链接在实际使用时会被浏览器阻止
- 部分示例数据不够贴近真实的校园场景，如价格设置不合理
- API 模块的返回类型定义与实际 db.json 字段不完全匹配
## 5. 最终调整
在 AI 生成的基础上，我进行了以下人工修改：
**数据调整：**
- 将所有 AI 生成的图片链接替换为真实的 Unsplash 图片 URL
- 修改了部分价格数据，使其更符合校园消费水平（如教材 15-25 元，快递代取 2-5 元）
- 补充了更多真实的校园场景描述
**类型修复：**
- 在 market.ts 中添加了 Favorite 类型定义
- 在 user.ts 中添加了 bio 属性
- 在 messageStore.ts 中添加了 MessageType 类型
- 为多个文件添加了可选链操作符和类型保护
**页面优化：**
- 添加了 loading 状态，防止页面加载闪烁
- 使用 try/finally 模式确保 loading 状态正确更新
- 在 ChatDetailView.vue 中移除了不必要的头像图片显示（使用图标代替）
## 6. 遇到的问题与解决方法
**问题 1：JSON Server 无法启动**
- 现象：执行 `npm run mock` 时提示 'json-server' 不是内部或外部命令
- 原因：json-server 版本为 beta 版本，不稳定
- 解决：卸载 beta 版本，安装稳定版 `npm install json-server@0.17.4 -D`
**问题 2：图片链接被浏览器阻止**
- 现象：页面加载时出现 `net::ERR_BLOCKED_BY_ORB` 错误
- 原因：使用了 AI 生成图片的 API 链接
- 解决：替换为真实的 Unsplash 图片链接
**问题 3：TypeScript 类型错误**
- 现象：多个页面存在类型不匹配的错误
- 原因：AI 生成的类型定义与实际数据字段不一致
- 解决：手动修复类型定义，添加可选链操作符，补充缺失的类型
**问题 4：空状态闪烁**
- 现象：页面加载初期短暂显示空状态
- 原因：没有 loading 状态管理，数据未返回时就显示了空状态
- 解决：添加 loading ref，初始值为 true，数据返回后设置为 false
## 7. 今日反思
通过今天的 Mock 数据建模、JSON Server 配置和列表渲染实践，我深刻认识到 Mock 数据在整个前端开发流程中的重要性。使用 JSON Server 可以快速搭建临时的后端 API，让前端开发不再依赖后端进度，实现了前后端并行开发。列表渲染不仅仅是简单的数据展示，还需要考虑加载状态、空状态、错误状态等多种情况，这些细节直接影响用户体验。在实际项目中，Mock 数据的设计需要与业务场景紧密结合，字段的选择要服务于核心功能，不能盲目追求大而全。通过 AI 辅助开发可以提高效率，但需要注意验证 AI 生成内容的准确性，特别是类型定义和图片链接这类容易出错的地方。Day3 的工作为后续的详情页开发、用户交互和状态管理奠定了坚实的基础。

证据卡完成时间： 2026-06-29  
包含文件：
- mock/db.json
- src/api/http.ts
- src/api/trade.ts、lostFound.ts、groupBuy.ts、errand.ts
- src/components/ItemCard.vue
- src/components/EmptyState.vue
- src/views/TradeView.vue、LostFoundView.vue、GroupBuyView.vue、ErrandView.vue
