# Biochat

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-green" alt="Platform">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

> Elegant Desktop Client based on DeerFlow 2.0, inspired by LobeHub UI design

## ✨ Features

- 🏠 **Dashboard** - Monitor service status (Docker, DeerFlow) at a glance
- 💬 **Chat Interface** - Seamless AI conversation experience
- 📁 **File Management** - Browse and preview generated reports
- 🛠️ **Skills Market** - Install and manage powerful plugins
- 🎨 **Beautiful UI** - LobeHub-inspired design with dark mode support
- 🖥️ **System Tray** - Always accessible, minimal footprint

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Docker (for DeerFlow backend)
- DeerFlow 2.0 running on localhost:2026

### Installation

```bash
# Clone the repository
git clone https://github.com/xiaoxuan0820-ctrl/biochat.git
cd biochat

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build for your current platform
npm run dist

# Build for macOS (requires macOS)
npm run dist:mac

# Build for Windows
npm run dist:win
```

## 📁 Project Structure

```
biochat/
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.ts    # Main entry
│   │   ├── tray.ts     # System tray
│   │   └── ipc.ts      # IPC handlers
│   ├── renderer/       # React frontend
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   ├── store/      # State management
│   │   └── styles/     # Global styles
│   └── preload/        # Preload scripts
├── .github/
│   └── workflows/      # CI/CD pipelines
└── package.json
```

## 🎯 Tech Stack

- **Electron** - Desktop application framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Router** - Navigation

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development mode |
| `npm run build` | Build for production |
| `npm run dist` | Create distributable packages |
| `npm run dist:mac` | Build for macOS |
| `npm run dist:win` | Build for Windows |

## 🔧 Configuration

### API Keys

Configure your AI provider API keys in Settings:

- DeepSeek
- Kimi (Moonshot)
- OpenAI (GPT-4)
- Anthropic (Claude)
- Google AI (Gemini)

### Theme

Switch between light and dark modes in Settings or via the sidebar toggle.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [DeerFlow](https://github.com/aicompanion/deerflow) - AI research framework
- [LobeHub](https://github.com/lobehub/lobe-chat) - UI design inspiration
- [Electron](https://electronjs.org/) - Desktop framework
