import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";
import ThemeText from "@/components/base/themeText";
import Image from "@/components/base/image";
import { ImgAsset } from "@/constants/assetsConst";

interface IThemeCardProps {
    selected?: boolean;
    preview?: string;
    onPress?: () => void;
    title?: string;
    theme?: any;
    name?: string;
    isSelected?: boolean;
}
export default function ThemeCard(props: IThemeCardProps) {
    const { selected, preview, onPress, title, theme, name, isSelected } = props;
    const actualSelected = isSelected || selected;
    const actualTitle = name || title;

    const isPreviewColor = preview?.startsWith("#") ? true : false;

    const colors = useColors();

    const previewColor = theme?.colors?.primary || preview || colors.primary;

    return (
        <View>
            <Pressable
                onPress={onPress}
                style={[
                    styles.borderContainer,
                    actualSelected
                        ? {
                            borderWidth: 2,
                            borderStyle: "solid",
                            borderColor: colors.primary,
                        }
                        : null,
                ]}>
                <View
                    style={[
                        styles.container,
                        {
                            backgroundColor: previewColor,
                        },
                    ]}>
                    {isPreviewColor ? null : preview ? (
                        <Image
                            style={styles.image}
                            uri={preview}
                            emptySrc={ImgAsset.add}
                        />
                    ) : null}
                </View>
            </Pressable>
            <ThemeText
                numberOfLines={1}
                fontSize="subTitle"
                style={styles.title}
                fontColor={actualSelected ? "primary" : "text"}>
                {actualTitle}
            </ThemeText>
        </View>
    );
}

const styles = StyleSheet.create({
    borderContainer: {
        width: rpx(160),
        height: rpx(160),
        borderRadius: rpx(22),
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: rpx(136),
        height: rpx(136),
        borderRadius: rpx(12),
    },
    title: {
        textAlign: "center",
        marginTop: rpx(12),
        width: rpx(160),
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: rpx(12),
    },
});
