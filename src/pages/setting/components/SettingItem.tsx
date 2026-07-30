import React, { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from "react-native";
import useColors from "@/hooks/useColors";
import Icon from "@/components/base/icon.tsx";

interface SettingItemProps {
    title: string;
    right?: ReactNode;
    onPress?: () => void;
    hasDivider?: boolean;
    description?: string;
    style?: ViewStyle;
    titleStyle?: TextStyle;
}

export default function SettingItem(props: SettingItemProps) {
    const colors = useColors();
    const { title, right, onPress, hasDivider = true, description, style, titleStyle } = props;

    return (
        <TouchableOpacity
            style={[styles.item, style]}
            onPress={onPress}
            activeOpacity={0.7}>
            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: colors.text }, titleStyle]}>
                        {title}
                    </Text>
                    {description && (
                        <Text style={[styles.description, { color: colors.textTertiary }]}>
                            {description}
                        </Text>
                    )}
                </View>
                <View style={styles.rightContainer}>
                    {right}
                    {!right && onPress && (
                        <Icon
                            name="chevron-right"
                            size={16}
                            color={colors.textTertiary}
                        />
                    )}
                </View>
            </View>
            {hasDivider && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    item: {
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    content: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    titleContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        minWidth: 0,
    },
    title: {
        fontSize: 15,
        fontWeight: "400",
        flexShrink: 1,
    },
    description: {
        fontSize: 12,
        marginTop: 2,
    },
    rightContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        flexShrink: 0,
        justifyContent: "flex-end",
        minWidth: 0,
    },
    divider: {
        height: 1,
        marginTop: 14,
        marginHorizontal: -20,
        marginBottom: -14,
    },
});