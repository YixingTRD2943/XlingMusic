import { AppState, AppStateStatus } from "react-native";

declare global {
    var mmkv: Record<string, any>;
}

export function flushAllMMKV() {
    if (global.mmkv) {
        Object.values(global.mmkv).forEach((store: any) => {
            if (typeof store.flush === "function") {
                try {
                    store.flush();
                } catch (e) {
                    console.error("MMKV flush error:", e);
                }
            }
        });
    }
}

export function registerAppStateFlushListener() {
    const appStateSubscription = AppState.addEventListener("change", (status: AppStateStatus) => {
        if (status === "background" || status === "inactive") {
            flushAllMMKV();
        }
    });

    return () => {
        appStateSubscription.remove();
    };
}