import React, { useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";

import NavBar from "./components/navBar";
import MusicBar, { MusicBarVisibilityState } from "@/components/musicBar";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeDrawer from "./components/drawer";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import StatusBar from "@/components/base/statusBar";
import HorizontalSafeAreaView from "@/components/base/horizontalSafeAreaView.tsx";
import globalStyle from "@/constants/globalStyle";
import Theme from "@/core/theme";
import HomeBody from "./components/homeBody";
import HomeBodyHorizontal from "./components/homeBodyHorizontal";
import useOrientation from "@/hooks/useOrientation";
import BottomNavigation, { TabType } from "@/components/bottomNavigation/BottomNavigation";
import Profile from "@/pages/profile";
import rpx from "@/utils/rpx";

const MUSIC_BAR_HEIGHT = rpx(140);
const NAV_BAR_HEIGHT = rpx(144);

function HomeContent() {
    const orientation = useOrientation();

    return (
        <>
            <NavBar />
            {orientation === "vertical" ? (
                <HomeBody />
            ) : (
                <HomeBodyHorizontal />
            )}
        </>
    );
}

function HomeStatusBar() {
    const theme = Theme.useTheme();

    return (
        <StatusBar
            backgroundColor="transparent"
            barStyle={theme.dark ? undefined : "dark-content"}
        />
    );
}

const LeftDrawer = createDrawerNavigator();

function HomeWithDrawer() {
    const [activeTab, setActiveTab] = useState<TabType>("home");
    const [musicBarVisible, setMusicBarVisible] = useState(false);
    const [musicBarExpanded, setMusicBarExpanded] = useState(false);
    
    const safeAreaInsets = useSafeAreaInsets();

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };

    const handleMusicBarVisibilityChange = useCallback((state: MusicBarVisibilityState) => {
        setMusicBarVisible(state.visible);
        setMusicBarExpanded(state.expanded);
    }, []);

    const navBottomOffset = useCallback(() => {
        if (!musicBarVisible) return 0;
        const musicBarHeight = musicBarExpanded ? MUSIC_BAR_HEIGHT * 1.5 : MUSIC_BAR_HEIGHT;
        return musicBarHeight + safeAreaInsets.bottom;
    }, [musicBarVisible, musicBarExpanded, safeAreaInsets.bottom]);

    const contentBottomPadding = useCallback(() => {
        let padding = NAV_BAR_HEIGHT + safeAreaInsets.bottom;
        if (musicBarVisible) {
            padding += musicBarExpanded ? MUSIC_BAR_HEIGHT * 1.5 : MUSIC_BAR_HEIGHT;
        }
        return padding;
    }, [musicBarVisible, musicBarExpanded, safeAreaInsets.bottom]);

    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.appWrapper}>
            <HomeStatusBar />
            <HorizontalSafeAreaView style={[globalStyle.flex1, { paddingBottom: contentBottomPadding() }]}>
                {activeTab === "home" ? (
                    <HomeContent />
                ) : (
                    <Profile />
                )}
            </HorizontalSafeAreaView>
            
            <View style={[styles.overlaysContainer, { bottom: 0 }]}>
                <MusicBar onVisibilityChange={handleMusicBarVisibilityChange} />
                <BottomNavigation 
                    activeTab={activeTab} 
                    onTabChange={handleTabChange}
                    bottomOffset={navBottomOffset()}
                    visible={true}
                />
            </View>
        </SafeAreaView>
    );
}

export default function App() {
    return (
        <LeftDrawer.Navigator
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: "80%",
                },
            }}
            initialRouteName="HOME-MAIN"
            drawerContent={props => <HomeDrawer {...props} />}>
            <LeftDrawer.Screen name="HOME-MAIN" component={HomeWithDrawer} />
        </LeftDrawer.Navigator>
    );
}

const styles = StyleSheet.create({
    appWrapper: {
        flexDirection: "column",
        flex: 1,
    },
    overlaysContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        zIndex: 1000,
    },
});
