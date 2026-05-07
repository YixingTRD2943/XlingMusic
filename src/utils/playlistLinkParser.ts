import axios from "axios";

export type Platform = "qq" | "netease" | "kugou" | "unknown";

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
    pattern: RegExp;
    parse: (url: string) => Promise<ParsedPlaylist>;
}

const QQ_MUSIC_PATTERN = /(?:y\.qq\.com|qq\.com)\/.*?(?:playlist|album|songdetail|mlog)[\/?](?:id=|p\/)([a-zA-Z0-9]+)/i;
const NETEASE_PATTERN = /(?:music\.163\.com|y\.music\.163\.com).*?\/playlist\?id=(\d+)/i;
const KUGOU_PATTERN = /(?:kugou\.com|kgmusic\.com).*?\/song\/#hash=([a-zA-Z0-9]+)/i;

const qqMusicParser: IPlaylistLinkParser = {
    platform: "qq",
    name: "QQ音乐",
    pattern: QQ_MUSIC_PATTERN,
    async parse(url: string) {
        const match = url.match(/playlist\/([a-zA-Z0-9]+)/i);
        const playlistId = match?.[1];

        if (!playlistId) {
            throw new Error("无法解析QQ音乐歌单链接");
        }

        try {
            const response = await axios.get(
                `https://api.zxcvbn.com/qqmusic/playlist/${playlistId}`,
                { timeout: 10000 }
            );

            return {
                platform: "qq",
                name: response.data.name || "QQ音乐歌单",
                songs: response.data.tracks?.map((track: any) => ({
                    name: track.name || "",
                    artist: track.singer?.map((s: any) => s.name).join(", ") || "",
                    album: track.album?.name || "",
                })) || [],
                coverUrl: response.data.coverUrl,
                sourceUrl: url,
            };
        } catch {
            return {
                platform: "qq",
                name: "QQ音乐歌单",
                songs: [],
                sourceUrl: url,
            };
        }
    },
};

const neteaseParser: IPlaylistLinkParser = {
    platform: "netease",
    name: "网易云音乐",
    pattern: NETEASE_PATTERN,
    async parse(url: string) {
        const match = url.match(/id=(\d+)/);
        const playlistId = match?.[1];

        if (!playlistId) {
            throw new Error("无法解析网易云音乐歌单链接");
        }

        try {
            const response = await axios.post(
                "https://music.163.com/api/playlist/detail",
                { id: playlistId },
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    timeout: 10000,
                }
            );

            const playlist = response.data.playlist || {};

            return {
                platform: "netease",
                name: playlist.name || "网易云音乐歌单",
                songs: playlist.tracks?.map((track: any) => ({
                    name: track.name || "",
                    artist: track.ar?.map((a: any) => a.name).join(", ") || "",
                    album: track.al?.name || "",
                })) || [],
                coverUrl: playlist.coverImgUrl,
                sourceUrl: url,
            };
        } catch {
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
    pattern: KUGOU_PATTERN,
    async parse(url: string) {
        const match = url.match(/hash=([a-zA-Z0-9]+)/i);
        const hash = match?.[1];

        if (!hash) {
            throw new Error("无法解析酷狗音乐链接");
        }

        try {
            const response = await axios.get(
                `https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=${hash}`,
                { timeout: 10000 }
            );

            const data = response.data.data || {};

            return {
                platform: "kugou",
                name: data.album_name || "酷狗音乐",
                songs: [{
                    name: data.song_name || "",
                    artist: data.author_name || "",
                    album: data.album_name || "",
                }],
                coverUrl: data.img || "",
                sourceUrl: url,
            };
        } catch {
            return {
                platform: "kugou",
                name: "酷狗音乐",
                songs: [],
                sourceUrl: url,
            };
        }
    },
};

const parsers: IPlaylistLinkParser[] = [
    neteaseParser,
    qqMusicParser,
    kugouParser,
];

export function detectPlatform(url: string): Platform {
    for (const parser of parsers) {
        if (parser.pattern.test(url)) {
            return parser.platform;
        }
    }
    return "unknown";
}

export function getPlatformName(platform: Platform): string {
    const names: Record<Platform, string> = {
        qq: "QQ音乐",
        netease: "网易云音乐",
        kugou: "酷狗音乐",
        unknown: "未知平台",
    };
    return names[platform];
}

export function getPlatformIcon(platform: Platform): string {
    const icons: Record<Platform, string> = {
        qq: "music-note",
        netease: "music-note",
        kugou: "music-note",
        unknown: "question-mark-circle",
    };
    return icons[platform];
}

export async function parsePlaylistLink(url: string): Promise<ParsedPlaylist> {
    const trimmedUrl = url.trim();

    for (const parser of parsers) {
        if (parser.pattern.test(trimmedUrl)) {
            return await parser.parse(trimmedUrl);
        }
    }

    return {
        platform: "unknown",
        name: "未知歌单",
        songs: [],
        sourceUrl: trimmedUrl,
    };
}

export function validatePlaylistUrl(url: string): { valid: boolean; platform: Platform; message: string } {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
        return { valid: false, platform: "unknown", message: "请输入歌单链接" };
    }

    const platform = detectPlatform(trimmedUrl);

    if (platform === "unknown") {
        return {
            valid: false,
            platform: "unknown",
            message: "无法识别的链接格式，请输入QQ音乐、网易云音乐或酷狗音乐的歌单链接",
        };
    }

    return {
        valid: true,
        platform,
        message: `检测到${getPlatformName(platform)}歌单链接`,
    };
}

export function formatSongsCount(songs: Array<{ name: string; artist: string }>): string {
    if (songs.length === 0) {
        return "暂无歌曲";
    }
    return `${songs.length}首歌曲`;
}
