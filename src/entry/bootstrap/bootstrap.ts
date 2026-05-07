import "react-native-get-random-values";

import { getCurrentDialog, showDialog } from "@/components/dialogs/useDialog.ts";
import { ImgAsset } from "@/constants/assetsConst";
import { emptyFunction, localPluginHash, supportLocalMediaType } from "@/constants/commonConst";
import pathConst from "@/constants/pathConst";
import Config from "@/core/appConfig";
import downloader, { DownloadFailReason, DownloaderEvent } from "@/core/downloader";
import LocalMusicSheet from "@/core/localMusicSheet";
import lyricManager from "@/core/lyricManager";
import musicHistory from "@/core/musicHistory";
import MusicSheet from "@/core/musicSheet";
import PluginManager from "@/core/pluginManager";
import Theme from "@/core/theme";
import TrackPlayer from "@/core/trackPlayer";
import NativeUtils from "@/native/utils";
import { checkAndCreateDir } from "@/utils/fileUtils";
import { errorLog, trace } from "@/utils/log";
import { IPerfLogger, perfLogger } from "@/utils/perfLogger";
import PersistStatus from "@/utils/persistStatus";
import Toast from "@/utils/toast";
import * as SplashScreen from "expo-splash-screen";
import { Linking, Platform } from "react-native";
import { PERMISSIONS, check, request } from "react-native-permissions";
import RNTrackPlayer, { AppKilledPlaybackBehavior, Capability } from "react-native-track-player";
import i18n from "@/core/i18n";
import bootstrapAtom from "./bootstrap.atom";
import { getDefaultStore } from "jotai";
import PermissionManager from "@/utils/permissionManager";

PluginManager.injectDependencies(Config);
musicHistory.injectDependencies(Config);
TrackPlayer.injectDependencies(Config, musicHistory, PluginManager);
downloader.injectDependencies(Config, PluginManager);
lyricManager.injectDependencies(TrackPlayer, Config, PluginManager);
MusicSheet.injectDependencies(Config);

