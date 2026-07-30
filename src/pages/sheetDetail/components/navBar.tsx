import { showDialog } from "@/components/dialogs/useDialog";
import { showPanel } from "@/components/panels/usePanel.ts";
import { SortType } from "@/constants/commonConst.ts";
import { useI18N } from "@/core/i18n";
import MusicSheet, { useSheetItem } from "@/core/musicSheet";
import { ROUTE_PATH, useParams } from "@/core/router";
import { default as Toast, default as toast } from "@/utils/toast";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import IconButton from "@/components/base/iconButton";
import ThemeText from "@/components/base/themeText";

export default function NavBar() {
    const navigation = useNavigation<any>();
    const { id = "favorite" } = useParams<"local-sheet-detail">();
    const musicSheet = useSheetItem(id);
    const { t } = useI18N();

    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <IconButton
                    name="arrow-left"
                    sizeType="normal"
                    color="white"
                    onPress={() => navigation.goBack()}
                />
            </View>
            <View style={styles.center}>
                <ThemeText fontSize="title" fontWeight="bold" numberOfLines={1}>
                    {t("common.sheet")}
                </ThemeText>
            </View>
            <View style={styles.right}>
                <IconButton
                    name="ellipsis-vertical"
                    sizeType="normal"
                    color="white"
                    onPress={() => {
                        showDialog("RadioDialog", {
                            content: [
                                {
                                    value: SortType.Title,
                                    label: t("sheetDetail.sortMusicOption.byTitle"),
                                },
                                {
                                    value: SortType.Artist,
                                    label: t("sheetDetail.sortMusicOption.byArtist"),
                                },
                                {
                                    value: SortType.Album,
                                    label: t("sheetDetail.sortMusicOption.byAlbum"),
                                },
                                {
                                    value: SortType.Newest,
                                    label: t("sheetDetail.sortMusicOption.newest"),
                                },
                                {
                                    value: SortType.Oldest,
                                    label: t("sheetDetail.sortMusicOption.oldest"),
                                },
                            ],
                            defaultSelected:
                                MusicSheet.getSheetMeta(id, "sort") ||
                                SortType.None,
                            title: t("sheetDetail.sortMusic"),
                            async onOk(value) {
                                await MusicSheet.setSortType(
                                    id,
                                    value as SortType,
                                );
                                toast.success(t("toast.sortHasBeenUpdated"));
                            },
                        });
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        height: rpx(100),
        paddingHorizontal: rpx(24),
    },
    left: {
        width: rpx(80),
        alignItems: "flex-start",
    },
    center: {
        flex: 1,
        alignItems: "center",
    },
    right: {
        width: rpx(80),
        alignItems: "flex-end",
    },
});
