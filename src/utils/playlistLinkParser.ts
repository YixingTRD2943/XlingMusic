import axios from "axios";
import { errorLog, devLog } from "./log";

export type Platform = "qq" | "netease" | "kugou" | "kuwo" | "xiami" | "migu" | "unknown";

export interface ParsedPlaylist {
    platform: Platform;
    name: string;
    songs: Array<{
        name: string;
        artist: string;
        album?: string;
    }>;
    coverUrl?: string;
    sourceUrl: string;
}

interface IPlaylistLinkParser {
    platform: Platform;
    name: string;
    patterns: RegExp[];
    parse: (url: string) => Promise<ParsedPlaylist>;
}

const QQ_MUSIC_PATTERNS = [
    /y\.qq\.com.*playlist.*(\d+)/i,
    /i\d+\.y\.qq\.com.*playlist.*id=(\d+)/i,
    /i\.y\.qq\.com.*id=(\d+)/i,
    /y\.qq\.com\/n2\/m\/share\/details\/taoge\.html.*id=(\d+)/i,
    /c\.y\.qq\.com.*id=(\d+)/i,
    /qq\.com.*id=(\d+)/i,
];

const NETEASE_PATTERNS = [
    /music\.163\.com\/m\/playlist\?id=(\d+)/i,
    /music\.163\.com\/playlist\?id=(\d+)/i,
    /music\.163\.com\/playlist\/(\d+)/i,
    /music\.163\.com\/songlist\?id=(\d+)/i,
    /music\.163\.com\/songlist\/(\d+)/i,
    /y\.music\.163\.com\/m\/songlist\?id=(\d+)/i,
    /y\.music\.163\.com\/m\/playlist\?id=(\d+)/i,
    /music\.163\.com\/.*?id=(\d+).*?type=playlist/i,
    /music\.163\.com\/#\/playlist\?id=(\d+)/i,
];

const KUGOU_PATTERNS = [
    /kugou\.com\/playlist\/(\d+)/i,
    /kugou\.com\/song\/#hash=([a-zA-Z0-9]+)/i,
    /kgmusic\.com\/playlist\/(\d+)/i,
    /www\.kugou\.com\/yy\/html\/album_detail\.html\?id=(\d+)/i,
];

const KUWO_PATTERNS = [
    /kuwo\.cn\/playlist_detail\/(\d+)/i,
    /kuwo\.cn\/album\/(\d+)/i,
];

const XIAMI_PATTERNS = [
    /xiami\.com\/album\/(\d+)/i,
    /xiami\.com\/playlist\/(\d+)/i,
];

const MIGU_PATTERNS = [
    /music\.migu\.cn\/v3\/music\/playlist\/(\d+)/i,
    /migu\.cn\/song\/playlist\/(\d+)/i,
];

