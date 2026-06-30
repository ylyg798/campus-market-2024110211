# Day4 Evidence - 发布功能开发
## 1. 今日完成内容
Day4 主要完成了发布页面的开发，包括表单设计、校验逻辑和数据提交：
**新增 API 方法：**
- 为 trade.ts、lostFound.ts、groupBuy.ts、errand.ts 四个业务 API 模块补充了 POST 方法（createTrade、createLostFound、createGroupBuy、createErrand）
- 将所有接口的 id 字段改为可选（id?: number），由 JSON Server 自动生成
**表单项组件：**
- 创建了 `src/components/FormField.vue` 通用表单项组件，统一处理标签、必填标识和错误提示
**发布页面：**
- 设计了 `src/views/PublishView.vue` 发布页面，支持四种发布类型动态切换
- 实现了基础表单校验逻辑，包括必填校验和数值范围校验
- 实现了数据提交逻辑，成功后跳转到对应列表页
- 实现了表单重置功能
- 添加了基础样式，保持页面清晰简洁

## 2. 表单设计说明
### 通用字段
| 字段 | 类型 | 校验规则 |
|---|---|---|
| title | text | 必填 |
| location | text | 必填 |
| description | textarea | 必填 |

### 二手交易专属字段
| 字段 | 类型 | 校验规则 |
|---|---|---|
| category | text | 必填 |
| price | number | 必填，> 0 |
| condition | select | 必填 |

### 失物招领专属字段
| 字段 | 类型 | 校验规则 |
|---|---|---|
| lostFoundType | select | 默认 'lost' |
| itemName | text | 必填 |
| eventTime | datetime-local | 必填 |

### 拼单搭子专属字段
| 字段 | 类型 | 校验规则 |
|---|---|---|
| groupType | text | 必填 |
| targetCount | number | 必填，>= 2 |
| deadline | datetime-local | 必填 |

### 跑腿委托专属字段
| 字段 | 类型 | 校验规则 |
|---|---|---|
| taskType | text | 必填 |
| reward | number | 必填，>= 0 |
| from | text | 必填 |
| to | text | 必填 |
| deadline | datetime-local | 必填 |

## 3. 我的设计
在设计发布页面时，我基于以下考虑：
**统一表单对象：**
- 使用一个统一的 reactive 对象存储所有字段，便于教学理解
- 不同类型的字段共存于同一对象中，通过条件渲染控制显示

**条件渲染：**
- 使用 `<template v-if="publishType === 'xxx'">` 根据发布类型显示不同字段
- 这样可以保持模板结构清晰，便于维护

**校验逻辑：**
- 通用字段在所有类型下都需要校验
- 专属字段只在对应类型下进行校验
- 使用 errors 对象存储错误信息，与 FormField 组件配合显示

**提交跳转：**
- 发布成功后跳转到对应业务列表页，方便用户查看发布结果
- 使用 window.alert 提供即时反馈

## 4. AI 设计
在本次 Day4 任务中，AI 工具主要帮助生成了以下内容：
**AI 生成的内容：**
- FormField.vue 组件的基础模板和样式
- PublishView.vue 的基础页面结构和模板
- 表单响应式数据的定义
- 表单校验函数的基础逻辑
- 数据提交函数的基础框架

**AI 生成内容中的不合理之处：**
- 初始生成的表单字段名称与 API 接口字段不完全匹配（如使用 type 而非 lostFoundType）
- 部分字段类型设置不合理（如 price 使用 string 而非 number）
- 校验规则不够完善（如 targetCount 的最小值校验）
- 提交后统一跳转到首页而非对应列表页

## 5. 最终调整
在 AI 生成的基础上，我进行了以下人工修改：
**字段名称修正：**
- 将 type 字段拆分为 lostFoundType 和 groupType，与 API 接口字段保持一致
- 确保所有字段名称与 db.json 中的数据结构匹配

**类型优化：**
- 将 price、reward、targetCount 改为 number 类型
- 设置合理的默认值（price=0, reward=0, targetCount=2, lostFoundType='lost'）

**校验完善：**
- 更新校验逻辑以正确处理数字类型字段
- 添加 targetCount >= 2 的校验规则
- 添加 reward >= 0 的校验规则
- 添加 price > 0 的校验规则

**提交优化：**
- 修改提交后跳转逻辑，根据发布类型跳转到对应列表页
- 更新 alert 提示信息，使其更加具体
- 添加 console.error 记录错误信息

**样式调整：**
- 将表单布局改为 grid 布局
- 添加白色背景和圆角，提升视觉效果
- 优化按钮样式和交互效果

## 6. 遇到的问题与解决方法
**问题 1：字段名称不匹配**
- 现象：提交数据后字段名称与 db.json 不一致
- 原因：AI 生成的字段名称与 API 接口定义不匹配
- 解决：对照 API 接口定义，修正字段名称

**问题 2：数字类型校验错误**
- 现象：价格为 0 时校验通过，但应该提示错误
- 原因：使用 `!form.price` 判断，0 会被视为 falsy
- 解决：改为 `form.price <= 0` 进行判断

**问题 3：提交后跳转不正确**
- 现象：所有类型提交后都跳转到首页
- 原因：没有根据发布类型进行条件跳转
- 解决：在提交逻辑中添加条件判断，跳转到对应列表页

**问题 4：重置函数没有正确处理数字类型**
- 现象：重置后数字字段变为空字符串
- 原因：使用 `(form as Record<string, unknown>)[key] = ''` 统一重置
- 解决：改为逐个字段手动重置，确保数字类型字段设置为正确的默认值

## 7. 今日反思
通过今天的发布功能开发实践，我深刻认识到表单开发的复杂性。一个完整的表单不仅需要美观的界面，还需要完善的校验逻辑和错误处理机制。在设计表单时，字段名称和类型的选择要与后端接口保持一致，否则会导致数据提交失败。条件渲染是实现动态表单的常用方式，但需要注意字段之间的相互影响，避免不同类型之间残留无关数据。表单校验不仅要检查必填字段，还要根据业务规则进行数值范围和格式校验，这些校验规则直接关系到数据的有效性和完整性。AI 辅助开发可以快速生成代码框架，但需要仔细验证生成内容的准确性，特别是字段名称、类型定义和业务逻辑这类容易出错的地方。Day4 的工作为后续的详情页开发、用户交互和状态管理奠定了坚实的基础。

证据卡完成时间： 2026-06-30  
包含文件：
- src/components/FormField.vue
- src/views/PublishView.vue
- src/api/trade.ts、lostFound.ts、groupBuy.ts、errand.ts
- mock/db.json
