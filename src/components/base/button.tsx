import {
    GestureResponderEvent,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from "react-native";
import useColors from "@/hooks/useColors.ts";
import ThemeText from "@/components/base/themeText.tsx";
import React, { useState } from "react";
import rpx from "@/utils/rpx.ts";
import LinearGradient from "react-native-linear-gradient";

export function Button(props: {
    type?: "normal" | "primary" | "secondary" | "outline" | "ghost";
    text: string;
    style?: StyleProp<ViewStyle>;
    onPress?: (evt: GestureResponderEvent) => void;
    disabled?: boolean;
}) {
    const { type = "primary", text, style, onPress, disabled = false } = props;
    const colors = useColors();
    const [isPressed, setIsPressed] = useState(false);

    const getButtonStyle = () => {
        switch (type) {
            case "primary":
                return {
                    gradientColors: [colors.primary as string, colors.primary as string],
                    textColor: "#ffffff",
                    shadowColor: colors.primary,
                    backgroundColor: "transparent",
                    borderWidth: 0,
                };
            case "secondary":
                return {
                    gradientColors: ["#f5f5f5", "#e8e8e8"],
                    textColor: colors.text,
                    shadowColor: "#ccc",
                    backgroundColor: "transparent",
                    borderWidth: 0,
                };
            case "outline":
                return {
                    gradientColors: ["transparent", "transparent"],
                    textColor: colors.primary,
                    shadowColor: "transparent",
                    backgroundColor: "transparent",
                    borderWidth: rpx(2),
                    borderColor: colors.primary,
                };
            case "ghost":
                return {
                    gradientColors: ["transparent", "transparent"],
                    textColor: colors.text,
                    shadowColor: "transparent",
                    backgroundColor: colors.background,
                    borderWidth: 0,
                };
            default:
                return {
                    gradientColors: [colors.placeholder as string, colors.placeholder as string],
                    textColor: colors.text,
                    shadowColor: colors.shadow,
                    backgroundColor: "transparent",
                    borderWidth: 0,
                };
        }
    };

    const buttonStyle = getButtonStyle();

    return (
        <TouchableOpacity
            activeOpacity={disabled ? 1 : 0.7}
            onPress={onPress}
            disabled={disabled}
            onPressIn={() => !disabled && setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            style={[
                styles.bottomBtn,
                {
                    shadowColor: buttonStyle.shadowColor,
                    transform: isPressed && !disabled ? [{ scale: 0.98 }] : undefined,
                    opacity: disabled ? 0.5 : 1,
                },
                style,
            ]}>
            <LinearGradient
                colors={buttonStyle.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.gradient,
                    type === "outline" && { borderWidth: buttonStyle.borderWidth, borderColor: buttonStyle.borderColor },
                ]}>
                <ThemeText color={buttonStyle.textColor} style={styles.text}>
                    {text}
                </ThemeText>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    bottomBtn: {
        borderRadius: rpx(28),
        flexShrink: 0,
        justifyContent: "center",
        alignItems: "center",
        height: rpx(88),
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 6,
        overflow: "hidden",
    },
    gradient: {
        width: "100%",
        height: "100%",
        borderRadius: rpx(28),
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: rpx(32),
    },
    text: {
        fontSize: rpx(32),
        fontWeight: "600",
        letterSpacing: rpx(1),
    },
});
