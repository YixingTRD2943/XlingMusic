import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";
import Config, { useAppConfig } from "@/core/appConfig";
import { useI18N } from "@/core/i18n";
import { showDialog } from "@/components/dialogs/useDialog";
import { showPanel } from "@/components/panels/usePanel";
import ThemeSwitch from "@/components/base/switch";
import SettingCard from "../SettingCard";
import SettingItem from "../SettingItem";
import SectionLabel from "../SectionLabel";
import useColors from "@/hooks/useColors";
import { clearCache, getCacheSize, sizeFormatter } from "@/utils/fileUtils";
import Toast from "@/utils/toast";
import { qualityKeys } from "@/utils/qualities";

export default function PlaybackTab() {
    const { t } = useI18N();
    const colors = useColors();

    const notInterrupt = useAppConfig("basic.notInterrupt");
    const autoPlayWhenAppStart = useAppConfig("basic.autoPlayWhenAppStart");
    const tryChangeSourceWhenPlayFail = useAppConfig("basic.tryChangeSourceWhenPlayFail");
    const autoStopWhenError = useAppConfig("basic.autoStopWhenError");
    const tempRemoteDuck = useAppConfig("basic.tempRemoteDuck");
    const tempRemoteDuckVolume = useAppConfig("basic.tempRemoteDuckVolume");
    const defaultPlayQuality = useAppConfig("basic.defaultPlayQuality");
    const playQualityOrder = useAppConfig("basic.playQualityOrder");
    const maxCacheSize = useAppConfig("basic.maxCacheSize");
    const retryDelayWhenPlayFail = useAppConfig("basic.retryDelayWhenPlayFail");

    const [cacheSize, setCacheSize] = useState({
        music: 0,
        lyric: 0,
        image: 0,
    });

    const refreshCacheSize = useCallback(async () => {
        try {
            const [musicCache, lyricCache, imageCache] = await Promise.all([
                getCacheSize("music"),
                getCacheSize("lyric"),
                getCacheSize("image"),
            ]);
            setCacheSize({
                music: musicCache,
                lyric: lyricCache,
                image: imageCache,
            });
        } catch (e) {
            console.error("[设置] 获取缓存大小失败:", e);
            setCacheSize({ music: 0, lyric: 0, image: 0 });
        }
    }, []);

    useEffect(() => {
        refreshCacheSize();
    }, [refreshCacheSize]);

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

    const playbackControlItems = [
        {
            title: t("basicSettings.notInterrupt"),
            right: (
                <ThemeSwitch
                    value={notInterrupt ?? false}
                    onValueChange={(val) =>
                        Config.setConfig("basic.notInterrupt", val)
                    }
                />
            ),
            onPress: () =>
                Config.setConfig("basic.notInterrupt", !notInterrupt),
        },
        {
            title: t("basicSettings.autoPlayWhenAppStart"),
            right: (
                <ThemeSwitch
                    value={autoPlayWhenAppStart ?? false}
                    onValueChange={(val) =>
                        Config.setConfig("basic.autoPlayWhenAppStart", val)
                    }
                />
            ),
            onPress: () =>
                Config.setConfig(
                    "basic.autoPlayWhenAppStart",
                    !autoPlayWhenAppStart,
                ),
        },
        {
            title: t("basicSettings.tryChangeSourceWhenPlayFail"),
            right: (
                <ThemeSwitch
                    value={tryChangeSourceWhenPlayFail ?? false}
                    onValueChange={(val) =>
                        Config.setConfig("basic.tryChangeSourceWhenPlayFail", val)
                    }
                />
            ),
            onPress: () =>
                Config.setConfig(
                    "basic.tryChangeSourceWhenPlayFail",
                    !tryChangeSourceWhenPlayFail,
                ),
        },
        createRadio(
            t("basicSettings.retryDelayWhenPlayFail"),
            "basic.retryDelayWhenPlayFail",
            [1, 3, 5, 10, -1],
            retryDelayWhenPlayFail ?? 2,
            {
                1: t("basicSettings.retryDelayWhenPlayFail.1s"),
                3: t("basicSettings.retryDelayWhenPlayFail.3s"),
                5: t("basicSettings.retryDelayWhenPlayFail.5s"),
                10: t("basicSettings.retryDelayWhenPlayFail.10s"),
                "-1": t("basicSettings.retryDelayWhenPlayFail.never"),
            },
        ),
        {
            title: t("basicSettings.autoStopWhenError"),
            right: (
                <ThemeSwitch
                    value={autoStopWhenError ?? true}
                    onValueChange={(val) =>
                        Config.setConfig("basic.autoStopWhenError", val)
                    }
                />
            ),
            onPress: () =>
                Config.setConfig("basic.autoStopWhenError", !autoStopWhenError),
            hasDivider: false,
        },
    ];

    const audioFocusItems = [
        createRadio(
            t("basicSettings.tempRemoteDuck"),
            "basic.tempRemoteDuck",
            ["pause", "lowerVolume"],
            tempRemoteDuck ?? "pause",
            {
                pause: t("basicSettings.tempRemoteDuck.pause"),
                lowerVolume: t("basicSettings.tempRemoteDuck.lowerVolume"),
            },
        ),
        ...(tempRemoteDuck === "lowerVolume"
            ? [
                createRadio(
                    t("basicSettings.tempRemoteDuck.volumeDecreaseLevel"),
                    "basic.tempRemoteDuckVolume",
                    [0.3, 0.5, 0.8],
                    tempRemoteDuckVolume ?? 0.5,
                    {
                        0.3: "30%",
                        0.5: "50%",
                        0.8: "80%",
                    },
                ),
            ]
            : []),
    ];

    const qualityItems = [
        createRadio(
            t("basicSettings.defaultPlayQuality"),
            "basic.defaultPlayQuality",
            qualityKeys,
            defaultPlayQuality ?? "standard",
            {
                low: t("musicQuality.low"),
                standard: t("musicQuality.standard"),
                high: t("musicQuality.high"),
                super: t("musicQuality.super"),
            },
        ),
        createRadio(
            t("basicSettings.playQualityOrder"),
            "basic.playQualityOrder",
            ["asc", "desc"],
            playQualityOrder ?? "asc",
            {
                asc: t("basicSettings.playQualityOrder.asc"),
                desc: t("basicSettings.playQualityOrder.desc"),
            },
        ),
    ];

    const cacheItems = [
        {
            title: t("basicSettings.cache.musicCacheLimit"),
            right: (
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {maxCacheSize
                        ? sizeFormatter(maxCacheSize)
                        : "512M"}
                </Text>
            ),
            onPress: () => {
                showPanel("SimpleInput", {
                    title: t("dialog.setCacheTitle"),
                    placeholder: t("dialog.setCachePlaceholder"),
                    onOk(text, closePanel) {
                        let val = parseInt(text, 10);
                        if (val < 100) {
                            val = 100;
                        } else if (val > 8192) {
                            val = 8192;
                        }
                        if (val >= 100 && val <= 8192) {
                            Config.setConfig(
                                "basic.maxCacheSize",
                                val * 1024 * 1024,
                            );
                            closePanel();
                            Toast.success(t("toast.cacheSetSuccess"));
                        }
                    },
                });
            },
        },
        {
            title: t("basicSettings.cache.clearMusicCache"),
            right: (
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {sizeFormatter(cacheSize.music)}
                </Text>
            ),
            onPress: () => {
                showDialog("SimpleDialog", {
                    title: t("dialog.clearMusicCacheTitle"),
                    content: t("dialog.clearMusicCacheContent"),
                    async onOk() {
                        try {
                            await clearCache("music");
                            Toast.success(t("toast.musicCacheCleared"));
                            refreshCacheSize();
                        } catch (e) {
                            console.error("[设置] 清除音乐缓存失败:", e);
                            Toast.warn(t("toast.operationFailed"));
                        }
                    },
                });
            },
        },
        {
            title: t("basicSettings.cache.clearLyricCache"),
            right: (
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {sizeFormatter(cacheSize.lyric)}
                </Text>
            ),
            onPress: () => {
                showDialog("SimpleDialog", {
                    title: t("dialog.clearLyricCacheTitle"),
                    content: t("dialog.clearLyricCacheContent"),
                    async onOk() {
                        try {
                            await clearCache("lyric");
                            Toast.success(t("toast.lyricCacheCleared"));
                            refreshCacheSize();
                        } catch (e) {
                            console.error("[设置] 清除歌词缓存失败:", e);
                            Toast.warn(t("toast.operationFailed"));
                        }
                    },
                });
            },
        },
        {
            title: t("basicSettings.cache.clearImageCache"),
            right: (
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    {sizeFormatter(cacheSize.image)}
                </Text>
            ),
            onPress: () => {
                showDialog("SimpleDialog", {
                    title: t("dialog.clearImageCacheTitle"),
                    content: t("dialog.clearImageCacheContent"),
                    async onOk() {
                        try {
                            await clearCache("image");
                            Toast.success(t("toast.imageCacheCleared"));
                            refreshCacheSize();
                        } catch (e) {
                            console.error("[设置] 清除图片缓存失败:", e);
                            Toast.warn(t("toast.operationFailed"));
                        }
                    },
                });
            },
            hasDivider: false,
        },
    ];

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
            <SectionLabel text={t("basicSettings.playback")} />
            <SettingCard>
                {playbackControlItems.map((item, index) => (
                    <SettingItem
                        key={index}
                        title={item.title}
                        right={item.right}
                        onPress={item.onPress}
                        hasDivider={item.hasDivider !== false}
                    />
                ))}
            </SettingCard>

            <SectionLabel text={t("basicSettings.audioFocus")} />
            <SettingCard>
                {audioFocusItems.map((item, index) => (
                    <SettingItem
                        key={index}
                        title={item.title}
                        right={item.right}
                        onPress={item.onPress}
                        hasDivider={index < audioFocusItems.length - 1}
                    />
                ))}
            </SettingCard>

            <SectionLabel text={t("basicSettings.quality")} />
            <SettingCard>
                {qualityItems.map((item, index) => (
                    <SettingItem
                        key={index}
                        title={item.title}
                        right={item.right}
                        onPress={item.onPress}
                        hasDivider={index < qualityItems.length - 1}
                    />
                ))}
            </SettingCard>

            <SectionLabel text={t("basicSettings.cache")} />
            <SettingCard>
                {cacheItems.map((item, index) => (
                    <SettingItem
                        key={index}
                        title={item.title}
                        right={item.right}
                        onPress={item.onPress}
                        hasDivider={item.hasDivider !== false}
                    />
                ))}
            </SettingCard>
        </ScrollView>
    );
}