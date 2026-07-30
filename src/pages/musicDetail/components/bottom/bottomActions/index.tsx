import React from "react";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import Icon from "@/components/base/icon.tsx";
import ThemeText from "@/components/base/themeText";
import { showPanel } from "@/components/panels/usePanel";
import { useCurrentMusic } from "@/core/trackPlayer";
import { ROUTE_PATH } from "@/core/router";

export default function BottomActions() {
    const musicItem = useCurrentMusic();

    return (
        <View style={styles.container}>
            <View style={styles.actionItem}>
                <Icon
                    name="font-size"
                    size={rpx(40)}
                    color="#b3b3b3"
                />
                <ThemeText
                    fontSize="description"
                    fontColor="textSecondary"
                    style={styles.actionLabel}
                    color="#727272"
                >
                    词
                </ThemeText>
            </View>
            <View style={styles.actionItem}>
                <Icon
                    name="playlist"
                    size={rpx(40)}
                    color="#b3b3b3"
                    onPress={() => {
                        showPanel("PlayList");
                    }}
                />
                <ThemeText
                    fontSize="description"
                    fontColor="textSecondary"
                    style={styles.actionLabel}
                    color="#727272"
                >
                    列表
                </ThemeText>
            </View>
            <View style={styles.actionItem}>
                <Icon
                    name="ellipsis-horizontal"
                    size={rpx(40)}
                    color="#b3b3b3"
                    onPress={() => {
                        if (musicItem) {
                            showPanel("MusicItemOptions", {
                                musicItem: musicItem,
                                from: ROUTE_PATH.MUSIC_DETAIL,
                            });
                        }
                    }}
                />
                <ThemeText
                    fontSize="description"
                    fontColor="textSecondary"
                    style={styles.actionLabel}
                    color="#727272"
                >
                    更多
                </ThemeText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginTop: rpx(40),
    },
    actionItem: {
        flexDirection: "column",
        alignItems: "center",
        gap: rpx(8),
    },
    actionLabel: {
        fontSize: rpx(22),
    },
});