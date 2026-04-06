# Obsidian Kindle Plugin — 开发变更文档

> 分支：`Chinese`（基于 `master`）
> 作者：ProudBenzene
> 最后更新：2026-02-19

---

## 变更概览

本分支在原插件基础上新增了两项功能，并修复了一项 Bug，共包含 **3 次提交**：

| 提交      | 类型 | 说明                                                            |
| --------- | ---- | --------------------------------------------------------------- |
| `bb34903` | fix  | 修复中文 Kindle 摘录的日期时间解析问题（Issue #311）            |
| `017a998` | feat | 新增自动去除书名/作者括号内容功能 + 白名单机制                  |
| `6c5ed4e` | feat | 增强括号移除功能，支持书名/作者分别控制、括号类型选择及空格处理 |

---

## 一、修复：中文日期时间解析（Issue #311）

### 问题背景

Kindle 中文设备在 `My Clippings.txt` 中写入的时间戳为中文格式，例如：

```
2022年12月17日星期六 下午5:11:41
```

原插件未对该格式做预处理，直接交给第三方库 `@hadynz/kindle-clippings` 解析，导致「下午」时间段解析失败，返回错误日期（如 `2017/01/17 00:00:00`）。

### 修复方案

在 `parseBooks.ts` 中，于调用第三方解析库**之前**引入预处理步骤，将所有中文日期时间字符串统一转换为第三方库能够正确识别的完整英文格式。

#### 核心逻辑（`src/sync/syncClippings/parseBooks.ts`）

新增函数 `convertChineseDateToEnglish`，通过正则匹配 + 映射表完成转换：

```
2022年12月17日星期六 下午5:11:41
  → Saturday, December 17, 2022 5:11:41 PM   ✅

2021年8月28日 上午1:47:38
  → August 28, 2021 1:47:38 AM               ✅

2024年12月31日 星期二
  → Tuesday, December 31, 2024               ✅

2024年1月1日
  → January 1, 2024                          ✅
```

**关键设计决策**：输出格式选择完整英文日期（`Weekday, Month Day, Year H:MM:SS AM/PM`）而非 ISO 8601，原因是 `@hadynz/kindle-clippings` 对 ISO 8601 的解析存在已知 Bug。

#### 支持的输入格式

- `YYYY年MM月DD日星期X 上午/下午H:mm:ss`（完整格式）
- `YYYY年MM月DD日 上午/下午H:mm:ss`（无星期）
- `YYYY年MM月DD日 星期X`（无时间）
- `YYYY年MM月DD日`（仅日期）
- 支持「星期 X」和「周 X」两种星期表达

#### 调用位置

```typescript
// src/sync/syncClippings/parseBooks.ts
export const parseBooks = (file: string): BookHighlight[] => {
  let clippingsFileContent = fs.readFileSync(file, 'utf8');
  clippingsFileContent = convertChineseDateToEnglish(clippingsFileContent); // 预处理
  const parsedRows = readMyClippingsFile(clippingsFileContent);
  // ...
};
```

### 其他关联改动

| 文件                                                  | 改动说明                             |
| ----------------------------------------------------- | ------------------------------------ |
| `src/amazonRegion.ts`                                 | 新增中国区 Amazon（`amazon.cn`）支持 |
| `src/models.ts`                                       | 新增中国区相关类型定义               |
| `src/scraper/scrapeBooks.ts`                          | 适配中国区抓取逻辑                   |
| `src/sync/syncClippings/parseBooks.spec.ts`           | 新增/更新单元测试                    |
| `src/sync/syncClippings/parseBooks.issue311.spec.ts`  | Issue #311 专项测试                  |
| `src/sync/syncClippings/parseBooks.userIssue.spec.ts` | 用户反馈的真实案例测试               |
| `src/sync/syncClippings/moment.test.spec.ts`          | 时间解析边界用例测试                 |

---

## 二、功能：括号移除（基础版）

### 需求背景

中文 Kindle 书库中大量书名包含括号注释，例如：

```
飘（上下）(外国文学名著名译丛书)
深度学习（第二版）
```

这类括号内容会被原样写入 Obsidian 笔记文件名，导致文件名过长或包含无意义注释。本功能允许用户在生成文件名时自动去除括号及其内容。

### 实现方案

在文件名渲染阶段（`FileNameRenderer`）对书名/作者字段进行后处理。

#### 新增设置项（`src/store/settingsStore.ts`）

```typescript
removeParens: boolean; // 主开关（默认 false）
removeParensWhitelist: string; // 白名单关键词，每行一个（默认空）
```

#### 括号移除逻辑（`src/rendering/renderer/fileNameRenderer.ts`）

- 同时处理中文全角括号 `（）` 和英文半角括号 `()`
- 支持嵌套括号递归处理
- 支持多个括号连续出现
- 若书名包含白名单中的任意关键词，则跳过处理

**白名单示例**：  
白名单填写 `魔法禁书目录`，则 `魔法禁书目录（第一卷）` 不会被处理。

#### 设置界面（`src/settings/index.ts`）

- 新增「移除书籍信息中的括号内容」开关
- 主开关关闭时，白名单设置项自动隐藏

