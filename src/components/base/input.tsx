import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";
import Color from "color";
import React, { useState } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
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
            <View style={[
                hasHorizontalPadding
                    ? isFocused ? styles.containerFocused : styles.container
                    : isFocused ? styles.containerWithoutPaddingFocused : styles.containerWithoutPadding,
                {
                    borderColor: isFocused ? colors.primary : colors.border,
                    backgroundColor: isFocused ? colors.background : colors.placeholder,
                },
            ]}>
                {prefix && <View style={styles.prefix}>{prefix}</View>}
                <TextInput
                    placeholderTextColor={Color(currentColor).alpha(0.4).toString()}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...restProps}
                    style={[
                        styles.input,
                        defaultStyle,
                        props?.style,
                    ]}
                />
                {suffix && <View style={styles.suffix}>{suffix}</View>}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: rpx(24),
        paddingHorizontal: rpx(32),
        borderRadius: rpx(20),
        borderWidth: rpx(1.5),
        borderStyle: "solid",
        fontSize: rpx(28),
    },
    containerWithoutPadding: {
        flexDirection: "row",
        alignItems: "center",
        padding: 0,
        borderRadius: rpx(20),
        borderWidth: rpx(1.5),
        borderStyle: "solid",
        fontSize: rpx(28),
    },
    containerFocused: {
        flexDirection: "row",
        alignItems: "center",
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
        flexDirection: "row",
        alignItems: "center",
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
    input: {
        flex: 1,
        fontSize: rpx(28),
    },
    prefix: {
        marginRight: rpx(12),
    },
    suffix: {
        marginLeft: rpx(12),
    },
});
