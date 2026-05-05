import { StyleSheet } from "react-native";
import rpx from "@/utils/rpx";

const globalStyle = StyleSheet.create({
    flex1: {
        flex: 1,
    },
    fwflex1: {
        width: "100%",
        flex: 1,
    },
    rowfwflex1: {
        width: "100%",
        flex: 1,
        flexDirection: "row",
    },
    fullCenter: {
        width: "100%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    notShrink: {
        flexShrink: 0,
        flexGrow: 0,
    },
    grow: {
        flexShrink: 0,
        flexGrow: 1,
    },
    safeArea: {
        paddingTop: 0,
        paddingBottom: 0,
    },
    screenPadding: {
        paddingHorizontal: rpx(28),
    },
    cardSpacing: {
        marginBottom: rpx(24),
    },
});

export default globalStyle;
