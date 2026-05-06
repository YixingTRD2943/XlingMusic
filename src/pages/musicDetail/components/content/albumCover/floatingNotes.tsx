import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import rpx from "@/utils/rpx";
import Icon from "@/components/base/icon";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    cancelAnimation,
} from "react-native-reanimated";

interface INote {
    id: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
    size: number;
}

interface IFloatingNotesProps {
    isPaused: boolean;
    size: number;
}

export default function FloatingNotes(props: IFloatingNotesProps) {
    const { isPaused, size } = props;
    const notesRef = useRef<INote[]>([]);
    const noteCount = 8;

    useEffect(() => {
        const notes: INote[] = [];
        for (let i = 0; i < noteCount; i++) {
            notes.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                delay: Math.random() * 2000,
                duration: 3000 + Math.random() * 2000,
                size: rpx(24) + Math.random() * rpx(16),
            });
        }
        notesRef.current = notes;
    }, []);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {notesRef.current.map((note) => (
                <FloatingNote
                    key={note.id}
                    note={note}
                    isPaused={isPaused}
                    containerSize={size}
                />
            ))}
        </View>
    );
}

interface IFloatingNoteProps {
    note: INote;
    isPaused: boolean;
    containerSize: number;
}

function FloatingNote(props: IFloatingNoteProps) {
    const { note, isPaused, containerSize } = props;

    const offsetY = useSharedValue(containerSize);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.5);
    const wobble = useSharedValue(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isPaused) {
            timerRef.current = setTimeout(() => {
                offsetY.value = withRepeat(
                    withTiming(-note.size, {
                        duration: note.duration,
                        easing: Easing.out(Easing.cubic),
                    }),
                    -1,
                    true,
                );

                opacity.value = withRepeat(
                    withTiming(0, { duration: 500 }),
                    -1,
                    true,
                );
                opacity.value = withTiming(0.8, { duration: 300 });

                scale.value = withRepeat(
                    withTiming(0.3, { duration: note.duration / 2 }),
                    -1,
                    true,
                );
                scale.value = withTiming(note.size / rpx(32), { duration: 300 });

                wobble.value = withRepeat(
                    withTiming(360, {
                        duration: note.duration / 3,
                        easing: Easing.linear,
                    }),
                    -1,
                    false,
                );
            }, note.delay);
        } else {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            cancelAnimation(offsetY);
            cancelAnimation(opacity);
            cancelAnimation(scale);
            cancelAnimation(wobble);
            opacity.value = withTiming(0, { duration: 300 });
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            cancelAnimation(offsetY);
            cancelAnimation(opacity);
            cancelAnimation(scale);
            cancelAnimation(wobble);
        };
    }, [isPaused, note]); // eslint-disable-line react-hooks/exhaustive-deps

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: offsetY.value },
            { scale: scale.value },
            { rotate: `${wobble.value}deg` },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.note,
                animatedStyle,
                {
                    left: (note.x / 100) * (containerSize - note.size),
                    bottom: note.y / 100,
                },
            ]}>
            <Icon
                name="musical-note"
                size={note.size}
                color="rgba(255, 255, 255, 0.6)"
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        overflow: "visible",
    },
    note: {
        position: "absolute",
    },
});
