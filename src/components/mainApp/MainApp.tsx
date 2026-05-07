import React, { useState } from "react";
import { StyleSheet, View, SafeAreaView } from "react-native";
import { BottomNavigation, TabType } from "../bottomNavigation";
import HomePage from "@/pages/home";
import HistoryPage from "@/pages/history";
import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";

export default function MainApp() {
    const [activeTab, setActiveTab] = useState<TabType>("home");
    const colors = useColors();

    const renderPage = () => {
        switch (activeTab) {
        case "home":
            return <HomePage />;
        case "profile":
            return <HistoryPage />;
        default:
            return <HomePage />;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>{renderPage()}</View>
            <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    content: {
        flex: 1,
        paddingBottom: rpx(120),
    },
});