import { useEffect, useRef } from "react";
import { BackHandler, NativeEventSubscription } from "react-native";

export default function (
    onHardwareBackPress: () => boolean | null | undefined,
    deps: any[] = [],
) {
    const backHandlerRef = useRef<NativeEventSubscription>();
    useEffect(() => {
        try {
            if (backHandlerRef.current) {
                backHandlerRef.current.remove();
                backHandlerRef.current = undefined;
            }

            backHandlerRef.current = BackHandler.addEventListener(
                "hardwareBackPress",
                onHardwareBackPress,
            );
        } catch (e) {
            console.error("HardwareBackPress listener error:", e);
            backHandlerRef.current = undefined;
        }

        return () => {
            try {
                if (backHandlerRef.current) {
                    backHandlerRef.current.remove();
                    backHandlerRef.current = undefined;
                }
            } catch (e) {
                console.error("HardwareBackPress cleanup error:", e);
            }
        };
    }, deps);
}
