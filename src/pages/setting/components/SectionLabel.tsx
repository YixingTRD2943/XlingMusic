import React from "react";
import { StyleSheet, Text, View } from "react-native";
import useColors from "@/hooks/useColors";

interface SectionLabelProps {
    text: string;
}

export default function SectionLabel(props: SectionLabelProps) {
    const colors = useColors();
    return (
        <View style={styles.container}>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
                {props.text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        marginBottom: 8,
        paddingLeft: 20,
        paddingRight: 16,
    },
    text: {
        fontSize: 13,
        fontWeight: "600",
    },
});