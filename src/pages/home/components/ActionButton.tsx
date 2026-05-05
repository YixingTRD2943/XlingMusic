import ThemeText from "@/components/base/themeText";
import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon, { IIconName } from "@/components/base/icon.tsx";

interface IActionButtonProps {
    iconName: IIconName;
    iconColor?: string;
    title: string;
    subtitle?: string;
    action?: () => void;
    style?: StyleProp<ViewStyle>;
    gradientColors?: readonly string[];
}

export default function ActionButton(props: IActionButtonProps) {
    const { iconName, iconColor, title, subtitle, action, style, gradientColors } = props;
    const colors = useColors();

    const buttonColors = gradientColors || [colors.primary, colors.primary];

    return (
        <TouchableOpacity
            onPress={action}
            style={[styles.wrapper, { backgroundColor: colors.card }, style]}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${buttonColors[0]}20` }]}>
                <Icon
                    name={iconName}
                    color={iconColor || buttonColors[0]}
                    size={rpx(56)}
                />
            </View>
            <View style={styles.textContainer}>
                <ThemeText
                    fontSize="subTitle"
                    fontWeight="bold"
                    style={styles.title}
                >
                    {title}
                </ThemeText>
                {subtitle ? (
                    <ThemeText
                        fontSize="description"
                        fontColor="textSecondary"
                        style={styles.subtitle}
                    >
                        {subtitle}
                    </ThemeText>
                ) : null}
            </View>
            <Icon
                name="arrow-right-end-on-rectangle"
                size={rpx(32)}
                color={colors.textSecondary}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: rpx(24),
        paddingVertical: rpx(28),
        borderRadius: rpx(28),
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
    },
    iconContainer: {
        width: rpx(96),
        height: rpx(96),
        borderRadius: rpx(48),
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    textContainer: {
        flex: 1,
        marginLeft: rpx(20),
    },
    title: {
        marginBottom: rpx(6),
    },
    subtitle: {
        opacity: 0.7,
    },
});
