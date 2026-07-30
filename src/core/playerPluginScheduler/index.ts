import { errorLog, trace, devLog } from "@/utils/log";
import delay from "@/utils/delay";
import { IPlugin } from "@/types/plugin";
import type { IMusic } from "@/types/music";

export enum PluginPlayState {
    PLUGIN_FAILED = "plugin_failed",
    SONG_EXHAUSTED = "song_exhausted",
}

export interface IPluginPlayAttempt {
    pluginName: string;
    quality: string;
    success: boolean;
    error?: string;
    errorCode?: string;
    duration: number;
}

export interface IPluginPlayResult {
    success: boolean;
    source?: IMusic.IMediaSourceResult;
    attempts: IPluginPlayAttempt[];
    finalState: PluginPlayState;
}

export interface ISchedulerConfig {
    maxPluginRetries: number;
    retryDelayMs: number;
    songExhaustedThreshold: number;
    maxConsecutiveErrorsPerSong: number;
    logErrors: boolean;
}

const DEFAULT_CONFIG: ISchedulerConfig = {
    maxPluginRetries: 3,
    retryDelayMs: 300,
    songExhaustedThreshold: 3,
    maxConsecutiveErrorsPerSong: 5,
    logErrors: true,
};

/**
 * 播放插件调度器
 * 负责按优先级轮询多个播放插件，在插件失败时自动切换至下一个插件
 * 区分"插件尝试失败"与"歌曲资源彻底失效"两种状态，避免无限切歌循环
 */
class PlayerPluginScheduler {
    private config: ISchedulerConfig;
    private sortedPlugins: IPlugin[] = [];
    private songErrorCounter: Map<string, number> = new Map();
    private pluginErrorCounter: Map<string, number> = new Map();
    private lastPlayedPlugin: Map<string, string> = new Map();

