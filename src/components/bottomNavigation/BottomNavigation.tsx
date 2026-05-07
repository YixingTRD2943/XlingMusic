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
                    <View style={[styles.profileIconHead, { backgroundColor: colors.text }]} />
                    <View style={[styles.profileIconBody, { backgroundColor: colors.text }]} />
                    <View style={[styles.profileIconArmLeft, { backgroundColor: colors.text }]} />
                    <View style={[styles.profileIconArmRight, { backgroundColor: colors.text }]} />
                    <View style={[styles.profileIconLegLeft, { backgroundColor: colors.text }]} />
                    <View style={[styles.profileIconLegRight, { backgroundColor: colors.text }]} />
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
        width: rpx(90),
        height: rpx(90),
        borderRadius: rpx(45),
        justifyContent: "center",
        alignItems: "center",
        marginBottom: rpx(6),
    },
    iconInner: {
        width: rpx(58),
        height: rpx(58),
        borderRadius: rpx(29),
        justifyContent: "center",
        alignItems: "center",
    },
    label: {
        fontSize: rpx(24),
        color: "#999",
        marginTop: rpx(4),
        textAlign: "center",
    },
    homeIcon: {
        width: rpx(32),
        height: rpx(36),
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    homeIconTop: {
        width: rpx(30),
        height: rpx(8),
        borderRadius: rpx(4),
        position: "absolute",
        top: rpx(4),
    },
    homeIconBottom: {
        width: rpx(20),
        height: rpx(8),
        borderRadius: rpx(4),
        position: "absolute",
        bottom: rpx(8),
        transform: [{ translateX: rpx(-5) }],
    },
    profileIcon: {
        width: rpx(32),
        height: rpx(36),
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    profileIconHead: {
        width: rpx(12),
        height: rpx(12),
        borderRadius: rpx(6),
        position: "absolute",
        top: rpx(2),
    },
    profileIconBody: {
        width: rpx(10),
        height: rpx(14),
        borderRadius: rpx(5),
        position: "absolute",
        top: rpx(13),
    },
    profileIconArmLeft: {
        width: rpx(4),
        height: rpx(10),
        borderRadius: rpx(2),
        position: "absolute",
        top: rpx(13),
        left: rpx(1),
        transform: [{ rotate: "-15deg" }],
    },
    profileIconArmRight: {
        width: rpx(4),
        height: rpx(10),
        borderRadius: rpx(2),
        position: "absolute",
        top: rpx(13),
        right: rpx(1),
        transform: [{ rotate: "15deg" }],
    },
    profileIconLegLeft: {
        width: rpx(4),
        height: rpx(10),
        borderRadius: rpx(2),
        position: "absolute",
        top: rpx(25),
        left: rpx(5),
        transform: [{ rotate: "-5deg" }],
    },
    profileIconLegRight: {
        width: rpx(4),
        height: rpx(10),
        borderRadius: rpx(2),
        position: "absolute",
        top: rpx(25),
        right: rpx(5),
        transform: [{ rotate: "5deg" }],
    },
});
