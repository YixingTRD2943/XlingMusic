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
import useColors from "@/hooks/useColors";

export default function Background() {
    const { t } = useI18N();
    const colors = useColors();

    const themeBackground = useAppConfig("theme.background");
    const currentTheme = Theme.useTheme();
    const themeSelectedTheme = currentTheme?.id ?? "p-dark";

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
            <View style={[styles.section, { backgroundColor: colors.card }]}>
                <ThemeText
                    fontSize="subTitle"
                    fontWeight="bold"
                    style={styles.header}>
                    {t("themeSettings.setTheme")}
                </ThemeText>
                <View style={styles.cardList}>
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
            </View>

            <View style={[styles.section, { backgroundColor: colors.card }]}>
                <ThemeText
                    fontSize="subTitle"
                    fontWeight="bold"
                    style={styles.header}>
                    背景图片
                </ThemeText>
                <View style={styles.cardList}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginHorizontal: rpx(24),
        marginTop: rpx(24),
        borderRadius: rpx(16),
        paddingBottom: rpx(16),
    },
    header: {
        paddingLeft: rpx(24),
        paddingTop: rpx(20),
        marginBottom: rpx(8),
    },
    cardList: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: rpx(16),
        marginTop: rpx(12),
        gap: rpx(12),
    },
});
