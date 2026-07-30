import Empty from "@/components/base/empty";
import ListItem from "@/components/base/listItem";
import ThemeText from "@/components/base/themeText";
import { showDialog } from "@/components/dialogs/useDialog";
import { ImgAsset } from "@/constants/assetsConst";
import { localPluginPlatform } from "@/constants/commonConst";
import { useI18N } from "@/core/i18n";
import MusicSheet, { useSheetsBase, useStarredSheets } from "@/core/musicSheet";
import { ROUTE_PATH, useNavigate } from "@/core/router";
import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";
import Toast from "@/utils/toast";
import { FlashList } from "@shopify/flash-list";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "@/components/base/icon.tsx";

export default function Sheets() {
    const [index, setIndex] = useState(0);
    const colors = useColors();
    const navigate = useNavigate();

    const allSheets = useSheetsBase();
    const staredSheets = useStarredSheets();
    const { t } = useI18N();

    const tabs = [
        { label: t("home.myPlaylists"), count: allSheets.length },
        { label: t("home.starredPlaylists"), count: staredSheets.length },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <ThemeText fontWeight="bold" fontSize="title" color="#ffffff">
                    {t("home.myPlaylists")}
                </ThemeText>
                <View style={styles.countBadge}>
                    <ThemeText fontSize="description" color="#ffffff" fontWeight="bold">
                        {allSheets.length}
                    </ThemeText>
                </View>
            </View>

            <View style={styles.tabContainer}>
                {tabs.map((tab, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[
                            styles.tab,
                            index === i ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface },
                        ]}
                        onPress={() => setIndex(i)}
                    >
                        <ThemeText
                            fontSize="subTitle"
                            fontWeight="bold"
                            color={index === i ? "#ffffff" : colors.textSecondary}
                        >
                            {tab.label} {tab.count}
                        </ThemeText>
                    </TouchableOpacity>
                ))}
            </View>

            <FlashList
                ListEmptyComponent={<Empty />}
                extraData={{ t }}
                data={(index === 0 ? allSheets : staredSheets) ?? []}
                estimatedItemSize={ListItem.Size.big}
                renderItem={({ item: sheet }) => {
                    const isLocalSheet = !(
                        sheet.platform && sheet.platform !== localPluginPlatform
                    );

                    return (
                        <ListItem
                            key={`${sheet.id}`}
                            heightType="big"
                            withHorizontalPadding
                            leftPadding={rpx(12)}
                            rightPadding={rpx(12)}
                            onPress={() => {
                                if (isLocalSheet) {
                                    navigate(ROUTE_PATH.LOCAL_SHEET_DETAIL, {
                                        id: sheet.id,
                                    });
                                } else {
                                    navigate(ROUTE_PATH.PLUGIN_SHEET_DETAIL, {
                                        sheetInfo: sheet,
                                    });
                                }
                            }}
                        >
                            <ListItem.ListItemImage
                                uri={sheet.coverImg ?? sheet.artwork}
                                fallbackImg={ImgAsset.albumDefault}
                                contentStyle={styles.sheetCover}
                                maskIcon={
                                    sheet.id === MusicSheet.defaultSheet.id
                                        ? "heart"
                                        : null
                                }
                            />
                            <ListItem.Content
                                title={
                                    <ThemeText fontSize="content" fontWeight="bold" numberOfLines={1}>
                                        {sheet.title}
                                    </ThemeText>
                                }
                                description={
                                    <ThemeText fontSize="description" fontColor="textSecondary" numberOfLines={1}>
                                        {isLocalSheet
                                            ? t("home.songCount", { count: sheet.worksNum })
                                            : `${sheet.artist ?? ""}`}
                                    </ThemeText>
                                }
                            />
                            <Icon
                                name="arrow-long-left"
                                size={rpx(28)}
                                color={colors.textTertiary}
                                style={{ transform: [{ rotate: "180deg" }] }}
                            />
                            {sheet.id !== MusicSheet.defaultSheet.id ? (
                                <ListItem.ListItemIcon
                                    position="right"
                                    icon="trash-outline"
                                    color={colors.textTertiary}
                                    onPress={() => {
                                        showDialog("SimpleDialog", {
                                            title: t("dialog.deleteSheetTitle"),
                                            content: t("dialog.deleteSheetContent", {
                                                name: sheet.title,
                                            }),
                                            onOk: async () => {
                                                if (isLocalSheet) {
                                                    await MusicSheet.removeSheet(
                                                        sheet.id
                                                    );
                                                    Toast.success(t("toast.deleteSuccess"));
                                                } else {
                                                    await MusicSheet.unstarMusicSheet(
                                                        sheet
                                                    );
                                                    Toast.success(t("toast.hasUnstarred"));
                                                }
                                            },
                                        });
                                    }}
                                />
                            ) : null}
                        </ListItem>
                    );
                }}
                nestedScrollEnabled
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: rpx(32),
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: rpx(48),
        marginBottom: rpx(12),
    },
    countBadge: {
        width: rpx(36),
        height: rpx(36),
        borderRadius: rpx(18),
        justifyContent: "center",
        alignItems: "center",
        marginLeft: rpx(8),
        backgroundColor: "#1DB954",
    },
    tabContainer: {
        flexDirection: "row",
        gap: rpx(16),
        marginBottom: rpx(16),
    },
    tab: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: rpx(32),
        paddingVertical: rpx(12),
        borderRadius: rpx(9999),
    },
    sheetCover: {
        width: rpx(96),
        height: rpx(96),
        borderRadius: rpx(20),
    },
});
