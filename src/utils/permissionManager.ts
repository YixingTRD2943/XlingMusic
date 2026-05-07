import { Platform, Linking } from "react-native";
import { PERMISSIONS, check, request, RESULTS } from "react-native-permissions";
import NativeUtils from "@/native/utils";
import LyricUtil from "@/native/lyricUtil";
import Toast from "./toast";
import { showDialog } from "@/components/dialogs/useDialog";

export type PermissionType = 
  | "notification" 
  | "storage" 
  | "floatWindow"
  | "readStorage"
  | "writeStorage";

export interface PermissionStatus {
  hasPermission: boolean;
  canAskAgain: boolean;
  status: string;
}

export class PermissionManager {
    /**
   * 检查权限状态
   */
    static async checkPermission(permission: PermissionType): Promise<PermissionStatus> {
        if (Platform.OS === "android") {
            switch (permission) {
            case "notification":
                if (Platform.Version >= 33) {
                    const status = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
                    return {
                        hasPermission: status === RESULTS.GRANTED,
                        canAskAgain: status !== RESULTS.BLOCKED,
                        status,
                    };
                }
                return { hasPermission: true, canAskAgain: false, status: "granted" };
        
            case "storage":
                const hasStorage = await NativeUtils.checkStoragePermission();
                return {
                    hasPermission: hasStorage,
                    canAskAgain: true,
                    status: hasStorage ? "granted" : "denied",
                };
        
            case "floatWindow":
                const hasFloatWindow = await LyricUtil.checkSystemAlertPermission();
                return {
                    hasPermission: hasFloatWindow,
                    canAskAgain: true,
                    status: hasFloatWindow ? "granted" : "denied",
                };
        
            case "readStorage":
                if (Platform.Version < 33) {
                    const status = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                    return {
                        hasPermission: status === RESULTS.GRANTED,
                        canAskAgain: status !== RESULTS.BLOCKED,
                        status,
                    };
                }
                return { hasPermission: true, canAskAgain: false, status: "granted" };
        
            case "writeStorage":
                if (Platform.Version < 33) {
                    const status = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
                    return {
                        hasPermission: status === RESULTS.GRANTED,
                        canAskAgain: status !== RESULTS.BLOCKED,
                        status,
                    };
                }
                return { hasPermission: true, canAskAgain: false, status: "granted" };
            }
        }
    
        return { hasPermission: true, canAskAgain: false, status: "granted" };
    }

    /**
   * 请求权限
   */
    static async requestPermission(permission: PermissionType): Promise<boolean> {
        if (Platform.OS === "android") {
            switch (permission) {
            case "notification":
                if (Platform.Version >= 33) {
                    const status = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
                    return status === RESULTS.GRANTED;
                }
                return true;
        
            case "storage":
                NativeUtils.requestStoragePermission();
                return false;
        
            case "floatWindow":
                LyricUtil.requestSystemAlertPermission();
                return false;
        
            case "readStorage":
                if (Platform.Version < 33) {
                    const status = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                    return status === RESULTS.GRANTED;
                }
                return true;
        
            case "writeStorage":
                if (Platform.Version < 33) {
                    const status = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
                    return status === RESULTS.GRANTED;
                }
                return true;
            }
        }
    
        return true;
    }

    /**
   * 检查并请求权限
   */
    static async checkAndRequest(
        permission: PermissionType, 
        options?: {
      showRationale?: boolean;
      rationaleTitle?: string;
      rationaleMessage?: string;
    }
    ): Promise<boolean> {
        const status = await this.checkPermission(permission);
    
        if (status.hasPermission) {
            return true;
        }

        if (!status.canAskAgain && options?.showRationale) {
            showDialog("SimpleDialog", {
                title: options.rationaleTitle || "需要权限",
                content: options.rationaleMessage || "请在设置中开启此权限",
                onOk: () => {
                    Linking.openSettings();
                },
            });
            return false;
        }

        return await this.requestPermission(permission);
    }

    /**
   * 确保有权限才执行操作
   */
    static async withPermission<T>(
        permission: PermissionType,
        action: () => Promise<T>,
        options?: {
      showError?: boolean;
      errorMessage?: string;
      rationaleTitle?: string;
      rationaleMessage?: string;
    }
    ): Promise<T | null> {
        const hasPermission = await this.checkAndRequest(permission, {
            showRationale: true,
            rationaleTitle: options?.rationaleTitle,
            rationaleMessage: options?.rationaleMessage,
        });

        if (!hasPermission) {
            if (options?.showError !== false) {
                Toast.warn(options?.errorMessage || "需要权限才能继续操作");
            }
            return null;
        }

        try {
            return await action();
        } catch (error) {
            throw error;
        }
    }

    /**
   * 打开应用设置页面
   */
    static openSettings(): void {
        Linking.openSettings();
    }

    /**
   * 获取权限名称
   */
    static getPermissionName(permission: PermissionType): string {
        const names: Record<PermissionType, string> = {
            notification: "通知权限",
            storage: "存储权限",
            floatWindow: "悬浮窗权限",
            readStorage: "读取存储权限",
            writeStorage: "写入存储权限",
        };
        return names[permission];
    }
}

export default PermissionManager;
