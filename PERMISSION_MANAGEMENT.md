# 权限管理系统

## 概述

为 MusicFree 应用实现了完整的权限管理系统，提供了统一的权限检查、请求和管理接口。

## 新增文件

### 1. `src/utils/permissionManager.ts`
核心权限管理工具类，提供以下功能：

#### 权限类型
- `notification`: 通知权限
- `storage`: 存储权限
- `floatWindow`: 悬浮窗权限
- `readStorage`: 读取存储权限
- `writeStorage`: 写入存储权限

#### 主要方法

##### `checkPermission(permission: PermissionType): Promise<PermissionStatus>`
检查权限状态，返回：
- `hasPermission`: 是否已有权限
- `canAskAgain`: 是否可以再次请求权限
- `status`: 原始状态字符串

##### `requestPermission(permission: PermissionType): Promise<boolean>`
请求指定权限，返回是否成功获取权限

##### `checkAndRequest(permission: PermissionType, options?): Promise<boolean>`
检查并请求权限，如果权限被拒绝且不能再次请求，会显示理由对话框

##### `withPermission<T>(permission: PermissionType, action: () => Promise<T>, options?): Promise<T | null>`
确保有权限才执行操作，如果没有权限会先请求权限。如果权限获取失败，返回 null 并显示错误提示。

##### `openSettings(): void`
打开系统设置页面

##### `getPermissionName(permission: PermissionType): string`
获取权限的中文名称

### 2. `src/utils/permissionManager.example.ts`
使用示例文件，展示了如何在项目中使用权限管理工具

## 修改文件

### 1. `src/pages/permissions/index.tsx`
- 添加了通知权限的管理
- 集成了 PermissionManager
- 当用户点击权限开关时，会自动检查和请求权限

### 2. `src/entry/bootstrap/bootstrap.ts`
- 集成了 PermissionManager
- 在应用启动时自动检查并请求通知权限（Android 13+）

### 3. `src/pages/setting/settingTypes/basicSetting.tsx`
- 集成了 PermissionManager
- 桌面歌词开关现在使用 withPermission 方法确保权限
- 如果没有悬浮窗权限，会显示理由对话框并引导用户去设置

### 4. `src/components/panels/types/musicItemLyricOptions.tsx`
- 集成了 PermissionManager
- 桌面歌词开关现在使用 withPermission 方法确保权限
- 提供了更好的用户体验

## 主要特性

### 1. 统一的权限管理
所有权限相关的操作都通过 PermissionManager 进行，提供了一致的接口

### 2. 智能权限请求
- 自动处理不同 Android 版本的权限差异
- 对于需要特殊处理的权限（如存储、悬浮窗）提供了专门的处理

### 3. 用户友好的体验
- 权限请求前显示理由说明
- 权限被永久拒绝后引导用户到设置页面
- 提供了清晰的错误提示

### 4. 与现有代码无缝集成
- 保持了原有的功能完整性
- 渐进式升级，不影响现有用户体验

## 使用示例

### 基础使用

```typescript
import PermissionManager from "@/utils/permissionManager";

// 检查权限
const status = await PermissionManager.checkPermission("notification");
if (status.hasPermission) {
    console.log("已有通知权限");
}

// 请求权限
const success = await PermissionManager.requestPermission("storage");
if (success) {
    console.log("权限请求成功");
}
```

### 使用 withPermission 确保权限

```typescript
import PermissionManager from "@/utils/permissionManager";

const result = await PermissionManager.withPermission(
    "floatWindow",
    async () => {
        // 需要权限的操作
        await LyricUtil.showStatusBarLyric("MusicFree", config);
        return true;
    },
    {
        rationaleTitle: "需要悬浮窗权限",
        rationaleMessage: "我们需要悬浮窗权限来显示桌面歌词",
        errorMessage: "无法获取悬浮窗权限",
    }
);

if (result) {
    console.log("操作成功完成");
}
```

### 在设置页面中使用

```typescript
const handlePermissionToggle = async (newValue: boolean) => {
    if (newValue) {
        const success = await PermissionManager.withPermission(
            "notification",
            async () => {
                // 执行需要权限的操作
                return true;
            },
            {
                rationaleTitle: "需要通知权限",
                rationaleMessage: "我们需要通知权限来显示播放控制",
            }
        );
        
        if (!success) {
            // 处理权限获取失败的情况
            Config.setConfig("permission.enabled", false);
        }
    } else {
        // 关闭功能
        Config.setConfig("permission.enabled", false);
    }
};
```

## 权限说明

### 通知权限
- **用途**: 显示播放控制通知
- **Android 版本**: Android 13 (API 33) 及以上需要
- **请求时机**: 应用启动时

### 存储权限
- **用途**: 下载音乐、备份歌单
- **Android 版本**: 
  - Android 13 以下需要 READ_EXTERNAL_STORAGE 和 WRITE_EXTERNAL_STORAGE
  - Android 13 及以上需要 MANAGE_EXTERNAL_STORAGE
- **请求时机**: 首次下载或备份时

### 悬浮窗权限
- **用途**: 显示桌面歌词
- **请求时机**: 用户开启桌面歌词时

## 注意事项

1. **权限请求时机**: 应该在真正需要使用权限时再请求，而不是在应用启动时请求所有权限
2. **权限理由说明**: 应该清楚地向用户说明为什么需要这个权限
3. **优雅降级**: 如果用户拒绝权限，应该提供替代方案或清晰的错误提示
4. **权限状态检查**: 在执行需要权限的操作前，应该先检查权限状态
5. **设置页面引导**: 如果权限被永久拒绝，应该引导用户到系统设置页面

## 未来扩展

可以考虑添加以下功能：
- 权限使用统计
- 权限状态变化监听
- 批量权限请求
- iOS 平台支持
