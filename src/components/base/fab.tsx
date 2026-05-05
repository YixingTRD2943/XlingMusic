import React, { useState } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";
import { iconSizeConst } from "@/constants/uiConst";
import Icon, { IIconName } from "@/components/base/icon.tsx";
import Animated, {
    useSharedValue,
    withSpring,
    useAnimatedStyle,
} from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";

interface IFabProps {
    icon?: IIconName;
    onPress?: () => void;
    position?: "right-bottom" | "left-bottom" | "center-bottom";
    mini?: boolean;
    color?: string;
}
export default function Fab(props: IFabProps) {
    const { icon, onPress, position = "right-bottom", mini = false, color } = props;

    const colors = useColors();
    const scale = useSharedValue(1);
    const [isPressed, setIsPressed] = useState(false);

    const handlePress = () => {
        scale.value = withSpring(0.95);
        setTimeout(() => {
            scale.value = withSpring(1);
        }, 150);
        onPress?.();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const fabColor = color || colors.primary;
    const fabSize = mini ? rpx(80) : rpx(112);
    const fabRadius = mini ? rpx(40) : rpx(56);

    const positionStyles: Record<string, ViewStyle> = {
        "left-bottom": { left: rpx(40) },
        "center-bottom": { left: rpx(50), marginLeft: -fabSize / 2 },
        "right-bottom": { right: rpx(40) },
    };

    return (
        <Animated.View style={[animatedStyle]}>
            <Pressable
                onPress={handlePress}
                onHoverIn={() => !isPressed && (scale.value = withSpring(1.05))}
                onHoverOut={() => scale.value = withSpring(1)}
                onTouchStart={() => setIsPressed(true)}
                onTouchEnd={() => setIsPressed(false)}
                style={[
                    styles.container,
                    positionStyles[position],
                    {
                        width: fabSize,
                        height: fabSize,
                        borderRadius: fabRadius,
                        shadowColor: fabColor as string,
                    },
                ]}>
                <LinearGradient
                    colors={[fabColor as string, fabColor as string]}
                    start={{ x: 0.3, y: 0.3 }}
                    end={{ x: 0.7, y: 0.7 }}
                    style={{ borderRadius: fabRadius, width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                    {icon ? (
                        <Icon
                            name={icon}
                            color="#ffffff"
                            size={mini ? iconSizeConst.small : iconSizeConst.normal}
                        />
                    ) : null}
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        zIndex: 10010,
        bottom: rpx(80),
        justifyContent: "center",
        alignItems: "center",
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 16,
    },
});
