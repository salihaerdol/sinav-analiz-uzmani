// =====================================================
// MODÜL: AI ASSISTANT - INDEX EXPORT
// =====================================================

export { AIAssistantDashboard } from './AIAssistantDashboard';
export {
    generateAdvancedAIAnalysis,
    generateQuickAnalysis,
    generateCustomAnalysis,
    getAllPresets,
    getPresetsByCategory,
    getFocusAreas
} from './aiService';
export {
    AI_PROMPT_PRESETS,
    AI_FOCUS_AREAS,
    AI_CATEGORIES,
    getPresetById,
    getDefaultPresets
} from './presets';
export * from './types';
