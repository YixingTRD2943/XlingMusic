import React, { useState } from "react";
import { StyleSheet, ViewStyle, StyleProp } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    withSpring,
} from "react-native-reanimated";
import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";
import rpx from "@/utils/rpx";

interface DeformableCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onDragEnd?: (velocity: number) => void;
}

export default function DeformableCard({ children, style, onDragEnd }: DeformableCardProps) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scaleX = useSharedValue(1);
    const scaleY = useSharedValue(1);
    const rotation = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const glowOpacity = useSharedValue(0);
    const [isPressed, setIsPressed] = useState(false);

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            isDragging.value = true;
            glowOpacity.value = 0.3;
            setIsPressed(true);
        })
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;

            const dragAngle = Math.atan2(event.translationY, event.translationX);
            const dragDistance = Math.sqrt(
                event.translationX * event.translationX +
        event.translationY * event.translationY
            );

            const stretchFactor = 1 + Math.min(dragDistance / rpx(200), 0.2);
            scaleX.value = interpolate(
                dragAngle,
                [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI],
                [1, stretchFactor, 1, stretchFactor, 1]
            );
            scaleY.value = interpolate(
                dragAngle,
                [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI],
                [stretchFactor, 1, stretchFactor, 1, stretchFactor]
            );

            rotation.value = event.translationX * 0.05;
        })
        .onEnd((event) => {
            isDragging.value = false;
            glowOpacity.value = 0;
            setIsPressed(false);

            translateX.value = withSpring(0, {
                damping: 15,
                stiffness: 200,
                mass: 0.6,
            });
            translateY.value = withSpring(0, {
                damping: 15,
                stiffness: 200,
                mass: 0.6,
            });
            scaleX.value = withSpring(1, {
                damping: 20,
                stiffness: 300,
                mass: 0.5,
            });
            scaleY.value = withSpring(1, {
                damping: 20,
                stiffness: 300,
                mass: 0.5,
            });
            rotation.value = withSpring(0, {
                damping: 10,
                stiffness: 150,
                mass: 0.8,
            });

            onDragEnd?.(event.velocityY);
        })
        .minDistance(5);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scaleX: scaleX.value },
                { scaleY: scaleY.value },
                { rotate: `${rotation.value}deg` },
            ],
        };
    });

    const pressStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: isDragging.value ? 1 : (isPressed ? 0.98 : 1),
                },
            ],
        };
    });

    const glowStyle = useAnimatedStyle(() => {
        return {
            opacity: glowOpacity.value,
            transform: [
                { translateX: translateX.value * 0.5 },
                { translateY: translateY.value * 0.5 },
            ],
        };
    });

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.container, pressStyle]}>
                <Animated.View
                    style={[
                        styles.card,
                        animatedStyle,
                        style,
                    ]}
                >
                    {children}
                </Animated.View>

                <Animated.View
                    style={[styles.deformGlow, glowStyle]}
                />
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: "visible",
    },
    card: {
        borderRadius: rpx(24),
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    deformGlow: {
        position: "absolute",
        top: -rpx(40),
        left: -rpx(40),
        right: -rpx(40),
        bottom: -rpx(40),
        borderRadius: rpx(44),
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        pointerEvents: "none",
    },
});