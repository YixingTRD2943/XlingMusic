import repeatModeConst from "@/constants/repeatModeConst";
import rpx from "@/utils/rpx";
import React from "react";
import { InteractionManager, StyleSheet, View, TouchableOpacity } from "react-native";

import Icon from "@/components/base/icon.tsx";
import TrackPlayer, { useMusicState, useRepeatMode } from "@/core/trackPlayer";
import useOrientation from "@/hooks/useOrientation";
import delay from "@/utils/delay";
import { musicIsPaused } from "@/utils/trackUtils";
import useColors from "@/hooks/useColors";

export default function PlayControl() {
    const repeatMode = useRepeatMode();
    const musicState = useMusicState();
    const colors = useColors();
    const orientation = useOrientation();
    const isPaused = musicIsPaused(musicState);

    return (
        <View
            style={[
                styles.wrapper,
                orientation === "horizontal" ? { marginTop: 0 } : null,
            ]}>
            <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={async () => {
                    InteractionManager.runAfterInteractions(async () => {
                        await delay(20, false);
                        TrackPlayer.toggleRepeatMode();
                    });
                }}>
                <Icon
                    color={colors.textSecondary}
                    name={repeatModeConst[repeatMode].icon}
                    size={rpx(44)}
                />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => TrackPlayer.skipToPrevious()}>
                <Icon
                    color="#ffffff"
                    name="skip-left"
                    size={rpx(56)}
                />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.playBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                    if (isPaused) {
                        TrackPlayer.play();
                    } else {
                        TrackPlayer.pause();
                    }
                }}>
                <Icon
                    color={colors.text}
                    name={isPaused ? "play" : "pause"}
                    size={rpx(48)}
                />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => TrackPlayer.skipToNext()}>
                <Icon
                    color="#ffffff"
                    name="skip-right"
                    size={rpx(56)}
                />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={async () => {
                    InteractionManager.runAfterInteractions(async () => {
                        await delay(20, false);
                        TrackPlayer.toggleRepeatMode();
                    });
                }}>
                <Icon
                    color={colors.textSecondary}
                    name={repeatModeConst[repeatMode].icon}
                    size={rpx(44)}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        marginTop: rpx(24),
        height: rpx(120),
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: rpx(32),
    },
    secondaryBtn: {
        width: rpx(72),
        height: rpx(72),
        justifyContent: "center",
        alignItems: "center",
    },
    skipBtn: {
        width: rpx(88),
        height: rpx(88),
        justifyContent: "center",
        alignItems: "center",
    },
    playBtn: {
        width: rpx(112),
        height: rpx(112),
        borderRadius: rpx(56),
        justifyContent: "center",
        alignItems: "center",
    },
});