const qqMusicParser: IPlaylistLinkParser = {
    platform: "qq",
    name: "QQ音乐",
    patterns: QQ_MUSIC_PATTERNS,
    async parse(url: string) {
        let playlistId: string | undefined;
        
        for (const pattern of QQ_MUSIC_PATTERNS) {
            const match = url.match(pattern);
            if (match) {
                playlistId = match[1];
                break;
            }
        }
        
        if (!playlistId) {
            const idMatch = url.match(/[?&]id=(\d+)/);
            playlistId = idMatch?.[1];
        }

        if (!playlistId) {
            errorLog("QQ音乐链接解析失败", { url });
            throw new Error("无法解析QQ音乐歌单链接");
        }

        const tryMusicu = async () => {
            const resp = await axios.get("https://u.y.qq.com/cgi-bin/musicu.fcg", {
                params: {
                    data: JSON.stringify({
                        comm: { ct: 20, cv: 2000, uin: 0 },
                        playlistInfo: {
                            method: "get_playlist_info",
                            param: { id: parseInt(playlistId), n: 10000 },
                        },
                    }),
                },
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                    Referer: "https://y.qq.com/",
                    Origin: "https://y.qq.com",
                    "Accept": "application/json, text/plain, */*",
                    "Accept-Language": "zh-CN,zh;q=0.9",
                },
                timeout: 20000,
            });
            const p = resp.data?.playlistInfo?.data?.playlist;
            if (!p?.track_list) return null;
            return {
                name: p.dissname || "QQ音乐歌单",
                songs: p.track_list.map((t: any) => ({
                    name: t.title,
                    artist: (t.singer || []).map((s: any) => s.name).join(", "),
                    album: t.album?.name || "",
                })),
                coverUrl: p.logo || undefined,
            };
        };

        const tryH5Api = async () => {
            const resp = await axios.get(
                `https://c.y.qq.com/v8/fcg-bin/fcg_playlist_detail.fcg?format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&playlistid=${playlistId}`,
                {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                        Referer: "https://y.qq.com/",
                        Origin: "https://y.qq.com",
                        "Accept": "application/json",
                    },
                    timeout: 20000,
                },
            );
            const list = resp.data?.data?.trackList;
            if (!list) return null;
            return {
                name: resp.data?.data?.dissName || "QQ音乐歌单",
                songs: list.map((t: any) => ({
                    name: t.title,
                    artist: (t.singer || []).map((s: any) => s.name).join(", "),
                    album: t.album?.name || "",
                })),
                coverUrl: resp.data?.data?.dissCoverImg || undefined,
            };
        };

        const tryQzoneApi = async () => {
            const resp = await axios.get(
                `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&disstid=${playlistId}&format=json&g_tk=5381`,
                {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                        Referer: "https://y.qq.com/",
                        Origin: "https://y.qq.com",
                    },
                    timeout: 20000,
                },
            );
            const cdlist = resp.data?.cdlist?.[0];
            if (!cdlist) return null;
            return {
                name: cdlist.dissname || "QQ音乐歌单",
                songs: (cdlist.songlist || []).map((t: any) => ({
                    name: t.songname || t.name || "",
                    artist: (t.singer || []).map((s: any) => s.name).join(", "),
                    album: t.albumname || "",
                })),
                coverUrl: cdlist.logo || undefined,
            };
        };

        const tryIYQQApi = async () => {
            const resp = await axios.get(
                `https://i.y.qq.com/qzone-music/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&disstid=${playlistId}&format=json&g_tk=5381`,
                {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                        Referer: "https://y.qq.com/",
                        Origin: "https://y.qq.com",
                    },
                    timeout: 20000,
                },
            );
            const cdlist = resp.data?.cdlist?.[0];
            if (!cdlist) return null;
            return {
                name: cdlist.dissname || "QQ音乐歌单",
                songs: (cdlist.songlist || []).map((t: any) => ({
                    name: t.songname || t.name || "",
                    artist: (t.singer || []).map((s: any) => s.name).join(", "),
                    album: t.albumname || "",
                })),
                coverUrl: cdlist.logo || undefined,
            };
        };

        const tryV8PlaylistApi = async () => {
            const resp = await axios.get(
                `https://c.y.qq.com/v8/fcg-bin/fcg_v8_playlist_cp.fcg?id=${playlistId}&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`,
                {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                        Referer: "https://y.qq.com/",
                        Origin: "https://y.qq.com",
                        "Accept": "application/json",
                    },
                    timeout: 20000,
                },
            );
            const cdlist = resp.data?.data?.cdlist?.[0];
            if (!cdlist) return null;
            const songlist = cdlist.songlist || cdlist.songs || [];
            return {
                name: cdlist.dissname || cdlist.name || "QQ音乐歌单",
                songs: songlist.map((t: any) => ({
                    name: t.songname || t.name || "",
                    artist: (t.singer || []).map((s: any) => s.name).join(", "),
                    album: t.albumname || "",
                })),
                coverUrl: cdlist.logo || cdlist.cover || undefined,
            };
        };

        const apis = [tryMusicu, tryH5Api, tryQzoneApi, tryIYQQApi, tryV8PlaylistApi];
        for (const fn of apis) {
            try {
                const result = await fn();
                if (result && result.songs.length > 0) {
                    return { ...result, platform: "qq", sourceUrl: url };
                }
            } catch (e: any) {
                console.log("[QQMusicParser]", fn.name, "failed:", e?.message);
            }
        }
        console.log("[QQMusicParser] all APIs failed");
        return { platform: "qq", name: "QQ音乐歌单", songs: [], sourceUrl: url };
    },
};

