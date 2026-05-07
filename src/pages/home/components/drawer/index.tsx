import { IIconName } from "@/components/base/icon.tsx";
import Icon from "@/components/base/icon";
import ListItem from "@/components/base/listItem";
import PageBackground from "@/components/base/pageBackground";
import ThemeText from "@/components/base/themeText";
import { showDialog } from "@/components/dialogs/useDialog";
import { showPanel } from "@/components/panels/usePanel";
import { useI18N } from "@/core/i18n";
import { ROUTE_PATH, useNavigate } from "@/core/router";
import TrackPlayer from "@/core/trackPlayer";
import { checkUpdateAndShowResult } from "@/hooks/useCheckUpdate.ts";
import useColors from "@/hooks/useColors";
import NativeUtils from "@/native/utils";
import rpx from "@/utils/rpx";
import { useScheduleCloseCountDown } from "@/utils/scheduleClose";
import timeformat from "@/utils/timeformat";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import React, { memo } from "react";
import { BackHandler, Platform, StyleSheet, View } from "react-native";
import { default as DeviceInfo, default as deviceInfoModule } from "react-native-device-info";

const ITEM_HEIGHT = rpx(108);

interface ISettingOptions {
    icon: IIconName;
    title: string;
    onPress?: () => void;
}

function HomeDrawer(props: any) {
    const navigate = useNavigate();
    function navigateToSetting(settingType: string) {
        navigate(ROUTE_PATH.SETTING, {
            type: settingType,
        });
    }

    const { t, getSupportedLanguages, getLanguage, setLanguage } = useI18N();
    const colors = useColors();

    const basicSetting: ISettingOptions[] = [
        {
            icon: "cog-8-tooth",
            title: t("sidebar.basicSettings"),
            onPress: () => {
                navigateToSetting("basic");
            },
        }, {
            icon: "javascript",
            title: t("sidebar.pluginManagement"),
            onPress: () => {
                navigateToSetting("plugin");
            },
        },
        {
            icon: "t-shirt-outline",
            title: t("sidebar.themeSettings"),
            onPress: () => {
                navigateToSetting("theme");
            },
        },
    ];

    const otherSetting: ISettingOptions[] = [
        {
            icon: "circle-stack",
            title: t("sidebar.backupAndResume"),
            onPress: () => {
                navigateToSetting("backup");
            },
        },
    ];

    if (Platform.OS === "android") {
        otherSetting.push({
            icon: "shield-keyhole-outline",
            title: t("sidebar.permissionManagement"),
            onPress: () => {
                navigate(ROUTE_PATH.PERMISSIONS);
            },
        });
    }


    return (
        <>
            <PageBackground />
            <DrawerContentScrollView {...[props]} style={style.scrollWrapper}>
                <View style={style.header}>
                    <ThemeText fontSize="appbar" fontWeight="bold">
                        {DeviceInfo.getApplicationName()}
                    </ThemeText>
                </View>

                <View style={style.section}>
                    <ThemeText style={style.sectionTitle} fontSize="subTitle" fontWeight="bold">
                        {t("common.setting")}
                    </ThemeText>
                    {basicSetting.map((item, index) => (
                        <ListItem
                            key={"basic-setting-" + index}
                            onPress={item.onPress}
                            style={style.menuItem}>
                            <ListItem.ListItemIcon
                                icon={item.icon}
                                width={rpx(64)}
                                circleBg
                                circleBgColor={colors.listActive}
                            />
                            <ListItem.Content title={item.title} />
                            <Icon name="arrow-right-end-on-rectangle" size={rpx(32)} color={colors.textSecondary} />
                        </ListItem>
                    ))}
                </View>

                <View style={style.section}>
                    <ThemeText style={style.sectionTitle} fontSize="subTitle" fontWeight="bold">
                        {t("common.other")}
                    </ThemeText>
                    <CountDownItem />
                    {otherSetting.map((item, index) => (
                        <ListItem
                            key={"other-setting-" + index}
                            onPress={item.onPress}
                            style={style.menuItem}>
                            <ListItem.ListItemIcon
                                icon={item.icon}
                                width={rpx(64)}
                                circleBg
                                circleBgColor={colors.listActive}
                            />
                            <ListItem.Content title={item.title} />
                            <Icon name="arrow-right-end-on-rectangle" size={rpx(32)} color={colors.textSecondary} />
                        </ListItem>
                    ))}
                    <ListItem key='language' onPress={() => {
                        showDialog("RadioDialog", {
                            "content": getSupportedLanguages().map(item => ({
                                title: item.name,
                                value: item.locale,
                                label: item.name,
                            })),
                            title: t("sidebar.languageSettings"),
                            onOk(value) {
                                setLanguage(value as string);
                            },
                            defaultSelected: getLanguage().locale,
                        });
                    }} style={style.menuItem}>
                        <ListItem.ListItemIcon icon='language' width={rpx(64)} circleBg circleBgColor={colors.listActive} />
                        <ListItem.Content title={t("sidebar.languageSettings")} />
                        <ListItem.ListItemText fontSize='subTitle' fontColor='textSecondary' position='right'>{getLanguage().name}</ListItem.ListItemText>
                    </ListItem>
                </View>

                <View style={style.section}>
                    <ThemeText style={style.sectionTitle} fontSize="subTitle" fontWeight="bold">
                        {t("common.software")}
                    </ThemeText>

                    <ListItem
                        key={"update"}
                        onPress={() => {
                            checkUpdateAndShowResult(true);
                        }}
                        style={style.menuItem}>
                        <ListItem.ListItemIcon
                            icon={"arrow-path"}
                            width={rpx(64)}
                            circleBg
                            circleBgColor={colors.listActive}
                        />
                        <ListItem.Content title={t("sidebar.checkUpdate")} />
                        <ListItem.ListItemText
                            position="right"
                            fontSize="subTitle"
                            fontColor="textSecondary">
                            {deviceInfoModule.getVersion()}
                        </ListItem.ListItemText>
                    </ListItem>
                    <ListItem
                        key={"about"}
                        onPress={() => {
                            navigateToSetting("about");
                        }}
                        style={style.menuItem}>
                        <ListItem.ListItemIcon
                            icon={"information-circle"}
                            width={rpx(64)}
                            circleBg
                            circleBgColor={colors.listActive}
                        />
                        <ListItem.Content title={`${t("common.about")} ${deviceInfoModule.getApplicationName()}`} />
                        <Icon name="arrow-right-end-on-rectangle" size={rpx(32)} color={colors.textSecondary} />
                    </ListItem>
                </View>

                <View style={style.section}>
                    <ListItem
                        onPress={() => {
                            BackHandler.exitApp();
                        }}
                        style={style.menuItem}>
                        <ListItem.ListItemIcon
                            icon={"home-outline"}
                            width={rpx(64)}
                            circleBg
                            circleBgColor={colors.listActive}
                        />
                        <ListItem.Content title={t("sidebar.backToDesktop")} />
                        <Icon name="arrow-right-end-on-rectangle" size={rpx(32)} color={colors.textSecondary} />
                    </ListItem>
                    <ListItem
                        onPress={async () => {
                            await TrackPlayer.reset();
                            NativeUtils.exitApp();
                        }}
                        style={style.menuItem}>
                        <ListItem.ListItemIcon
                            icon={"power-outline"}
                            width={rpx(64)}
                            circleBg
                            circleBgColor={colors.listActive}
                        />
                        <ListItem.Content title={t("sidebar.exitApp")} />
                        <Icon name="arrow-right-end-on-rectangle" size={rpx(32)} color={colors.textSecondary} />
                    </ListItem>
                </View>
            </DrawerContentScrollView>
        </>
    );
}

