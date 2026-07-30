import React, { memo, useEffect, useState, useCallback } from "react";
import { ActivityIndicator, Keyboard, StyleSheet, View } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import rpx from "@/utils/rpx";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showPanel } from "../panels/usePanel";
import useColors from "@/hooks/useColors";
import TrackPlayer, { useCurrentMusic, useIsResolvingSource, useMusicState } from "@/core/trackPlayer";
import { musicIsBuffering, musicIsPaused } from "@/utils/trackUtils";
import MusicInfo from "./musicInfo";
import Icon from "@/components/base/icon.tsx";
import { TouchableOpacity } from "react-native-gesture-handler";

export interface MusicBarVisibilityState {
    visible: boolean;
    expanded: boolean;
}

function PlayPauseBtn() {
    const musicState = useMusicState();
    const isResolving = useIsResolvingSource();
    const colors = useColors();

    const isPaused = musicIsPaused(musicState);
    const isLoading = isResolving || musicIsBuffering(musicState);

    return (
        <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: colors.primary }]}
            onPress={async () => {
                if (isLoading) return;
                if (isPaused) {
                    await TrackPlayer.play();
                } else {
                    await TrackPlayer.pause();
                }
            }}
        >
            {isLoading ? (
                <ActivityIndicator color="#ffffff" size={rpx(32)} />
            ) : (
                <Icon
                    name={isPaused ? "play" : "pause"}
                    size={rpx(32)}
                    color="#ffffff"
                />
            )}
        </TouchableOpacity>
    );
}

interface MusicBarProps {
    onVisibilityChange?: (state: MusicBarVisibilityState) => void;
    shouldHide?: boolean;
}

function MusicBar({ onVisibilityChange, shouldHide = false }: MusicBarProps) {
    const musicItem = useCurrentMusic();
    const [showKeyboard, setKeyboardStatus] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    
    const colors = useColors();
    const safeAreaInsets = useSafeAreaInsets();

    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);

    const isVisible = musicItem && !showKeyboard && !shouldHide;

    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardStatus(true);
            onVisibilityChange?.({ visible: false, expanded: isExpanded });
        });
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardStatus(false);
            onVisibilityChange?.({ visible: !!musicItem, expanded: isExpanded });
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [musicItem, isExpanded, onVisibilityChange]);

    useEffect(() => {
        if (isVisible) {
            translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
            opacity.value = withSpring(1, { damping: 20, stiffness: 300 });
            onVisibilityChange?.({ visible: true, expanded: isExpanded });
        } else {
            translateY.value = withSpring(rpx(200), { damping: 20, stiffness: 300 });
            opacity.value = withSpring(0, { damping: 20, stiffness: 300 });
            onVisibilityChange?.({ visible: false, expanded: isExpanded });
        }
    }, [isVisible, isExpanded, onVisibilityChange]);

    useEffect(() => {
        if (musicItem) {
            onVisibilityChange?.({ visible: !showKeyboard && !shouldHide, expanded: isExpanded });
        }
    }, [musicItem, showKeyboard, shouldHide, isExpanded, onVisibilityChange]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    const handlePress = useCallback(() => {
        showPanel("PlayList");
    }, []);

    const handleLongPress = useCallback(() => {
        setIsExpanded(prev => !prev);
        onVisibilityChange?.({ visible: true, expanded: !isExpanded });
    }, [isExpanded, onVisibilityChange]);

    return (
        <>
            {musicItem && (
                <Animated.View style={animatedStyle}>
                    <TouchableOpacity
                        style={[
                            style.wrapper,
                            {
                                backgroundColor: colors.musicBar,
                                borderTopColor: colors.border,
                                paddingRight: safeAreaInsets.right + rpx(28),
                            },
                        ]}
                        accessible
                        accessibilityLabel={`歌曲: ${musicItem.title} 歌手: ${musicItem.artist}`}
                        onPress={handlePress}
                        onLongPress={handleLongPress}
                    >
                        <MusicInfo musicItem={musicItem} />
                        <View style={style.actionGroup}>
                            <PlayPauseBtn />
                            <TouchableOpacity
                                style={style.listBtn}
                                onPress={() => showPanel("PlayList")}
                            >
                                <Icon
                                    accessible
                                    accessibilityLabel="播放列表"
                                    name="playlist"
                                    size={rpx(44)}
                                    color={colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </>
    );
}

export default memo(MusicBar, () => true);

const style = StyleSheet.create({
    wrapper: {
        width: "100%",
        height: rpx(132),
        flexDirection: "row",
        alignItems: "center",
        paddingRight: rpx(28),
        paddingHorizontal: rpx(28),
        borderTopWidth: 1,
    },
    actionGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: rpx(20),
    },
    listBtn: {
        width: rpx(72),
        height: rpx(72),
        justifyContent: "center",
        alignItems: "center",
    },
});

const styles = StyleSheet.create({
    playBtn: {
        width: rpx(72),
        height: rpx(72),
        borderRadius: rpx(36),
        justifyContent: "center",
        alignItems: "center",
    },
});
