import PluginManager from "@/core/pluginManager";
import { PluginState } from "@/core/pluginManager/plugin";
import axios from "axios";
import EventEmitter from "eventemitter3";

export enum MediaSourceMatchResult {
    Success = "success",
    VerificationFailed = "verification-failed",
    PluginDisabled = "plugin-disabled",
    PluginStateError = "plugin-state-error",
    AllPluginsUnavailable = "all-plugins-unavailable",
    NoAvailableSource = "no-available-source",
}

export interface ISongSourceMatchResult {
    result: MediaSourceMatchResult;
    plugin?: any;
    error?: string;
    url?: string;
    headers?: Record<string, string>;
    userAgent?: string;
    quality?: IMusic.IQualityKey;
}

export interface IBatchMatchResult {
    total: number;
    success: number;
    failed: number;
    verified: number;
    unverifiable: number;
    items: IMusic.IMusicItem[];
}

export interface ISongSourceMatcher {
    matchSongSource(musicItem: IMusic.IMusicItem, quality?: IMusic.IQualityKey, qualityOrder?: string[]): Promise<ISongSourceMatchResult>;
    getAvailableSourcePlugins(): any[];
    isPluginAvailable(pluginName: string): boolean;
    batchMatchSongSources(musicItems: IMusic.IMusicItem[], quality?: IMusic.IQualityKey, onProgress?: (matched: number, total: number, current: IMusic.IMusicItem) => void, verifySource?: boolean): Promise<IBatchMatchResult>;
}

class SongSourceMatcher implements ISongSourceMatcher {
    private matchEvents = new EventEmitter<ISongSourceMatchResult>();

    async matchSongSource(musicItem: IMusic.IMusicItem, quality?: IMusic.IQualityKey, qualityOrder?: string[]): Promise<ISongSourceMatchResult> {
        if (musicItem.platform === "localfile") {
            const localPlugin = PluginManager.getByName("localfile");
            if (localPlugin && localPlugin.isAvailable?.()) {
                return {
                    result: MediaSourceMatchResult.Success,
                    plugin: localPlugin,
                    url: musicItem.url,
                };
            }
        }

        if (musicItem.platform && PluginManager.getByName(musicItem.platform)) {
            const plugin = PluginManager.getByName(musicItem.platform)!;
            if (plugin.isAvailable?.()) {
                const matchResult = await this.tryPluginForSong(plugin, musicItem, quality, qualityOrder);
                if (matchResult.result === MediaSourceMatchResult.Success) {
                    return matchResult;
                }
            }
        }

        const availablePlugins = this.getAvailableSourcePlugins();
        let lastError: string = "";

        for (const plugin of availablePlugins) {
            if (musicItem.platform && plugin.name === musicItem.platform) continue;
            try {
                const matchResult = await this.tryPluginForSong(plugin, musicItem, quality, qualityOrder);
                if (matchResult.result === MediaSourceMatchResult.Success) {
                    return matchResult;
                }
                lastError = matchResult.error || "";
            } catch (e) {
                lastError = e?.message || "Unknown error";
            }
        }

        return {
            result: MediaSourceMatchResult.AllPluginsUnavailable,
            error: lastError || "All available plugins failed to provide a sound source",
        };
    }

    getAvailableSourcePlugins() {
        const allPlugins = PluginManager.getSortedPlugins();
        return allPlugins.filter(plugin => {
            try {
                return plugin.isAvailable?.() ?? false;
            } catch (e) {
                console.error("Check plugin availability error:", plugin.name, e);
                return false;
            }
        });
    }

    isPluginAvailable(pluginName: string) {
        const allPlugins = PluginManager.getSortedPlugins();
        const plugin = allPlugins.find(p => p.name === pluginName);
        if (!plugin) return false;
        return plugin.isAvailable?.() ?? false;
    }

