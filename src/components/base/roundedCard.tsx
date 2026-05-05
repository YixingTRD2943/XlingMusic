import React, { ReactNode } from "react";
import {
    View,
    ViewStyle,
    StyleProp,
    TouchableOpacity,
} from "react-native";
import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";

interface IRoundedCardProps {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    padding?: boolean;
}

export default function RoundedCard(props: IRoundedCardProps) {
    const { children, style, onPress, padding = true } = props;
    const colors = useColors();

    const cardStyle: ViewStyle = {
        backgroundColor: colors.card,
        borderRadius: rpx(20),
        padding: padding ? rpx(24) : 0,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    };

    if (onPress) {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                style={[cardStyle, style]}>
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={[cardStyle, style]}>{children}</View>;
}