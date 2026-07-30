import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import ThemeText from "@/components/base/themeText";
import useColors from "@/hooks/useColors";
import TrackPlayer, { useIsResolvingSource, useMusicState } from "@/core/trackPlayer";
import { musicIsBuffering } from "@/utils/trackUtils";

const resolvingMessages = [
    "正在疯狂寻找音源…",
    "正在为主人匹配音源~",
    "音源正在赶来的路上~",
    "小音源马上就到！",
    "正在全力搜索中…",
    "音源君加油冲刺中！",
    "马上就找到了，再等等哦~",
];

const bufferingMessages = [
    "网络有点小卡顿，不过马上就好了~",
    "网络君在加油…",
    "网速有点慢，再等等哦~",
    "信号正在努力追赶…",
    "网络正在疏通中…",
    "稍等片刻，马上恢复~",
];

function randomItem(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)];
}

export default function PlaybackStatus() {
    const isResolving = useIsResolvingSource();
    const musicState = useMusicState();
    const colors = useColors();
    const isBuffering = !isResolving && musicIsBuffering(musicState);

    const [message, setMessage] = useState("");
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isResolving || isBuffering) {
            setMessage(isResolving ? randomItem(resolvingMessages) : randomItem(bufferingMessages));
            intervalRef.current = setInterval(() => {
                setMessage(isResolving ? randomItem(resolvingMessages) : randomItem(bufferingMessages));
            }, 3000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setMessage("");
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isResolving, isBuffering]);

    if (!message) return null;

    return (
        <View style={styles.wrapper}>
            <ThemeText
                fontSize="description"
                fontColor="textSecondary"
                style={styles.text}
            >
                {message}
            </ThemeText>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: rpx(8),
        height: rpx(36),
    },
    text: {
        textAlign: "center",
    },
});
