import { Easing } from "react-native-reanimated";

/**
 * 动画缓动曲线配置
 */
export const ANIMATION_EASINGS = {
    /** 标准弹性缓动 - 用于大多数交互 */
    standard: Easing.bezier(0.4, 0, 0.2, 1),
    /** 弹性缓动 - 用于强调效果 */
    bounce: Easing.bezier(0.34, 1.56, 0.64, 1),
    /** 快速进入缓动 - 用于弹窗出现 */
    enter: Easing.bezier(0, 0, 0.2, 1),
    /** 快速退出缓动 - 用于弹窗消失 */
    exit: Easing.bezier(0.4, 0, 1, 1),
    /** 平滑缓动 - 用于列表滚动等 */
    smooth: Easing.out(Easing.exp),
} as const;

/**
 * 动画时长配置（毫秒）
 */
export const ANIMATION_DURATIONS = {
    /** 极快 - 80ms，用于轻微反馈 */
    xFast: 80,
    /** 快速 - 150ms，用于按钮点击 */
    fast: 150,
    /** 标准 - 250ms，用于大多数界面过渡 */
    normal: 250,
    /** 较慢 - 350ms，用于复杂界面切换 */
    slow: 350,
    /** 缓慢 - 500ms，用于大型动画 */
    xSlow: 500,
} as const;

/**
 * 动画配置组合
 */
export const animationConfig = {
    /** 快速动画配置 - 用于按钮点击等反馈 */
    fast: {
        duration: ANIMATION_DURATIONS.fast,
        easing: ANIMATION_EASINGS.standard,
    },
    /** 标准动画配置 - 用于弹窗、面板等 */
    normal: {
        duration: ANIMATION_DURATIONS.normal,
        easing: ANIMATION_EASINGS.standard,
    },
    /** 慢速动画配置 - 用于页面切换 */
    slow: {
        duration: ANIMATION_DURATIONS.slow,
        easing: ANIMATION_EASINGS.standard,
    },
    /** 弹性动画配置 - 用于强调效果 */
    bounce: {
        duration: ANIMATION_DURATIONS.normal,
        easing: ANIMATION_EASINGS.bounce,
    },
    /** 进入动画配置 - 用于组件出现 */
    enter: {
        duration: ANIMATION_DURATIONS.normal,
        easing: ANIMATION_EASINGS.enter,
    },
    /** 退出动画配置 - 用于组件消失 */
    exit: {
        duration: ANIMATION_DURATIONS.fast,
        easing: ANIMATION_EASINGS.exit,
    },
} as const;

/**
 * 透明度动画值
 */
export const OPACITY = {
    /** 完全透明 */
    transparent: 0,
    /** 半透明遮罩 */
    mask: 0.5,
    /** 完全不透明 */
    opaque: 1,
} as const;

/**
 * 缩放动画值
 */
export const SCALE = {
    /** 隐藏状态 */
    hidden: 0.85,
    /** 标准状态 */
    normal: 1,
    /** 轻微放大 */
    large: 1.05,
} as const;

/**
 * 位移动画值（相对单位）
 */
export const TRANSLATE = {
    /** 从底部滑入 */
    bottom: 1,
    /** 从顶部滑入 */
    top: -1,
    /** 从右侧滑入 */
    right: 1,
    /** 从左侧滑入 */
    left: -1,
    /** 原位 */
    center: 0,
} as const;
