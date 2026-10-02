import type { Live2DExpressionSettingsSnapshot } from '@proj-airi/stage-ui-live2d/stores/expression-store'

import type { StageModelRenderer } from '../../../../stores/settings/stage-model'

export type ModelSettingsRuntimeRenderer = 'disabled' | 'live2d' | 'vrm' | 'tachie'
export type ModelSettingsRuntimePhase = 'pending' | 'loading' | 'binding' | 'mounted' | 'no-model' | 'error'

export interface ModelSettingsRuntimeSnapshot {
  ownerInstanceId: string
  /** Identifies the loaded model state that produced the runtime controls. */
  modelId: string
  renderer: ModelSettingsRuntimeRenderer
  phase: ModelSettingsRuntimePhase
  controlsLocked: boolean
  previewAvailable: boolean
  canCapturePreview: boolean
  live2dExpressions?: Live2DExpressionSettingsSnapshot
  lastError?: string
  updatedAt: number
}

export function createEmptyModelSettingsRuntimeSnapshot(
  overrides: Partial<ModelSettingsRuntimeSnapshot> = {},
): ModelSettingsRuntimeSnapshot {
  return {
    ownerInstanceId: '',
    modelId: '',
    renderer: 'disabled',
    phase: 'pending',
    controlsLocked: false,
    previewAvailable: false,
    canCapturePreview: false,
    updatedAt: 0,
    ...overrides,
  }
}

/** Resolves which settings component the model settings panel should mount. */
export function resolveModelSettingsPanelRenderer(options: {
  settingsRenderer: StageModelRenderer
  runtimeRenderer: ModelSettingsRuntimeRenderer
}): ModelSettingsRuntimeRenderer {
  return options.runtimeRenderer
}

/** Maps component load state into the shared model settings runtime phase. */
export function resolveComponentStateToRuntimePhase(
  componentState: 'pending' | 'loading' | 'mounted',
  options: {
    hasModel?: boolean
  } = {},
): ModelSettingsRuntimePhase {
  if (options.hasModel === false)
    return 'no-model'

  return componentState
}
