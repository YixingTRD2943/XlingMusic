import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";
import ThemeText from "@/components/base/themeText";

interface ILogoCardProps {
    selected?: boolean;
    logo: number;
    onPress?: () => void;
    title?: string;
}
export default function LogoCard(props: ILogoCardProps) {
    const { selected, logo, onPress, title } = props;

    const colors = useColors();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.wrapper}
        >
            <View
                style={[
                    styles.borderContainer,
                    selected
                        ? {
                            borderWidth: 2,
                            borderColor: colors.primary,
                        }
                        : {
                            borderWidth: 1,
                            borderColor: colors.border,
                        },
                ]}>
                <View style={styles.imageContainer}>
                    <Image style={styles.image} source={logo} />
                </View>
            </View>
            <ThemeText
                numberOfLines={1}
                fontSize="subTitle"
                style={styles.title}
                fontColor={selected ? "primary" : "text"}>
                {title}
            </ThemeText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: "center",
        marginBottom: rpx(8),
    },
    borderContainer: {
        width: rpx(160),
        height: rpx(160),
        borderRadius: rpx(22),
        justifyContent: "center",
        alignItems: "center",
    },
    imageContainer: {
        width: rpx(136),
        height: rpx(136),
        borderRadius: rpx(12),
    },
    title: {
        textAlign: "center",
        marginTop: rpx(10),
        width: rpx(160),
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: rpx(12),
    },
});
