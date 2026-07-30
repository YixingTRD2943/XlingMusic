import React, { useMemo } from "react";
import rpx from "@/utils/rpx";
import { ImgAsset } from "@/constants/assetsConst";
import FastImage from "@/components/base/fastImage";
import useOrientation from "@/hooks/useOrientation";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useCurrentMusic } from "@/core/trackPlayer";
import globalStyle from "@/constants/globalStyle";
import { View, StyleSheet } from "react-native";
import Operations from "./operations";
import { showPanel } from "@/components/panels/usePanel.ts";

interface IProps {
    onTurnPageClick?: () => void;
}

export default function AlbumCover(props: IProps) {
    const { onTurnPageClick } = props;

    const musicItem = useCurrentMusic();
    const orientation = useOrientation();

    const artworkSize = useMemo(() => {
        if (orientation === "vertical") {
            return rpx(520);
        } else {
            return rpx(260);
        }
    }, [orientation]);

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
                        <View>
                            <FastImage
                                style={[styles.albumCover, { width: artworkSize, height: artworkSize }]}
                                source={musicItem?.artwork}
                                placeholderSource={ImgAsset.albumDefault}
                            />
                        </View>
                    </GestureDetector>
                </View>
            </View>
            <Operations />
        </>
    );
}

const styles = StyleSheet.create({
    albumWrapper: {
        borderRadius: rpx(32),
        overflow: "hidden",
        shadowColor: "rgba(0, 0, 0, 0.4)",
        shadowOffset: { width: 0, height: rpx(20) },
        shadowOpacity: 0.4,
        shadowRadius: rpx(40),
        elevation: 20,
    },
    albumCover: {
        borderRadius: rpx(32),
    },
});
