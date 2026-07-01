# Day5 Evidence - 状态管理与用户中心

## 1. 今日完成内容

今天完成了基于 Pinia 的全局状态管理体系搭建，创建了用户状态 Store 和收藏状态 Store，并将其集成到项目的多个页面和组件中。具体完成内容包括：创建 `src/stores/user.ts` 管理当前用户信息，创建 `src/stores/favorite.ts` 管理收藏状态，修改 `AppHeader.vue` 显示当前用户信息，修改 `PublishView.vue` 使用当前用户作为发布人，在 TradeView、LostFoundView、GroupBuyView、ErrandView 四个列表页面添加收藏功能，完善 `UserCenterView.vue` 展示用户资料、我的收藏和我的发布列表。

## 2. Store 设计说明

| Store 文件 | 管理内容 | 主要状态 | 主要方法 |
|---|---|---|---|
| src/stores/user.ts | 当前用户信息 | isLoggedIn、currentUser（包含 id、name、college、grade、avatar、bio） | updateProfile、login、logout |
| src/stores/favorite.ts | 收藏状态 | favorites（包含 id、type、title、description、location） | addFavorite、removeFavorite、toggleFavorite、isFavorite |

**userStore 设计说明**：采用简洁的用户信息结构，包含基本的用户身份标识和个人资料字段。isLoggedIn 用于判断用户登录状态，currentUser 对象存储完整的用户信息。通过 displayName 和 userDescription 两个 getter 提供常用的显示格式，updateProfile 支持部分字段更新，login 和 logout 用于切换登录状态。

**favoriteStore 设计说明**：收藏列表使用数组存储，每条记录包含 id、type、title、description、location 字段。type 字段限定为 'trade' | 'lostFound' | 'groupBuy' | 'errand' 四种业务类型，确保收藏可以跨业务类型管理。isFavorite 方法用于判断指定类型和 ID 的项目是否已收藏，toggleFavorite 方法实现收藏和取消收藏的切换操作。

## 3. 状态边界说明

**放入 Store 的数据**：

- 当前用户信息放入 Store，因为导航栏需要显示用户名和头像，发布页面需要获取当前用户作为发布人，个人中心需要展示用户资料，多处需要共享用户状态。
- 收藏列表放入 Store，因为列表页面需要显示收藏状态和执行收藏操作，个人中心需要展示收藏列表和执行取消收藏操作，跨页面共享收藏数据。

**没有放入 Store 的数据**：

- 表单校验错误没有放入 Store，因为它只属于发布页面的临时状态，不需要跨页面共享，使用组件内部的 reactive 即可满足需求。
- 页面加载状态（loading）没有放入 Store，因为每个页面的加载状态是独立的，不需要全局共享。
- 发布页面的表单输入内容没有放入 Store，因为它是页面级别的临时数据，提交后即完成使命，没有跨页面共享的必要性。
- 业务列表数据（如 trades、lostFounds 等）没有放入 Store，因为这些数据通过 API 获取后直接在各页面使用，虽然可以考虑缓存到 Store，但当前项目规模较小，直接在页面中管理更为简单。

## 4. 页面使用记录

- `AppHeader.vue`：导入 `useUserStore`，显示当前用户名称 `userStore.displayName` 和头像（或首字母占位符），实现了导航栏的用户信息展示。
- `PublishView.vue`：导入 `useUserStore`，发布时 `publisher` 字段自动读取 `userStore.displayName`，确保发布内容关联到当前用户。
- `TradeView.vue`：导入 `useFavoriteStore`，在列表项中添加收藏按钮，调用 `favoriteStore.toggleFavorite()` 实现收藏切换。
- `LostFoundView.vue`：导入 `useFavoriteStore`，在列表项中添加收藏按钮，支持失物招领信息的收藏功能。
- `GroupBuyView.vue`：导入 `useFavoriteStore`，在列表项中添加收藏按钮，支持拼单搭子信息的收藏功能。
- `ErrandView.vue`：导入 `useFavoriteStore`，在列表项中添加收藏按钮，支持跑腿委托信息的收藏功能。
- `UserCenterView.vue`：同时导入 `useUserStore` 和 `useFavoriteStore`，展示用户资料（头像、名称、学院年级、简介）、我的收藏列表（支持取消收藏）和我的发布列表。

## 5. AI 协作记录

**使用的 AI 工具**：Trae IDE 内置的 AI 代码助手。

**核心提示词**：

- "创建用户状态 Store，包含 isLoggedIn 和 currentUser，支持 updateProfile、login、logout 方法"
- "创建收藏状态 Store，支持添加收藏、取消收藏、切换收藏、判断是否收藏"
- "在导航组件中显示当前用户信息"
- "在发布页面中使用当前用户作为发布人"
- "在列表页面中添加收藏功能"
- "完善用户中心页面，展示用户资料和我的收藏"

**AI 生成的内容**：

