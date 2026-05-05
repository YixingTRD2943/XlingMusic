import { useI18N } from "@/core/i18n";
import { ROUTE_PATH, useNavigate } from "@/core/router";
import rpx from "@/utils/rpx";
import React from "react";
import { StyleSheet, View } from "react-native";
import ActionButton from "../ActionButton";
import useColors from "@/hooks/useColors";

export default function Operations() {
    const navigate = useNavigate();
    const { t } = useI18N();
    const colors = useColors();

    const actionButtons = [
        {
            iconName: "fire",
            title: t("home.recommendSheet"),
            subtitle: "发现新歌",
            gradientColors: ["#FF6B6B", "#FF8E53"],
            action() {
                navigate(ROUTE_PATH.RECOMMEND_SHEETS);
            },
        },
        {
            iconName: "trophy",
            title: t("home.topList"),
            subtitle: "热门排行",
            gradientColors: ["#FFE66D", "#FFD166"],
            action() {
                navigate(ROUTE_PATH.TOP_LIST);
            },
        },
        {
            iconName: "clock-outline",
            title: t("home.playHistory"),
            subtitle: "最近播放",
            gradientColors: ["#4ECDC4", "#44A08D"],
            action() {
                navigate(ROUTE_PATH.HISTORY);
            },
        },
        {
            iconName: "folder-music-outline",
            title: t("home.localMusic"),
            subtitle: "本地文件",
            gradientColors: ["#A8E6CF", "#88D8B0"],
            action() {
                navigate(ROUTE_PATH.LOCAL);
            },
        },
    ] as const;

    return (
        <View style={styles.container}>
            {actionButtons.map((action, index) => (
                <ActionButton
                    style={[
                        styles.actionButtonStyle,
                        index > 0 ? styles.actionMarginTop : null,
                    ]}
                    key={action.title}
                    {...action}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: rpx(28),
        marginBottom: rpx(36),
    },
    actionButtonStyle: {
        width: "100%",
    },
    actionMarginTop: {
        marginTop: rpx(20),
    },
});
