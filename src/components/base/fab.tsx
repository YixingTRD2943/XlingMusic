import React from "react";
import { Pressable, StyleSheet } from "react-native";
import rpx from "@/utils/rpx";
import useColors from "@/hooks/useColors";
import { iconSizeConst } from "@/constants/uiConst";
import Icon, { IIconName } from "@/components/base/icon.tsx";

interface IFabProps {
    icon?: IIconName;
    onPress?: () => void;
}
export default function Fab(props: IFabProps) {
    const { icon, onPress } = props;

    const colors = useColors();

    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.container,
                {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                },
            ]}>
            {icon ? (
                <Icon
                    name={icon}
                    color={colors.card}
                    size={iconSizeConst.normal}
                />
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: rpx(112),
        height: rpx(112),
        borderRadius: rpx(56),
        position: "absolute",
        zIndex: 10010,
        right: rpx(40),
        bottom: rpx(80),
        justifyContent: "center",
        alignItems: "center",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,

        elevation: 12,
    },
});
