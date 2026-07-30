import React from "react";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import ThemeText from "@/components/base/themeText";
import Icon from "@/components/base/icon.tsx";
import { useCurrentMusic } from "@/core/trackPlayer";
import MusicSheet, { useFavorite } from "@/core/musicSheet";

export default function SongInfo() {
    const musicItem = useCurrentMusic();
    const isFavorite = useFavorite(musicItem);

    return (
        <View style={styles.container}>
            <View style={styles.infoWrapper}>
                <ThemeText
                    fontSize="title"
                    fontWeight="600"
                    style={styles.title}
                    color="#ffffff"
                    numberOfLines={1}
                >
                    {musicItem?.title ?? "--"}
                </ThemeText>
                <ThemeText
                    fontSize="subTitle"
                    fontColor="textSecondary"
                    style={styles.artist}
                    color="#b3b3b3"
                    numberOfLines={1}
                >
                    {musicItem?.artist ?? "--"}
                </ThemeText>
            </View>
            <View style={styles.heartButton}>
                <Icon
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={rpx(44)}
                    color={isFavorite ? "#ef4444" : "#b3b3b3"}
                    onPress={() => {
                        if (!musicItem) {
                            return;
                        }
                        if (isFavorite) {
                            MusicSheet.removeMusic(MusicSheet.defaultSheet.id, musicItem);
                        } else {
                            MusicSheet.addMusic(MusicSheet.defaultSheet.id, musicItem);
                        }
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: rpx(48),
        marginTop: rpx(40),
    },
    infoWrapper: {
        flex: 1,
        minWidth: 0,
        marginRight: rpx(24),
    },
    title: {
        fontSize: rpx(38),
        fontWeight: "600",
    },
    artist: {
        fontSize: rpx(28),
        marginTop: rpx(6),
    },
    heartButton: {
        width: rpx(72),
        height: rpx(72),
        flexShrink: 0,
        justifyContent: "center",
        alignItems: "center",
    },
});