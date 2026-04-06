# 像素风机甲对战小游戏 Spec

## Why
用户希望开发一个具有复古像素风格的机甲对战小游戏 Demo，以展示基本的游戏循环、碰撞检测、状态管理和渲染机制。这是一个基于 Web 的基础 2D 动作游戏，旨在提供可玩的战斗体验与简单的复古美学。

## What Changes
- 设计并实现基于 HTML5 Canvas 和 JavaScript 的 2D 动作游戏引擎基础。
- 引入两个机甲角色（玩家1与玩家2，本地双人对战）。
- 实现机甲的移动（左右移动、跳跃）、攻击（近战）和防御（格挡）功能。
- 实现血量系统和胜负判定逻辑。
- 设计基础的像素风素材方案（通过 Canvas 绘制像素块组合来模拟机甲造型）。

## Impact
- Affected specs: 游戏整体架构设计、渲染引擎、物理与碰撞引擎。
- Affected code: `index.html`, `style.css`, `js/game.js`, `js/classes.js`, `js/utils.js` 等核心游戏文件。

## ADDED Requirements
### Requirement: 游戏基础玩法与场景
系统 SHALL 提供一个可供两名玩家在同一键盘上进行对战的 2D 场景。
- **场景**：固定大小的竞技场（例如 1024x576 Canvas），包含复古背景和地面。
- **UI**：顶部显示双方的生命值条，中间显示对战计时器或状态。

### Requirement: 角色操作与机制
- **玩家1操作**：W/A/S/D 移动与跳跃，空格键 (Space) 攻击，Shift 键 防御。
- **玩家2操作**：方向键 移动与跳跃，Enter 键 攻击，右 Shift 键 防御。
- **胜负机制**：双方初始血量为 100，受到攻击扣减血量（防御状态下受到的伤害降低或无效）。血量归零者判负，游戏结束并提示重新开始。

### Requirement: 基础素材与动画
- **素材方案**：采用 Canvas API 绘制具有像素质感的几何色块组合来表现机甲结构，关闭图像平滑（`imageSmoothingEnabled = false`）以保持像素感。
- **动画**：包含待机（Idle）、移动（Run）、跳跃（Jump）、下落（Fall）、攻击（Attack）、受击（Take Hit）和死亡（Death）等状态反馈。
