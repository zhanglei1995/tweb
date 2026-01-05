# Telegram Web K 项目指南

## 项目概述

Telegram Web K 是基于 Webogram 的 Telegram 网页客户端，经过修补和改进。这是一个功能丰富的即时通讯应用，可在浏览器中运行，提供与原生 Telegram 客户端类似的功能。

### 核心技术栈

- **前端框架**: SolidJS (响应式 UI 框架)
- **构建工具**: Vite
- **语言**: TypeScript
- **样式**: SCSS
- **包管理器**: pnpm
- **测试**: Vitest
- **加密**: 自定义加密库和 Web Crypto API
- **媒体处理**: opus-recorder, mp4-muxer, rlottie

### 项目结构

```
tweb/
├── src/                    # 源代码目录
│   ├── components/         # UI 组件
│   ├── config/            # 配置文件
│   ├── environment/       # 环境检测和兼容性
│   ├── helpers/           # 辅助函数
│   ├── hooks/             # 自定义 hooks
│   ├── lib/               # 核心库和逻辑
│   ├── pages/             # 页面组件
│   ├── scss/              # 样式文件
│   ├── solid/             # SolidJS 框架源码
│   ├── stores/            # 状态管理
│   ├── tests/             # 测试文件
│   └── vendor/            # 第三方库
├── public/                # 静态资源
├── .docker/              # Docker 配置
└── snapshot-server/      # 快照服务器
```

## 构建和运行

### 开发环境

1. **安装依赖**:
   ```bash
   pnpm install
   ```

2. **启动开发服务器**:
   ```bash
   pnpm start
   ```
   应用将在 http://localhost:8080/ 上运行，并启用实时重载。

### 生产环境

1. **构建生产版本**:
   ```bash
   pnpm run build
   ```

2. **运行生产服务器**:
   ```bash
   pnpm run serve
   ```

### Docker 部署

**开发环境**:
```bash
docker-compose up tweb.dependencies  # 安装依赖
docker-compose up tweb.develop       # 运行开发容器
```

**生产环境**:
```bash
docker-compose up tweb.production -d  # 运行生产容器
```

## 开发约定

### 代码规范

- 使用 TypeScript 进行类型检查
- 使用 ESLint 进行代码检查
- 使用 SolidJS 的响应式编程模式
- 遵循项目的现有组件结构和命名约定

### 测试

- 使用 Vitest 进行单元测试
- 测试文件放在 `src/tests/` 目录下
- 运行测试: `pnpm test`

### 状态管理

- 使用 SolidJS 的 store 进行状态管理
- 全局状态通过 `rootScope` 管理
- 账户状态通过 `AccountController` 管理

### 样式约定

- 使用 SCSS 进行样式编写
- 组件样式与组件逻辑分离
- 使用 CSS 变量进行主题切换
- 响应式设计考虑移动端和桌面端

## 调试和开发工具

### 调试参数

可以在 URL 中添加以下查询参数来启用调试功能:

- `test=1`: 使用测试 DC (数据中心)
- `debug=1`: 启用额外日志记录
- `noSharedWorker=1`: 禁用 Shared Worker (对调试有用)
- `http=1`: 强制使用 HTTPS 传输连接到 Telegram 服务器

示例: `http://localhost:8080/?test=1`

### 本地存储快照

可以使用 `./snapshot-server` 小应用来获取和加载本地存储和 Indexed DB 的快照。详细信息请查看该目录下的 README.md。

### 图标预览

在浏览器控制台中调用 `showIconLibrary()` 全局函数可以查看所有可用的 SVG 图标。

## 项目特性

### 多账户支持

- 支持多个 Telegram 账户同时登录
- 免费用户最多支持有限数量的账户
- Premium 用户支持更多账户

### 安全特性

- 端到端加密
- 双因素认证支持
- 密码锁定屏幕
- 安全的会话管理

### 媒体功能

- 语音消息录制和播放
- 视频消息支持
- 动画贴纸 (rlottie)
- 图片和视频处理

### 国际化

- 多语言支持
- RTL 语言支持 (阿拉伯语、波斯语等)
- 动态语言包更新

## 开发脚本

- `pnpm generate-mtproto-types`: 生成 MTProto 类型定义
- `pnpm generate-changelog`: 生成更新日志
- `pnpm generate-icons`: 生成图标文件
- `pnpm watch-lang`: 监视语言文件变化
- `pnpm lint`: 运行 ESLint 检查
- `pnpm format-lang`: 格式化语言文件

## 许可证

本项目使用 GPL v3 许可证。详细信息请查看 [LICENSE](/LICENSE) 文件。

## 贡献

如果您发现错误或希望添加新功能，请通过 [Suggestions Platform](https://bugs.telegram.org/c/4002) 联系 Telegram。

## 依赖项

主要依赖项包括:
- BigInteger.js (Unlicense)
- pako (MIT License)
- cryptography (Apache License 2.0)
- SolidJS (MIT License)
- rlottie (MIT License)
- 以及其他多个开源库

完整的依赖项列表和许可证信息请参考 README.md 文件。