    private async tryPluginForSong(plugin: any, musicItem: IMusic.IMusicItem, quality?: IMusic.IQualityKey, qualityOrder?: string[]): Promise<ISongSourceMatchResult> {
        if (plugin.state === PluginState.Error) {
            return {
                result: MediaSourceMatchResult.PluginStateError,
                error: `Plugin ${plugin.name} is in error state, reason: ${plugin.errorReason}`,
            };
        }

        if (!PluginManager.isPluginEnabled(plugin)) {
            return {
                result: MediaSourceMatchResult.PluginDisabled,
                error: `Plugin ${plugin.name} is disabled`,
            };
        }

        if (!plugin.hasMethod("getMediaSource")) {
            return {
                result: MediaSourceMatchResult.NoAvailableSource,
                error: `Plugin ${plugin.name} has no getMediaSource method`,
            };
        }

        try {
            const qualityList = qualityOrder ?? (this.getQualityOrder?.(musicItem.platform) || ["flac", "standard", "high", "try"].reverse());
            let foundSource: IPlugin.IMediaSourceResult | null = null;
            let matchedQuality: IMusic.IQualityKey = "standard";

            for (const q of qualityList) {
                const source = await plugin.methods.getMediaSource(musicItem, q);
                if (source?.url) {
                    foundSource = source;
                    matchedQuality = q;
                    break;
                }
            }

            if (foundSource?.url) {
                return {
                    result: MediaSourceMatchResult.Success,
                    plugin: plugin,
                    url: foundSource.url,
                    headers: foundSource.headers,
                    userAgent: foundSource.userAgent,
                    quality: foundSource.quality ?? matchedQuality,
                };
            } else {
                return {
                    result: MediaSourceMatchResult.NoAvailableSource,
                    error: `Plugin ${plugin.name} could not provide a sound source for this song`,
                };
            }
        } catch (e) {
            return {
                result: MediaSourceMatchResult.NoAvailableSource,
                error: `Plugin ${plugin.name} exception: ${e?.message || String(e)}`,
            };
        }
    }

    private getQualityOrder(platform?: string) {
        if (!platform) return ["flac", "standard", "high", "try"];

        const platformOrderMap: Record<string, string[]> = {
            "netease": ["flac", "hires", "standard"],
            "qqmusic": ["320k", "192k"],
            "kugou": ["320k", "192k"],
        };

        return platformOrderMap[platform] || ["flac", "standard", "high", "try"];
    }

    /**
     * 验证音源URL是否可访问
     */
    private async verifyMediaSourceUrl(url: string): Promise<boolean> {
        if (!url || url.startsWith("file://") || url.startsWith("content://")) {
            return true;
        }
        try {
            const response = await axios.head(url, { timeout: 5000 });
            const status = response.status;
            if (status >= 200 && status < 400) {
                return true;
            }
            return false;
        } catch {
            try {
                const response = await axios.get(url, {
                    timeout: 5000,
                    headers: { Range: "bytes=0-4096" },
                    responseType: "arraybuffer",
                });
                const status = response.status;
                if (status === 200 || status === 206) {
                    const contentType = response.headers["content-type"] || "";
                    if (
                        contentType.startsWith("audio/") ||
                        contentType === "application/octet-stream" ||
                        contentType === "application/mpeg" ||
                        !contentType
                    ) {
                        return true;
                    }
                }
                return false;
            } catch {
                return false;
            }
        }
    }

