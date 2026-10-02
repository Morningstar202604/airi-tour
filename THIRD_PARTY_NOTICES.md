# 第三方组件许可声明（Third-Party Notices）

文旅助手基于 Project AIRI（MIT License，Copyright (c) 2024-PRESENT Neko Ayaka）二次开发。
除主仓库的 MIT 许可证外，本项目还包含以下第三方组件，各自适用独立许可条款。
**商业发布前请逐项核对。**

## 1. Live2D Cubism SDK（Web）

- 位置：`apps/stage-web/.cache/assets/js/CubismSdkForWeb-5-r.3/`
- 许可：Live2D 官方许可（详见该目录下 `LICENSE.md`、`NOTICE.md`）
- 要点：**企业最近会计年度销售额 ≥ 1000 万日元（约合人民币 50 万元）必须购买
  [Cubism SDK Release License（出版授权）](https://www.live2d.com/zh-CHS/download/cubism-sdk/release-license/)**
- 年销售额低于该阈值的企业/个人可依据 Live2D Open Software License 免费使用（需遵守其条款）
- 附带的 Live2D 免费模型（hiyori 等）另有 Live2D 模型使用条款，需保留署名/遵守条款

## 2. Spine 运行时（stage-ui-spine）

- 许可：`packages/stage-ui-spine/LICENSE.md` —— 本包原创代码为 MIT，但整合了
  **Spine Runtime**（Esoteric Software）的运行时许可
- 要点：使用 Spine 运行时需获得 [Esoteric Software](https://esotericsoftware.com/) 授权；
  生成 Spine 动画内容需 Spine 编辑器许可。不引入 Spine 模型时可忽略此条

## 3. 字体

| 字体 | 许可 | 位置 |
| --- | --- | --- |
| cjkFonts 全瀨體 | SIL OFL 1.1（保留保留字体名） | `packages/font-cjkfonts-allseto/license.txt` |
| Chillround M | MIT / OFL（见 LICENSE） | `packages/font-chillroundm/LICENSE` |
| Departure Mono | 见 LICENSE | `packages/font-departure-mono/LICENSE` |
| 霞鹜文楷（Xiaolai） | 见包内声明 | `packages/font-xiaolai/` |

OFL 字体允许修改、再分发与商用，但需保留版权声明与许可证全文，且不得使用保留字体名销售修改版。

## 4. 其他源码包

`packages/ccc/LICENSE`、各 `packages/*/LICENSE*` 均为各自作者的开源许可（多为 MIT），
保留其声明即可。

## 合规清单（发布前检查）

- [ ] 保留仓库根目录 `LICENSE`（含上游 MIT 版权声明，不可删除）
- [ ] 保留各第三方组件的 LICENSE / NOTICE 文件
- [ ] 若商用：核对 Live2D Cubism SDK 出版授权（收入阈值）与 Spine 许可
- [ ] 若分发修改版字体：遵守 OFL 保留字体名规则
