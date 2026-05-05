import React, { ReactNode, useState } from "react";
import {
    View,
    ViewStyle,
    StyleProp,
    TouchableOpacity,
} from "react-native";
import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";
import Animated, {
    useSharedValue,
    withSpring,
    useAnimatedStyle,
} from "react-native-reanimated";

interface IRoundedCardProps {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    padding?: boolean;
    hoverable?: boolean;
    variant?: "elevated" | "outlined" | "surface";
}

export default function RoundedCard(props: IRoundedCardProps) {
    const { children, style, onPress, padding = true, variant = "elevated" } = props;
    const colors = useColors();
    const scale = useSharedValue(1);
    const [_isPressed, setIsPressed] = useState(false);

    const handlePressIn = () => {
        setIsPressed(true);
        if (onPress) {
            scale.value = withSpring(0.98, { damping: 20, stiffness: 300 });
        }
    };

    const handlePressOut = () => {
        setIsPressed(false);
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const getCardStyle = (): ViewStyle => {
        switch (variant) {
        case "outlined":
            return {
                backgroundColor: "transparent",
                borderWidth: rpx(1),
                borderColor: colors.border,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0,
                shadowRadius: 0,
                elevation: 0,
            };
        case "surface":
            return {
                backgroundColor: colors.background,
                borderWidth: 0,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
            };
        default:
            return {
                backgroundColor: colors.card,
                borderWidth: 0,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 6,
            };
        }
    };

    const cardStyle: ViewStyle = {
        ...getCardStyle(),
        borderRadius: rpx(24),
        padding: padding ? rpx(28) : 0,
        shadowColor: colors.shadow,
    };

    const innerContent = (
        <Animated.View style={[animatedStyle]}>
            <View style={[cardStyle, style]}>
                {children}
            </View>
        </Animated.View>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}>
                {innerContent}
            </TouchableOpacity>
        );
    }

    return innerContent;
}