const neteaseParser: IPlaylistLinkParser = {
    platform: "netease",
    name: "网易云音乐",
    patterns: NETEASE_PATTERNS,
    async parse(url: string) {
        let playlistId: string | undefined;
        
        for (const pattern of NETEASE_PATTERNS) {
            const match = url.match(pattern);
            if (match) {
                playlistId = match[1];
                break;
            }
        }

        if (!playlistId) {
            const idMatch = url.match(/[?&]id=(\d+)/);
            playlistId = idMatch?.[1];
        }

        if (!playlistId) {
            errorLog("网易云音乐链接解析失败", { url });
            throw new Error("无法解析网易云音乐歌单链接");
        }

        try {
            devLog("info", "网易云音乐API请求", { playlistId });
            const response = await axios.get(
                `https://music.163.com/api/playlist/detail?id=${playlistId}`,
                {
                    headers: {
                        Referer: "https://music.163.com/",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    },
                    timeout: 20000,
                },
            );

            const data = response.data?.result;
            devLog("info", "网易云音乐API响应", { hasData: !!data });

            if (!data) {
                errorLog("网易云音乐API返回数据为空", { url, playlistId });
                return {
                    platform: "netease",
                    name: "网易云音乐歌单",
                    songs: [],
                    sourceUrl: url,
                };
            }

            const songlist = data.tracks || data.songs || [];
            devLog("info", "网易云音乐歌单解析完成", { songCount: songlist.length, name: data.name });

            return {
                platform: "netease",
                name: data.name || "网易云音乐歌单",
                songs: songlist.map((track: any) => ({
                    name: track.name || "",
                    artist:
                        (track.ar || track.artists || [])
                            .map((s: any) => s.name)
                            .filter(Boolean)
                            .join(", ") || "",
                    album: track.al?.name || track.album?.name || "",
                })),
                coverUrl: data.coverImgUrl || data.picUrl || undefined,
                sourceUrl: url,
            };
        } catch (e: any) {
            errorLog("网易云音乐API请求失败", { url, playlistId, error: e?.message });
            return {
                platform: "netease",
                name: "网易云音乐歌单",
                songs: [],
                sourceUrl: url,
            };
        }
    },
};

const kugouParser: IPlaylistLinkParser = {
    platform: "kugou",
    name: "酷狗音乐",
    patterns: KUGOU_PATTERNS,
    async parse(url: string) {
        let playlistId: string | undefined;
        
        for (const pattern of KUGOU_PATTERNS) {
            const match = url.match(pattern);
            if (match) {
                playlistId = match[1];
                break;
            }
        }

        if (!playlistId) {
            const idMatch = url.match(/[?&]id=(\d+)/);
            playlistId = idMatch?.[1];
        }

        if (!playlistId) {
            errorLog("酷狗音乐链接解析失败", { url });
            throw new Error("无法解析酷狗音乐歌单链接");
        }

        try {
            devLog("info", "酷狗音乐API请求", { playlistId });
            const response = await axios.get(
                `https://www.kugou.com/yy/html/playlist.html?hash=${playlistId}`,
                {
                    headers: {
                        Referer: "https://www.kugou.com/",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    },
                    timeout: 20000,
                },
            );

            const html = response.data;
            const jsonMatch = html.match(/var\s+dataFromSmarty\s*=\s*({.*?});/);
            
            if (!jsonMatch) {
                errorLog("酷狗音乐API返回数据解析失败", { url, playlistId });
                return {
                    platform: "kugou",
                    name: "酷狗音乐歌单",
                    songs: [],
                    sourceUrl: url,
                };
            }

            try {
                const data = JSON.parse(jsonMatch[1]);
                const songlist = data.songs || data.list || [];

                return {
                    platform: "kugou",
                    name: data.name || data.title || "酷狗音乐歌单",
                    songs: songlist.map((track: any) => ({
                        name: track.song_name || track.name || "",
                        artist: track.singer_name || track.artist || "",
                        album: track.album_name || track.album || "",
                    })),
                    coverUrl: data.img || data.cover || undefined,
                    sourceUrl: url,
                };
            } catch (parseError) {
                errorLog("酷狗音乐JSON解析失败", { url, playlistId, error: parseError?.message });
                return {
                    platform: "kugou",
                    name: "酷狗音乐歌单",
                    songs: [],
                    sourceUrl: url,
                };
            }
        } catch (e: any) {
            errorLog("酷狗音乐API请求失败", { url, playlistId, error: e?.message });
            return {
                platform: "kugou",
                name: "酷狗音乐歌单",
                songs: [],
                sourceUrl: url,
            };
        }
    },
};

