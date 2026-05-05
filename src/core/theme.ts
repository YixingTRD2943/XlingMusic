import Config from "@/core/appConfig";

import { DarkTheme as _DarkTheme, DefaultTheme as _DefaultTheme } from "@react-navigation/native";
import { GlobalState } from "@/utils/stateMapper";
import { CustomizedColors } from "@/hooks/useColors";
import Color from "color";

export const lightTheme = {
    id: "p-light",
    ..._DefaultTheme,
    colors: {
        ..._DefaultTheme.colors,
        background: "transparent",
        text: "#333333",
        textSecondary: Color("#333333").alpha(0.7).toString(),
        primary: "#f17d34",
        pageBackground: "#fafafa",
        shadow: "#000",
        appBar: "#f17d34",
        appBarText: "#fefefe",
        musicBar: "#f2f2f2",
        musicBarText: "#333333",
        divider: "rgba(0,0,0,0.1)",
        listActive: "rgba(0,0,0,0.1)", // 在手机上表现是ripple
        mask: "rgba(51,51,51,0.2)",
        backdrop: "#f0f0f0",
        tabBar: "#f0f0f0",
        placeholder: "#eaeaea",
        success: "#08A34C",
        danger: "#FC5F5F",
        info: "#0A95C8",
        card: "#e2e2e288",
        notification: "#f0f0f0",
    },
};

export const darkTheme = {
    id: "p-dark",
    ..._DarkTheme,
    colors: {
        ..._DarkTheme.colors,
        background: "transparent",
        text: "#fcfcfc",
        textSecondary: Color("#fcfcfc").alpha(0.7).toString(),
        primary: "#3FA3B5",
        pageBackground: "#202020",
        shadow: "#999",
        appBar: "#262626",
        appBarText: "#fcfcfc",
        musicBar: "#262626",
        musicBarText: "#fcfcfc",
        divider: "rgba(255,255,255,0.1)",
        listActive: "rgba(255,255,255,0.1)", // 在手机上表现是ripple
        mask: "rgba(33,33,33,0.8)",
        backdrop: "#303030",
        tabBar: "#303030",
        placeholder: "#424242",
        success: "#08A34C",
        danger: "#FC5F5F",
        info: "#0A95C8",
        card: "#33333388",
        notification: "#303030",
    },
};

export const sakuraTheme = {
    id: "sakura",
    ..._DarkTheme,
    colors: {
        ..._DarkTheme.colors,
        background: "transparent",
        text: "#ffffff",
        textSecondary: Color("#ffffff").alpha(0.7).toString(),
        primary: "#ff85ab",
        pageBackground: "rgba(255,133,171,0.15)",
        shadow: "#ff85ab",
        appBar: "rgba(255,133,171,0.3)",
        appBarText: "#ffffff",
        musicBar: "rgba(255,133,171,0.3)",
        musicBarText: "#ffffff",
        divider: "rgba(255,255,255,0.15)",
        listActive: "rgba(255,133,171,0.2)",
        mask: "rgba(0,0,0,0.5)",
        backdrop: "rgba(255,133,171,0.2)",
        tabBar: "rgba(255,133,171,0.25)",
        placeholder: "rgba(255,133,171,0.3)",
        success: "#7eed9e",
        danger: "#ff6b6b",
        info: "#74b9ff",
        card: "rgba(255,133,171,0.25)",
        notification: "rgba(255,133,171,0.2)",
    },
};

export const gradientTheme = {
    id: "gradient",
    ..._DarkTheme,
    colors: {
        ..._DarkTheme.colors,
        background: "transparent",
        text: "#ffffff",
        textSecondary: Color("#ffffff").alpha(0.7).toString(),
        primary: "#a855f7",
        pageBackground: "rgba(168,85,247,0.12)",
        shadow: "#a855f7",
        appBar: "rgba(168,85,247,0.3)",
        appBarText: "#ffffff",
        musicBar: "rgba(168,85,247,0.3)",
        musicBarText: "#ffffff",
        divider: "rgba(255,255,255,0.12)",
        listActive: "rgba(168,85,247,0.25)",
        mask: "rgba(0,0,0,0.5)",
        backdrop: "rgba(168,85,247,0.2)",
        tabBar: "rgba(168,85,247,0.25)",
        placeholder: "rgba(168,85,247,0.3)",
        success: "#34d399",
        danger: "#f87171",
        info: "#60a5fa",
        card: "rgba(168,85,247,0.25)",
        notification: "rgba(168,85,247,0.2)",
    },
};