async function bootstrapImpl() {
    await SplashScreen.preventAutoHideAsync()
        .then(result => console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`))
        .catch(console.warn);
    
    const logger = perfLogger();
    
    // 1. 并行执行：权限检查 + 文件夹初始化
    await Promise.all([
        checkPermissions(logger),
        setupFolder().then(() => {
            trace("文件夹初始化完成");
            logger.mark("文件夹初始化完成");
        }),
    ]);

    // 2. 并行执行：配置加载
    await Promise.all([
        Config.setup().then(() => logger.mark("Config")),
        MusicSheet.setup().then(() => logger.mark("MusicSheet")),
        musicHistory.setup().then(() => logger.mark("musicHistory")),
    ]);
    trace("配置初始化完成");
    logger.mark("配置初始化完成");

    // 3. 插件加载（支持懒加载）
    await PluginManager.setup();
    logger.mark("插件初始化完成");
    trace("插件初始化完成");

    // 4. 播放器初始化（延迟执行，不阻塞启动）
    initTrackPlayerAsync(logger);

    // 5. 本地音乐初始化（延迟执行，不阻塞启动）
    LocalMusicSheet.setup().then(() => {
        trace("本地音乐初始化完成");
        logger.mark("本地音乐初始化完成");
    });

    // 6. 主题和语言初始化
    Theme.setup();
    trace("主题初始化完成");
    logger.mark("主题初始化完成");

    i18n.setup();
    logger.mark("语言模块初始化完成");

    // 7. 非阻塞的额外初始化（延迟1秒执行）
    setTimeout(() => {
        extraMakeup();
    }, 1000);

    ErrorUtils.setGlobalHandler(error => {
        errorLog("未捕获的错误", error);
    });
}

async function checkPermissions(logger: IPerfLogger) {
    if (Platform.OS === "android") {
        if (Platform.Version >= 30) {
            const hasPermission = await NativeUtils.checkStoragePermission();
            if (!hasPermission && !PersistStatus.get("app.skipBootstrapStorageDialog")) {
                showDialog("CheckStorage");
            }
        } else {
            const [readStoragePermission, writeStoragePermission] = await Promise.all([
                check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE),
                check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE),
            ]);
            if (!(readStoragePermission === "granted" && writeStoragePermission === "granted")) {
                await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
                await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
            }
        }

        if (Platform.Version >= 33) {
            const notificationStatus = await PermissionManager.checkPermission("notification");
            if (!notificationStatus.hasPermission && notificationStatus.canAskAgain) {
                await PermissionManager.requestPermission("notification");
            }
        }
    }
    logger.mark("权限检查完成");
}

async function setupFolder() {
    await Promise.all([
        checkAndCreateDir(pathConst.dataPath),
        checkAndCreateDir(pathConst.logPath),
        checkAndCreateDir(pathConst.cachePath),
        checkAndCreateDir(pathConst.pluginPath),
        checkAndCreateDir(pathConst.lrcCachePath),
        checkAndCreateDir(pathConst.downloadCachePath),
        checkAndCreateDir(pathConst.localLrcPath),
        checkAndCreateDir(pathConst.downloadPath).then(() => {
            checkAndCreateDir(pathConst.downloadMusicPath);
        }),
    ]);
}

export async function initTrackPlayer(logger?: IPerfLogger) {
    try {
        await RNTrackPlayer.setupPlayer({
            maxCacheSize: Config.getConfig("basic.maxCacheSize") ?? 1024 * 1024 * 512,
        });
    } catch (e: any) {
        if (e?.message !== "The player has already been initialized via setupPlayer.") {
            throw e;
        }
    }
    logger?.mark("加载播放器");

    const capabilities = Config.getConfig("basic.showExitOnNotification")
        ? [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious, Capability.Stop]
        : [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious];
    
    await RNTrackPlayer.updateOptions({
        icon: ImgAsset.logoTransparent,
        progressUpdateEventInterval: 1,
        android: {
            alwaysPauseOnInterruption: true,
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
        },
        capabilities,
        compactCapabilities: capabilities,
        notificationCapabilities: [...capabilities, Capability.SeekTo],
    });
    logger?.mark("播放器初始化完成");
    trace("播放器初始化完成");

    await TrackPlayer.setupTrackPlayer();
    trace("播放列表初始化完成");
    logger?.mark("播放列表初始化完成");

    await lyricManager.setup();
    logger?.mark("歌词初始化完成");
}

let trackPlayerInitialized = false;
async function initTrackPlayerAsync(logger?: IPerfLogger) {
    if (trackPlayerInitialized) return;
    trackPlayerInitialized = true;

    try {
        await initTrackPlayer(logger);
    } catch (err) {
        const bootstrapState = getDefaultStore().get(bootstrapAtom);
        if (bootstrapState.state === "Loading") {
            getDefaultStore().set(bootstrapAtom, {
                state: "TrackPlayerError",
                reason: err,
            });
        }
    }
}

async function extraMakeup() {
    try {
        if (Config.getConfig("basic.autoUpdatePlugin")) {
            const lastUpdated = PersistStatus.get("app.pluginUpdateTime") || 0;
            const now = Date.now();
            if (Math.abs(now - lastUpdated) > 86400000) {
                PersistStatus.set("app.pluginUpdateTime", now);
                const plugins = PluginManager.getEnabledPlugins();
                for (let i = 0; i < plugins.length; ++i) {
                    const srcUrl = plugins[i].instance.srcUrl;
                    if (srcUrl) {
                        await PluginManager.installPluginFromUrl(srcUrl).catch(emptyFunction);
                    }
                }
            }
        }
    } catch { }

    async function handleLinkingUrl(url: string) {
        try {
            if (url.startsWith("musicfree://install/")) {
                const plugins = url.slice(20).split(",").map(decodeURIComponent);
                await Promise.all(plugins.map(it => PluginManager.installPluginFromUrl(it).catch(emptyFunction)));
                Toast.success("安装成功~");
            } else if (url.endsWith(".js")) {
                PluginManager.installPluginFromLocalFile(url, {
                    notCheckVersion: Config.getConfig("basic.notCheckPluginVersion"),
                }).then(res => {
                    if (res.success) {
                        Toast.success(`插件「${res.pluginName}」安装成功~`);
                    } else {
                        Toast.warn("安装失败: " + res.message);
                    }
                }).catch(e => {
                    console.log(e);
                    Toast.warn(e?.message ?? "无法识别此插件");
                });
            } else if (supportLocalMediaType.some(it => url.endsWith(it))) {
                const musicItem = await PluginManager.getByHash(localPluginHash)?.instance?.importMusicItem?.(url);
                if (musicItem) {
                    TrackPlayer.play(musicItem);
                }
            }
        } catch { }
    }

    Linking.addEventListener("url", data => {
        if (data.url) {
            handleLinkingUrl(data.url);
        }
    });
    
    const initUrl = await Linking.getInitialURL();
    if (initUrl) {
        handleLinkingUrl(initUrl);
    }

    if (Config.getConfig("basic.autoPlayWhenAppStart")) {
        TrackPlayer.play();
    }
}

function bindEvents() {
    downloader.on(DownloaderEvent.DownloadError, (reason) => {
        if (reason === DownloadFailReason.NetworkOffline) {
            Toast.warn("当前无网络连接，请等待网络恢复后重试");
        } else if (reason === DownloadFailReason.NotAllowToDownloadInCellular) {
            if (getCurrentDialog()?.name !== "SimpleDialog") {
                showDialog("SimpleDialog", {
                    title: "流量提醒",
                    content: "当前非WIFI环境，为节省流量，请到侧边栏设置中打开【使用移动网络下载】功能后方可继续下载",
                });
            }
        }
    });

    downloader.on(DownloaderEvent.DownloadQueueCompleted, () => {
        Toast.success("下载任务已完成");
    });
}

export default async function () {
    try {
        getDefaultStore().set(bootstrapAtom, { state: "Loading" });
        await bootstrapImpl();
        bindEvents();
        getDefaultStore().set(bootstrapAtom, { state: "Done" });
    } catch (e: any) {
        errorLog("初始化出错", e);
        if (getDefaultStore().get(bootstrapAtom).state === "Loading") {
            getDefaultStore().set(bootstrapAtom, { state: "Fatal", reason: e });
        }
    }
    console.log("HIDE");
    await SplashScreen.hideAsync();
}
