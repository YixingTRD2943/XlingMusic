import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import NavBar from "@/components/base/appBar";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeDrawer from "@/pages/home/components/drawer";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBar from "@/components/base/statusBar";
import HorizontalSafeAreaView from "@/components/base/horizontalSafeAreaView.tsx";
import globalStyle from "@/constants/globalStyle";
import Theme from "@/core/theme";
import ThemeText from "@/components/base/themeText";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";
import Icon from "@/components/base/icon";
import ListItem from "@/components/base/listItem";
import { useNavigate } from "@/core/router";
import { ROUTE_PATH } from "@/core/router";
import { IIconName } from "@/components/base/icon.tsx";

function Profile() {
    const colors = useColors();
    const navigate = useNavigate();

    const menuItems: Array<{ icon: IIconName; title: string; onPress: () => void }> = [
        { icon: "heart", title: "我喜欢", onPress: () => {} },
        { icon: "clock-outline", title: "播放历史", onPress: () => navigate(ROUTE_PATH.HISTORY) },
        { icon: "arrow-down-tray", title: "下载管理", onPress: () => navigate(ROUTE_PATH.DOWNLOADING) },
        { icon: "folder-music-outline", title: "本地音乐", onPress: () => navigate(ROUTE_PATH.LOCAL) },
        { icon: "bookmark-square", title: "收藏歌单", onPress: () => {} },
        { icon: "cog-8-tooth", title: "设置", onPress: () => navigate(ROUTE_PATH.SETTING) },
    ];

    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.appWrapper}>
            <ProfileStatusBar />
            <HorizontalSafeAreaView style={globalStyle.flex1}>
                <>
                    <NavBar
                        containerStyle={styles.appBar}
                        contentStyle={styles.appBar}
                    />
                    <ScrollView style={styles.scrollView}>
                        <View style={styles.header}>
                            <View style={[styles.avatar, { backgroundColor: colors.primary + "30" }]}>
                                <Icon name="user" size={rpx(64)} color={colors.text} />
                            </View>
                            <View style={styles.userInfo}>
                                <ThemeText fontSize="title" fontWeight="bold">
                                    星玲音乐
                                </ThemeText>
                                <ThemeText fontSize="subTitle" fontColor="textSecondary">
                                    享受音乐的美好
                                </ThemeText>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <ThemeText style={styles.sectionTitle} fontSize="subTitle" fontWeight="bold">
                                我的音乐
                            </ThemeText>
                            {menuItems.map((item, index) => (
                                <ListItem
                                    key={index}
                                    onPress={item.onPress}
                                    style={styles.menuItem}>
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
                    </ScrollView>
                </>
            </HorizontalSafeAreaView>

        </SafeAreaView>
    );
}

function ProfileStatusBar() {
    const theme = Theme.useTheme();

    return (
        <StatusBar
            backgroundColor="transparent"
            barStyle={theme.dark ? undefined : "dark-content"}
        />
    );
}

const LeftDrawer = createDrawerNavigator();
export default function ProfileApp() {
    return (
        <LeftDrawer.Navigator
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: "80%",
                },
            }}
            initialRouteName="PROFILE-MAIN"
            drawerContent={props => <HomeDrawer {...props} />}>
            <LeftDrawer.Screen name="PROFILE-MAIN" component={Profile} />
        </LeftDrawer.Navigator>
    );
}

const styles = StyleSheet.create({
    appWrapper: {
        flexDirection: "column",
        flex: 1,
    },
    appBar: {
        paddingRight: 0,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: rpx(32),
        paddingTop: rpx(24),
    },
    avatar: {
        width: rpx(120),
        height: rpx(120),
        borderRadius: rpx(60),
        justifyContent: "center",
        alignItems: "center",
        marginRight: rpx(24),
    },
    userInfo: {
        flex: 1,
    },
    section: {
        paddingHorizontal: rpx(16),
        paddingTop: rpx(16),
    },
    sectionTitle: {
        paddingHorizontal: rpx(16),
        paddingVertical: rpx(16),
        color: "#999",
        marginBottom: rpx(8),
    },
    menuItem: {
        backgroundColor: "rgba(255,255,255,0.06)",
        marginBottom: rpx(12),
        height: rpx(104),
        borderRadius: rpx(28),
        paddingHorizontal: rpx(16),
    },
});
