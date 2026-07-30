import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useColors from "@/hooks/useColors";

type TabType = "general" | "playback" | "download";

interface SettingTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const tabs: { key: TabType; label: string }[] = [
    { key: "general", label: "常规" },
    { key: "playback", label: "播放" },
    { key: "download", label: "下载" },
];

export default function SettingTabs(props: SettingTabsProps) {
    const colors = useColors();
    const { activeTab, onTabChange } = props;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.tabItem}
                        onPress={() => onTabChange(tab.key)}
                        activeOpacity={0.7}>
                        <Text
                            style={[
                                styles.tabText,
                                {
                                    color:
                                        activeTab === tab.key
                                            ? colors.text
                                            : colors.textSecondary,
                                },
                            ]}>
                            {tab.label}
                        </Text>
                        {activeTab === tab.key && (
                            <View
                                style={[
                                    styles.tabIndicator,
                                    { backgroundColor: colors.primary },
                                ]}
                            />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 10,
    },
    tabs: {
        flexDirection: "row",
        alignItems: "center",
        height: 44,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    tabItem: {
        flex: 1,
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    tabText: {
        fontSize: 15,
        fontWeight: "500",
    },
    tabIndicator: {
        position: "absolute",
        bottom: 0,
        width: 24,
        height: 2.5,
        borderRadius: 9999,
    },
});