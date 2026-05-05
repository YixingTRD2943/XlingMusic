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
    
    // 生成不同格式的图标
    const outputPath1 = path.join(dir, 'ic_launcher.webp');
    const outputPath2 = path.join(dir, 'ic_launcher_round.webp');
    const outputPath3 = path.join(dir, 'ic_launcher_foreground.webp');
    
    console.log(`生成 ${name} (${size}x${size})...`);
    
    try {
      const sharp = require('sharp');
      
      // 生成 launcher 图标
      await sharp(sourceIconPath)
        .resize(size, size)
        .webp({ quality: 90 })
        .toFile(outputPath1);
      console.log(`✓ ${outputPath1}`);
      
      // 生成 round 图标
      await sharp(sourceIconPath)
        .resize(size, size)
        .webp({ quality: 90 })
        .toFile(outputPath2);
      console.log(`✓ ${outputPath2}`);
      
      // 生成 foreground 图标
      await sharp(sourceIconPath)
        .resize(size, size)
        .webp({ quality: 90 })
        .toFile(outputPath3);
      console.log(`✓ ${outputPath3}`);
      
    } catch (error) {
      console.error(`✗ 生成 ${name} 失败: ${error.message}`);
    }
  }
  
  // 也生成一个用于 Google Play Store 的大图标
  const playStorePath = path.join(outputDir, '..', 'ic_launcher-playstore.png');
  try {
    const sharp = require('sharp');
    await sharp(sourceIconPath)
      .resize(512, 512)
      .png({ quality: 95 })
      .toFile(playStorePath);
    console.log(`✓ ${playStorePath}`);
  } catch (error) {
    console.error(`✗ 生成 Play Store 图标失败: ${error.message}`);
  }
  
  console.log('\n🎉 图标生成完成！');
}

generateIcons();
