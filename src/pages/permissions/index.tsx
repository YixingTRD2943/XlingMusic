import AppBar from "@/components/base/appBar";
import ListItem from "@/components/base/listItem";
import StatusBar from "@/components/base/statusBar";
import ThemeSwitch from "@/components/base/switch";
import ThemeText from "@/components/base/themeText";
import VerticalSafeAreaView from "@/components/base/verticalSafeAreaView";
import globalStyle from "@/constants/globalStyle";
import { useI18N } from "@/core/i18n";
import LyricUtil from "@/native/lyricUtil";
import NativeUtils from "@/native/utils";
import rpx from "@/utils/rpx";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { AppState, StyleSheet } from "react-native";
import PermissionManager from "@/utils/permissionManager";

type IPermissionTypes = "floatingWindow" | "fileStorage" | "notification";

export default function Permissions() {
    const appState = useRef(AppState.currentState);
    const [permissions, setPermissions] = useState<
        Record<IPermissionTypes, boolean>
    >({
        floatingWindow: false,
        fileStorage: false,
        notification: false,
    });
    const { t } = useI18N();

    const checkPermission = useCallback(async (type?: IPermissionTypes) => {
        let newPermission = { ...permissions };
        
        if (!type || type === "floatingWindow") {
            const hasPermission = await LyricUtil.checkSystemAlertPermission();
            newPermission.floatingWindow = hasPermission;
        }
        
        if (!type || type === "fileStorage") {
            const hasPermission = await NativeUtils.checkStoragePermission();
            newPermission.fileStorage = hasPermission;
        }
        
        if (!type || type === "notification") {
            const status = await PermissionManager.checkPermission("notification");
            newPermission.notification = status.hasPermission;
        }

        setPermissions(newPermission);
    }, [permissions]);

    useEffect(() => {
        checkPermission();
        const subscription = AppState.addEventListener(
            "change",
            nextAppState => {
                if (
                    appState.current.match(/inactive|background/) &&
                    nextAppState === "active"
                ) {
                    checkPermission();
                }
                appState.current = nextAppState;
            }
        );
        return () => {
            subscription.remove();
        };
    }, [checkPermission]);

    const handleRequestNotification = async () => {
        const hasPermission = await PermissionManager.requestPermission("notification");
        if (!hasPermission) {
            const status = await PermissionManager.checkPermission("notification");
            if (!status.canAskAgain) {
                PermissionManager.openSettings();
            }
        }
        checkPermission("notification");
    };

    return (
        <VerticalSafeAreaView style={globalStyle.fwflex1}>
            <StatusBar />
            <AppBar>{t("permissionSetting.title")}</AppBar>
            <ThemeText style={styles.description}>
                {t("permissionSetting.description")}
            </ThemeText>
            
            <ListItem
                withHorizontalPadding
                heightType="big"
                onPress={handleRequestNotification}>
                <ListItem.Content
                    title="通知权限"
                    description="用以显示播放控制和消息通知"
                />
                <ThemeSwitch value={permissions.notification} />
            </ListItem>
            
            <ListItem
                withHorizontalPadding
                heightType="big"
                onPress={() => {
                    LyricUtil.requestSystemAlertPermission();
                }}>
                <ListItem.Content
                    title={t("permissionSetting.floatWindowPermission")}
                    description={t("permissionSetting.floatWindowPermissionDescription")}
                />
                <ThemeSwitch value={permissions.floatingWindow} />
            </ListItem>
            
            <ListItem
                withHorizontalPadding
                heightType="big"
                onPress={() => {
                    NativeUtils.requestStoragePermission();
                }}>
                <ListItem.Content
                    title={t("permissionSetting.fileReadWritePermission")}
                    description={t("permissionSetting.fileReadWritePermissionDescription")}
                />
                <ThemeSwitch value={permissions.fileStorage} />
            </ListItem>
        </VerticalSafeAreaView>
    );
}

const styles = StyleSheet.create({
    description: {
        width: "100%",
        paddingHorizontal: rpx(24),
        marginVertical: rpx(36),
    },
});
