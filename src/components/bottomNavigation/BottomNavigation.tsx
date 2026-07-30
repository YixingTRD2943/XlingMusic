import React from "react";
import { Platform, StyleSheet, View, Text, Pressable } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";
import Icon from "@/components/base/icon.tsx";

export type TabType = "home" | "profile";

interface TabItemProps {
    iconName: any;
    label: string;
    isActive: boolean;
    onPress: () => void;
}

function TabItem({ iconName, label, isActive, onPress }: TabItemProps) {
    const colors = useColors();

    const handlePress = () => {
        onPress();
    };

    return (
        <Pressable
            onPress={handlePress}
            style={styles.tabItem}
        >
            <View style={styles.tabContent}>
                <Icon
                    name={iconName}
                    size={rpx(40)}
                    color={isActive ? colors.primary : colors.textTertiary}
                />
                <Text style={[styles.label, isActive && { color: colors.primary, fontWeight: "600" }]} allowFontScaling={false}>
                    {label}
                </Text>
                {isActive && <View style={[styles.indicator, { backgroundColor: colors.primary }]} />}
            </View>
        </Pressable>
    );
}

interface BottomNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    bottomOffset?: number;
    visible?: boolean;
}

export default function BottomNavigation({ activeTab, onTabChange, bottomOffset = 0, visible = true }: BottomNavigationProps) {
    const colors = useColors();
    const offset = useSharedValue(bottomOffset);
    const opacity = useSharedValue(visible ? 1 : 0);

    React.useEffect(() => {
        offset.value = withSpring(bottomOffset, { damping: 20, stiffness: 300 });
        opacity.value = withSpring(visible ? 1 : 0, { damping: 20, stiffness: 300 });
    }, [bottomOffset, visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: offset.value }],
        opacity: opacity.value,
    }));

    const tabs: { key: TabType; label: string; iconName: any }[] = [
        {
            key: "home",
            label: "首页",
            iconName: "home-outline",
        },
        {
            key: "profile",
            label: "我的",
            iconName: "user",
        },
    ];

    return (
        <Animated.View style={[styles.container, { backgroundColor: colors.backdrop, borderTopColor: colors.border }, animatedStyle]}>
            <View style={styles.safeArea} />
            <View style={styles.navBar}>
                <View style={styles.navInner}>
                    {tabs.map((tab) => (
                        <TabItem
                            key={tab.key}
                            iconName={tab.iconName}
                            label={tab.label}
                            isActive={activeTab === tab.key}
                            onPress={() => onTabChange(tab.key)}
                        />
                    ))}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTopWidth: 1,
    },
    safeArea: {
        height: rpx(34),
    },
    navBar: {
        height: rpx(100),
        paddingHorizontal: rpx(40),
        justifyContent: "center",
    },
    navInner: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    tabContent: {
        alignItems: "center",
        justifyContent: "center",
        gap: rpx(4),
    },
    label: {
        fontSize: rpx(22),
        color: "#727272",
        textAlign: "center",
        textAlignVertical: "center",
        includeFontPadding: false,
        lineHeight: rpx(22) * 1.2,
        transform: Platform.OS === "android" ? [{ translateY: -rpx(2) }] : undefined,
    },
    indicator: {
        width: rpx(8),
        height: rpx(8),
        borderRadius: rpx(4),
        marginTop: rpx(2),
    },
});
