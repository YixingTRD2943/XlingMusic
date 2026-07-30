import React from "react";
import { Platform, Text, TextProps } from "react-native";
import { fontSizeConst, fontWeightConst } from "@/constants/uiConst";
import useColors, { CustomizedColors } from "@/hooks/useColors";

type IThemeTextProps = TextProps & {
    color?: string;
    fontColor?: keyof CustomizedColors;
    fontSize?: keyof typeof fontSizeConst;
    fontWeight?: keyof typeof fontWeightConst;
    opacity?: number;
};

export default function ThemeText(props: IThemeTextProps) {
    const colors = useColors();
    const {
        style,
        color,
        children,
        fontSize = "content",
        fontColor = "text",
        fontWeight = "regular",
        opacity,
    } = props;

    const fontSizeValue = fontSizeConst[fontSize];
    const androidOffset = fontSizeValue * 0.25;
    const themeStyle = {
        color: color ?? colors[fontColor],
        fontSize: fontSizeValue,
        fontWeight: fontWeightConst[fontWeight],
        includeFontPadding: false,
        textAlignVertical: "center",
        lineHeight: fontSizeValue * 1.4,
        opacity,
        transform: Platform.OS === "android" ? [{ translateY: -androidOffset }] : undefined,
    };

    const _style = Array.isArray(style)
        ? [themeStyle, ...style]
        : [themeStyle, style];

    return (
        <Text {...props} style={_style} allowFontScaling={false}>
            {children}
        </Text>
    );
}
