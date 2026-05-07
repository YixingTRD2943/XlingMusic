import React, { useState } from "react";
import { StyleSheet } from "react-native";

import NavBar from "./components/navBar";
import MusicBar from "@/components/musicBar";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeDrawer from "./components/drawer";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBar from "@/components/base/statusBar";
import HorizontalSafeAreaView from "@/components/base/horizontalSafeAreaView.tsx";
import globalStyle from "@/constants/globalStyle";
import Theme from "@/core/theme";
import HomeBody from "./components/homeBody";
import HomeBodyHorizontal from "./components/homeBodyHorizontal";
import useOrientation from "@/hooks/useOrientation";
import BottomNavigation, { TabType } from "@/components/bottomNavigation/BottomNavigation";
import Profile from "@/pages/profile";

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

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };

    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.appWrapper}>
            <HomeStatusBar />
            <HorizontalSafeAreaView style={globalStyle.flex1}>
                {activeTab === "home" ? (
                    <HomeContent />
                ) : (
                    <Profile />
                )}
            </HorizontalSafeAreaView>
            <MusicBar />
            <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
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
    flexRow: {
        flexDirection: "row",
    },
});
