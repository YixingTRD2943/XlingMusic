/**
 * @format
 */

// Process polyfill - 必须在所有 import 之前执行
// 注意：ES6 import 会被提升，所以这里不能用 import
if (typeof global.process === 'undefined') {
    global.process = {};
}
if (typeof global.process.listeners !== 'function') {
    global.process.listeners = function(eventName) {
        return [];
    };
}
if (typeof global.process.on !== 'function') {
    global.process.on = function(eventName, callback) {
        // React Native/Hermes environment - no-op
    };
}

const {AppRegistry} = require('react-native');
const {name: appName} = require('./app.json');
const Pages = require('./src/entry/index').default;

AppRegistry.registerComponent(appName, () => Pages);

// 注册 TrackPlayer 播放服务 - 通知栏控制必须
// 直接使用 AppRegistry.registerHeadlessTask 注册后台任务
AppRegistry.registerHeadlessTask('TrackPlayer', () => require('./src/service'));
