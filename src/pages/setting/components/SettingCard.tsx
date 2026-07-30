import React, { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import useColors from "@/hooks/useColors";

interface SettingCardProps {
    children: ReactNode;
    style?: ViewStyle;
}

export default function SettingCard(props: SettingCardProps) {
    const colors = useColors();
    return (
        <View style={[styles.card, { backgroundColor: colors.card }, props.style]}>
            {props.children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 14,
        overflow: "hidden",
        marginHorizontal: 16,
    },
});