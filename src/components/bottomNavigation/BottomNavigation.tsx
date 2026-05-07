import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";

export type TabType = "home" | "profile";

interface TabItemProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onPress: () => void;
}

function TabItem({ icon, label, isActive, onPress }: TabItemProps) {
    const scale = useSharedValue(isActive ? 1.1 : 1);
    const colors = useColors();

    const handlePress = () => {
        scale.value = withSpring(0.9, { damping: 10, stiffness: 300 });
        setTimeout(() => {
            scale.value = withSpring(1.1, { damping: 10, stiffness: 300 });
            setTimeout(() => {
                scale.value = withSpring(1, { damping: 15, stiffness: 200 });
            }, 150);
        }, 100);
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Pressable
            onPress={handlePress}
            style={styles.tabItem}
        >
            <Animated.View style={animatedStyle}>
                <View style={[styles.iconWrapper, isActive && { backgroundColor: colors.primary + "20" }]}>
                    <View style={[styles.iconInner, isActive && { backgroundColor: colors.primary }]}>
                        {icon}
                    </View>
                </View>
                <Text style={[styles.label, isActive && { color: colors.primary, fontWeight: "600" }]}>
                    {label}
                </Text>
            </Animated.View>
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

    const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
        {
            key: "home",
            label: "首页",
            icon: (
                <View style={styles.homeIcon}>
                    <View style={[styles.homeIconTop, { backgroundColor: colors.text }]} />
                    <View style={[styles.homeIconBottom, { backgroundColor: colors.text }]} />
                </View>
            ),
        },
        {
            key: "profile",
            label: "我的",
            icon: (
                <View style={styles.profileIcon}>
                    <View style={[styles.profileIconCircle, { borderColor: colors.text }]} />
                    <View style={[styles.profileIconDot, { backgroundColor: colors.text }]} />
                </View>
            ),
        },
    ];

    return (
        <Animated.View style={[styles.container, { backgroundColor: colors.backdrop }, animatedStyle]}>
            <View style={styles.safeArea} />
            <View style={styles.navBar}>
                <View style={styles.navInner}>
                    {tabs.map((tab) => (
                        <TabItem
                            key={tab.key}
                            icon={tab.icon}
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
    },
    safeArea: {
        height: rpx(34),
    },
    navBar: {
        height: rpx(110),
        paddingHorizontal: rpx(40),
        justifyContent: "center",
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.1)",
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
    iconWrapper: {
        width: rpx(88),
        height: rpx(88),
        borderRadius: rpx(44),
        justifyContent: "center",
        alignItems: "center",
        marginBottom: rpx(8),
    },
    iconInner: {
        width: rpx(56),
        height: rpx(56),
        borderRadius: rpx(28),
        justifyContent: "center",
        alignItems: "center",
    },
    label: {
        fontSize: rpx(24),
        color: "#999",
    },
    homeIcon: {
        width: rpx(32),
        height: rpx(32),
        position: "relative",
    },
    homeIconTop: {
        width: rpx(32),
        height: rpx(8),
        borderRadius: rpx(4),
        position: "absolute",
        top: 0,
    },
    homeIconBottom: {
        width: rpx(20),
        height: rpx(8),
        borderRadius: rpx(4),
        position: "absolute",
        bottom: 0,
        transform: [{ translateX: rpx(-6) }],
    },
    profileIcon: {
        width: rpx(32),
        height: rpx(32),
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    profileIconCircle: {
        width: rpx(28),
        height: rpx(28),
        borderRadius: rpx(14),
        borderWidth: 3,
        position: "absolute",
    },
    profileIconDot: {
        width: rpx(8),
        height: rpx(8),
        borderRadius: rpx(4),
        position: "absolute",
        bottom: 0,
        right: 0,
    },
});
