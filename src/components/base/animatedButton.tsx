import React, { useRef } from "react";
import {
    GestureResponderEvent,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    Animated,
} from "react-native";
import useColors from "@/hooks/useColors.ts";
import ThemeText from "@/components/base/themeText.tsx";
import rpx from "@/utils/rpx.ts";

interface IAnimatedButtonProps {
    type?: "normal" | "primary";
    text: string;
    style?: StyleProp<ViewStyle>;
    onPress?: (evt: GestureResponderEvent) => void;
}

export default function AnimatedButton(props: IAnimatedButtonProps) {
    const { type = "normal", text, style, onPress } = props;
    const colors = useColors();
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
            friction: 8,
            tension: 100,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
            tension: 100,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.container,
                    {
                        backgroundColor:
                            type === "normal" ? colors.placeholder : colors.primary,
                        shadowColor: type === "normal" ? colors.shadow : colors.primary,
                    },
                    style,
                ]}>
                <ThemeText color={type === "normal" ? undefined : "white"}>
                    {text}
                </ThemeText>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: rpx(16),
        flexShrink: 0,
        justifyContent: "center",
        alignItems: "center",
        height: rpx(80),
        paddingHorizontal: rpx(32),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
});