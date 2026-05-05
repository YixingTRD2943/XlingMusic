import Empty from "@/components/base/empty";
import IconButton from "@/components/base/iconButton";
import ListItem from "@/components/base/listItem";
import ThemeText from "@/components/base/themeText";
import { showDialog } from "@/components/dialogs/useDialog";
import { showPanel } from "@/components/panels/usePanel";
import { ImgAsset } from "@/constants/assetsConst";
import { localPluginPlatform } from "@/constants/commonConst";
import { useI18N } from "@/core/i18n";
import MusicSheet, { useSheetsBase, useStarredSheets } from "@/core/musicSheet";
import { ROUTE_PATH, useNavigate } from "@/core/router";
import useColors from "@/hooks/useColors";
import rpx from "@/utils/rpx";
import Toast from "@/utils/toast";
import { FlashList } from "@shopify/flash-list";
import React, { useMemo, useState } from "react";
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

    const selectedTabStyle = useMemo(() => {
        return {
            backgroundColor: colors.primary,
            color: "#ffffff",
        };
    }, [colors]);

    const tabs = [
        { label: t("home.myPlaylists") },
        { label: t("home.starredPlaylists") },
    ];

    return (
        <>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <ThemeText fontSize="large" fontWeight="bold" style={styles.title}>
                        我的歌单
                    </ThemeText>
                    <View style={styles.more}>
                        <IconButton
                            name="plus"
                            style={styles.newSheetButton}
                            sizeType="normal"
                            accessibilityLabel={t("home.newPlaylist.a11y")}
                            onPress={() => {
                                showPanel("CreateMusicSheet");
                            }}
                        />
                        <IconButton
                            name="inbox-arrow-down"
                            sizeType="normal"
                            accessibilityLabel={t("home.importPlaylist.a11y")}
                            onPress={() => {
                                showPanel("ImportMusicSheet");
                            }}
                        />
                    </View>
                </View>

                <View style={styles.tabContainer}>
                    {tabs.map((tab, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.tab,
                                index === i ? selectedTabStyle : null,
                            ]}
                            onPress={() => setIndex(i)}
                        >
                            <ThemeText
                                fontSize="subTitle"
                                fontWeight={index === i ? "bold" : "normal"}
                                color={index === i ? "#ffffff" : colors.text}
                            >
                                {tab.label}
                            </ThemeText>
                            {i === 0 ? (
                                <ThemeText
                                    fontSize="small"
                                    color={
                                        index === i ? "#ffffff" : colors.textSecondary
                                    }
                                    style={styles.count}
                                >
                                    {allSheets.length}
                                </ThemeText>
                            ) : (
                                <ThemeText
                                    fontSize="small"
                                    color={
                                        index === i ? "#ffffff" : colors.textSecondary
                                    }
                                    style={styles.count}
                                >
                                    {staredSheets.length}
                                </ThemeText>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <FlashList
                    ListEmptyComponent={<Empty />}
                    extraData={{ t }}
                    data={(index === 0 ? allSheets : staredSheets) ?? []}
                    estimatedItemSize={ListItem.Size.big}
                    renderItem={({ item: sheet, index: itemIndex }) => {
                        const isLocalSheet = !(
                            sheet.platform && sheet.platform !== localPluginPlatform
                        );

                        return (
                            <ListItem
                                key={`${sheet.id}`}
                                heightType="big"
                                withHorizontalPadding
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
                                    maskIcon={
                                        sheet.id === MusicSheet.defaultSheet.id
                                            ? "heart"
                                            : null
                                    }
                                />
                                <ListItem.Content
                                    title={sheet.title}
                                    description={
                                        isLocalSheet
                                            ? t("home.songCount", { count: sheet.worksNum })
                                            : `${sheet.artist ?? ""}`
                                    }
                                />
                                {sheet.id !== MusicSheet.defaultSheet.id ? (
                                    <ListItem.ListItemIcon
                                        position="right"
                                        icon="trash-outline"
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
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: rpx(28),
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: rpx(24),
    },
    title: {
        flex: 1,
    },
    more: {
        flexDirection: "row",
        alignItems: "center",
    },
    newSheetButton: {
        marginRight: rpx(12),
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "transparent",
        marginBottom: rpx(24),
        gap: rpx(12),
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: rpx(20),
        paddingVertical: rpx(16),
        borderRadius: rpx(24),
        backgroundColor: "transparent",
    },
    count: {
        marginLeft: rpx(8),
        opacity: 0.7,
    },
});
