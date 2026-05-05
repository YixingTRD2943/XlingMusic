const fs = require('fs');
const path = require('path');

const iconSizes = [
  { name: 'mdpi', size: 48 },
  { name: 'hdpi', size: 72 },
  { name: 'xhdpi', size: 96 },
  { name: 'xxhdpi', size: 144 },
  { name: 'xxxhdpi', size: 192 },
];

const sourceIconPath = process.argv[2];
const outputDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

if (!sourceIconPath) {
  console.error('请提供源图标路径作为参数');
  console.error('用法: node generate-icons.js <源图标路径>');
  process.exit(1);
}

if (!fs.existsSync(sourceIconPath)) {
  console.error(`源图标不存在: ${sourceIconPath}`);
  process.exit(1);
}

async function generateIcons() {
  console.log('🎨 开始生成应用图标...');
  
  for (const { name, size } of iconSizes) {
    const dir = path.join(outputDir, `mipmap-${name}`);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const outputPath = path.join(dir, 'ic_launcher_foreground.webp');
    
    console.log(`生成 ${name} (${size}x${size})...`);
    
    try {
      const sharp = require('sharp');
      await sharp(sourceIconPath)
        .resize(size, size)
        .webp({ quality: 90 })
        .toFile(outputPath);
      console.log(`✓ ${outputPath}`);
    } catch (error) {
      console.error(`✗ 生成 ${name} 失败: ${error.message}`);
      console.log('提示: 需要安装 sharp 库: npm install sharp');
    }
  }
  
  console.log('\n🎉 图标生成完成！');
  console.log('请确保安装了 sharp: npm install sharp');
}

generateIcons();