- 生成了 `src/stores/user.ts` 的完整代码，包括 CurrentUser 接口定义、state、getters 和 actions。
- 生成了 `src/stores/favorite.ts` 的完整代码，包括 FavoriteItem 接口定义、state、getters 和 actions。
- 修改了 `AppHeader.vue`，添加了用户信息展示区域。
- 修改了 `PublishView.vue`，集成了 userStore 获取发布人信息。
- 修改了四个列表页面，添加了收藏按钮和相关逻辑。
- 修改了 `UserCenterView.vue`，实现了用户资料展示和收藏列表功能。

**AI 生成内容中的不合理之处**：

- AI 最初生成的用户 Store 包含了过多的字段和复杂的登录逻辑，不符合项目的简化需求，需要精简。
- AI 在收藏 Store 中最初设计了过多的 getters，部分没有实际用途，需要删除。
- AI 生成的用户头像展示方式不够美观，需要调整为渐变背景的首字母占位符。
- AI 在用户中心页面中最初没有考虑"我的发布"功能，需要补充实现。

## 6. 人工调整内容

- 删除了 AI 生成的复杂登录系统，保留简单的 login 和 logout 方法，使用 mock 数据模拟已登录状态。
- 删除了 JWT 权限逻辑，因为当前项目是演示性质，不需要真实的认证系统。
- 拆分了 userStore 和 favoriteStore，确保每个 Store 职责单一，便于维护和测试。
- 修改了 Store 中部分字段命名，使其更加语义化。
- 调整了收藏数据结构，增加了 type 字段以区分不同业务类型的收藏。
- 修正了页面读取 Store 的方式，确保正确导入和使用 Pinia Store。
- 添加了用户头像的渐变背景首字母占位符，提升视觉效果。
- 补充了"我的发布"功能，在用户中心页面展示用户发布的所有内容。

## 7. 测试记录

**测试场景**：收藏功能端到端测试

1. 启动 Mock 服务（npm run mock）和前端服务（npm run dev）。
2. 进入二手交易页面（/trade），选择一条商品信息，点击"收藏"按钮。
3. 观察按钮文字从"收藏"变为"已收藏"，确认收藏状态切换成功。
4. 点击导航栏中的用户按钮，进入个人中心页面（/user-center）。
5. 在"我的收藏"区域可以看到刚才收藏的二手交易商品。
6. 点击该收藏项的"取消收藏"按钮，按钮执行操作后，该内容从个人中心的收藏列表中消失。
7. 返回二手交易页面，观察该商品的收藏按钮文字恢复为"收藏"。
8. 进入发布页面（/publish），选择发布类型为"二手交易"，填写必要信息后点击发布。
9. 发布成功后，进入二手交易列表页面，可以看到新发布的商品信息，发布人显示为"校园用户"（来自当前用户状态）。

**测试结果**：所有步骤均按预期执行，收藏功能和发布功能正常工作。

## 8. 遇到的问题与解决方法

**问题**：收藏按钮点击后无反应

**现象**：在 TradeView.vue 中点击收藏按钮，页面没有任何变化，按钮文字也没有切换。

**原因**：检查发现是因为没有正确导入 useFavoriteStore，导致 favoriteStore 未定义。

**解决方法**：在 TradeView.vue 的 script 部分添加 `import { useFavoriteStore } from '../stores/favorite'`，并初始化 `const favoriteStore = useFavoriteStore()`，问题解决。

**问题**：刷新页面后收藏数据丢失

**现象**：在列表页面收藏了商品，刷新页面后收藏状态恢复为未收藏。

**原因**：当前收藏状态存储在内存中，页面刷新后 Vue 应用重新初始化，Store 状态重置为初始值。

**解决方法**：当前项目作为演示项目，内存存储已满足需求。如果需要持久化，可以在后续版本中添加 localStorage 或 sessionStorage 的支持，在 Store 初始化时读取存储的数据，在状态变化时保存数据。

## 9. 今日反思

Pinia 状态管理对多页面前端应用具有至关重要的作用。在校园轻集市项目中，通过 Pinia 我们实现了用户状态和收藏状态的全局共享，使得导航栏、发布页面和用户中心能够高效地获取和更新相同的数据。状态管理解决了传统组件通信方式的局限性，避免了通过 props 层层传递数据的繁琐和通过事件总线通信的混乱。

在 Store 设计方面，我们遵循了单一职责原则，将用户信息和收藏状态分别放在不同的 Store 中，使得代码结构清晰、易于维护。通过明确的状态边界，我们区分了需要全局共享的数据和页面局部数据，避免了 Store 的过度膨胀。

用户中心作为项目的核心页面之一，集成了多个 Store 的数据，展示了状态管理在实际场景中的应用价值。通过 Pinia，用户中心可以轻松获取当前用户的个人资料、收藏列表和发布记录，实现了数据的集中管理和高效利用。

在实际开发过程中，我们也意识到状态持久化的重要性。当前的内存存储虽然简单高效，但无法在页面刷新后保留数据。未来可以考虑引入 localStorage 等持久化方案，进一步提升用户体验。此外，随着项目规模的扩大，可以考虑将业务列表数据也纳入状态管理，实现数据的缓存和共享，减少重复的 API 请求。