    /**
     * 使用搜索方式为歌曲匹配音源（适用于无平台ID的导入歌曲）
     */
    private async searchAndMatchSong(musicItem: IMusic.IMusicItem): Promise<ISongSourceMatchResult> {
        const searchPlugins = PluginManager.getSortedSearchablePlugins();

        for (const plugin of searchPlugins) {
            try {
                if (!plugin.isAvailable?.()) continue;

                const query = `${musicItem.title} ${musicItem.artist}`.trim();
                if (!query) continue;

                const result = await plugin.methods.search(query, 1, "music");
                if (!result?.data?.length) continue;

                const items = result.data;
                // 优先选歌手完全匹配的（原唱），其次选部分匹配，最后选第一个
                const matched = items.find((item: IMusic.IMusicItem) =>
                    item.artist === musicItem.artist && (item.title === musicItem.title || item.title.startsWith(musicItem.title))
                ) || items.find((item: IMusic.IMusicItem) =>
                    item.artist === musicItem.artist
                ) || items.find((item: IMusic.IMusicItem) => {
                    const titleMatch = item.title.includes(musicItem.title) || musicItem.title.includes(item.title);
                    const artistMatch = !musicItem.artist || item.artist.includes(musicItem.artist) || musicItem.artist.includes(item.artist);
                    return titleMatch && artistMatch;
                }) || items[0];

                if (matched) {
                    const qualityList = this.getQualityOrder(matched.platform);
                    for (const q of qualityList) {
                        try {
                            const source = await plugin.methods.getMediaSource(matched, q);
                            if (source?.url) {
                                return {
                                    result: MediaSourceMatchResult.Success,
                                    plugin: plugin,
                                    url: source.url,
                                    headers: source.headers,
                                    userAgent: source.userAgent,
                                    quality: source.quality ?? q,
                                };
                            }
                        } catch { }
                    }
                }
            } catch (e) {
                console.warn(`[SongSourceMatcher] 搜索匹配插件 ${plugin.name} 失败:`, e);
            }
        }

        return {
            result: MediaSourceMatchResult.NoAvailableSource,
            error: "All search plugins failed to find a match",
        };
    }

    /**
     * 批量匹配音源 - 为导入的歌单歌曲自动匹配可用音源
     * @param musicItems 要匹配的音乐列表
     * @param quality 音质设置
     * @param onProgress 进度回调
     * @param verifySource 是否验证音源可访问（默认true）
     */
    async batchMatchSongSources(
        musicItems: IMusic.IMusicItem[],
        quality?: IMusic.IQualityKey,
        onProgress?: (matched: number, total: number, current: IMusic.IMusicItem) => void,
        verifySource: boolean = true,
    ): Promise<IBatchMatchResult> {
        const results: IMusic.IMusicItem[] = [];
        const total = musicItems.length;
        let success = 0;
        let failed = 0;
        let verified = 0;
        let unverifiable = 0;

        for (let i = 0; i < total; i++) {
            const item = { ...musicItems[i] };
            let matched = false;
            try {
                let matchResult: ISongSourceMatchResult;

                if (item.platform === "import" || item.platform === "local" || !PluginManager.getByName(item.platform)) {
                    matchResult = await this.searchAndMatchSong(item);
                } else {
                    matchResult = await this.matchSongSource(item, quality);
                }

                if (matchResult.result === MediaSourceMatchResult.Success && matchResult.url) {
                    if (verifySource && !matchResult.url.startsWith("file://") && !matchResult.url.startsWith("content://")) {
                        const valid = await this.verifyMediaSourceUrl(matchResult.url);
                        if (!valid) {
                            matchResult = {
                                result: MediaSourceMatchResult.VerificationFailed,
                                error: `Source URL is not accessible: ${matchResult.url.substring(0, 50)}...`,
                            };
                        } else {
                            verified++;
                        }
                    } else {
                        verified++;
                    }

                    if (matchResult.result === MediaSourceMatchResult.Success) {
                        const matchedQuality = matchResult.quality ?? quality ?? "standard";
                        item.source = {
                            ...(item.source || {}),
                            [matchedQuality]: {
                                url: matchResult.url,
                                headers: matchResult.headers,
                                userAgent: matchResult.userAgent,
                                quality: matchedQuality,
                            },
                        };
                        item.url = matchResult.url;
                        matched = true;
                    }
                }
            } catch (e) {
                console.warn(`[SongSourceMatcher] 匹配失败: ${item.title} - ${item.artist}`, e);
            }

            if (matched) {
                success++;
            } else {
                failed++;
                if (item.source) {
                    unverifiable++;
                }
            }

            results.push(item);
            onProgress?.(i + 1, total, item);
        }

        return {
            total,
            success,
            failed,
            verified,
            unverifiable,
            items: results,
        };
    }

    onMatch(callback: (result: ISongSourceMatchResult) => void) {
        this.matchEvents.on("match", callback);
    }

    offMatch(callback: (result: ISongSourceMatchResult) => void) {
        this.matchEvents.off("match", callback);
    }
}

const songSourceMatcher = new SongSourceMatcher();

export default songSourceMatcher;