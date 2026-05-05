import React, { memo, useEffect, useRef } from "react";
import { StyleSheet, View, Animated } from "react-native";
import Image from "./image";
import useColors from "@/hooks/useColors";
import Theme from "@/core/theme";
import LinearGradient from "react-native-linear-gradient";

function PageBackground() {
    const theme = Theme.useTheme();
    const background = Theme.useBackground();
    const colors = useColors();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (theme.id === "tech") {
            const animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 3000,
                        useNativeDriver: false,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration: 3000,
                        useNativeDriver: false,
                    }),
                ])
            );
            animation.start();
            return () => animation.stop();
        }
    }, [theme.id, animatedValue]);

    const isTechTheme = theme.id === "tech";
    const gradientColors = isTechTheme
        ? animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ["#00d4ff", "#00f5d4"],
        })
        : "#00d4ff";

    return (
        <>
            <View
                style={[
                    style.wrapper,
                    {
                        backgroundColor:
                            colors?.pageBackground ?? colors.background,
                    },
                ]}
            />
            {isTechTheme ? (
                <Animated.View style={[style.wrapper, style.gradientWrapper]}>
                    <LinearGradient
                        colors={[
                            "rgba(0,212,255,0.15)",
                            "rgba(0,245,212,0.08)",
                            "rgba(0,212,255,0.15)",
                        ]}
                        locations={[0, 0.5, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <Animated.View
                        style={[
                            style.gradientOverlay,
                            {
                                backgroundColor: gradientColors,
                                opacity: animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.05, 0.15],
                                }),
                            },
                        ]}
                    />
                </Animated.View>
            ) : null}
            {!theme.id.startsWith("p-") && background?.url ? (
                <Image
                    uri={background.url}
                    style={[
                        style.wrapper,
                        {
                            opacity: background?.opacity ?? 0.6,
                        },
                    ]}
                    blurRadius={background?.blur ?? 20}
                />
            ) : null}
        </>
    );
}
export default memo(PageBackground, () => true);

const style = StyleSheet.create({
    wrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
    },
    gradientWrapper: {
        overflow: "hidden",
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
});
