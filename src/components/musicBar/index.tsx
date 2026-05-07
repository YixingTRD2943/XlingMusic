import React, { memo, useEffect, useState, useCallback } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import rpx from "@/utils/rpx";
import { CircularProgressBase } from "react-native-circular-progress-indicator";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showPanel } from "../panels/usePanel";
import useColors from "@/hooks/useColors";
import IconButton from "../base/iconButton";
import TrackPlayer, { useCurrentMusic, useMusicState, useProgress } from "@/core/trackPlayer";
import { musicIsPaused } from "@/utils/trackUtils";
import MusicInfo from "./musicInfo";
import Icon from "@/components/base/icon.tsx";
import { TouchableOpacity } from "react-native-gesture-handler";

export interface MusicBarVisibilityState {
    visible: boolean;
    expanded: boolean;
}

function CircularPlayBtn() {
    const progress = useProgress();
    const musicState = useMusicState();
    const colors = useColors();

    const isPaused = musicIsPaused(musicState);

    return (
        <CircularProgressBase
            activeStrokeWidth={rpx(4)}
            inActiveStrokeWidth={rpx(2)}
            inActiveStrokeOpacity={0.2}
            value={
                progress?.duration
                    ? (100 * progress.position) / progress.duration
                    : 0
            }
            duration={100}
            radius={rpx(36)}
            activeStrokeColor={colors.primary}
            inActiveStrokeColor={colors.textSecondary}>
            <IconButton
                accessibilityLabel={"播放或暂停歌曲"}
                name={isPaused ? "play" : "pause"}
                sizeType={"normal"}
                hitSlop={{
                    top: 10,
                    left: 10,
                    right: 10,
                    bottom: 10,
                }}
                color={colors.primary}
                onPress={async () => {
                    if (isPaused) {
                        await TrackPlayer.play();
                    } else {
                        await TrackPlayer.pause();
                    }
                }}
            />
        </CircularProgressBase>
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
                                paddingRight: safeAreaInsets.right + rpx(28),
                                shadowColor: colors.shadow,
                            },
                        ]}
                        accessible
                        accessibilityLabel={`歌曲: ${musicItem.title} 歌手: ${musicItem.artist}`}
                        onPress={handlePress}
                        onLongPress={handleLongPress}
                    >
                        <MusicInfo musicItem={musicItem} />
                        <View style={style.actionGroup}>
                            <CircularPlayBtn />
                            <Icon
                                accessible
                                accessibilityLabel="播放列表"
                                name="playlist"
                                size={rpx(56)}
                                onPress={() => {
                                    showPanel("PlayList");
                                }}
                                color={colors.text}
                                style={[style.actionIcon]}
                            />
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
        height: rpx(140),
        flexDirection: "row",
        alignItems: "center",
        paddingRight: rpx(28),
        paddingHorizontal: rpx(28),
        borderTopLeftRadius: rpx(28),
        borderTopRightRadius: rpx(28),
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
    actionGroup: {
        width: rpx(200),
        justifyContent: "flex-end",
        flexDirection: "row",
        alignItems: "center",
    },
    actionIcon: {
        marginLeft: rpx(40),
    },
});
