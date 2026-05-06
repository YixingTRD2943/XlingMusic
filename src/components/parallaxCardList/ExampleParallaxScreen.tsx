import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { ParallaxCardList, DeformableCard } from "./index";
import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";
import { ImgAsset } from "@/constants/assetsConst";

const mockData = [
    {
        id: "1",
        title: "夏日回忆",
        artist: "周杰伦",
        cover: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=summer%20beach%20sunset%20music%20album%20cover&image_size=landscape_16_9",
        description: "华语乐坛天王经典之作",
    },
    {
        id: "2",
        title: "夜曲",
        artist: "周杰伦",
        cover: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=night%20piano%20moonlight%20romantic%20album%20cover&image_size=landscape_16_9",
        description: "融合古典与流行的完美之作",
    },
    {
        id: "3",
        title: "稻香",
        artist: "周杰伦",
        cover: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=rice%20field%20countryside%20sunrise%20peaceful%20album%20cover&image_size=landscape_16_9",
        description: "回归自然的田园风情",
    },
    {
        id: "4",
        title: "晴天",
        artist: "周杰伦",
        cover: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=sunny%20day%20blue%20sky%20clouds%20happy%20album%20cover&image_size=landscape_16_9",
        description: "青春记忆的代表作品",
    },
    {
        id: "5",
        title: "七里香",
        artist: "周杰伦",
        cover: "https://neeko-copilot.bytedance.net/api/text_to_image?prompt=white%20flowers%20garden%20romantic%20spring%20album%20cover&image_size=landscape_16_9",
        description: "经典情歌传唱至今",
    },
];

function CardContent({ item }: { item: typeof mockData[0] }) {
    const colors = useColors();

    return (
        <DeformableCard>
            <View style={[styles.cardContent, { backgroundColor: colors.card }]}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.cover }}
                        style={styles.coverImage}
                        resizeMode="cover"
                        defaultSource={ImgAsset.albumDefault}
                    />
                    <View style={styles.imageOverlay} />

                    <View style={styles.playButton}>
                        <Text style={styles.playIcon}>▶</Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {item.title}
                    </Text>
                    <Text style={[styles.artist, { color: colors.textSecondary }]}>
                        {item.artist}
                    </Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        {item.description}
                    </Text>
                </View>

                <View style={[styles.bottomBar, { backgroundColor: colors.primary }]} />
            </View>
        </DeformableCard>
    );
}

export default function ExampleParallaxScreen() {
    const colors = useColors();

    return (
        <ParallaxCardList
            data={mockData}
            renderItem={(item) => <CardContent item={item} />}
            backgroundColor={colors.background}
            backgroundChildren={
                <View style={styles.parallaxBackgroundContent}>
                    <View style={styles.backgroundGradient} />

                    <View style={styles.floatingCircle1} />
                    <View style={styles.floatingCircle2} />
                    <View style={styles.floatingCircle3} />

                    <Text style={styles.backgroundTitle}>Music</Text>
                    <Text style={styles.backgroundSubtitle}>Discover</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    cardContent: {
        flex: 1,
        borderRadius: rpx(24),
        overflow: "hidden",
    },
    imageContainer: {
        position: "relative",
        height: rpx(200),
    },
    coverImage: {
        width: "100%",
        height: "100%",
    },
    imageOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    playButton: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: rpx(-35) }, { translateY: rpx(-35) }],
        width: rpx(70),
        height: rpx(70),
        borderRadius: rpx(35),
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    playIcon: {
        fontSize: rpx(28),
        color: "#1a1a1a",
        marginLeft: rpx(4),
    },
    infoContainer: {
        padding: rpx(24),
        paddingBottom: rpx(20),
    },
    title: {
        fontSize: rpx(32),
        fontWeight: "bold",
        marginBottom: rpx(8),
    },
    artist: {
        fontSize: rpx(26),
        marginBottom: rpx(8),
    },
    description: {
        fontSize: rpx(22),
    },
    bottomBar: {
        height: rpx(4),
        borderRadius: rpx(2),
        marginHorizontal: rpx(24),
        marginBottom: rpx(20),
    },

    parallaxBackgroundContent: {
        flex: 1,
        position: "relative",
        overflow: "hidden",
    },
    backgroundGradient: {
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#1a1a1a",
    },
    floatingCircle1: {
        position: "absolute",
        top: rpx(200),
        right: rpx(-100),
        width: rpx(400),
        height: rpx(400),
        borderRadius: rpx(200),
        backgroundColor: "rgba(255, 133, 171, 0.15)",
    },
    floatingCircle2: {
        position: "absolute",
        bottom: rpx(300),
        left: rpx(-80),
        width: rpx(300),
        height: rpx(300),
        borderRadius: rpx(150),
        backgroundColor: "rgba(168, 85, 247, 0.12)",
    },
    floatingCircle3: {
        position: "absolute",
        top: rpx(500),
        right: rpx(100),
        width: rpx(200),
        height: rpx(200),
        borderRadius: rpx(100),
        backgroundColor: "rgba(0, 212, 255, 0.1)",
    },
    backgroundTitle: {
        position: "absolute",
        top: rpx(150),
        left: rpx(40),
        fontSize: rpx(120),
        fontWeight: "bold",
        color: "rgba(255, 255, 255, 0.05)",
        letterSpacing: rpx(-4),
    },
    backgroundSubtitle: {
        position: "absolute",
        top: rpx(280),
        left: rpx(40),
        fontSize: rpx(100),
        fontWeight: "bold",
        color: "rgba(255, 255, 255, 0.03)",
        letterSpacing: rpx(-2),
    },
});