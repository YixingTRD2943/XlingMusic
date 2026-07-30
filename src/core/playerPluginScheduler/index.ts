import { errorLog, trace, devLog } from "@/utils/log";
import delay from "@/utils/delay";
import type { Plugin } from "@/core/pluginManager/plugin";

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
    source?: IPlugin.IMediaSourceResult;
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
    private getPlugins: () => Plugin[];
    private songErrorCounter: Map<string, number> = new Map();
    private pluginErrorCounter: Map<string, number> = new Map();
    private lastPlayedPlugin: Map<string, string> = new Map();
    private platformPluginScore: Map<string, Map<string, number>> = new Map();

    constructor(
        getPlugins?: () => Plugin[],
        config?: Partial<ISchedulerConfig>,
    ) {
        this.getPlugins = getPlugins ?? (() => []);
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * 设置插件列表获取函数（每次调用时动态获取最新列表）
     * @param getPluginsFn 返回插件实例数组的函数
     */
    setPluginGetter(getPluginsFn: () => Plugin[]): void {
        this.getPlugins = getPluginsFn;
    }

    /**
     * 获取当前可用的播放插件列表（动态查询，始终为最新）
     */
    getAvailablePlugins(): Plugin[] {
        return this.getPlugins().filter(p => {
            try {
                return typeof p.isAvailable === "function" ? p.isAvailable() : p.state === 2;
            } catch {
                return false;
            }
        });
    }

    /**
     * 获取按相关性排序的插件列表，最匹配的插件排在最前
     * @param musicItem 当前要播放的歌曲
     */
    getRankedPlugins(musicItem: IMusic.IMusicItem): Plugin[] {
        const available = this.getAvailablePlugins();
        const platform = musicItem.platform;
        const platformHistory = this.platformPluginScore.get(platform);

        return available
            .map(plugin => ({
                plugin,
                score: this.calculatePluginScore(plugin, platform, platformHistory),
            }))
            .sort((a, b) => b.score - a.score)
            .map(item => item.plugin);
    }

    /**
     * 计算插件与歌曲的匹配度分数
     */
    private calculatePluginScore(
        plugin: Plugin,
        platform: string,
        platformHistory: Map<string, number> | undefined,
    ): number {
        let score = 0;

        // 1. 平台精确匹配（最高权重）
        if (plugin.name === platform) {
            score += 100;
        }
        if (plugin.hash === platform) {
            score += 100;
        }

        // 2. 已支持的平台方法
        if (plugin.name && platform && typeof plugin.name === "string") {
            if (plugin.name.toLowerCase() === platform.toLowerCase()) {
                score += 80;
            }
            if (plugin.name.includes(platform) || platform.includes(plugin.name)) {
                score += 50;
            }
        }

        // 3. 历史成功记录
        if (platformHistory?.has(plugin.name)) {
            const historyScore = platformHistory.get(plugin.name) ?? 0;
            score += Math.min(historyScore, 30);
        }

        // 4. 插件错误率惩罚
        const pluginErrors = this.pluginErrorCounter.get(plugin.name) ?? 0;
        score -= pluginErrors * 5;

        // 5. 最近使用过该插件的偏好
        for (const [, lastPlugin] of this.lastPlayedPlugin) {
            if (lastPlugin === plugin.name) {
                score += 10;
                break;
            }
        }

        // 6. 检查是否有 getMediaSource 能力
        if (plugin.hasMethod("getMediaSource")) {
            score += 20;
        }

        return Math.max(0, score);
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
            plugin: Plugin,
            musicItem: IMusic.IMusicItem,
            quality: string,
        ) => Promise<IPlugin.IMediaSourceResult | null>,
    ): Promise<IPluginPlayResult> {
        const songId = this.getSongId(musicItem);
        const rankedPlugins = this.getRankedPlugins(musicItem);

        if (rankedPlugins.length === 0) {
            errorLog("[PluginScheduler] 没有可用的播放插件");
            return {
                success: false,
                attempts: [],
                finalState: PluginPlayState.PLUGIN_FAILED,
            };
        }

        const attempts: IPluginPlayAttempt[] = [];
        let consecutiveErrors = 0;

        for (let i = 0; i < rankedPlugins.length; i++) {
            const plugin = rankedPlugins[i];
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

            if (i < rankedPlugins.length - 1) {
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
     * 标记插件失败（内部方法），同时降低该插件对该平台的匹配分数
     */
    private onPluginFailedInternal(pluginName: string, songId: string): void {
        const count = this.songErrorCounter.get(songId) ?? 0;
        this.songErrorCounter.set(songId, count + 1);

        const pCount = this.pluginErrorCounter.get(pluginName) ?? 0;
        this.pluginErrorCounter.set(pluginName, pCount + 1);

        const platform = songId.split(":")[0];
        if (platform && platform !== "unknown" && platform !== pluginName) {
            if (this.platformPluginScore.has(platform)) {
                const scores = this.platformPluginScore.get(platform)!;
                const current = scores.get(pluginName) ?? 0;
                scores.set(pluginName, Math.max(current - 2, -20));
            }
        }
    }

    /**
     * 插件成功播放，重置该歌曲的错误计数，并记录平台匹配成功
     */
    private onPluginSuccess(pluginName: string, songId: string): void {
        this.songErrorCounter.delete(songId);
        this.pluginErrorCounter.delete(pluginName);
        this.lastPlayedPlugin.set(songId, pluginName);

        const platform = songId.split(":")[0];
        if (platform && platform !== "unknown" && platform !== pluginName) {
            if (!this.platformPluginScore.has(platform)) {
                this.platformPluginScore.set(platform, new Map());
            }
            const scores = this.platformPluginScore.get(platform)!;
            const current = scores.get(pluginName) ?? 0;
            scores.set(pluginName, Math.min(current + 5, 50));
        }
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
        this.platformPluginScore.clear();
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