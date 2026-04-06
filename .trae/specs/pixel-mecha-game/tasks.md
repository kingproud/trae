# Tasks

- [x] Task 1: 初始化项目结构与游戏画布
  - [x] SubTask 1.1: 创建 `index.html`，引入必要的 CSS 和 JS 文件，并设置 HTML5 Canvas。
  - [x] SubTask 1.2: 创建 `style.css`，引入像素风字体（如 Google Fonts 的 'Press Start 2P'），设置页面布局。
  - [x] SubTask 1.3: 创建 `js/game.js`，设置游戏主循环（`requestAnimationFrame`）和基础场景绘制。
- [x] Task 2: 实现核心游戏实体与物理系统
  - [x] SubTask 2.1: 在 `js/classes.js` 创建 `Sprite` 和 `Fighter` 类（继承自 Sprite，包含位置、速度、尺寸、状态等属性）。
  - [x] SubTask 2.2: 实现基础物理（重力、地面碰撞限制、左右移动）。
- [x] Task 3: 实现输入处理与角色控制
  - [x] SubTask 3.1: 监听键盘事件，管理按键状态（键被按下和抬起）。
  - [x] SubTask 3.2: 将输入绑定到两个机甲实例（Player 1 和 Player 2），实现移动与跳跃。
- [x] Task 4: 实现战斗机制与状态管理
  - [x] SubTask 4.1: 实现攻击判定框（Attack Box）及其基于矩形相交的碰撞检测。
  - [x] SubTask 4.2: 实现防御状态及伤害计算逻辑（普通攻击扣除 20 血量，防御状态扣除 0 或 5）。
  - [x] SubTask 4.3: 添加血量系统及胜负判定，在 HTML/CSS 中绘制血条并在 JS 中动态更新宽度。
- [x] Task 5: 完善像素风表现与游戏流程
  - [x] SubTask 5.1: 使用 Canvas API 绘制简单的像素块模拟机甲造型（头部、躯干、手部、腿部），或使用色块替代。
  - [x] SubTask 5.2: 添加攻击、受击和防御时的颜色变化或位移动画（如受击闪烁红光）。
  - [x] SubTask 5.3: 添加游戏结束提示（“Player 1 Wins”、“Tie”等）UI，并提供重新开始（Restart）功能。
