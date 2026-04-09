# 内力计算器 (Internal Force Calculator)

一个用于计算梁的内力（剪力和弯矩）的应用程序，使用 Rust 作为核心计算引擎，React 作为前端界面，Tauri 作为桌面应用框架。

## 项目结构

- `calculator_core/` - 核心计算库，包含梁的内力计算逻辑
- `calculator_wasm/` - WebAssembly 模块，用于在浏览器中运行计算
- `calculator_ui/` - 前端界面，使用 React + TypeScript + Tauri

## 构建步骤

### 1. 安装依赖

#### Rust 依赖

确保已安装 Rust 工具链：

```bash
# 安装 Rust（如果尚未安装）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 安装 wasm-pack（用于构建 WebAssembly 模块）
cargo install wasm-pack
```

#### Node.js 依赖

确保已安装 Node.js 和 pnpm：

```bash
# 安装 pnpm（如果尚未安装）
npm install -g pnpm

# 安装前端依赖
cd calculator_ui
pnpm install
```

### 2. 构建项目

#### 构建 WebAssembly 模块

```bash
cd calculator_wasm
cargo build -p calculator_wasm --target wasm32-unknown-unknown --release && wasm-bindgen ../target/wasm32-unknown-unknown/release/calculator_wasm.wasm --out-dir pkg --target bundler
```

#### 构建桌面应用

```bash
cd calculator_ui
pnpm tauri build
```

### 3. 运行开发服务器

如果需要在开发模式下运行：

```bash
cd calculator_ui
pnpm tauri dev
```

## 功能

- 梁的剪力和弯矩计算
- 内力图显示
- 正应力计算

## 技术栈

- **后端**：Rust
- **前端**：React, TypeScript, Vite
- **桌面框架**：Tauri
- **WebAssembly**：用于浏览器计算

## 部署说明

如果在 web 服务器的非根目录下部署，需要修改以下文件中的路径配置：

1. **vite.config.ts**：修改 `base` 选项
   - 文件路径：`calculator_ui/vite.config.ts`
   - 将 `base: '/ifc'` 改为对应目录

2. **App.tsx**：修改 `basename` 选项
   - 文件路径：`calculator_ui/src/App.tsx`
   - 将 `<BrowserRouter basename="/ifc">` 改为对应目录