---

## 三、功能：括号移除（增强版）

### 需求背景

基础版只能处理书名，且无法区分括号类型。用户反映作者名也存在同样问题，例如：

```
싱숑 (sing N song)   ← 作者字段，英文括号内为音译
```

同时，部分用户只希望移除中文括号（保留英文括号中的作者信息），或对空格处理有不同偏好。

### 增强方案

#### 新增设置项（`src/store/settingsStore.ts`）

```typescript
removeParensType: 'all' | 'chinese' | 'english'; // 括号类型（默认 'all'）
removeParensSpaces: boolean; // 移除英文括号前后空格（默认 true）
removeParensFromTitle: boolean; // 处理书名（默认 true）
removeParensFromAuthor: boolean; // 处理作者（默认 false）
```

对应新增 Store Action：`setRemoveParensType`、`setRemoveParensSpaces`、`setRemoveParensFromTitle`、`setRemoveParensFromAuthor`

#### 核心工具函数（`src/rendering/renderer/fileNameRenderer.ts`）

将括号处理逻辑抽取为独立的私有方法，可复用于书名和作者两个字段：

```typescript
private removeParenthesesFromText(
  text: string,
  whitelist: string[],
  removeParensType: 'all' | 'chinese' | 'english',
  removeParensSpaces: boolean
): string
```

各模式处理规则：

| 模式      | 中文括号 `（）` | 英文括号 `()`                |
| --------- | --------------- | ---------------------------- |
| `chinese` | 移除            | 保留                         |
| `english` | 保留            | 移除（可选同时清理前后空格） |
| `all`     | 移除            | 移除（可选同时清理前后空格） |

**空格处理**（`removeParensSpaces: true`）：

```
"Tom Mitchell (CMU)" → "Tom Mitchell"   （移除括号及前后空格，避免双空格）
```

**空格处理**（`removeParensSpaces: false`）：

```
"Tom Mitchell (CMU)" → "Tom Mitchell "  （仅移除括号内容）
```

#### 设置界面增强（`src/settings/index.ts`）

新增以下设置条目（均在主开关启用后才显示）：

1. **从书名中移除括号**（开关）
2. **从作者中移除括号**（开关）
3. **括号类型**（下拉选择）：
   - All types（中文 + 英文）
   - Chinese parentheses only（`（）`）
   - English parentheses only（`()`）
4. **移除英文括号前后空格**（开关，仅选择 `english` 或 `all` 时显示）
5. **括号移除白名单**（文本区域）

界面采用动态显示策略：父级开关关闭时子选项自动隐藏，减少视觉干扰。

#### 默认值设计原则

| 设置项                   | 默认值  | 理由                 |
| ------------------------ | ------- | -------------------- |
| `removeParens`           | `false` | 避免影响现有用户     |
| `removeParensFromTitle`  | `true`  | 与原有行为保持一致   |
| `removeParensFromAuthor` | `false` | 防止意外修改作者信息 |
| `removeParensType`       | `'all'` | 最全面的处理方式     |
| `removeParensSpaces`     | `true`  | 更整洁的输出结果     |

---

## 四、受影响文件汇总

| 文件                                                  | 改动类型 | 说明                                    |
| ----------------------------------------------------- | -------- | --------------------------------------- |
| `src/sync/syncClippings/parseBooks.ts`                | 修改     | 新增中文日期预处理逻辑                  |
| `src/amazonRegion.ts`                                 | 修改     | 新增中国区支持                          |
| `src/models.ts`                                       | 修改     | 新增中国区类型                          |
| `src/scraper/scrapeBooks.ts`                          | 修改     | 中国区抓取适配                          |
| `src/rendering/renderer/fileNameRenderer.ts`          | 修改     | 重构括号移除逻辑，支持书名/作者分别处理 |
| `src/store/settingsStore.ts`                          | 修改     | 新增括号移除相关设置项及 Actions        |
| `src/settings/index.ts`                               | 修改     | 括号移除设置界面                        |
| `src/sync/syncClippings/parseBooks.spec.ts`           | 修改     | 更新/补充测试用例                       |
| `src/sync/syncClippings/parseBooks.issue311.spec.ts`  | 新增     | Issue #311 专项测试                     |
| `src/sync/syncClippings/parseBooks.userIssue.spec.ts` | 新增     | 用户真实案例测试                        |
| `src/sync/syncClippings/moment.test.spec.ts`          | 新增     | 时间解析单元测试                        |
| `src/sync/syncClippings/parseBooks.debug.spec.ts`     | 新增     | 调试用测试                              |

---

## 五、向后兼容性

- 所有新增设置项均有安全默认值，已有用户升级后行为不变。
- 中文日期预处理仅对包含中文年月日字符的行生效，不影响英文时间戳。
- 括号移除功能默认**关闭**，需要用户主动启用。

---

## 六、构建验证

```bash
npm run build   # TypeScript 编译 + Webpack 打包
```

- TypeScript 编译：✅ 无报错
- ESLint 检查：✅ 通过
- Webpack 构建：✅ 成功，输出 `main.js`（约 1.02 MB）
