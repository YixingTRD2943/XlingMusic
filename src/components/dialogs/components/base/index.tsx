import React, { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import {
    BackHandler,
    NativeEventSubscription,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from "react-native";
import rpx, { vh, vw } from "@/utils/rpx";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import {
    animationConfig,
    OPACITY,
    SCALE,
} from "@/constants/animationConst";
import useColors from "@/hooks/useColors";
import ThemeText from "@/components/base/themeText";
import Divider from "@/components/base/divider";
import { fontSizeConst } from "@/constants/uiConst";
import Icon from "@/components/base/icon";
import { ScrollView } from "react-native-gesture-handler";
import useOrientation from "@/hooks/useOrientation.ts";

interface IDialogProps {
    onDismiss?: () => void;
    hideCloseButton?: boolean;
    children?: ReactNode;
}

function Dialog(props: IDialogProps) {
    const { children, onDismiss, hideCloseButton } = props;

    const sharedShowValue = useSharedValue(0);
    const colors = useColors();
    const backHandlerRef = useRef<NativeEventSubscription>();
    const orientation = useOrientation();
    const isDismissingRef = useRef(false);
    const onDismissRef = useRef(onDismiss);
    onDismissRef.current = onDismiss;

    // 对话框宽度
    const dialogContainerStyle: ViewStyle =
        orientation === "vertical"
            ? {
                width: vw(100) - rpx(72),
            }
            : {
                width: "80%",
            };

    const handleDismiss = useCallback(() => {
        if (isDismissingRef.current) return;
        isDismissingRef.current = true;
        onDismissRef.current?.();
        sharedShowValue.value = withTiming(0, animationConfig.exit);
    }, []);

    useEffect(() => {
        sharedShowValue.value = withTiming(1, animationConfig.enter);
        if (backHandlerRef.current) {
            backHandlerRef.current?.remove();
            backHandlerRef.current = undefined;
        }
        backHandlerRef.current = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                handleDismiss();
                return true;
            },
        );

        return () => {
            if (backHandlerRef.current) {
                backHandlerRef.current?.remove();
                backHandlerRef.current = undefined;
            }
        };
    }, [handleDismiss]);

    const containerStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(
                OPACITY.transparent + sharedShowValue.value * OPACITY.mask,
                sharedShowValue.value > 0.5 ? animationConfig.enter : animationConfig.exit,
            ),
        };
    });

    const scaleAnimationStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: withTiming(
                        SCALE.hidden + sharedShowValue.value * (SCALE.normal - SCALE.hidden),
                        sharedShowValue.value > 0.5 ? animationConfig.enter : animationConfig.exit,
                    ),
                },
            ],
        };
    });

    const translateYAnimationStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: withTiming(
                        (1 - sharedShowValue.value) * -rpx(40),
                        sharedShowValue.value > 0.5 ? animationConfig.enter : animationConfig.exit,
                    ),
                },
            ],
        };
    });

    return (
        <View style={styles.backContainer}>
            <TouchableWithoutFeedback
                style={styles.container}
                onPress={handleDismiss}>
                <Animated.View style={[styles.container, containerStyle]} />
            </TouchableWithoutFeedback>
            <Animated.View
                style={[
                    styles.dialogContainer,
                    dialogContainerStyle,
                    scaleAnimationStyle,
                    translateYAnimationStyle,
                    {
                        backgroundColor: colors.backdrop,
                        shadowColor: colors.shadow,
                    },
                ]}>
                {hideCloseButton ? null : (
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleDismiss}
                        activeOpacity={0.6}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Icon name="x-mark" size={rpx(28)} color={colors.text} />
                    </TouchableOpacity>
                )}
                {children}
            </Animated.View>
        </View>
    );
}

interface IDialogTitleProps {
    children?: ReactNode;
    withDivider?: boolean;
    stringContent?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
}

