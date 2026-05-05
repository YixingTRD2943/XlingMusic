import { useTheme } from "@react-navigation/native";
import Color from "color";
import { useMemo } from "react";

export interface CustomizedColors {
    background: string;
    text: string;
    textSecondary?: string;
    textHighlight?: string;
    pageBackground?: string;
    shadow?: string;
    appBar?: string;
    appBarText?: string;
    musicBar?: string;
    musicBarText?: string;
    divider?: string;
    listActive?: string;
    placeholder?: string;
    backdrop?: string;
    card: string;
    tabBar?: string;
    mask?: string;
    success?: string;
    danger?: string;
    info?: string;
    notification?: string;
    border: string;
    primary: string;
}

export default function useColors() {
    const { colors } = useTheme();

    const cColors = useMemo(() => {
        return {
            ...colors,
            textSecondary: Color(colors.text).alpha(0.7).toString(),
            // @ts-ignore
            background: (colors as any).pageBackground ?? colors.background,
        };
    }, [colors]);

    return cColors as unknown as CustomizedColors;
}
