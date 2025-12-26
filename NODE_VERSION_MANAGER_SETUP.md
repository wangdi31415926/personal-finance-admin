# Node.js 版本管理工具配置指南

## 推荐工具：nvm-windows

### 安装步骤

1. **下载 nvm-windows**
   - 访问：https://github.com/coreybutler/nvm-windows/releases
   - 下载最新版本的 `nvm-setup.exe`（推荐使用安装程序）

2. **安装 nvm-windows**
   - 运行 `nvm-setup.exe`
   - 按照安装向导完成安装
   - 安装完成后，**重新打开 PowerShell 或 CMD**

3. **验证安装**
   ```bash
   nvm version
   ```

### 安装项目所需的 Node.js 版本

根据项目 `package.json` 要求：`"node": "^20.19.0 || >=22.13.0"`

#### 安装 Node.js 20.19.0（推荐）
```bash
nvm install 20.19.0
nvm use 20.19.0
```

#### 或安装 Node.js 22.13.0（最新 LTS）
```bash
nvm install 22.13.0
nvm use 22.13.0
```

#### 或安装最新版本
```bash
nvm install latest
nvm use latest
```

### 常用命令

```bash
# 查看可安装的版本列表
nvm list available

# 查看已安装的版本
nvm list

# 切换到指定版本
nvm use 20.19.0

# 设置默认版本（新终端自动使用）
nvm alias default 20.19.0

# 卸载指定版本
nvm uninstall 20.13.1
```

### 注意事项

1. **安装后需要重新打开终端**才能使用 nvm 命令
2. 如果遇到权限问题，请以**管理员身份**运行 PowerShell
3. 切换版本后，需要重新安装全局包（如 pnpm）
4. 建议先卸载当前全局安装的 Node.js，避免冲突

---

## 替代方案：fnm (Fast Node Manager)

如果 nvm-windows 安装遇到问题，可以使用 fnm：

### 使用 Scoop 安装 fnm
```bash
# 先安装 Scoop（如果没有）
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# 安装 fnm
scoop install fnm

# 初始化 fnm（添加到 PowerShell 配置）
fnm env --use-on-cd | Out-String | Invoke-Expression
```

### 使用 fnm 安装 Node.js
```bash
fnm install 20.19.0
fnm use 20.19.0
fnm default 20.19.0
```

---

## 快速开始

安装完成后，在项目目录下运行：

```bash
# 切换到项目要求的 Node.js 版本
nvm use 20.19.0

# 验证版本
node --version

# 安装项目依赖
pnpm install
```