export default memo(HomeDrawer, () => true);

const style = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#999999",
    },
    scrollWrapper: {
        paddingTop: rpx(24),
        paddingHorizontal: rpx(16),
    },

    header: {
        height: rpx(140),
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: rpx(20),
        marginBottom: rpx(8),
    },
    section: {
        marginBottom: rpx(32),
        paddingHorizontal: rpx(4),
    },
    sectionTitle: {
        paddingHorizontal: rpx(16),
        paddingVertical: rpx(16),
        color: "#999",
        marginBottom: rpx(4),
    },
    menuItem: {
        backgroundColor: "rgba(255,255,255,0.06)",
        marginBottom: rpx(10),
        height: rpx(104),
        borderRadius: rpx(28),
        paddingHorizontal: rpx(16),
        shadowColor: "rgba(0,0,0,0.1)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: rpx(8),
        elevation: 2,
    },

    countDownText: {
        height: ITEM_HEIGHT,
        textAlignVertical: "center",
    },
});

function _CountDownItem() {
    const countDown = useScheduleCloseCountDown();
    const { t } = useI18N();
    const colors = useColors();

    return (
        <ListItem
            onPress={() => {
                showPanel("TimingClose");
            }}
            style={style.menuItem}>
            <ListItem.ListItemIcon icon="alarm-outline" width={rpx(64)} circleBg circleBgColor={colors.listActive} />
            <ListItem.Content title={t("sidebar.scheduleClose")} />
            <ListItem.ListItemText position="right" fontSize="subTitle" fontColor="textSecondary">
                {countDown ? timeformat(countDown) : ""}
            </ListItem.ListItemText>
        </ListItem>
    );
}

const CountDownItem = memo(_CountDownItem, () => true);
