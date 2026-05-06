import React, { useMemo } from "react";
import rpx from "@/utils/rpx";
import { ImgAsset } from "@/constants/assetsConst";
import FastImage from "@/components/base/fastImage";
import useOrientation from "@/hooks/useOrientation";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useCurrentMusic, useMusicState } from "@/core/trackPlayer";
import globalStyle from "@/constants/globalStyle";
import { View, StyleSheet } from "react-native";
import Operations from "./operations";
import { showPanel } from "@/components/panels/usePanel.ts";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from "react-native-reanimated";
import { musicIsPaused } from "@/utils/trackUtils";
import FloatingNotes from "./floatingNotes";

interface IProps {
    onTurnPageClick?: () => void;
}

export default function AlbumCover(props: IProps) {
    const { onTurnPageClick } = props;

    const musicItem = useCurrentMusic();
    const orientation = useOrientation();
    const musicState = useMusicState();
    const isPaused = musicIsPaused(musicState);

    const rotation = useSharedValue(0);

    const artworkSize = useMemo(() => {
        if (orientation === "vertical") {
            return rpx(500);
        } else {
            return rpx(260);
        }
    }, [orientation]);

    if (!isPaused) {
        rotation.value = withRepeat(
            withTiming(360, { duration: 20000, easing: Easing.linear }),
            -1,
            false,
        );
    } else {
        rotation.value = withTiming(rotation.value, { duration: 0 });
    }

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const longPress = Gesture.LongPress()
        .onStart(() => {
            if (musicItem?.artwork) {
                showPanel("ImageViewer", {
                    url: musicItem.artwork,
                });
            }
        })
        .runOnJS(true);

    const tap = Gesture.Tap()
        .onStart(() => {
            onTurnPageClick?.();
        })
        .runOnJS(true);

    const combineGesture = Gesture.Race(tap, longPress);

    return (
        <>
            <View style={globalStyle.fullCenter}>
                <View style={[styles.albumWrapper, { width: artworkSize, height: artworkSize }]}>
                    <GestureDetector gesture={combineGesture}>
                        <Animated.View style={animatedStyle}>
                            <FastImage
                                style={[styles.albumCover, { width: artworkSize, height: artworkSize }]}
                                source={musicItem?.artwork}
                                placeholderSource={ImgAsset.albumDefault}
                            />
                        </Animated.View>
                    </GestureDetector>
                    <FloatingNotes isPaused={isPaused} size={artworkSize} />
                </View>
            </View>
            <Operations />
        </>
    );
}

const styles = StyleSheet.create({
    albumWrapper: {
        borderRadius: rpx(250),
        overflow: "hidden",
        shadowColor: "rgba(0, 0, 0, 0.5)",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 20,
    },
    albumCover: {
        borderRadius: rpx(250),
    },
});