    constructor(config?: Partial<ISchedulerConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * 设置插件列表（按优先级排序）
     * @param plugins 插件数组，按优先级从高到低排列
     */
    setPlugins(plugins: IPlugin[]): void {
        this.sortedPlugins = [...plugins].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0),
        );
    }

    /**
     * 更新单个插件的优先级
     */
    updatePluginOrder(pluginName: string, order: number): void {
        const plugin = this.sortedPlugins.find(p => p.name === pluginName);
        if (plugin) {
            plugin.order = order;
            this.sortedPlugins.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
    }

    /**
     * 获取当前可用的播放插件列表（按优先级）
     */
    getAvailablePlugins(): IPlugin[] {
        return this.sortedPlugins.filter(p => p.enabled !== false);
    }

    /**
     * 尝试用所有可用插件播放一首歌曲
     * 按优先级依次尝试每个插件，返回第一个成功的结果
     *
     * @param musicItem 音乐项
     * @param quality 音质选项
     * @param getSourceFn 获取音源的异步函数
     * @returns 播放结果（包含成功状态、使用的插件、尝试记录等）
     */
    async tryPlayWithPlugins(
        musicItem: IMusic.IMusicItem,
        quality: string,
        getSourceFn: (
            plugin: IPlugin,
            musicItem: IMusic.IMusicItem,
            quality: string,
        ) => Promise<IMusic.IMediaSourceResult | null>,
    ): Promise<IPluginPlayResult> {
        const songId = this.getSongId(musicItem);
        const availablePlugins = this.getAvailablePlugins();

        if (availablePlugins.length === 0) {
            errorLog("[PluginScheduler] 没有可用的播放插件");
            return {
                success: false,
                attempts: [],
                finalState: PluginPlayState.PLUGIN_FAILED,
            };
        }

        const attempts: IPluginPlayAttempt[] = [];
        let consecutiveErrors = 0;

        for (let i = 0; i < availablePlugins.length; i++) {
            const plugin = availablePlugins[i];
            const attemptStart = Date.now();
            const pluginName = plugin.name;

            trace("[PluginScheduler]", "尝试使用插件播放:", pluginName, "歌曲:", songId);

            try {
                const source = await getSourceFn(plugin, musicItem, quality);
                const attemptDuration = Date.now() - attemptStart;

                if (source?.url) {
                    this.onPluginSuccess(pluginName, songId);
                    devLog("[PluginScheduler]", `插件 ${pluginName} 播放成功，耗时 ${attemptDuration}ms`);
                    return {
                        success: true,
                        source,
                        attempts: [...attempts, {
                            pluginName,
                            quality,
                            success: true,
                            duration: attemptDuration,
                        }],
                        finalState: PluginPlayState.PLUGIN_FAILED,
                    };
                } else {
                    const errorMsg = `${pluginName} 返回空音源`;
                    this.onPluginFailed(pluginName, songId);
                    attempts.push({
                        pluginName,
                        quality,
                        success: false,
                        error: errorMsg,
                        duration: attemptDuration,
                    });
                    consecutiveErrors++;
                    devLog("[PluginScheduler]", `插件 ${pluginName} 未返回音源，错误数: ${consecutiveErrors}`);
                }
            } catch (e: any) {
                const attemptDuration = Date.now() - attemptStart;
                const errorMsg = e?.message ?? "未知错误";
                const errorCode = e?.code ?? "unknown";

                this.onPluginFailed(pluginName, songId);
                attempts.push({
                    pluginName,
                    quality,
                    success: false,
                    error: errorMsg,
                    errorCode,
                    duration: attemptDuration,
                });
                consecutiveErrors++;

                if (this.config.logErrors) {
                    errorLog("[PluginScheduler]", `插件 ${pluginName} 播放失败: ${errorMsg} (code: ${errorCode})`, { songId, quality });
                }
            }

            if (consecutiveErrors >= this.config.maxConsecutiveErrorsPerSong) {
                if (this.config.logErrors) {
                    errorLog("[PluginScheduler]", `歌曲 ${songId} 连续错误 ${consecutiveErrors} 次，判定为资源失效`);
                }
                return {
                    success: false,
                    attempts,
                    finalState: PluginPlayState.SONG_EXHAUSTED,
                };
            }

            if (i < availablePlugins.length - 1) {
                trace("[PluginScheduler]", `等待 ${this.config.retryDelayMs}ms 后切换到下一插件...`);
                await delay(this.config.retryDelayMs);
            }
        }

        return {
            success: false,
            attempts,
            finalState: PluginPlayState.PLUGIN_FAILED,
        };
    }

    /**
     * 检查歌曲是否已彻底失效（所有插件都尝试后仍失败）
     * 当连续错误次数超过阈值时判定为"资源失效"
     */
    isSongExhausted(musicItem: IMusic.IMusicItem): boolean {
        const songId = this.getSongId(musicItem);
        const errorCount = this.songErrorCounter.get(songId) ?? 0;
        return errorCount >= this.config.songExhaustedThreshold;
    }

    /**
     * 获取某歌曲的连续错误计数
     */
    getSongErrorCount(musicItem: IMusic.IMusicItem): number {
        return this.songErrorCounter.get(this.getSongId(musicItem)) ?? 0;
    }

    /**
     * 重置某歌曲的错误计数（当成功播放后调用）
     */
    resetSongErrorCount(musicItem: IMusic.IMusicItem): void {
        this.songErrorCounter.delete(this.getSongId(musicItem));
    }

    /**
     * 标记插件失败（公开方法，供外部调用）
     */
    onPluginFailed(pluginName: string, songId: string): void {
        this.onPluginFailedInternal(pluginName, songId);
    }

    /**
     * 标记插件失败（内部方法）
     */
    private onPluginFailedInternal(pluginName: string, songId: string): void {
        const count = this.songErrorCounter.get(songId) ?? 0;
        this.songErrorCounter.set(songId, count + 1);

        const pCount = this.pluginErrorCounter.get(pluginName) ?? 0;
        this.pluginErrorCounter.set(pluginName, pCount + 1);
    }

    /**
     * 插件成功播放，重置该歌曲的错误计数
     */
    private onPluginSuccess(pluginName: string, songId: string): void {
        this.songErrorCounter.delete(songId);
        this.pluginErrorCounter.delete(pluginName);
        this.lastPlayedPlugin.set(songId, pluginName);
    }

    /**
     * 获取音乐项的唯一标识
     */
    private getSongId(musicItem: IMusic.IMusicItem): string {
        return `${musicItem.platform || "unknown"}:${musicItem.id ?? musicItem.title ?? ""}`;
    }

    /**
     * 获取插件错误统计
     */
    getPluginErrorStats(): Map<string, number> {
        return new Map(this.pluginErrorCounter);
    }

    /**
     * 重置所有统计计数器
     */
    resetAllCounters(): void {
        this.songErrorCounter.clear();
        this.pluginErrorCounter.clear();
        this.lastPlayedPlugin.clear();
    }

    /**
     * 获取当前配置
     */
    getConfig(): ISchedulerConfig {
        return { ...this.config };
    }

    /**
     * 更新配置
     */
    updateConfig(config: Partial<ISchedulerConfig>): void {
        this.config = { ...this.config, ...config };
    }
}

export const playerPluginScheduler = new PlayerPluginScheduler();
export default playerPluginScheduler;