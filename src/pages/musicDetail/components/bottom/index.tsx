import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import rpx from "@/utils/rpx";
import SeekBar from "./seekBar";
import PlayControl from "./playControl";
import PlaybackStatus from "@/components/playbackStatus";
import useOrientation from "@/hooks/useOrientation";
import Icon from "@/components/base/icon.tsx";
import ThemeText from "@/components/base/themeText";
import useColors from "@/hooks/useColors";
import { showPanel } from "@/components/panels/usePanel";
import { useCurrentMusic } from "@/core/trackPlayer";
import { ROUTE_PATH } from "@/core/router";

function UtilityButton({
    icon,
    label,
    onPress,
}: {
    icon: any;
    label: string;
    onPress: () => void;
}) {
    const colors = useColors();
    return (
        <TouchableOpacity style={styles.utilityBtn} onPress={onPress}>
            <Icon name={icon} size={rpx(36)} color={colors.textSecondary} />
            <ThemeText fontSize="description" color={colors.textTertiary}>
                {label}
            </ThemeText>
        </TouchableOpacity>
    );
}

export default function Bottom() {
    const orientation = useOrientation();
    const colors = useColors();
    const musicItem = useCurrentMusic();

    return (
        <View
            style={[
                styles.wrapper,
                orientation === "horizontal" ? { height: rpx(200) } : undefined,
            ]}>
            <SeekBar />
            <PlaybackStatus />
            <PlayControl />
            <View style={styles.utilityRow}>
                <UtilityButton icon="lyric" label="词" onPress={() => {}} />
                <UtilityButton
                    icon="playlist"
                    label="列表"
                    onPress={() => showPanel("PlayList")}
                />
                <UtilityButton
                    icon="ellipsis-vertical"
                    label="更多"
                    onPress={() => {
                        if (musicItem) {
                            showPanel("MusicItemOptions", {
                                musicItem: musicItem,
                                from: ROUTE_PATH.MUSIC_DETAIL,
                            });
                        }
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        height: rpx(280),
    },
    utilityRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: rpx(20),
        gap: rpx(96),
    },
    utilityBtn: {
        alignItems: "center",
        justifyContent: "center",
        gap: rpx(8),
        width: rpx(80),
        height: rpx(80),
    },
});
