import React, { ReactNode, useState } from "react";
import {
    StyleProp,
    StyleSheet,
    TextProps,
    TextStyle,
    TouchableHighlight,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import rpx from "@/utils/rpx";
import useColors, { CustomizedColors } from "@/hooks/useColors";
import ThemeText from "./themeText";
import {
    fontSizeConst,
    fontWeightConst,
    iconSizeConst,
} from "@/constants/uiConst";
import FastImage from "./fastImage";
import { ImageStyle } from "react-native-fast-image";
import Icon, { IIconName } from "@/components/base/icon.tsx";
import Animated, {
    useSharedValue,
    withSpring,
    useAnimatedStyle,
} from "react-native-reanimated";

interface IListItemProps {
    withHorizontalPadding?: boolean;
    leftPadding?: number;
    rightPadding?: number;
    style?: StyleProp<ViewStyle>;
    heightType?: "big" | "small" | "smallest" | "normal" | "none";
    children?: ReactNode;
    onPress?: () => void;
    onLongPress?: () => void;
    hoverable?: boolean;
}

const defaultPadding = rpx(28);
const defaultActionWidth = rpx(88);

const Size = {
    big: rpx(140),
    normal: rpx(112),
    small: rpx(100),
    smallest: rpx(76),
    none: undefined,
};

function ListItem(props: IListItemProps) {
    const {
        withHorizontalPadding,
        leftPadding = defaultPadding,
        rightPadding = defaultPadding,
        style,
        heightType = "normal",
        children,
        onPress,
        onLongPress,
        hoverable = true,
    } = props;

    const [isPressed, setIsPressed] = useState(false);
    const scale = useSharedValue(1);

    const defaultStyle: StyleProp<ViewStyle> = {
        paddingLeft: withHorizontalPadding ? leftPadding : 0,
        paddingRight: withHorizontalPadding ? rightPadding : 0,
        height: Size[heightType],
    };

    const colors = useColors();

    const handlePressIn = () => {
        setIsPressed(true);
        if (hoverable && onPress) {
            scale.value = withSpring(0.99, { damping: 30, stiffness: 400 });
        }
    };

    const handlePressOut = () => {
        setIsPressed(false);
        scale.value = withSpring(1, { damping: 30, stiffness: 400 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[animatedStyle]}>
            <TouchableHighlight
                style={styles.container}
                underlayColor={colors.listActive}
                onPress={onPress}
                onLongPress={onLongPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}>
                <View style={[styles.container, defaultStyle, style]}>
                    {children}
                </View>
            </TouchableHighlight>
        </Animated.View>
    );
}

interface IListItemTextProps {
    children?: number | string;
    fontSize?: keyof typeof fontSizeConst;
    fontColor?: keyof CustomizedColors;
    fontWeight?: keyof typeof fontWeightConst;
    width?: number;
    position?: "left" | "right" | "none";
    fixedWidth?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<TextStyle>;
    contentProps?: TextProps;
}

function ListItemText(props: IListItemTextProps) {
    const {
        children,
        fontSize,
        fontWeight,
        fontColor,
        position = "left",
        fixedWidth,
        width,
        containerStyle,
        contentStyle,
        contentProps = {},
    } = props;

    const defaultStyle: StyleProp<ViewStyle> = {
        marginRight: position === "left" ? defaultPadding : 0,
        marginLeft: position === "right" ? defaultPadding : 0,
        width: fixedWidth ? width ?? defaultActionWidth : undefined,
        flexBasis: fixedWidth ? width ?? defaultActionWidth : undefined,
    };

    return (
        <View style={[styles.actionBase, defaultStyle, containerStyle]}>
            <ThemeText
                fontSize={fontSize}
                style={contentStyle}
                fontWeight={fontWeight}
                fontColor={fontColor}
                {...contentProps}>
                {children}
            </ThemeText>
        </View>
    );
}

interface IListItemIconProps {
    icon: IIconName;
    iconSize?: number;
    width?: number;
    position?: "left" | "right" | "none";
    fixedWidth?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<TextStyle>;
    onPress?: () => void;
    color?: string;
}

function ListItemIcon(props: IListItemIconProps) {
    const {
        icon,
        iconSize = iconSizeConst.normal,
        position = "left",
        fixedWidth,
        width,
        containerStyle,
        contentStyle,
        onPress,
        color,
    } = props;

    const colors = useColors();

    const defaultStyle: StyleProp<ViewStyle> = {
        marginRight: position === "left" ? defaultPadding : 0,
        marginLeft: position === "right" ? defaultPadding : 0,
        width: fixedWidth ? width ?? defaultActionWidth : undefined,
        flexBasis: fixedWidth ? width ?? defaultActionWidth : undefined,
    };

    const innerContent = (
        <View style={[styles.actionBase, defaultStyle, containerStyle]}>
            <Icon
                name={icon}
                size={iconSize}
                style={contentStyle}
                color={color || colors.text}
            />
        </View>
    );

    return onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{innerContent}</TouchableOpacity>
    ) : (
        innerContent
    );
}

interface IListItemImageProps {
    uri?: string;
    fallbackImg?: number;
    imageSize?: number;
    width?: number;
    position?: "left" | "right";
    fixedWidth?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ImageStyle>;
    maskIcon?: IIconName | null;
}

function ListItemImage(props: IListItemImageProps) {
    const {
        uri,
        fallbackImg,
        position = "left",
        fixedWidth,
        width,
        containerStyle,
        contentStyle,
        maskIcon,
    } = props;

    const defaultStyle: StyleProp<ViewStyle> = {
        marginRight: position === "left" ? defaultPadding : 0,
        marginLeft: position === "right" ? defaultPadding : 0,
        width: fixedWidth ? width ?? defaultActionWidth : undefined,
        flexBasis: fixedWidth ? width ?? defaultActionWidth : undefined,
    };

    return (
        <View style={[styles.actionBase, defaultStyle, containerStyle]}>
            <FastImage
                style={[styles.leftImage, contentStyle]}
                source={uri}
                placeholderSource={fallbackImg}
            />
            {maskIcon ? (
                <View style={[styles.leftImage, styles.imageMask]}>
                    <Icon
                        name={maskIcon}
                        size={iconSizeConst.normal}
                        color="red"
                    />
                </View>
            ) : null}
        </View>
    );
}

interface IContentProps {
    title?: ReactNode;
    children?: ReactNode;
    description?: ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
}

function Content(props: IContentProps) {
    const {
        children,
        title = children,
        description = null,
        containerStyle,
    } = props;

    let realTitle;
    let realDescription;

    if (typeof title === "string" || typeof title === "number") {
        realTitle = <ThemeText numberOfLines={1} fontSize="content">{title}</ThemeText>;
    } else {
        realTitle = title;
    }

    if (typeof description === "string" || typeof description === "number") {
        realDescription = (
            <ThemeText
                numberOfLines={1}
                fontSize="description"
                fontColor="textSecondary"
                style={styles.contentDesc}>
                {description}
            </ThemeText>
        );
    } else {
        realDescription = description;
    }

    return (
        <View style={[styles.itemContentContainer, containerStyle]}>
            {realTitle}
            {realDescription}
        </View>
    );
}

export function ListItemHeader(props: { children?: ReactNode }) {
    const { children } = props;
    return (
        <ListItem
            withHorizontalPadding
            heightType="smallest"
            style={styles.listItemHeader}>
            {typeof children === "string" ? (
                <ThemeText
                    fontSize="subTitle"
                    fontColor="textSecondary"
                    fontWeight="bold">
                    {children}
                </ThemeText>
            ) : (
                children
            )}
        </ListItem>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
    },
    actionBase: {
        height: "100%",
        flexShrink: 0,
        flexGrow: 0,
        flexBasis: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    leftImage: {
        width: rpx(88),
        height: rpx(88),
        borderRadius: rpx(24),
    },
    imageMask: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    itemContentContainer: {
        flex: 1,
        height: "100%",
        justifyContent: "center",
        minWidth: 0,
    },
    contentDesc: {
        marginTop: rpx(12),
    },

    listItemHeader: {
        marginTop: rpx(24),
    },
});

ListItem.Size = Size;
ListItem.ListItemIcon = ListItemIcon;
ListItem.ListItemImage = ListItemImage;
ListItem.ListItemText = ListItemText;
ListItem.Content = Content;

export default ListItem;