export const autumnTheme = {
    id: "autumn",
    ..._DarkTheme,
    colors: {
        ..._DarkTheme.colors,
        background: "transparent",
        text: "#fffaf0",
        textSecondary: Color("#fffaf0").alpha(0.7).toString(),
        primary: "#f97316",
        pageBackground: "rgba(249,115,22,0.12)",
        shadow: "#f97316",
        appBar: "rgba(249,115,22,0.3)",
        appBarText: "#fffaf0",
        musicBar: "rgba(249,115,22,0.3)",
        musicBarText: "#fffaf0",
        divider: "rgba(255,250,240,0.15)",
        listActive: "rgba(249,115,22,0.2)",
        mask: "rgba(0,0,0,0.5)",
        backdrop: "rgba(249,115,22,0.2)",
        tabBar: "rgba(249,115,22,0.25)",
        placeholder: "rgba(249,115,22,0.3)",
        success: "#22c55e",
        danger: "#ef4444",
        info: "#3b82f6",
        card: "rgba(249,115,22,0.25)",
        notification: "rgba(249,115,22,0.2)",
    },
};

export const techTheme = {
    id: "tech",
    ..._DarkTheme,
    colors: {
        ..._DarkTheme.colors,
        background: "transparent",
        text: "#00f5d4",
        textSecondary: Color("#00f5d4").alpha(0.7).toString(),
        primary: "#00d4ff",
        pageBackground: "rgba(0,212,255,0.08)",
        shadow: "#00d4ff",
        appBar: "rgba(0,212,255,0.25)",
        appBarText: "#00f5d4",
        musicBar: "rgba(0,212,255,0.25)",
        musicBarText: "#00f5d4",
        divider: "rgba(0,245,212,0.2)",
        listActive: "rgba(0,212,255,0.25)",
        mask: "rgba(0,0,0,0.6)",
        backdrop: "rgba(0,212,255,0.15)",
        tabBar: "rgba(0,212,255,0.2)",
        placeholder: "rgba(0,212,255,0.25)",
        success: "#00ff88",
        danger: "#ff4444",
        info: "#4488ff",
        card: "rgba(0,212,255,0.2)",
        notification: "rgba(0,212,255,0.15)",
    },
};

export const allThemes = [
    { id: "p-dark", name: "深色模式", theme: darkTheme },
    { id: "p-light", name: "浅色模式", theme: lightTheme },
    { id: "sakura", name: "樱花粉", theme: sakuraTheme },
    { id: "gradient", name: "渐变紫", theme: gradientTheme },
    { id: "autumn", name: "秋意", theme: autumnTheme },
    { id: "tech", name: "科技蓝", theme: techTheme },
];

interface IBackgroundInfo {
    url?: string;
    blur?: number;
    opacity?: number;
}

const themeStore = new GlobalState(darkTheme);
const backgroundStore = new GlobalState<IBackgroundInfo | null>(null);

function setup() {
    const currentTheme = Config.getConfig("theme.selectedTheme") ?? "p-dark";

    const themeMap: Record<string, any> = {
        "p-light": lightTheme,
        "p-dark": darkTheme,
        "sakura": sakuraTheme,
        "gradient": gradientTheme,
        "autumn": autumnTheme,
        "tech": techTheme,
    };

    if (themeMap[currentTheme]) {
        themeStore.setValue(themeMap[currentTheme]);
    } else {
        themeStore.setValue({
            id: currentTheme,
            dark: true,
            colors: (Config.getConfig("theme.colors") as CustomizedColors) ?? darkTheme.colors,
        });
    }

    const bgUrl = Config.getConfig("theme.background");
    const bgBlur = Config.getConfig("theme.backgroundBlur");
    const bgOpacity = Config.getConfig("theme.backgroundOpacity");

    backgroundStore.setValue({
        url: bgUrl,
        blur: bgBlur ?? 20,
        opacity: bgOpacity ?? 0.6,
    });
}