const kuwoParser: IPlaylistLinkParser = {
    platform: "kuwo",
    name: "酷我音乐",
    patterns: KUWO_PATTERNS,
    async parse(url: string) {
        let playlistId: string | undefined;
        
        for (const pattern of KUWO_PATTERNS) {
            const match = url.match(pattern);
            if (match) {
                playlistId = match[1];
                break;
            }
        }

        if (!playlistId) {
            const idMatch = url.match(/[?&]id=(\d+)/);
            playlistId = idMatch?.[1];
        }

        if (!playlistId) {
            errorLog("酷我音乐链接解析失败", { url });
            throw new Error("无法解析酷我音乐歌单链接");
        }

        try {
            devLog("info", "酷我音乐API请求", { playlistId });
            const response = await axios.get(
                `http://www.kuwo.cn/api/www/playlist/playListInfo?pid=${playlistId}&pn=1&rn=200`,
                {
                    headers: {
                        Referer: "http://www.kuwo.cn/",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Cookie": "kw_token=TEST",
                    },
                    timeout: 20000,
                },
            );

            const data = response.data?.data;

            if (!data) {
                errorLog("酷我音乐API返回数据为空", { url, playlistId });
                return {
                    platform: "kuwo",
                    name: "酷我音乐歌单",
                    songs: [],
                    sourceUrl: url,
                };
            }

            const songlist = data.musicList || data.songs || [];

            return {
                platform: "kuwo",
                name: data.name || "酷我音乐歌单",
                songs: songlist.map((track: any) => ({
                    name: track.name || "",
                    artist: track.artist || "",
                    album: track.album || "",
                })),
                coverUrl: data.pic || data.cover || undefined,
                sourceUrl: url,
            };
        } catch (e: any) {
            errorLog("酷我音乐API请求失败", { url, playlistId, error: e?.message });
            return {
                platform: "kuwo",
                name: "酷我音乐歌单",
                songs: [],
                sourceUrl: url,
            };
        }
    },
};

const xiamiParser: IPlaylistLinkParser = {
    platform: "xiami",
    name: "虾米音乐",
    patterns: XIAMI_PATTERNS,
    async parse(url: string) {
        let playlistId: string | undefined;
        
        for (const pattern of XIAMI_PATTERNS) {
            const match = url.match(pattern);
            if (match) {
                playlistId = match[1];
                break;
            }
        }

        if (!playlistId) {
            const idMatch = url.match(/[?&]id=(\d+)/);
            playlistId = idMatch?.[1];
        }

        if (!playlistId) {
            errorLog("虾米音乐链接解析失败", { url });
            throw new Error("无法解析虾米音乐歌单链接");
        }

        try {
            devLog("info", "虾米音乐API请求", { playlistId });
            const response = await axios.get(
                `https://api.xiami.com/web?v=2.0&app_key=1&format=json&method=album.getDetail&album_id=${playlistId}`,
                {
                    headers: {
                        Referer: "https://www.xiami.com/",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    },
                    timeout: 20000,
                },
            );

            const data = response.data?.result;

            if (!data) {
                errorLog("虾米音乐API返回数据为空", { url, playlistId });
                return {
                    platform: "xiami",
                    name: "虾米音乐歌单",
                    songs: [],
                    sourceUrl: url,
                };
            }

            const songlist = data.songs || [];

            return {
                platform: "xiami",
                name: data.name || "虾米音乐歌单",
                songs: songlist.map((track: any) => ({
                    name: track.song_name || track.name || "",
                    artist: track.artist_name || track.artist || "",
                    album: data.name || "",
                })),
                coverUrl: data.album_logo || data.cover || undefined,
                sourceUrl: url,
            };
        } catch (e: any) {
            errorLog("虾米音乐API请求失败", { url, playlistId, error: e?.message });
            return {
                platform: "xiami",
                name: "虾米音乐歌单",
                songs: [],
                sourceUrl: url,
            };
        }
    },
};

