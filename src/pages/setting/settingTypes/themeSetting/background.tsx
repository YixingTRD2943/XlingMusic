import React from "react";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import ThemeText from "@/components/base/themeText";
import { launchImageLibrary } from "react-native-image-picker";
import pathConst from "@/constants/pathConst";
import { copyFile } from "react-native-fs";
import Config, { useAppConfig } from "@/core/appConfig";
import ThemeCard from "./themeCard";
import { ROUTE_PATH, useNavigate } from "@/core/router";
import Theme from "@/core/theme";
import { useI18N } from "@/core/i18n";

export default function Background() {
    const { t } = useI18N();

    const themeBackground = useAppConfig("theme.background");
    const themeSelectedTheme = useAppConfig("theme.selectedTheme");

    const navigate = useNavigate();

    const onCustomBgPress = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: "photo",
                quality: 0.8,
                maxWidth: 1080,
                maxHeight: 1920,
            });
            const uri = result.assets?.[0].uri;
            if (!uri) {
                return;
            }

            const bgPath = `${pathConst.dataPath}background${uri.substring(
                uri.lastIndexOf("."),
            )}`;
            await copyFile(uri, bgPath);

            Config.setConfig("theme.background", `file://${bgPath}#${Date.now()}`);
            Theme.setBackground({ url: `file://${bgPath}#${Date.now()}` });

            if (themeSelectedTheme !== "image") {
                Theme.setTheme("image");
                Config.setConfig("theme.followSystem", false);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const removeBackground = () => {
        Config.setConfig("theme.background", undefined);
        Theme.setBackground({ url: undefined });
    };

    return (
        <View>
            <ThemeText
                fontSize="subTitle"
                fontWeight="bold"
                style={style.header}>
                {t("themeSettings.setTheme")}
            </ThemeText>
            <View style={style.sectionWrapper}>
                <ThemeCard
                    preview="#fff"
                    title={t("themeSettings.lightMode")}
                    selected={themeSelectedTheme === "p-light"}
                    onPress={() => {
                        if (themeSelectedTheme !== "p-light") {
                            Theme.setTheme("p-light");
                            Config.setConfig("theme.followSystem", false);
                        }
                    }}
                />
                <ThemeCard
                    preview="#131313"
                    title={t("themeSettings.darkMode")}
                    selected={themeSelectedTheme === "p-dark"}
                    onPress={() => {
                        if (themeSelectedTheme !== "p-dark") {
                            Theme.setTheme("p-dark");
                            Config.setConfig("theme.followSystem", false);
                        }
                    }}
                />

                <ThemeCard
                    title={t("themeSettings.customMode")}
                    selected={themeSelectedTheme === "custom"}
                    preview={themeBackground}
                    onPress={() => {
                        if (themeSelectedTheme !== "custom") {
                            Config.setConfig("theme.followSystem", false);
                            Theme.setTheme("custom", {
                                colors: Config.getConfig(
                                    "theme.customColors",
                                ),
                            });
                        }
                        navigate(ROUTE_PATH.SET_CUSTOM_THEME);
                    }}
                />
            </View>

            <ThemeText
                fontSize="subTitle"
                fontWeight="bold"
                style={style.header}>
                背景图片
            </ThemeText>
            <View style={style.sectionWrapper}>
                <ThemeCard
                    preview={themeBackground || "#333"}
                    title={themeBackground ? "更换图片" : "选择图片"}
                    selected={!!themeBackground}
                    onPress={onCustomBgPress}
                />
                {themeBackground && (
                    <ThemeCard
                        preview="#666"
                        title="移除背景"
                        selected={false}
                        onPress={removeBackground}
                    />
                )}
            </View>
        </View>
    );
}

const style = StyleSheet.create({
    header: {
        marginTop: rpx(36),
        paddingLeft: rpx(24),
    },
    sectionWrapper: {
        marginTop: rpx(28),
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: rpx(24),
        gap: rpx(24),
    },
});
