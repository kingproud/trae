# Convert Game to 3D Spec

## Why
用户希望将原本基于 2D Canvas 的机甲对战游戏升级为 3D 画面，以提供更丰富的视觉体验和立体空间感，同时保留原有的核心对战玩法。

## What Changes
- 引入 Three.js 作为 3D 渲染引擎，替代原生 2D Canvas 渲染。
- 重构场景，创建 3D 竞技场（包含 3D 地面、环境光和定向光）。
- 重构角色类（Fighter 等），使用 3D 几何体（如 BoxGeometry）组合来构建机甲外观，替代原有的 2D 矩形绘制。
- **BREAKING**: 将物理与碰撞检测系统从 2D 矩形（AABB）升级为基于 3D 坐标系的边界盒相交检测。
- 调整摄像机视角（正交或透视侧视角），保持经典的格斗游戏体验。

## Impact
- Affected specs: 渲染引擎、物理与碰撞引擎、角色实体视觉表现。
- Affected code: `index.html` (引入 Three.js), `js/game.js`, `js/classes.js`, `js/utils.js` (大量重构)。

## ADDED Requirements
### Requirement: 3D 渲染与场景
系统 SHALL 使用 Three.js 渲染 3D 场景。
- **场景**：包含 3D 地面、合适的灯光，以及固定或平滑跟随的摄像机。
- **视觉**：机甲模型由多个 3D 几何体拼接而成（躯干、头部、四肢），并在动作时产生对应的 3D 变换。

## MODIFIED Requirements
### Requirement: 物理与碰撞
- **坐标系**：使用 Three.js 的 3D 坐标系。角色移动限制在 X-Y 平面（或限制 Z 轴深度），以保持 2D 格斗玩法。
- **碰撞**：攻击判定框和角色受击框需要基于 3D 空间坐标进行检测（例如使用 THREE.Box3 或基于边界的手动判断）。
- **状态表现**：受击、防御和死亡的状态变化，需映射到 3D 材质颜色变化或模型整体的旋转与倾倒上。
