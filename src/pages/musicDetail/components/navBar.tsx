import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import rpx from "@/utils/rpx";
import { useNavigation } from "@react-navigation/native";
import Share from "react-native-share";
import { B64Asset } from "@/constants/assetsConst";
import Icon from "@/components/base/icon.tsx";
import ThemeText from "@/components/base/themeText";

export default function NavBar() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={rpx(48)} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <ThemeText fontSize="description" color="rgba(255,255,255,0.5)">
                正在播放
            </ThemeText>
            <TouchableOpacity
                style={styles.button}
                onPress={async () => {
                    try {
                        await Share.open({
                            type: "image/jpeg",
                            title: "XingLing-一个插件化的免费音乐播放器",
                            message: "XingLing-一个插件化的免费音乐播放器",
                            url: B64Asset.share,
                            subject: "XingLing分享",
                        });
                    } catch {}
                }}>
                <Icon name="share" size={rpx(40)} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: rpx(100),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: rpx(24),
    },
    button: {
        width: rpx(72),
        height: rpx(72),
        justifyContent: "center",
        alignItems: "center",
    },
});
