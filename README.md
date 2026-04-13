<div align="center">

# 🌿 Biochat

**优雅的 AI 对话桌面客户端**

基于 DeerFlow 2.0 内核 · 借鉴 LobeHub UI 设计 · 原生跨平台体验

[![GitHub release](https://img.shields.io/github/release/xiaoxuan0820-ctrl/biochat.svg?style=for-the-badge)](https://github.com/xiaoxuan0820-ctrl/biochat/releases)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-blue?style=for-the-badge)](https://github.com/xiaoxuan0820-ctrl/biochat/releases)
[![License](https://img.shields.io/github/license/xiaoxuan0820-ctrl/biochat?style=for-the-badge)](LICENSE)

</div>

---

## 🎯 项目简介

Biochat 是一款**开箱即用**的 AI 对话桌面客户端，融合了：

- **DeerFlow 2.0** 的强大 AI 内核
- **LobeHub** 的现代化设计美学
- **Electron** 的跨平台能力

无论您是开发者、创作者还是 AI 爱好者，Biochat 都能为您提供流畅、优雅的对话体验。

---

## ✨ 核心特性

<table>
<tr>
<td width="50%">

### 🎨 精致界面

- 现代化深色主题
- 流畅动画过渡
- 响应式布局设计
- 沉浸式对话体验

</td>
<td width="50%">

### 🤖 智能对话

- 多轮上下文记忆
- 实时流式响应
- 支持多种 AI 模型
- 本地数据隐私保护

</td>
</tr>
<tr>
<td width="50%">

### 🖥️ 跨平台支持

- macOS (Apple Silicon M系列)
- macOS (Intel 芯片)
- Windows 10/11
- 一键安装部署

</td>
<td width="50%">

### 🔒 安全可靠

- 本地运行，数据自控
- 无需联网核心功能
- 支持自定义配置
- 开源透明可审计

</td>
</tr>
</table>

---

## 📥 快速开始

### 下载安装

前往 [Releases](https://github.com/xiaoxuan0820-ctrl/biochat/releases/latest) 页面下载最新版本：

| 平台 | 芯片 | 下载文件 |
|:----:|:----:|:--------:|
| macOS | M1/M2/M3/M4 | `Biochat-x.x.x-arm64.dmg` |
| Windows | x64 | `Biochat-Setup-x.x.x.exe` |

### 安装指南

<details>
<summary><b>🍎 macOS 安装</b></summary>

1. 下载 `.dmg` 文件
2. 双击打开磁盘映像
3. 将 Biochat 拖入 Applications 文件夹
4. 首次打开若提示"无法验证开发者"，执行：
   ```bash
   xattr -cr "/Applications/Biochat.app"
   ```
5. 再次打开即可正常使用

</details>

<details>
<summary><b>🪟 Windows 安装</b></summary>

1. 下载 `.exe` 安装包
2. 双击运行安装程序
3. 选择安装路径
4. 完成安装后从开始菜单启动

</details>

---

## 🛠️ 技术架构

```
Biochat
├── Electron 28          # 跨平台桌面框架
├── DeerFlow 2.0         # AI 对话内核
└── LobeHub UI Design    # 界面设计参考
```

---

## 🗺️ 开发路线

- [x] 基础对话功能
- [x] macOS/Windows 双平台支持
- [x] Apple Silicon 原生适配
- [ ] 模型配置可视化界面
- [ ] 对话历史管理
- [ ] 多语言支持 (i18n)
- [ ] 主题切换功能
- [ ] 插件扩展系统

---

## 🤝 参与贡献

欢迎各种形式的贡献！

- 🐛 [报告 Bug](https://github.com/xiaoxuan0820-ctrl/biochat/issues)
- 💡 [提出建议](https://github.com/xiaoxuan0820-ctrl/biochat/issues)
- 🔧 [提交 PR](https://github.com/xiaoxuan0820-ctrl/biochat/pulls)

---

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

---

## 🙏 致谢

- [DeerFlow](https://github.com/bytedance/DeerFlow) - 强大的 AI Agent 框架
- [LobeHub](https://github.com/lobehub/lobe-chat) - 现代化聊天 UI 设计
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架

---

<div align="center">

**Made with ❤️ by [Biocherry](https://github.com/biocherry100)**

如果这个项目对您有帮助，请给个 ⭐️ Star 支持一下！

</div>
