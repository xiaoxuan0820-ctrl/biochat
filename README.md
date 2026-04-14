# Biochat

一个现代化的 AI 对话桌面客户端，基于 Electron + React 构建。

![Biochat](https://img.shields.io/badge/version-1.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 特性

- 🎨 **现代 UI** - 类似 LobeHub 的深色主题设计
- 🤖 **多后端支持** - 支持 OpenAI API 及所有兼容 OpenAI 格式的 API
- 💾 **本地存储** - SQLite 数据库存储对话历史，保护隐私
- 📝 **Markdown 支持** - 支持 Markdown 渲染和代码高亮
- 🔍 **历史搜索** - 快速搜索历史对话
- ⚡ **流式响应** - 实时显示 AI 生成内容

## 技术栈

- **Electron 28** - 桌面应用框架
- **React 18** - UI 库
- **TypeScript** - 类型安全
- **TailwindCSS** - 样式
- **SQLite (better-sqlite3)** - 本地数据库
- **Zustand** - 状态管理
- **Vite** - 构建工具

## 安装

### 从源码构建

```bash
# 克隆项目
git clone https://github.com/xiaoxuan0820-ctrl/biochat.git
cd biochat

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建应用
npm run build
```

### 下载发布版本

前往 [Releases](https://github.com/xiaoxuan0820-ctrl/biochat/releases) 下载最新版本。

## 使用

1. 首次运行需要配置 API 设置
2. 输入你的 API Key（支持 OpenAI 及兼容 API）
3. 选择使用的模型
4. 点击新建对话开始聊天

## 配置说明

### API 端点

默认使用 OpenAI API：
```
https://api.openai.com/v1
```

可以使用代理或第三方兼容服务：
- [OneAPI](https://github.com/songquanpeng/one-api)
- [NewAPI](https://github.com/Calcium-Ion/new-api)
- 任何兼容 OpenAI 格式的 API 服务

### 支持的模型

- GPT-3.5-Turbo
- GPT-4
- GPT-4-Turbo
- GPT-4o
- 以及任何自定义模型

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Enter` | 发送消息 |
| `Shift+Enter` | 换行 |

## 项目结构

```
biochat/
├── src/
│   ├── main/           # Electron 主进程
│   │   ├── index.ts    # 主入口
│   │   └── database.ts # SQLite 数据库
│   ├── preload/        # 预加载脚本
│   │   └── index.ts
│   └── renderer/       # 渲染进程 (React)
│       ├── App.tsx
│       ├── components/
│       ├── stores/     # Zustand 状态管理
│       └── styles/
├── public/
├── package.json
└── vite.config.ts
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 类型检查
npm run typecheck

# 构建 Windows 版本
npm run build:win

# 构建 macOS 版本
npm run build:mac
```

## License

MIT License - see LICENSE file for details

## 致谢

- [LobeHub](https://github.com/lobehub/lobe-chat) - UI 设计参考
- [Electron](https://electronjs.org/) - 桌面应用框架
- [Vite](https://vitejs.dev/) - 极快的构建工具