function Title(props: IDialogTitleProps) {
    const { children, withDivider, stringContent, containerStyle } = props;

    return (
        <>
            <View style={[styles.titleContainer, containerStyle]}>
                {typeof children === "string" || stringContent ? (
                    <ThemeText
                        fontSize="title"
                        fontWeight="bold"
                        numberOfLines={1}>
                        {children}
                    </ThemeText>
                ) : (
                    children
                )}
            </View>
            {withDivider ? <Divider /> : null}
        </>
    );
}

interface IDialogContentProps {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
    needScroll?: boolean;
}

function Content(props: IDialogContentProps) {
    const { children, style, needScroll } = props;

    const content =
        typeof children === "string" ? (
            <ThemeText fontSize="content" style={styles.defaultFontStyle}>
                {children}
            </ThemeText>
        ) : (
            children
        );

    return (
        <View
            style={[
                styles.contentContainer,
                {
                    maxHeight: vh(50),
                },
                style,
            ]}>
            {needScroll ? <ScrollView>{content}</ScrollView> : content}
        </View>
    );
}

interface IDialogActionsProps {
    children?: ReactNode;
    actions?: Array<{
        title: string;
        type?: "normal" | "primary";
        show?: boolean;
        onPress?: () => void;
    }>;
    style?: StyleProp<ViewStyle>;
}

function Actions(props: IDialogActionsProps) {
    const { children, style, actions } = props;

    const validActions = useMemo(
        () => actions?.filter(it => it.show !== false),
        [actions],
    );

    const _children = validActions?.length ? (
        <>
            {validActions.map((it, index) =>
                it.show === false ? null : (
                    <BottomButton
                        key={index}
                        style={index === 0 ? null : styles.actionButton}
                        onPress={it.onPress}
                        text={it.title}
                        type={it.type}
                    />
                ),
            )}
        </>
    ) : (
        children
    );

    return (
        <View style={[styles.actionsContainer, style]}>
            {typeof children === "string" ? (
                <ThemeText fontSize="content" numberOfLines={1}>
                    {children}
                </ThemeText>
            ) : (
                _children
            )}
        </View>
    );
}

function BottomButton(props: {
    type?: "normal" | "primary";
    text: string;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
}) {
    const { type = "normal", text, style, onPress } = props;
    const colors = useColors();

    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={onPress}
            style={[
                styles.bottomBtn,
                {
                    backgroundColor:
                        type === "normal" ? colors.placeholder : colors.primary,
                },
                style,
            ]}>
            <ThemeText color={type === "normal" ? undefined : "white"}>
                {text}
            </ThemeText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    bottomBtn: {
        borderRadius: rpx(8),
        flex: 1,
        flexShrink: 0,
        justifyContent: "center",
        alignItems: "center",
        height: rpx(72),
    },
    backContainer: {
        position: "absolute",
        zIndex: 16299,
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    container: {
        zIndex: 16300,
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    dialogContainer: {
        position: "absolute",
        width: "80%",
        zIndex: 16310,
        borderRadius: rpx(16),
        backgroundColor: "red",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 4,

        elevation: 5,
    },

    defaultFontStyle: {
        lineHeight: fontSizeConst.content * 1.5,
    },

    closeButton: {
        position: "absolute",
        top: rpx(12),
        right: rpx(12),
        zIndex: 999,
        width: rpx(32),
        height: rpx(32),
        borderRadius: rpx(16),
        alignItems: "center",
        justifyContent: "center",
    },
    /**** title */
    titleContainer: {
        height: rpx(88),
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        paddingHorizontal: rpx(24),
    },
    /** content */
    contentContainer: {
        width: "100%",
        paddingHorizontal: rpx(24),
        paddingVertical: rpx(36),
    },
    /** actions */
    actionsContainer: {
        width: "100%",
        height: rpx(88),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingHorizontal: rpx(24),
        marginBottom: rpx(12),
        flexWrap: "nowrap",
    },
    actionButton: {
        marginLeft: rpx(24),
    },
});

Dialog.Title = Title;
Dialog.Content = Content;
Dialog.Actions = Actions;

export default Dialog;