function setTheme(
    themeName: string,
    extra?: {
        colors?: Partial<CustomizedColors>;
        background?: IBackgroundInfo;
    },
) {
    const themeMap: Record<string, any> = {
        "p-light": lightTheme,
        "p-dark": darkTheme,
        "sakura": sakuraTheme,
        "gradient": gradientTheme,
        "autumn": autumnTheme,
        "tech": techTheme,
    };

    if (themeMap[themeName]) {
        themeStore.setValue(themeMap[themeName]);
    } else {
        themeStore.setValue({
            id: themeName,
            dark: true,
            colors: {
                ...darkTheme.colors,
                ...(extra?.colors ?? {}),
            },
        });
    }

    Config.setConfig("theme.selectedTheme", themeName);
    Config.setConfig("theme.colors", themeStore.getValue().colors);

    if (extra?.background) {
        const currentBg = backgroundStore.getValue();
        let newBg: IBackgroundInfo = {
            blur: 20,
            opacity: 0.6,
            ...(currentBg ?? {}),
            url: undefined,
        };
        if (typeof extra.background.blur === "number") {
            newBg.blur = extra.background.blur;
        }
        if (typeof extra.background.opacity === "number") {
            newBg.opacity = extra.background.opacity;
        }
        if (extra.background.url) {
            newBg.url = extra.background.url;
        }

        Config.setConfig("theme.background", newBg.url);
        Config.setConfig("theme.backgroundBlur", newBg.blur);
        Config.setConfig("theme.backgroundOpacity", newBg.opacity);

        backgroundStore.setValue(newBg);
    }
}

function setColors(colors: Partial<CustomizedColors>) {
    const currentTheme = themeStore.getValue();
    if (currentTheme.id !== "p-light" && currentTheme.id !== "p-dark") {
        const newTheme = {
            ...currentTheme,
            colors: {
                ...currentTheme.colors,
                ...colors,
            },
        };
        Config.setConfig("theme.customColors", newTheme.colors);
        Config.setConfig("theme.colors", newTheme.colors);
        themeStore.setValue(newTheme);
    }
}

function setBackground(backgroundInfo: Partial<IBackgroundInfo>) {
    const currentBackgroundInfo = backgroundStore.getValue();
    let newBgInfo = {
        ...(currentBackgroundInfo ?? {
            opacity: 0.6,
            blur: 20,
        }),
    };
    if (typeof backgroundInfo.blur === "number") {
        Config.setConfig("theme.backgroundBlur", backgroundInfo.blur);
        newBgInfo.blur = backgroundInfo.blur;
    }
    if (typeof backgroundInfo.opacity === "number") {
        Config.setConfig("theme.backgroundOpacity", backgroundInfo.opacity);
        newBgInfo.opacity = backgroundInfo.opacity;
    }
    if (backgroundInfo.url !== undefined) {
        Config.setConfig("theme.background", backgroundInfo.url);
        newBgInfo.url = backgroundInfo.url;
    }
    backgroundStore.setValue(newBgInfo);
}

const configableColorKey: Array<keyof CustomizedColors> = [
    "primary",
    "text",
    "appBar",
    "appBarText",
    "musicBar",
    "musicBarText",
    "pageBackground",
    "backdrop",
    "card",
    "placeholder",
    "tabBar",
    "notification",
];


const Theme = {
    setup,
    setTheme,
    setBackground,
    setColors,
    useTheme: themeStore.useValue,
    getTheme: themeStore.getValue,
    useBackground: backgroundStore.useValue,
    configableColorKey,
    allThemes,
};

export default Theme;
