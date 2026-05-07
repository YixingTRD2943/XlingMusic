/**
 * 权限管理器使用示例
 * 
 * 这个文件展示了如何在项目中使用 PermissionManager
 */

import PermissionManager from "./permissionManager";

// 示例 1: 检查权限状态
async function checkPermissionExample() {
    const status = await PermissionManager.checkPermission("notification");
    console.log("权限状态:", status);
    // {
    //   hasPermission: boolean,     // 是否有权限
    //   canAskAgain: boolean,       // 是否可以再次请求
    //   status: string              // 原始状态字符串
    // }
}

// 示例 2: 请求权限
async function requestPermissionExample() {
    const hasPermission = await PermissionManager.requestPermission("notification");
    if (hasPermission) {
        console.log("已获得通知权限");
    } else {
        console.log("未获得通知权限");
    }
}

// 示例 3: 检查并请求权限
async function checkAndRequestExample() {
    const hasPermission = await PermissionManager.checkAndRequest("notification", {
        showRationale: true,
        rationaleTitle: "需要通知权限",
        rationaleMessage: "我们需要通知权限来显示播放控制",
    });
  
    if (hasPermission) {
        console.log("权限已获得");
    }
}

// 示例 4: 确保有权限才执行操作
async function withPermissionExample() {
    const result = await PermissionManager.withPermission(
        "storage",
        async () => {
            // 这里是需要权限的操作
            console.log("执行需要存储权限的操作");
            return "操作成功";
        },
        {
            showError: true,
            errorMessage: "需要存储权限才能执行此操作",
            rationaleTitle: "需要存储权限",
            rationaleMessage: "我们需要存储权限来保存音乐文件",
        }
    );
  
    if (result) {
        console.log(result); // "操作成功"
    }
}

// 示例 5: 打开设置页面
function openSettingsExample() {
    PermissionManager.openSettings();
}

// 示例 6: 获取权限名称
function getPermissionNameExample() {
    const name = PermissionManager.getPermissionName("notification");
    console.log(name); // "通知权限"
}

/**
 * 在实际组件中的使用示例
 */
// import PermissionManager from "@/utils/permissionManager";
// 
// function MyComponent() {
//   const handleDownload = async () => {
//     await PermissionManager.withPermission(
//       "storage",
//       async () => {
//         // 执行下载操作
//         await downloadMusic();
//       },
//       {
//         rationaleTitle: "需要存储权限",
//         rationaleMessage: "我们需要存储权限来下载和保存音乐文件",
//       }
//     );
//   };
//   
//   return (
//     <Button onPress={handleDownload} title="下载音乐" />
//   );
// }

export {
    checkPermissionExample,
    requestPermissionExample,
    checkAndRequestExample,
    withPermissionExample,
    openSettingsExample,
    getPermissionNameExample,
};
