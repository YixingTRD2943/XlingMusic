import { ROUTE_PATH } from "@/core/router";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";
import ThemeText from "@/components/base/themeText";
import Color from "color";
import IconButton from "@/components/base/iconButton";
import Icon from "@/components/base/icon.tsx";
import { useI18N } from "@/core/i18n";
import Animated, {
    useSharedValue,
    withSpring,
    useAnimatedStyle,
} from "react-native-reanimated";

export default function NavBar() {
    const navigation = useNavigation<any>();
    const colors = useColors();
    const { t } = useI18N();
    const [isPressed, setIsPressed] = useState(false);
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        setIsPressed(true);
        scale.value = withSpring(0.98, { damping: 25, stiffness: 350 });
    };

    const handlePressOut = () => {
        setIsPressed(false);
        scale.value = withSpring(1, { damping: 25, stiffness: 350 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View style={styles.appbar}>
            <IconButton
                accessibilityLabel={t("home.openSidebar.a11y")}
                name="bars-3"
                style={styles.menu}
                color={colors.text}
                onPress={() => {
                    navigation?.openDrawer();
                }}
            />

            <Animated.View style={[animatedStyle]}>
                <Pressable
                    style={[
                        styles.searchBar,
                        {
                            backgroundColor: colors.placeholder,
                            shadowColor: colors.primary,
                        },
                    ]}
                    accessible
                    accessibilityLabel={t("home.clickToSearch")}
                    onPress={() => {
                        navigation.navigate(ROUTE_PATH.SEARCH_PAGE);
                    }}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}>
                    <Icon
                        accessible={false}
                        name="magnifying-glass"
                        size={rpx(36)}
                        color={Color(colors.text).alpha(0.5).toString()}
                    />
                    <ThemeText
                        accessible={false}
                        fontSize="subTitle"
                        style={[styles.text]}>
                        {t("home.clickToSearch")}
                    </ThemeText>
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    appbar: {
        backgroundColor: "transparent",
        shadowColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: rpx(96),
    },
    searchBar: {
        marginHorizontal: rpx(28),
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        height: rpx(72),
        borderRadius: rpx(36),
        paddingHorizontal: rpx(28),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    text: {
        marginLeft: rpx(16),
        opacity: 0.6,
    },
    menu: {
        marginLeft: rpx(28),
    },
});
