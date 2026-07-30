import FastImage from "@/components/base/fastImage";
import ThemeText from "@/components/base/themeText";
import { ImgAsset } from "@/constants/assetsConst";
import { useI18N } from "@/core/i18n";
import { useSheetItem } from "@/core/musicSheet";
import { useParams } from "@/core/router";
import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";
import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import TrackPlayer from "@/core/trackPlayer";
import { MusicRepeatMode } from "@/constants/repeatModeConst";
import Icon from "@/components/base/icon.tsx";

export default function Header() {
    const { id = "favorite" } = useParams<"local-sheet-detail">();
    const sheet = useSheetItem(id);
    const colors = useColors();
    const { t } = useI18N();

    const handlePlayAll = () => {
        const musicList = sheet?.musicList;
        if (musicList && musicList.length > 0) {
            let defaultPlayMusic = musicList[0];
            if (TrackPlayer.repeatMode === MusicRepeatMode.SHUFFLE) {
                defaultPlayMusic = musicList[Math.floor(Math.random() * musicList.length)];
            }
            TrackPlayer.playWithReplacePlayList(defaultPlayMusic, musicList);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <FastImage
                    style={styles.coverImg}
                    source={sheet?.coverImg}
                    placeholderSource={ImgAsset.albumDefault}
                />
                <View style={styles.details}>
                    <ThemeText fontSize="title" fontWeight="bold" numberOfLines={2}>
                        {sheet?.title}
                    </ThemeText>
                    <ThemeText fontColor="textSecondary" fontSize="subTitle">
                        {t("sheetDetail.totalMusicCount", {
                            count: sheet?.musicList?.length ?? 0,
                        })}
                    </ThemeText>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.playAllBtn, { backgroundColor: colors.primary }]}
                    onPress={handlePlayAll}
                >
                    <Icon name="play" size={rpx(32)} color={colors.text} />
                    <ThemeText fontWeight="bold" style={styles.btnText} color={colors.text}>
                        {t("playAllBar.title")}
                    </ThemeText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.downloadBtn, { borderColor: colors.border }]}
                    onPress={() => {}}
                >
                    <Icon name="arrow-down-tray" size={rpx(32)} color={colors.textSecondary} />
                    <ThemeText fontWeight="bold" style={styles.btnText} fontColor="textSecondary">
                        下载
                    </ThemeText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: rpx(32),
        paddingTop: rpx(16),
        paddingBottom: rpx(16),
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: rpx(24),
    },
    coverImg: {
        width: rpx(220),
        height: rpx(220),
        borderRadius: rpx(28),
    },
    details: {
        flex: 1,
        justifyContent: "center",
        gap: rpx(16),
        minWidth: 0,
    },
    actions: {
        flexDirection: "row",
        gap: rpx(20),
        marginTop: rpx(24),
    },
    playAllBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: rpx(12),
        paddingVertical: rpx(22),
        borderRadius: rpx(9999),
    },
    downloadBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: rpx(12),
        paddingVertical: rpx(22),
        borderRadius: rpx(9999),
        borderWidth: 1,
        backgroundColor: "transparent",
    },
    btnText: {
        fontSize: rpx(28),
    },
});
