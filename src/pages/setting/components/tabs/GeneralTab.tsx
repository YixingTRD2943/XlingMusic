import React from "react";
import { ScrollView, Text } from "react-native";
import Config, { useAppConfig } from "@/core/appConfig";
import { useI18N } from "@/core/i18n";
import { SortType } from "@/constants/commonConst.ts";
import { showDialog } from "@/components/dialogs/useDialog";
import ThemeSwitch from "@/components/base/switch";
import SettingCard from "../SettingCard";
import SettingItem from "../SettingItem";
import SectionLabel from "../SectionLabel";
import useColors from "@/hooks/useColors";

export default function GeneralTab() {
    const { t } = useI18N();
    const colors = useColors();

    const maxHistoryLen = useAppConfig("basic.maxHistoryLen");
    const musicDetailDefault = useAppConfig("basic.musicDetailDefault");
    const musicDetailAwake = useAppConfig("basic.musicDetailAwake");
    const associateLyricType = useAppConfig("basic.associateLyricType");
    const showExitOnNotification = useAppConfig("basic.showExitOnNotification");
    const clickMusicInSearch = useAppConfig("basic.clickMusicInSearch");
    const clickMusicInAlbum = useAppConfig("basic.clickMusicInAlbum");
    const musicOrderInLocalSheet = useAppConfig("basic.musicOrderInLocalSheet");
    const autoUpdatePlugin = useAppConfig("basic.autoUpdatePlugin");
    const notCheckPluginVersion = useAppConfig("basic.notCheckPluginVersion");
    const lazyLoadPlugin = useAppConfig("basic.lazyLoadPlugin");
    const useCelluarNetworkPlay = useAppConfig("basic.useCelluarNetworkPlay");
    const useCelluarNetworkDownload = useAppConfig("basic.useCelluarNetworkDownload");

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

    const generalItems = [
        createRadio(
            t("basicSettings.maxHistoryLength"),
            "basic.maxHistoryLen",
            [20, 50, 100, 200, 500],
            maxHistoryLen ?? 50,
        ),
        createRadio(
            t("basicSettings.musicDetailDefault"),
            "basic.musicDetailDefault",
            ["album", "lyric"],
            musicDetailDefault ?? "album",
            {
                album: t("basicSettings.musicDetailDefault.album"),
                lyric: t("basicSettings.musicDetailDefault.lyric"),
            },
        ),
        {
            title: t("basicSettings.musicDetailAwake"),
            right: (
                <ThemeSwitch
                    value={musicDetailAwake ?? false}
                    onValueChange={(val) =>
                        Config.setConfig("basic.musicDetailAwake", val)
                    }
                />
            ),
            onPress: () =>
                Config.setConfig(
                    "basic.musicDetailAwake",
                    !musicDetailAwake,
                ),
        },
        createRadio(
            t("basicSettings.associateLyricType"),
            "basic.associateLyricType",
            ["input", "search"],
            associateLyricType ?? "search",
            {
                input: t("basicSettings.associateLyricType.input"),
                search: t("basicSettings.associateLyricType.search"),
            },
        ),
        {
            title: t("basicSettings.showExitOnNotification"),
            description: t("basicSettings.showExitOnNotification.desc"),
            right: (
                <ThemeSwitch
                    value={showExitOnNotification ?? false}
                    onValueChange={(val) =>
                        Config.setConfig("basic.showExitOnNotification", val)
                    }
                />
            ),
            onPress: () =>
                Config.setConfig(
                    "basic.showExitOnNotification",
                    !showExitOnNotification,
                ),
        },
    ];

    const sheetItems = [
        createRadio(
            t("basicSettings.clickMusicInSearch"),
            "basic.clickMusicInSearch",
            ["playMusic", "playMusicAndReplace"],
            clickMusicInSearch ?? "playMusic",
            {
                playMusic: t("basicSettings.clickMusicInSearch.playMusic"),
                playMusicAndReplace: t(
                    "basicSettings.clickMusicInSearch.playMusicAndReplace",
                ),
            },
        ),
        createRadio(
            t("basicSettings.clickMusicInAlbum"),
            "basic.clickMusicInAlbum",
            ["playMusic", "playAlbum"],
            clickMusicInAlbum ?? "playAlbum",
            {
                playMusic: t("basicSettings.clickMusicInAlbum.playMusic"),
                playAlbum: t("basicSettings.clickMusicInAlbum.playAlbum"),
            },
        ),
        createRadio(
            t("basicSettings.musicDetailDefault"),
            "basic.musicDetailDefault",
            ["album", "lyric"],
            musicDetailDefault ?? "album",
            {
                album: t("basicSettings.musicDetailDefault.album"),
                lyric: t("basicSettings.musicDetailDefault.lyric"),
            },
        ),
        createRadio(
            t("basicSettings.musicOrderInLocalSheet"),
            "basic.musicOrderInLocalSheet",
            [
                SortType.Title,
                SortType.Artist,
                SortType.Album,
                SortType.Newest,
                SortType.Oldest,
            ],
            musicOrderInLocalSheet ?? "end",
            {
                [SortType.Title]: t(
                    "basicSettings.musicOrderInLocalSheet.title",
                ),
                [SortType.Artist]: t(
                    "basicSettings.musicOrderInLocalSheet.artist",
                ),
                [SortType.Album]: t(
                    "basicSettings.musicOrderInLocalSheet.album",
                ),
                [SortType.Newest]: t(
                    "basicSettings.musicOrderInLocalSheet.newest",
                ),
                [SortType.Oldest]: t(
                    "basicSettings.musicOrderInLocalSheet.oldest",
                ),
            },
        ),
    ];

    const pluginItems = [
        {
            title: t("basicSettings.autoUpdatePlugin"),
            right: (
                <ThemeSwitch
                    value={autoUpdatePlugin ?? false}
                    onValueChange={(val) =>
                        Config.setConfig("basic.autoUpdatePlugin", val)
                    }
                />
            ),
            onPress: () =>
                Config.setConfig("basic.autoUpdatePlugin", !autoUpdatePlugin),
        },
        {
            title: t("basicSettings.notCheckPluginVersion"),
            right: (
                <ThemeSwitch
                    value={notCheckPluginVersion ?? false}
                    onValueChange={(val) =>
                        Config.setConfig("basic.notCheckPluginVersion", val)
                    }
                />
            ),
            onPress: () =>
                Config.setConfig(
                    "basic.notCheckPluginVersion",
                    !notCheckPluginVersion,
                ),
        },
        {
            title: t("basicSettings.lazyLoadPlugin"),
            right: (
                <ThemeSwitch
                    value={lazyLoadPlugin ?? false}
                    onValueChange={(val) =>
                        Config.setConfig("basic.lazyLoadPlugin", val)
                    }
                />
            ),
            onPress: () =>
                Config.setConfig("basic.lazyLoadPlugin", !lazyLoadPlugin),
            hasDivider: false,
        },
    ];

    const networkItems = [
        {
            title: t("basicSettings.useCelluarNetworkPlay"),
            right: (
                <ThemeSwitch
                    value={useCelluarNetworkPlay ?? true}
                    onValueChange={(val) =>
                        Config.setConfig("basic.useCelluarNetworkPlay", val)
                    }
                />
            ),
            onPress: () =>
                Config.setConfig(
                    "basic.useCelluarNetworkPlay",
                    !useCelluarNetworkPlay,
                ),
        },
        {
            title: t("basicSettings.useCelluarNetworkDownload"),
            right: (
                <ThemeSwitch
                    value={useCelluarNetworkDownload ?? false}
                    onValueChange={(val) =>
                        Config.setConfig("basic.useCelluarNetworkDownload", val)
                    }
                />
            ),
            onPress: () =>
                Config.setConfig(
                    "basic.useCelluarNetworkDownload",
                    !useCelluarNetworkDownload,
                ),
            hasDivider: false,
        },
    ];

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
            <SectionLabel text={t("basicSettings.common")} />
            <SettingCard>
                {generalItems.map((item, index) => (
                    <SettingItem
                        key={index}
                        title={item.title}
                        description={(item as any).description}
                        right={item.right}
                        onPress={item.onPress}
                        hasDivider={index < generalItems.length - 1}
                    />
                ))}
            </SettingCard>

            <SectionLabel text={t("basicSettings.sheetAndAlbum")} />
            <SettingCard>
                {sheetItems.map((item, index) => (
                    <SettingItem
                        key={index}
                        title={item.title}
                        right={item.right}
                        onPress={item.onPress}
                        hasDivider={index < sheetItems.length - 1}
                    />
                ))}
            </SettingCard>

            <SectionLabel text={t("basicSettings.plugin")} />
            <SettingCard>
                {pluginItems.map((item, index) => (
                    <SettingItem
                        key={index}
                        title={item.title}
                        right={item.right}
                        onPress={item.onPress}
                        hasDivider={item.hasDivider !== false}
                    />
                ))}
            </SettingCard>

            <SectionLabel text={t("basicSettings.network")} />
            <SettingCard>
                {networkItems.map((item, index) => (
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