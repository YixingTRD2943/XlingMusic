import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import bootstrap from "./bootstrap/bootstrap";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Dialogs from "@/components/dialogs";
import Panels from "@/components/panels";
import PageBackground from "@/components/base/pageBackground";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Debug from "@/components/debug";
import { PortalHost } from "@/components/base/portal";
import globalStyle from "@/constants/globalStyle";
import Theme from "@/core/theme";
import { BootstrapComponent } from "./bootstrap/BootstrapComponent";
import { ToastBaseComponent } from "@/components/base/toast";
import { StatusBar, View, ActivityIndicator, Text } from "react-native";
import { ReduceMotion, ReducedMotionConfig } from "react-native-reanimated";
import { routes } from "@/core/router/routes.tsx";
import ErrorBoundary from "@/components/errorBoundary";
import { ANIMATION_DURATIONS } from "@/constants/animationConst";
import bootstrapAtom from "./bootstrap/bootstrap.atom";
import { useAtomValue } from "jotai";

/**
 * 字体颜色
 */

StatusBar.setBackgroundColor("transparent");
StatusBar.setTranslucent(true);

bootstrap();
const Stack = createNativeStackNavigator<any>();

// 加载界面 - 不依赖主题
function LoadingScreen() {
    return (
        <View style={[globalStyle.flex1, globalStyle.center, { backgroundColor: "#1a1a1a" }]}>
            <ActivityIndicator size="large" color="#3FA3B5" />
            <Text style={{ marginTop: 20, color: "#fcfcfc" }}>加载中...</Text>
        </View>
    );
}

// 错误界面 - 不依赖主题
function FatalScreen({ reason }: { reason?: Error }) {
    return (
        <View style={[globalStyle.flex1, globalStyle.center, { backgroundColor: "#1a1a1a" }]}>
            <Text style={{ color: "#fcfcfc", marginBottom: 10 }}>启动失败</Text>
            <Text style={{ color: "rgba(252,252,252,0.7)", fontSize: 12 }}>{reason?.message}</Text>
        </View>
    );
}

// 默认主题，在真正的主题加载前使用
const defaultTheme = {
    dark: true,
    colors: {
        primary: "#3FA3B5",
        background: "#1a1a1a",
        card: "#2d2d2d",
        text: "#fcfcfc",
        border: "#424242",
        notification: "#f17d34",
    },
};

export default function Pages() {
    let theme;
    try {
        theme = Theme.useTheme();
    } catch {
        theme = defaultTheme;
    }
    const bootstrapState = useAtomValue(bootstrapAtom);

    if (bootstrapState.state === "Loading") {
        return <LoadingScreen />;
    }

    if (bootstrapState.state === "Fatal") {
        return <FatalScreen reason={bootstrapState.reason} />;
    }

    return (
        <ErrorBoundary>
            <BootstrapComponent />
            <ReducedMotionConfig mode={ReduceMotion.Never} />
            <GestureHandlerRootView style={globalStyle.flex1}>
                <SafeAreaProvider>
                    <NavigationContainer theme={theme}>
                        <PageBackground />
                        <Stack.Navigator
                            initialRouteName={routes[0].path}
                            screenOptions={{
                                headerShown: false,
                                animation: "slide_from_right",
                                animationDuration: ANIMATION_DURATIONS.normal,
                                gestureEnabled: true,
                                gestureDirection: "horizontal",
                                presentation: "card",
                            }}>
                            {routes.map(route => (
                                <Stack.Screen
                                    key={route.path}
                                    name={route.path}
                                    component={route.component}
                                />
                            ))}
                        </Stack.Navigator>                        
                        <Panels />
                        <Dialogs />
                        <Debug />
                        <ToastBaseComponent />
                        <PortalHost />
                    </NavigationContainer>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
}
