import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View, PanResponder, GestureResponderEvent, LayoutChangeEvent } from "react-native";
import rpx from "@/utils/rpx";
import timeformat from "@/utils/timeformat";
import TrackPlayer, { useProgress } from "@/core/trackPlayer";
import useColors from "@/hooks/useColors";

interface ITimeLabelProps {
    time: number;
    align?: "left" | "right";
}

function TimeLabel(props: ITimeLabelProps) {
    return (
        <Text style={[styles.timeText, { textAlign: props.align ?? "left", minWidth: rpx(56) }]}>
            {timeformat(Math.max(props.time, 0))}
        </Text>
    );
}

export default function SeekBar() {
    const progress = useProgress(250);
    const [tmpProgress, setTmpProgress] = useState<number | null>(null);
    const slidingRef = useRef(false);
    const trackLayoutRef = useRef({ x: 0, width: 0 });
    const trackContainerRef = useRef<View>(null);
    const rafRef = useRef<number | null>(null);
    const pendingProgressRef = useRef<number | null>(null);
    const colors = useColors();

    const currentProgress = tmpProgress ?? progress.position;
    const duration = progress.duration > 0 ? progress.duration : 0;
    const progressPercent = duration > 0
        ? currentProgress / duration
        : 0;

    const durationRef = useRef(duration);
    durationRef.current = duration;

    const calcRatio = (absoluteX: number) => {
        const { x, width } = trackLayoutRef.current;
        if (width <= 0) return 0;
        const ratio = (absoluteX - x) / width;
        return Math.max(0, Math.min(1, ratio));
    };

    const scheduleUpdate = useCallback((absoluteX: number) => {
        pendingProgressRef.current = absoluteX;
        if (rafRef.current != null) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            const absX = pendingProgressRef.current;
            pendingProgressRef.current = null;
            if (absX == null) return;
            const dur = durationRef.current;
            if (dur > 0) {
                setTmpProgress(calcRatio(absX) * dur);
            }
        });
    }, []);

    const cancelScheduledUpdate = useCallback(() => {
        if (rafRef.current != null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        pendingProgressRef.current = null;
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt: GestureResponderEvent) => {
                slidingRef.current = true;
                cancelScheduledUpdate();
                const dur = durationRef.current;
                if (dur > 0) {
                    setTmpProgress(calcRatio(evt.nativeEvent.pageX) * dur);
                }
            },
            onPanResponderMove: (evt: GestureResponderEvent) => {
                scheduleUpdate(evt.nativeEvent.pageX);
            },
            onPanResponderRelease: (evt: GestureResponderEvent) => {
                slidingRef.current = false;
                cancelScheduledUpdate();
                const dur = durationRef.current;
                const val = calcRatio(evt.nativeEvent.pageX) * dur;
                setTmpProgress(null);
                if (val >= dur - 2) {
                    TrackPlayer.seekTo(dur - 2);
                } else {
                    TrackPlayer.seekTo(val);
                }
            },
        })
    ).current;

    const onTrackLayout = (e: LayoutChangeEvent) => {
        const { width } = e.nativeEvent.layout;
        trackLayoutRef.current = { ...trackLayoutRef.current, width };
        trackContainerRef.current?.measureInWindow((x) => {
            trackLayoutRef.current = { ...trackLayoutRef.current, x };
        });
    };

    return (
        <View style={styles.wrapper}>
            <TimeLabel time={currentProgress} align="left" />
            <View
                ref={trackContainerRef}
                style={styles.trackContainer}
                onLayout={onTrackLayout}
                {...panResponder.panHandlers}>
                <View style={styles.trackBackground}>
                    <View style={[styles.trackFill, { width: `${progressPercent * 100}%`, backgroundColor: colors.primary }]} />
                </View>
                <View style={[styles.thumb, { left: `${progressPercent * 100}%`, marginLeft: rpx(-6) }]} />
            </View>
            <TimeLabel time={duration} align="right" />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        height: rpx(48),
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: rpx(48),
        gap: rpx(16),
    },
    timeText: {
        fontSize: rpx(22),
        includeFontPadding: false,
        color: "#727272",
    },
    trackContainer: {
        flex: 1,
        height: rpx(24),
        justifyContent: "center",
        alignItems: "center",
    },
    trackBackground: {
        width: "100%",
        height: rpx(4),
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: rpx(2),
        overflow: "hidden",
    },
    trackFill: {
        height: "100%",
        borderRadius: rpx(2),
    },
    thumb: {
        position: "absolute",
        width: rpx(16),
        height: rpx(16),
        borderRadius: rpx(8),
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
});
