const fs = require('fs');
const path = require('path');

console.log('📱 保存应用图标脚本');
console.log('请将你的图标文件重命名为 "app-icon.png" 并放在项目根目录');
console.log('然后运行: node save-app-icon.js');

const sourcePath = path.join(__dirname, 'app-icon.png');
const destPath = path.join(__dirname, 'src', 'assets', 'app-icon', 'app-icon.png');

if (fs.existsSync(sourcePath)) {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(sourcePath, destPath);
    console.log('✓ 图标已保存到: src/assets/app-icon/app-icon.png');
    console.log('现在可以运行: node generate-icons.js src/assets/app-icon/app-icon.png');
} else {
    console.error('✗ 未找到图标文件: app-icon.png');
    console.log('请确保图标文件在项目根目录');
}
