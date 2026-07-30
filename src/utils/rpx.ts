import { Dimensions } from "react-native";

export default function (rpx: number) {
    const { width, height } = Dimensions.get("window");
    return (rpx / 750) * Math.min(width, height);
}

export function vh(pct: number) {
    return (pct / 100) * Dimensions.get("window").height;
}

export function vw(pct: number) {
    return (pct / 100) * Dimensions.get("window").width;
}

export function vmin(pct: number) {
    const { width, height } = Dimensions.get("window");
    return (pct / 100) * Math.min(width, height);
}

export function vmax(pct: number) {
    const { width, height } = Dimensions.get("window");
    return (pct / 100) * Math.max(width, height);
}

export function sh(pct: number) {
    return (pct / 100) * Dimensions.get("screen").height;
}

export function sw(pct: number) {
    return (pct / 100) * Dimensions.get("screen").width;
}
