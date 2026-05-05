import React from "react";
import { Appearance, StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import ThemeText from "@/components/base/themeText";
import ListItem from "@/components/base/listItem";
import ThemeSwitch from "@/components/base/switch";
import Config, { useAppConfig } from "@/core/appConfig";
import Theme from "@/core/theme";
import { useI18N } from "@/core/i18n";
import ThemeCard from "./themeCard";

export default function Mode() {
    const { t } = useI18N();
    const mode = useAppConfig("theme.followSystem") ?? false;
    const selectedTheme = useAppConfig("theme.selectedTheme") ?? "p-dark";

    return (
        <View>
            <ThemeText
                fontSize="subTitle"
                fontWeight="bold"
                style={styles.header}>
                {t("themeSettings.displayStyle")}
            </ThemeText>
            <View style={styles.sectionWrapper}>
                <ListItem withHorizontalPadding>
                    <ListItem.Content>
                        <View style={styles.itemRow}>
                            <ThemeText>{t("themeSettings.followSystemTheme")}</ThemeText>
                            <ThemeSwitch
                                value={mode}
                                onValueChange={e => {
                                    if (e) {
                                        const colorScheme =
                                            Appearance.getColorScheme();
                                        if (colorScheme === "dark") {
                                            Theme.setTheme("p-dark");
                                        } else if (colorScheme === "light") {
                                            Theme.setTheme("p-light");
                                        }
                                    }
                                    Config.setConfig("theme.followSystem", e);
                                }}
                            />
                        </View>
                    </ListItem.Content>
                </ListItem>
            </View>

            <ThemeText
                fontSize="subTitle"
                fontWeight="bold"
                style={styles.header}>
                主题选择
            </ThemeText>
            <View style={styles.themeList}>
                {Theme.allThemes.map((themeInfo: any) => (
                    <ThemeCard
                        key={themeInfo.id}
                        theme={themeInfo.theme}
                        name={themeInfo.name}
                        isSelected={selectedTheme === themeInfo.id}
                        onPress={() => Theme.setTheme(themeInfo.id)}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingLeft: rpx(24),
        marginTop: rpx(36),
    },
    sectionWrapper: {
        marginTop: rpx(24),
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    themeList: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: rpx(24),
        marginTop: rpx(24),
        gap: rpx(24),
    },
});
