import React from "react";
import { ScrollView, Text, View } from "react-native";
import Config, { useAppConfig } from "@/core/appConfig";
import { useI18N } from "@/core/i18n";
import { showDialog } from "@/components/dialogs/useDialog";
import { showPanel } from "@/components/panels/usePanel";
import ThemeSwitch from "@/components/base/switch";
import SettingCard from "../SettingCard";
import SettingItem from "../SettingItem";
import SectionLabel from "../SectionLabel";
import useColors from "@/hooks/useColors";
import Toast from "@/utils/toast";
import { qualityKeys } from "@/utils/qualities";
import pathConst from "@/constants/pathConst";
import { ROUTE_PATH, useNavigate } from "@/core/router";
import { readdir } from "react-native-fs";
import LyricUtil, { NativeTextAlignment } from "@/native/lyricUtil";
import PermissionManager from "@/utils/permissionManager";

export default function DownloadTab() {
    const { t } = useI18N();
    const colors = useColors();
    const navigate = useNavigate();

    const downloadPath = useAppConfig("basic.downloadPath");
    const maxDownload = useAppConfig("basic.maxDownload");
    const defaultDownloadQuality = useAppConfig("basic.defaultDownloadQuality");
    const downloadQualityOrder = useAppConfig("basic.downloadQualityOrder");
    const downloadAutoDeleteFailedFile = useAppConfig("basic.downloadAutoDeleteFailedFile");
    const downloadAutoAddToSheet = useAppConfig("basic.downloadAutoAddToSheet");
    const downloadAutoAddSheetName = useAppConfig("basic.downloadAutoAddSheetName");

    const enableAutoSearchLyric = useAppConfig("lyric.autoSearchLyric");
    const showStatusBarLyric = useAppConfig("lyric.showStatusBarLyric");
    const align = useAppConfig("lyric.align");
    const color = useAppConfig("lyric.color");
    const backgroundColor = useAppConfig("lyric.backgroundColor");

    const createRadio = (
        title: string,
        changeKey: string,
        candidates: Array<string | number>,
        value: string | number,
        valueMap?: Record<string | number, string | number>,
    ) => {
        const onPress = () => {
            showDialog("RadioDialog", {
                title,
                content: valueMap
                    ? candidates.map((_) => ({
                        label: valueMap[_] as string,
                        value: _,
                    }))
                    : candidates,
                onOk(val) {
                    Config.setConfig(changeKey as any, val);
                },
            });
        };
        return {
            title,
            right: (
                <Text
                    style={{
                        fontSize: 14,
                        color: colors.textSecondary,
                        maxWidth: 140,
                    }}
                    numberOfLines={1}>
                    {valueMap ? valueMap[value] : value}
                </Text>
            ),
            onPress,
        };
    };

    const pathItems = [
        {
            title: t("basicSettings.downloadPath"),
            right: (
                <View style={{ flexShrink: 1, alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: "right" }} numberOfLines={2}>
                        {downloadPath ?? pathConst.downloadMusicPath}
                    </Text>
                </View>
            ),
            onPress: () => {
                navigate<"file-selector">(ROUTE_PATH.FILE_SELECTOR, {
                    fileType: "folder",
                    multi: false,
                    actionText: t("basicSettings.fileSelector.selectFolder"),
                    async onAction(selectedFiles) {
                        try {
                            const targetDir = selectedFiles[0];
                            await readdir(targetDir.path);
                            Config.setConfig("basic.downloadPath", targetDir.path);
                            return true;
                        } catch {
                            Toast.warn(t("toast.folderNotExistOrNoPermission"));
                            return false;
                        }
                    },
                });
            },
            hasDivider: false,
        },
    ];

    const downloadSettingsItems = [
        createRadio(
            t("basicSettings.maxDownload"),
            "basic.maxDownload",
            [1, 3, 5, 7],
            maxDownload ?? 3,
        ),
        createRadio(
            t("basicSettings.defaultDownloadQuality"),
            "basic.defaultDownloadQuality",
            qualityKeys,
            defaultDownloadQuality ?? "standard",
            {
                low: t("musicQuality.low"),
                standard: t("musicQuality.standard"),
                high: t("musicQuality.high"),
                super: t("musicQuality.super"),
            },
        ),
        createRadio(
            t("basicSettings.downloadQualityOrder"),
            "basic.downloadQualityOrder",
            ["asc", "desc"],
            downloadQualityOrder ?? "asc",
            {
                asc: t("basicSettings.playQualityOrder.asc"),
                desc: t("basicSettings.playQualityOrder.desc"),
            },
        ),
    ];

    const downloadManagementItems = [
        {
            title: t("basicSettings.download.downloadAutoDeleteFailedFile"),
            right: (
                <ThemeSwitch
                    value={downloadAutoDeleteFailedFile ?? false}
                    onValueChange={(val) =>
                        Config.setConfig(
                            "basic.downloadAutoDeleteFailedFile",
                            val,
                        )
                    }
                />
            ),
            onPress: () =>
                Config.setConfig(
                    "basic.downloadAutoDeleteFailedFile",
                    !downloadAutoDeleteFailedFile,
                ),
        },
        {
            title: t("basicSettings.download.downloadAutoAddToSheet"),
            right: (
                <ThemeSwitch
                    value={downloadAutoAddToSheet ?? false}
                    onValueChange={(val) =>
                        Config.setConfig("basic.downloadAutoAddToSheet", val)
                    }
                />
            ),
            onPress: () =>
                Config.setConfig(
                    "basic.downloadAutoAddToSheet",
                    !downloadAutoAddToSheet,
                ),
        },
        {
            title: t("basicSettings.download.downloadAutoAddSheetName"),
            right: (
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {downloadAutoAddSheetName ?? "下载"}
                </Text>
            ),
            onPress: () => {
                showPanel("SimpleInput", {
                    title: t("panel.createMusicSheet.title"),
                    placeholder: t("panel.createMusicSheet.inputLabel"),
                    defaultValue: downloadAutoAddSheetName ?? "下载",
                    onOk(text, closePanel) {
                        if (text.trim()) {
                            Config.setConfig(
                                "basic.downloadAutoAddSheetName",
                                text.trim(),
                            );
                            closePanel();
                            Toast.success(t("toast.saveSuccess"));
                        }
                    },
                });
            },
            hasDivider: false,
        },
    ];

    const lyricItems = [
        {
            title: t("basicSettings.lyric.autoSearchLyric"),
            right: (
                <ThemeSwitch
                    value={enableAutoSearchLyric ?? false}
                    onValueChange={(val) =>
                        Config.setConfig("lyric.autoSearchLyric", val)
                    }
                />
            ),
            onPress: () =>
                Config.setConfig("lyric.autoSearchLyric", !enableAutoSearchLyric),
        },
        {
            title: t("basicSettings.lyric.showStatusBarLyric"),
            right: (
                <ThemeSwitch
                    value={showStatusBarLyric ?? false}
                    onValueChange={async (val) => {
                        try {
                            if (val) {
                                const success = await PermissionManager.withPermission(
                                    "floatWindow",
                                    async () => {
                                        try {
                                            const statusBarLyricConfig = {
                                                topPercent: Config.getConfig("lyric.topPercent"),
                                                leftPercent: Config.getConfig("lyric.leftPercent"),
                                                align: Config.getConfig("lyric.align"),
                                                color: Config.getConfig("lyric.color"),
                                                backgroundColor: Config.getConfig("lyric.backgroundColor"),
                                                widthPercent: Config.getConfig("lyric.widthPercent"),
                                                fontSize: Config.getConfig("lyric.fontSize"),
                                            };
                                            await LyricUtil.showStatusBarLyric(
                                                "XingLing",
                                                statusBarLyricConfig ?? {}
                                            );
                                            Config.setConfig("lyric.showStatusBarLyric", true);
                                            return true;
                                        } catch (e) {
                                            console.error("[设置] 显示状态栏歌词失败:", e);
                                            Toast.warn(t("toast.operationFailed"));
                                            Config.setConfig("lyric.showStatusBarLyric", false);
                                            return false;
                                        }
                                    },
                                    {
                                        rationaleTitle: "需要悬浮窗权限",
                                        rationaleMessage: "我们需要悬浮窗权限来显示桌面歌词",
                                        errorMessage: t("toast.noFloatWindowPermission"),
                                    }
                                );
                                if (!success) {
                                    Config.setConfig("lyric.showStatusBarLyric", false);
                                }
                            } else {
                                try {
                                    LyricUtil.hideStatusBarLyric();
                                    Config.setConfig("lyric.showStatusBarLyric", false);
                                } catch (e) {
                                    console.error("[设置] 隐藏状态栏歌词失败:", e);
                                    Config.setConfig("lyric.showStatusBarLyric", false);
                                }
                            }
                        } catch (e) {
                            console.error("[设置] 状态栏歌词开关操作失败:", e);
                            Config.setConfig("lyric.showStatusBarLyric", false);
                        }
                    }}
                />
            ),
            onPress: async () => {
                try {
                    if (!showStatusBarLyric) {
                        const success = await PermissionManager.withPermission(
                            "floatWindow",
                            async () => {
                                try {
                                    const statusBarLyricConfig = {
                                        topPercent: Config.getConfig("lyric.topPercent"),
                                        leftPercent: Config.getConfig("lyric.leftPercent"),
                                        align: Config.getConfig("lyric.align"),
                                        color: Config.getConfig("lyric.color"),
                                        backgroundColor: Config.getConfig("lyric.backgroundColor"),
                                        widthPercent: Config.getConfig("lyric.widthPercent"),
                                        fontSize: Config.getConfig("lyric.fontSize"),
                                    };
                                    await LyricUtil.showStatusBarLyric(
                                        "XingLing",
                                        statusBarLyricConfig ?? {}
                                    );
                                    Config.setConfig("lyric.showStatusBarLyric", true);
                                    return true;
                                } catch (e) {
                                    console.error("[设置] 显示状态栏歌词失败:", e);
                                    Toast.warn(t("toast.operationFailed"));
                                    Config.setConfig("lyric.showStatusBarLyric", false);
                                    return false;
                                }
                            },
                            {
                                rationaleTitle: "需要悬浮窗权限",
                                rationaleMessage: "我们需要悬浮窗权限来显示桌面歌词",
                                errorMessage: t("toast.noFloatWindowPermission"),
                            }
                        );
                        if (!success) {
                            Config.setConfig("lyric.showStatusBarLyric", false);
                        }
                    } else {
                        try {
                            LyricUtil.hideStatusBarLyric();
                            Config.setConfig("lyric.showStatusBarLyric", false);
                        } catch (e) {
                            console.error("[设置] 隐藏状态栏歌词失败:", e);
                            Config.setConfig("lyric.showStatusBarLyric", false);
                        }
                    }
                } catch (e) {
                    console.error("[设置] 状态栏歌词操作失败:", e);
                    Config.setConfig("lyric.showStatusBarLyric", false);
                }
            },
        },
        createRadio(
            t("basicSettings.lyric.align"),
            "lyric.align",
            [
                NativeTextAlignment.LEFT,
                NativeTextAlignment.CENTER,
                NativeTextAlignment.RIGHT,
            ],
            align ?? NativeTextAlignment.CENTER,
            {
                [NativeTextAlignment.LEFT]: t("basicSettings.lyric.align.left"),
                [NativeTextAlignment.CENTER]: t("basicSettings.lyric.align.center"),
                [NativeTextAlignment.RIGHT]: t("basicSettings.lyric.align.right"),
            },
        ),
        {
            title: t("basicSettings.lyric.textColor"),
            right: (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: color ?? "#FFE9D2FF",
                        }}
                    />
                </View>
            ),
            onPress: () => {
                showPanel("ColorPicker", {
                    closePanelWhenSelected: true,
                    defaultColor: color ?? "transparent",
                    onSelected(selectedColor) {
                        if (showStatusBarLyric) {
                            const colorStr = selectedColor.hexa();
                            LyricUtil.setStatusBarColors(colorStr, null);
                            Config.setConfig("lyric.color", colorStr);
                        }
                    },
                });
            },
        },
        {
            title: t("basicSettings.lyric.backgroundColor"),
            right: (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: backgroundColor ?? "#84888153",
                        }}
                    />
                </View>
            ),
            onPress: () => {
                showPanel("ColorPicker", {
                    closePanelWhenSelected: true,
                    defaultColor: backgroundColor ?? "transparent",
                    onSelected(selectedColor) {
                        if (showStatusBarLyric) {
                            const colorStr = selectedColor.hexa();
                            LyricUtil.setStatusBarColors(null, colorStr);
                            Config.setConfig("lyric.backgroundColor", colorStr);
                        }
                    },
                });
            },
            hasDivider: false,
        },
    ];

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
            <SectionLabel text={t("basicSettings.downloadPath")} />
            <SettingCard>
                {pathItems.map((item, index) => (
                    <SettingItem
                        key={index}
                        title={item.title}
                        right={item.right}
                        onPress={item.onPress}
                        hasDivider={(item as any).hasDivider !== false}
                    />
                ))}
            </SettingCard>

            <SectionLabel text={t("basicSettings.downloadSettings")} />
            <SettingCard>
                {downloadSettingsItems.map((item, index) => (
                    <SettingItem
                        key={index}
                        title={item.title}
                        right={item.right}
                        onPress={item.onPress}
                        hasDivider={index < downloadSettingsItems.length - 1}
                    />
                ))}
            </SettingCard>

            <SectionLabel text={t("basicSettings.downloadManagement")} />
            <SettingCard>
                {downloadManagementItems.map((item, index) => (
                    <SettingItem
                        key={index}
                        title={item.title}
                        right={item.right}
                        onPress={item.onPress}
                        hasDivider={(item as any).hasDivider !== false}
                    />
                ))}
            </SettingCard>

            <SectionLabel text={t("basicSettings.lyric")} />
            <SettingCard>
                {lyricItems.map((item, index) => (
                    <SettingItem
                        key={index}
                        title={item.title}
                        right={item.right}
                        onPress={item.onPress}
                        hasDivider={(item as any).hasDivider !== false}
                    />
                ))}
            </SettingCard>
        </ScrollView>
    );
}