const miguParser: IPlaylistLinkParser = {
    platform: "migu",
    name: "咪咕音乐",
    patterns: MIGU_PATTERNS,
    async parse(url: string) {
        let playlistId: string | undefined;
        
        for (const pattern of MIGU_PATTERNS) {
            const match = url.match(pattern);
            if (match) {
                playlistId = match[1];
                break;
            }
        }

        if (!playlistId) {
            const idMatch = url.match(/[?&]id=(\d+)/);
            playlistId = idMatch?.[1];
        }

        if (!playlistId) {
            errorLog("咪咕音乐链接解析失败", { url });
            throw new Error("无法解析咪咕音乐歌单链接");
        }

        try {
            devLog("info", "咪咕音乐API请求", { playlistId });
            const response = await axios.get(
                `https://music.migu.cn/v3/api/music/playlist/queryPlaylistById?pid=${playlistId}`,
                {
                    headers: {
                        Referer: "https://music.migu.cn/",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    },
                    timeout: 20000,
                },
            );

            const data = response.data?.data;

            if (!data) {
                errorLog("咪咕音乐API返回数据为空", { url, playlistId });
                return {
                    platform: "migu",
                    name: "咪咕音乐歌单",
                    songs: [],
                    sourceUrl: url,
                };
            }

            const songlist = data.songs || [];

            return {
                platform: "migu",
                name: data.name || "咪咕音乐歌单",
                songs: songlist.map((track: any) => ({
                    name: track.name || "",
                    artist: track.singer || track.artist || "",
                    album: track.album || "",
                })),
                coverUrl: data.cover || data.img || undefined,
                sourceUrl: url,
            };
        } catch (e: any) {
            errorLog("咪咕音乐API请求失败", { url, playlistId, error: e?.message });
            return {
                platform: "migu",
                name: "咪咕音乐歌单",
                songs: [],
                sourceUrl: url,
            };
        }
    },
};

const parsers: IPlaylistLinkParser[] = [
    qqMusicParser,
    neteaseParser,
    kugouParser,
    kuwoParser,
    miguParser,
    xiamiParser,
];

export function detectPlatform(url: string): Platform {
    const trimmedUrl = url.trim();
    console.log("[playlistLinkParser] detectPlatform called with:", trimmedUrl);
    
    for (const parser of parsers) {
        for (const pattern of parser.patterns) {
            if (pattern.test(trimmedUrl)) {
                console.log("[playlistLinkParser] detected platform:", parser.platform);
                return parser.platform;
            }
        }
    }
    console.log("[playlistLinkParser] no platform detected, returning unknown");
    return "unknown";
}

export function getPlatformName(platform: Platform): string {
    const names: Record<Platform, string> = {
        qq: "QQ音乐",
        netease: "网易云音乐",
        kugou: "酷狗音乐",
        kuwo: "酷我音乐",
        xiami: "虾米音乐",
        migu: "咪咕音乐",
        unknown: "未知平台",
    };
    return names[platform];
}

export function getPlatformIcon(platform: Platform): string {
    const icons: Record<Platform, string> = {
        qq: "music-note",
        netease: "music-note",
        kugou: "music-note",
        kuwo: "music-note",
        xiami: "music-note",
        migu: "music-note",
        unknown: "question-mark-circle",
    };
    return icons[platform];
}

export async function parsePlaylistLink(url: string): Promise<ParsedPlaylist> {
    const trimmedUrl = url.trim();
    console.log("[playlistLinkParser] parsePlaylistLink called with:", trimmedUrl);

    for (const parser of parsers) {
        for (const pattern of parser.patterns) {
            if (pattern.test(trimmedUrl)) {
                console.log("[playlistLinkParser] matched parser:", parser.name);
                const result = await parser.parse(trimmedUrl);
                console.log("[playlistLinkParser] parser result, songCount:", result.songs.length);
                return result;
            }
        }
    }

    console.log("[playlistLinkParser] no parser matched");
    return {
        platform: "unknown",
        name: "未知歌单",
        songs: [],
        sourceUrl: trimmedUrl,
    };
}

export function validatePlaylistUrl(url: string): {
    valid: boolean;
    platform: Platform;
    message: string;
} {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
        return { valid: false, platform: "unknown", message: "请输入歌单链接" };
    }

    const platform = detectPlatform(trimmedUrl);

    if (platform === "unknown") {
        return {
            valid: false,
            platform: "unknown",
            message:
                "无法识别的链接格式，请输入QQ音乐、网易云音乐、酷狗音乐、酷我音乐或咪咕音乐的歌单链接",
        };
    }

    return {
        valid: true,
        platform,
        message: `检测到${getPlatformName(platform)}歌单链接`,
    };
}

export function formatSongsCount(
    songs: Array<{ name: string; artist: string }>,
): string {
    return `${songs.length} 首歌曲`;
}
