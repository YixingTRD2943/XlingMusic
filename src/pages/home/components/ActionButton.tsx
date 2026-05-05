import ThemeText from "@/components/base/themeText";
import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";
import React, { useState } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon, { IIconName } from "@/components/base/icon.tsx";
import Animated, {
    useSharedValue,
    withSpring,
    useAnimatedStyle,
} from "react-native-reanimated";

interface IActionButtonProps {
    iconName: IIconName;
    iconColor?: string;
    title: string;
    action?: () => void;
    style?: StyleProp<ViewStyle>;
}

export default function ActionButton(props: IActionButtonProps) {
    const { iconName, iconColor, title, action, style } = props;
    const colors = useColors();
    const [isPressed, setIsPressed] = useState(false);
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        setIsPressed(true);
        scale.value = withSpring(0.95, { damping: 25, stiffness: 350 });
    };

    const handlePressOut = () => {
        setIsPressed(false);
        scale.value = withSpring(1, { damping: 25, stiffness: 350 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[animatedStyle]}>
            <TouchableOpacity
                onPress={action}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.85}
                style={[
                    styles.wrapper,
                    {
                        backgroundColor: colors.card,
                        shadowColor: colors.primary,
                    },
                    style,
                ]}>
                <Icon
                    accessible={false}
                    name={iconName}
                    color={iconColor ?? colors.primary}
                    size={rpx(64)}
                />
                <ThemeText
                    accessible={false}
                    fontSize="subTitle"
                    fontWeight="semibold"
                    style={styles.text}>
                    {title}
                </ThemeText>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: rpx(150),
        height: rpx(168),
        borderRadius: rpx(28),
        flexGrow: 1,
        flexShrink: 0,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    text: {
        marginTop: rpx(16),
    },
});
