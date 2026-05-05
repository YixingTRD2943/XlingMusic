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
                <View style={styles.logoSection}>
                    <Icon 
                        name="musical-note" 
                        size={rpx(56)} 
                        color={colors.primary} 
                    />
                    <ThemeText 
                        fontSize="title" 
                        fontWeight="bold"
                        style={styles.appName}
                    >
                        星玲音乐
                    </ThemeText>
                </View>
                <IconButton
                    name="information-circle"
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
                    size={rpx(36)}
                    color={Color(colors.text).alpha(0.6).toString()}
                />
                <ThemeText
                    fontSize="subTitle"
                    fontColor="textSecondary"
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
        paddingHorizontal: rpx(28),
        paddingTop: rpx(16),
        paddingBottom: rpx(24),
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: rpx(24),
    },
    logoSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    appName: {
        marginLeft: rpx(16),
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: rpx(28),
        paddingVertical: rpx(20),
        borderRadius: rpx(32),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    searchText: {
        marginLeft: rpx(16),
        flex: 1,
    },
});
