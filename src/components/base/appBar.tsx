import React, { ReactNode, useEffect, useState } from "react";
import {
    LayoutRectangle,
    StatusBar as OriginalStatusBar,
    StyleProp,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from "react-native";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";
import StatusBar from "./statusBar";
import color from "color";
import IconButton from "./iconButton";
import globalStyle from "@/constants/globalStyle";
import ThemeText from "./themeText";
import { useNavigation } from "@react-navigation/native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import Portal from "./portal";
import ListItem from "./listItem";
import { IIconName } from "@/components/base/icon.tsx";
import LinearGradient from "react-native-linear-gradient";

interface IAppBarProps {
    titleTextOpacity?: number;
    withStatusBar?: boolean;
    color?: string;
    actions?: Array<{
        icon: IIconName;
        onPress?: () => void;
    }>;
    menu?: Array<{
        icon: IIconName;
        title: string;
        show?: boolean;
        onPress?: () => void;
    }>;
    menuWithStatusBar?: boolean;
    children?: string | ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
    actionComponent?: ReactNode;
    onBackPress?: () => void;
    variant?: "default" | "transparent" | "elevated";
}

const ANIMATION_EASING: Animated.EasingFunction = Easing.out(Easing.exp);
const ANIMATION_DURATION = 500;

const timingConfig = {
    duration: ANIMATION_DURATION,
    easing: ANIMATION_EASING,
};

export default function AppBar(props: IAppBarProps) {
    const {
        titleTextOpacity = 1,
        withStatusBar,
        color: _color,
        actions = [],
        menu = [],
        menuWithStatusBar = true,
        containerStyle,
        contentStyle,
        children,
        actionComponent,
        onBackPress,
        variant = "default",
    } = props;

    const colors = useColors();
    const navigation = useNavigation();

    const bgColor = variant === "transparent" ? "transparent" : (color(colors.appBar ?? colors.primary).toString());
    const contentColor = _color ?? colors.appBarText;

    const [showMenu, setShowMenu] = useState(false);
    const [menuIconLayout, setMenuIconLayout] =
        useState<LayoutRectangle | null>(null);
    const scaleRate = useSharedValue(0);

    useEffect(() => {
        if (showMenu) {
            scaleRate.value = withTiming(1, timingConfig);
        } else {
            scaleRate.value = withTiming(0, timingConfig);
        }
    }, [showMenu]);

    const transformStyle = useAnimatedStyle(() => {
        return {
            opacity: scaleRate.value,
            transform: [{ scale: scaleRate.value }],
        };
    });

    const getContainerStyle = (): ViewStyle => {
        switch (variant) {
        case "transparent":
            return {
                backgroundColor: "transparent",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0,
                shadowRadius: 0,
                elevation: 0,
            };
        case "elevated":
            return {
                backgroundColor: colors.appBar,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
            };
        default:
            return {
                backgroundColor: bgColor,
            };
        }
    };

    return (
        <>
            {withStatusBar ? <StatusBar backgroundColor={bgColor} /> : null}
            <LinearGradient
                colors={[bgColor, bgColor]}
                style={[
                    styles.container,
                    getContainerStyle(),
                    containerStyle,
                ]}>
                <IconButton
                    name="arrow-left"
                    sizeType="normal"
                    color={contentColor}
                    style={globalStyle.notShrink}
                    onPress={
                        onBackPress ||
                        (() => {
                            navigation.goBack();
                        })
                    }
                />
                <View style={[globalStyle.grow, styles.content, contentStyle]}>
                    {typeof children === "string" ? (
                        <ThemeText
                            fontSize="title"
                            fontWeight="bold"
                            numberOfLines={1}
                            color={
                                titleTextOpacity !== 1
                                    ? color(contentColor)
                                        .alpha(titleTextOpacity)
                                        .toString()
                                    : contentColor
                            }>
                            {children}
                        </ThemeText>
                    ) : (
                        children
                    )}
                </View>
                {actions.map((action, index) => (
                    <IconButton
                        key={index}
                        name={action.icon}
                        sizeType="normal"
                        color={contentColor}
                        style={[globalStyle.notShrink, styles.rightButton]}
                        onPress={action.onPress}
                    />
                ))}
                {actionComponent ?? null}
                {menu?.length ? (
                    <IconButton
                        name="ellipsis-vertical"
                        sizeType="normal"
                        onLayout={evt => {
                            setMenuIconLayout(evt.nativeEvent.layout);
                        }}
                        color={contentColor}
                        style={[globalStyle.notShrink, styles.rightButton]}
                        onPress={() => {
                            setShowMenu(true);
                        }}
                    />
                ) : null}
            </LinearGradient>
            <Portal>
                {showMenu ? (
                    <TouchableWithoutFeedback
                        onPress={() => {
                            setShowMenu(false);
                        }}>
                        <View style={styles.blocker} />
                    </TouchableWithoutFeedback>
                ) : null}
                <>
                    <Animated.View
                        pointerEvents={showMenu ? "auto" : "none"}
                        style={[
                            {
                                borderBottomColor: colors.background,
                                left:
                                    (menuIconLayout?.x ?? 0) +
                                    (menuIconLayout?.width ?? 0) / 2 -
                                    rpx(12),
                                top:
                                    (menuIconLayout?.y ?? 0) +
                                    (menuIconLayout?.height ?? 0) +
                                    (menuWithStatusBar
                                        ? OriginalStatusBar.currentHeight ?? 0
                                        : 0),
                            },
                            transformStyle,
                            styles.bubbleCorner,
                        ]}
                    />
                    <Animated.View
                        pointerEvents={showMenu ? "auto" : "none"}
                        style={[
                            {
                                backgroundColor: colors.background,
                                right: rpx(28),
                                top:
                                    (menuIconLayout?.y ?? 0) +
                                    (menuIconLayout?.height ?? 0) +
                                    rpx(24) +
                                    (menuWithStatusBar
                                        ? OriginalStatusBar.currentHeight ?? 0
                                        : 0),
                                shadowColor: colors.shadow,
                            },
                            transformStyle,
                            styles.menu,
                        ]}>
                        {menu.map(it =>
                            it.show !== false ? (
                                <ListItem
                                    key={it.title}
                                    withHorizontalPadding
                                    heightType="small"
                                    onPress={() => {
                                        setShowMenu(false);
                                        setTimeout(() => {
                                            it.onPress?.();
                                        }, 20);
                                    }}>
                                    <ListItem.ListItemIcon icon={it.icon} />
                                    <ListItem.Content title={it.title} />
                                </ListItem>
                            ) : null,
                        )}
                    </Animated.View>
                </>
            </Portal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        zIndex: 10000,
        height: rpx(96),
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: rpx(28),
        borderBottomLeftRadius: rpx(28),
        borderBottomRightRadius: rpx(28),
    },
    content: {
        flexDirection: "row",
        flexBasis: 0,
        alignItems: "center",
        paddingHorizontal: rpx(28),
    },
    rightButton: {
        marginLeft: rpx(32),
    },
    blocker: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 10010,
    },
    bubbleCorner: {
        position: "absolute",
        borderColor: "transparent",
        borderWidth: rpx(12),
        zIndex: 10012,
        transformOrigin: "right top",
        opacity: 0,
    },
    menu: {
        width: rpx(360),
        maxHeight: rpx(640),
        borderRadius: rpx(20),
        zIndex: 10011,
        position: "absolute",
        opacity: 0,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
});
