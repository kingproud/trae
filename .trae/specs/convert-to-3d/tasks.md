# Tasks

- [x] Task 1: 引入 Three.js 并初始化 3D 场景
  - [x] SubTask 1.1: 在 `index.html` 中通过 CDN 引入 Three.js (例如使用 unpkg 或 cdnjs)。
  - [x] SubTask 1.2: 修改 `js/game.js` 的初始化代码，移除原生的 2D context，设置 WebGLRenderer、Scene、PerspectiveCamera。
  - [x] SubTask 1.3: 添加基础光源（AmbientLight 和 DirectionalLight）以及 3D 地面（PlaneGeometry 或 BoxGeometry）。
- [x] Task 2: 重构基础类到 3D 空间
  - [x] SubTask 2.1: 在 `js/classes.js` 中重构 `Sprite` 和 `Fighter` 类，使用 `THREE.Group` 和相应的 Mesh 组合（如 BoxGeometry）替代 2D 矩形。
  - [x] SubTask 2.2: 实现 3D 机甲模型：躯干、头部、眼睛、腿部、手臂和格挡盾牌。
- [x] Task 3: 适配 3D 物理与角色动作逻辑
  - [x] SubTask 3.1: 将原有的位置（position）和速度（velocity）逻辑映射到 Three.js 的坐标系中（Y轴为上下，X轴为左右，重力处理）。
  - [x] SubTask 3.2: 将左右移动、跳跃、攻击、受击闪烁、防御材质变色以及死亡（旋转倾倒）逻辑与 3D 模型的属性挂钩。
- [x] Task 4: 适配 3D 碰撞检测与攻击判定
  - [x] SubTask 4.1: 修改 `utils.js` 中的 `rectangularCollision` 函数，使其基于 3D 空间的 AABB 碰撞或手动基于宽高深的判定。
  - [x] SubTask 4.2: 确保攻击判定框（Attack Box）在 3D 空间中的相对位置和大小正确，且能正常触发扣血，血条 UI 正确响应。
- [x] Task 5: 优化 UI 和游戏重置流程
  - [x] SubTask 5.1: 保持 HTML/CSS UI 层覆盖在 3D Canvas 之上，调整布局以适配新画布。
  - [x] SubTask 5.2: 确保重置游戏（Restart）逻辑能够正确重置 3D 模型的位置、旋转、材质颜色和状态。
