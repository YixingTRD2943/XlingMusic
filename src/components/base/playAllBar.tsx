import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import { iconSizeConst } from "@/constants/uiConst";
import { ROUTE_PATH, useNavigate } from "@/core/router";
import ThemeText from "./themeText";
import useColors from "@/hooks/useColors";
import { showPanel } from "../panels/usePanel";
import IconButton from "./iconButton";
import TrackPlayer from "@/core/trackPlayer";
import Toast from "@/utils/toast";
import Icon from "@/components/base/icon.tsx";
import MusicSheet, { useSheetIsStarred } from "@/core/musicSheet";
import { MusicRepeatMode } from "@/constants/repeatModeConst";
import { useI18N } from "@/core/i18n";
import songSourceMatcher from "@/core/songSourceMatcher";
import storage from "@/core/musicSheet/storage";

interface IProps {
    musicList: IMusic.IMusicItem[] | null;
    canStar?: boolean;
    musicSheet?: IMusic.IMusicSheetItem | null;
}
export default function (props: IProps) {
    const { musicList, canStar, musicSheet } = props;

    const sheetName = musicSheet?.title;
    const sheetId = musicSheet?.id;

    const colors = useColors();
    const navigate = useNavigate();
    const { t } = useI18N();

    const starred = useSheetIsStarred(musicSheet);

    return (
        <View style={style.topWrapper}>
            <Pressable
                style={style.playAll}
                onPress={() => {
                    if (musicList) {
                        let defaultPlayMusic = musicList[0];
                        if (
                            TrackPlayer.repeatMode ===
                            MusicRepeatMode.SHUFFLE
                        ) {
                            defaultPlayMusic =
                                musicList[
                                    Math.floor(Math.random() * musicList.length)
                                ];
                        }
                        TrackPlayer.playWithReplacePlayList(
                            defaultPlayMusic,
                            musicList,
                        );
                    }
                }}>
                <Icon
                    name="play-circle"
                    style={style.playAllIcon}
                    size={iconSizeConst.normal}
                    color={colors.text}
                />
                <ThemeText fontWeight="bold">{t("playAllBar.title")}</ThemeText>
            </Pressable>
            {canStar && musicSheet ? (
                <IconButton
                    name={starred ? "heart" : "heart-outline"}
                    sizeType={"normal"}
                    color={starred ? "#e31639" : undefined}
                    style={style.optionButton}
                    onPress={async () => {
                        if (!starred) {
                            MusicSheet.starMusicSheet(musicSheet);
                            Toast.success(t("toast.hasStarred"));
                        } else {
                            MusicSheet.unstarMusicSheet(musicSheet);
                            Toast.success(t("toast.hasUnstarred"));
                        }
                    }}
                />
            ) : null}
            <IconButton
                name="folder-plus"
                sizeType={"normal"}
                style={style.optionButton}
                onPress={async () => {
                    showPanel("AddToMusicSheet", {
                        musicItem: musicList ?? [],
                        newSheetDefaultName: sheetName,
                    });
                }}
            />
            <IconButton
                name="pencil-square"
                sizeType={"normal"}
                style={style.optionButton}
                onPress={async () => {
                    navigate(ROUTE_PATH.MUSIC_LIST_EDITOR, {
                        musicList: musicList,
                        musicSheet: {
                            title: sheetName,
                            id: sheetId,
                        },
                    });
                }}
            />
            {sheetId && sheetId !== "favorite" && sheetId !== "history" && (
                <IconButton
                    name="link"
                    sizeType={"normal"}
                    style={style.optionButton}
                    onPress={async () => {
                        if (!musicList?.length) return;
                        Toast.warn("正在后台匹配音源...");
                        const needMatch = musicList.filter(
                            it => !it.source || Object.keys(it.source).length === 0,
                        );
                        if (!needMatch.length) {
                            Toast.success("所有歌曲已有音源");
                            return;
                        }
                        const result = await songSourceMatcher.batchMatchSongSources(
                            needMatch,
                            "standard",
                            (matched, total) => {
                                if (matched % 5 === 0) {
                                    Toast.warn(`音源匹配中 ${matched}/${total}...`);
                                }
                            },
                            true,
                        );
                        if (result.success > 0) {
                            const updatedList = [...musicList];
                            for (const matchedItem of result.items) {
                                if (!matchedItem.source || Object.keys(matchedItem.source).length === 0) continue;
                                const idx = updatedList.findIndex(it =>
                                    it.id === matchedItem.id && it.platform === matchedItem.platform,
                                );
                                if (idx !== -1) {
                                    updatedList[idx] = { ...matchedItem };
                                }
                            }
                            await storage.setMusicList(sheetId, updatedList);
                        }
                        let msg = `匹配完成：成功 ${result.success} 首`;
                        if (result.failed > 0) msg += `，失败 ${result.failed} 首`;
                        Toast.success(msg);
                    }}
                />
            )}
        </View>
    );
}

const style = StyleSheet.create({
    /** playall */
    topWrapper: {
        height: rpx(84),
        paddingHorizontal: rpx(24),
        flexDirection: "row",
        alignItems: "center",
    },
    playAll: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    playAllIcon: {
        marginRight: rpx(12),
    },
    optionButton: {
        marginLeft: rpx(36),
    },
});
