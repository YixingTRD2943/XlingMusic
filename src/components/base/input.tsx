import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";
import Color from "color";
import React, { useState } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
} from "react-native-reanimated";

interface IInputProps extends TextInputProps {
    fontColor?: string;
    hasHorizontalPadding?: boolean;
    onFocusChange?: (focused: boolean) => void;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
}

export default function Input(props: IInputProps) {
    const { fontColor, hasHorizontalPadding = true, onFocusChange, prefix, suffix, ...restProps } = props;
    const colors = useColors();
    const [isFocused, setIsFocused] = useState(false);
    const scale = useSharedValue(1);

    const currentColor = fontColor ?? colors.text;

    const defaultStyle = {
        color: currentColor,
    };

    const handleFocus = () => {
        setIsFocused(true);
        scale.value = withTiming(1.01, { duration: 200 });
        onFocusChange?.(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        scale.value = withTiming(1, { duration: 200 });
        onFocusChange?.(false);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[animatedStyle]}>
            <TextInput
                placeholderTextColor={Color(currentColor).alpha(0.4).toString()}
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...restProps}
                style={[
                    hasHorizontalPadding
                        ? isFocused ? styles.containerFocused : styles.container
                        : isFocused ? styles.containerWithoutPaddingFocused : styles.containerWithoutPadding,
                    {
                        borderColor: isFocused ? colors.primary : colors.border,
                        backgroundColor: isFocused ? colors.background : colors.placeholder,
                    },
                    defaultStyle,
                    props?.style,
                ]}>
                {prefix}
                {suffix}
            </TextInput>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: rpx(24),
        paddingHorizontal: rpx(32),
        borderRadius: rpx(20),
        borderWidth: rpx(1.5),
        borderStyle: "solid",
        fontSize: rpx(28),
    },
    containerWithoutPadding: {
        padding: 0,
        borderRadius: rpx(20),
        borderWidth: rpx(1.5),
        borderStyle: "solid",
        fontSize: rpx(28),
    },
    containerFocused: {
        paddingVertical: rpx(24),
        paddingHorizontal: rpx(32),
        borderRadius: rpx(24),
        borderWidth: rpx(2),
        borderStyle: "solid",
        fontSize: rpx(28),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    containerWithoutPaddingFocused: {
        padding: 0,
        borderRadius: rpx(24),
        borderWidth: rpx(2),
        borderStyle: "solid",
        fontSize: rpx(28),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
});
