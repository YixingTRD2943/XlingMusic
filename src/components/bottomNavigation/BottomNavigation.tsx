import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import rpx from "@/utils/rpx";

export type TabType = "home" | "profile";

interface TabItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function TabItem({ icon, label, isActive, onPress }: TabItemProps) {
    const scale = useSharedValue(isActive ? 1.1 : 1);

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
            activeOpacity={0.8}
        >
            <Animated.View style={animatedStyle}>
                <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                    {icon}
                </View>
                <Text style={[styles.label, isActive && styles.labelActive]}>
                    {label}
                </Text>
            </Animated.View>
        </Pressable>
    );
}

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
    const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
        {
            key: "home",
            label: "首页",
            icon: (
                <View style={styles.homeIcon}>
                    <View style={styles.homeIconTop} />
                    <View style={styles.homeIconBottom} />
                </View>
            ),
        },
        {
            key: "profile",
            label: "我的",
            icon: (
                <View style={styles.profileIcon}>
                    <View style={styles.profileIconCircle} />
                    <View style={styles.profileIconDot} />
                </View>
            ),
        },
    ];

    return (
        <View style={styles.container}>
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
        
                {/* 中间播放按钮 */}
                <Pressable style={styles.playButton} activeOpacity={0.7}>
                    <View style={styles.playButtonInner}>
                        <View style={styles.playIcon} />
                    </View>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    safeArea: {
        height: rpx(34),
        backgroundColor: "#0d0d0d",
    },
    navBar: {
        backgroundColor: "rgba(13, 13, 13, 0.95)",
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.05)",
        paddingVertical: rpx(12),
        paddingBottom: rpx(24),
    },
    navInner: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: rpx(60),
    },
    tabItem: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: rpx(8),
    },
    iconWrapper: {
        width: rpx(48),
        height: rpx(48),
        borderRadius: rpx(16),
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: rpx(6),
        transitionProperty: "background-color",
        transitionDuration: "200ms",
    },
    iconWrapperActive: {
        backgroundColor: "rgba(139, 92, 246, 0.2)",
    },
    label: {
        fontSize: rpx(22),
        color: "rgba(255, 255, 255, 0.5)",
        fontWeight: "500",
        transitionProperty: "color",
        transitionDuration: "200ms",
    },
    labelActive: {
        color: "#8b5cf6",
        fontWeight: "600",
    },

    // Home Icon
    homeIcon: {
        width: rpx(28),
        height: rpx(28),
        position: "relative",
    },
    homeIconTop: {
        width: rpx(18),
        height: rpx(18),
        borderWidth: rpx(2),
        borderColor: "rgba(255, 255, 255, 0.5)",
        borderBottomWidth: 0,
        borderRightWidth: 0,
        position: "absolute",
        top: 0,
        left: rpx(5),
        borderRadius: rpx(4),
    },
    homeIconBottom: {
        width: rpx(28),
        height: rpx(12),
        borderWidth: rpx(2),
        borderColor: "rgba(255, 255, 255, 0.5)",
        borderTopWidth: 0,
        borderRightWidth: 0,
        position: "absolute",
        bottom: 0,
        borderRadius: 0,
    },

    // Profile Icon
    profileIcon: {
        width: rpx(28),
        height: rpx(28),
        position: "relative",
    },
    profileIconCircle: {
        width: rpx(24),
        height: rpx(24),
        borderRadius: rpx(12),
        borderWidth: rpx(2),
        borderColor: "rgba(255, 255, 255, 0.5)",
        position: "absolute",
        top: rpx(2),
        left: rpx(2),
    },
    profileIconDot: {
        width: rpx(8),
        height: rpx(8),
        borderRadius: rpx(4),
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        position: "absolute",
        bottom: 0,
        right: 0,
    },

    // Play Button
    playButton: {
        position: "absolute",
        bottom: rpx(12),
        left: "50%",
        transform: [{ translateX: rpx(-36) }],
        zIndex: 10,
    },
    playButtonInner: {
        width: rpx(72),
        height: rpx(72),
        borderRadius: rpx(36),
        background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "rgba(139, 92, 246, 0.5)",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
    },
    playIcon: {
        width: 0,
        height: 0,
        borderLeftWidth: rpx(12),
        borderLeftColor: "#fff",
        borderTopWidth: rpx(9),
        borderTopColor: "transparent",
        borderBottomWidth: rpx(9),
        borderBottomColor: "transparent",
        marginLeft: rpx(4),
    },
});