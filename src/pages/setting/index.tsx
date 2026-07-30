import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import settingTypes from "./settingTypes";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBar from "@/components/base/statusBar";
import { useParams } from "@/core/router";
import HorizontalSafeAreaView from "@/components/base/horizontalSafeAreaView.tsx";
import AppBar from "@/components/base/appBar";
import { useI18N } from "@/core/i18n";
import SettingTabs from "./components/SettingTabs";
import GeneralTab from "./components/tabs/GeneralTab";
import PlaybackTab from "./components/tabs/PlaybackTab";
import DownloadTab from "./components/tabs/DownloadTab";

type TabType = "general" | "playback" | "download";

export default function Setting() {
    const params = useParams<"setting">();
    const type = params?.type || "basic";
    const settingItem = settingTypes[type] || settingTypes.basic;

    const { t } = useI18N();
    const [activeTab, setActiveTab] = useState<TabType>("general");

    const renderTabContent = () => {
        switch (activeTab) {
        case "general":
            return <GeneralTab />;
        case "playback":
            return <PlaybackTab />;
        case "download":
            return <DownloadTab />;
        default:
            return <GeneralTab />;
        }
    };

    if (type !== "basic") {
        return (
            <SafeAreaView edges={["bottom", "top"]} style={style.wrapper}>
                <StatusBar />
                {settingItem?.showNav === false ? null : (
                    <AppBar>{t(settingItem?.i18nKey as any)}</AppBar>
                )}
                {settingItem?.component && type === "plugin" ? (
                    <settingItem.component />
                ) : (
                    <HorizontalSafeAreaView style={style.wrapper}>
                        {settingItem?.component && <settingItem.component />}
                    </HorizontalSafeAreaView>
                )}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={["bottom", "top"]} style={style.wrapper}>
            <StatusBar />
            <AppBar>{t("basicSettings.title")}</AppBar>
            <HorizontalSafeAreaView style={style.wrapper}>
                <View style={style.container}>
                    <SettingTabs activeTab={activeTab} onTabChange={setActiveTab} />
                    <View style={style.content}>{renderTabContent()}</View>
                </View>
            </HorizontalSafeAreaView>
        </SafeAreaView>
    );
}

const style = StyleSheet.create({
    wrapper: {
        width: "100%",
        flex: 1,
    },
    container: {
        flex: 1,
        flexDirection: "column",
    },
    content: {
        flex: 1,
    },
});