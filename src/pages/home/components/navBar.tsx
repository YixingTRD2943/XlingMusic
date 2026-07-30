import { ROUTE_PATH } from "@/core/router";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";
import ThemeText from "@/components/base/themeText";
import Color from "color";
import IconButton from "@/components/base/iconButton";
import Icon from "@/components/base/icon.tsx";
import { useI18N } from "@/core/i18n";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function NavBar() {
    const navigation = useNavigation<any>();
    const colors = useColors();
    const { t } = useI18N();

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <IconButton
                    name="bars-3"
                    sizeType="normal"
                    color={colors.text}
                    onPress={() => {
                        navigation.openDrawer();
                    }}
                />
                <ThemeText
                    fontSize="title"
                    fontWeight="bold"
                    style={styles.appName}
                >
                    星玲音乐
                </ThemeText>
                <IconButton
                    name="alarm-outline"
                    sizeType="normal"
                    color={colors.text}
                    onPress={() => {}}
                />
            </View>

            <TouchableOpacity
                style={[styles.searchBox, { backgroundColor: colors.card }]}
                onPress={() => {
                    navigation.navigate(ROUTE_PATH.SEARCH_PAGE);
                }}
            >
                <Icon
                    name="magnifying-glass"
                    size={rpx(32)}
                    color={Color(colors.text).alpha(0.4).toString()}
                />
                <ThemeText
                    fontSize="subTitle"
                    fontColor="textTertiary"
                    style={styles.searchText}
                >
                    {t("home.clickToSearch")}
                </ThemeText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: rpx(32),
        paddingTop: rpx(16),
        paddingBottom: rpx(24),
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: rpx(24),
        height: rpx(88),
    },
    appName: {
        fontSize: rpx(32),
        letterSpacing: rpx(-0.5),
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: rpx(28),
        paddingVertical: rpx(18),
        borderRadius: rpx(9999),
    },
    searchText: {
        marginLeft: rpx(16),
        flex: 1,
    },
});
