import PanelBase from "../base/panelBase";
import PanelHeader from "../base/panelHeader";
import rpx, { vmax } from "@/utils/rpx";
import React, { useState, useRef } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList } from "react-native";
import useColors from "@/hooks/useColors";
import ThemeText from "@/components/base/themeText";
import Input from "@/components/base/input";
import Icon from "@/components/base/icon";
import { showPanel } from "../usePanel";
import Toast from "@/utils/toast";
import axios from "axios";
import WebView from "react-native-webview";

interface ParsedPlaylistInfo {
    name: string;
    songs: Array<{
        name: string;
        artist: string;
        album?: string;
    }>;
    platform: string;
    coverUrl?: string;
}

export default function ImportPlaylistLink() {
    const colors = useColors();
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [parsedPlaylist, setParsedPlaylist] = useState<ParsedPlaylistInfo | null>(null);
    const [error, setError] = useState<string>("");

    const extractQQMusicPlaylistId = (url: string): string | null => {
        const patterns = [
            /y\.qq\.com.*playlist.*(\d+)/i,
            /i\d+\.y\.qq\.com.*playlist.*id=(\d+)/i,
            /y\.qq\.com\/n2\/m\/share\/details\/taoge\.html.*id=(\d+)/i,
            /y\.qq\.com\/n3\/other\/pages\/details\/playlist\.html.*id=(\d+)/i,
            /id=(\d+)/i,
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    };

    const extractNeteasePlaylistId = (url: string): string | null => {
        const patterns = [
            /playlist.*id=(\d+)/i,
            /playlist\/(\d+)/,
            /songlist.*id=(\d+)/i,
            /songlist\/(\d+)/,
            /[?&]id=(\d+)/,
        ];
        for (const p of patterns) {
            const m = url.match(p);
            if (m && m[1]) return m[1];
        }
        return null;
    };

    const extractKugouPlaylistId = (url: string): string | null => {
        const match = url.match(/playlist\/(\d+)/i);
        return match ? match[1] : null;
    };

    const parseQQMusicPlaylist = async (url: string): Promise<ParsedPlaylistInfo | null> => {
        const playlistId = extractQQMusicPlaylistId(url);
        if (!playlistId) return null;

        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "Referer": "https://y.qq.com/",
            "Origin": "https://y.qq.com",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "zh-CN,zh;q=0.9",
        };

        const apis = [
            {
                name: "musicu.fcg",
                url: "https://u.y.qq.com/cgi-bin/musicu.fcg",
                params: {
                    data: JSON.stringify({
                        comm: { ct: 20, cv: 2000, uin: 0 },
                        playlistInfo: {
                            method: "get_playlist_info",
                            param: { id: parseInt(playlistId), n: 10000 },
                        },
                    }),
                },
                parse: (data: any) => {
                    const p = data?.playlistInfo?.data?.playlist;
                    if (!p?.track_list) return null;
                    return {
                        name: p.dissname || "QQ音乐歌单",
                        songs: p.track_list.map((t: any) => ({
                            name: t.title,
                            artist: (t.singer || []).map((s: any) => s.name).join("/"),
                            album: t.album?.name || "",
                        })),
                    };
                },
            },
            {
                name: "qzone.fcg",
                url: "https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg",
                params: {
                    type: 1,
                    json: 1,
                    utf8: 1,
                    onlysong: 0,
                    disstid: playlistId,
                    format: "json",
                    g_tk: 5381,
                },
                parse: (data: any) => {
                    const cdlist = data?.cdlist?.[0];
                    if (!cdlist?.songlist) return null;
                    return {
                        name: cdlist.dissname || "QQ音乐歌单",
                        songs: cdlist.songlist.map((s: any) => ({
                            name: s.songname,
                            artist: (s.singer || []).map((s2: any) => s2.name).join("/"),
                            album: s.albumname || "",
                        })),
                    };
                },
            },
            {
                name: "h5.fcg",
                url: "https://c.y.qq.com/v8/fcg-bin/fcg_playlist_detail.fcg",
                params: {
                    format: "json",
                    inCharset: "utf8",
                    outCharset: "utf-8",
                    notice: 0,
                    platform: "h5",
                    needNewCode: 1,
                    playlistid: playlistId,
                },
                parse: (data: any) => {
                    const list = data?.data?.trackList;
                    if (!list) return null;
                    return {
                        name: data?.data?.dissName || "QQ音乐歌单",
                        songs: list.map((s: any) => ({
                            name: s.title,
                            artist: (s.singer || []).map((s2: any) => s2.name).join("/"),
                            album: s.album?.name || "",
                        })),
                    };
                },
            },
        ];

        for (const api of apis) {
            try {
                console.log("[歌单导入] 尝试QQ音乐API:", api.name);
                const response = await axios.get(api.url, {
                    params: api.params,
                    headers: headers,
                    timeout: 15000,
                });

                let data = response.data;
                if (typeof data === "string") {
                    const match = data.match(/\{[\s\S]*\}/);
                    if (match) {
                        data = JSON.parse(match[0]);
                    }
                }

                const result = api.parse(data);
                if (result && result.songs && result.songs.length > 0) {
                    console.log("[歌单导入] QQ音乐解析成功，共", result.songs.length, "首歌曲");
                    return {
                        ...result,
                        platform: "QQ音乐",
                        coverUrl: "",
                    };
                }
            } catch (error: any) {
                console.error("[歌单导入] QQ音乐API失败:", api.name, error?.message);
            }
        }

        console.error("[歌单导入] 所有QQ音乐API均失败");
        return null;
    };

    const parseNeteasePlaylist = async (url: string): Promise<ParsedPlaylistInfo | null> => {
        const playlistId = extractNeteasePlaylistId(url);
        if (!playlistId) return null;

        try {
            const baseUrl = "https://music.163.com/api/playlist/detail";
            const response = await axios.get(baseUrl, {
                params: { id: playlistId },
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                    "Referer": "https://music.163.com/",
                },
                timeout: 15000,
            });

            const playlistData = response.data?.playlist;
            if (!playlistData || !playlistData.tracks) return null;

            const songs = playlistData.tracks.map((track: any) => ({
                name: track.name,
                artist: track.ar.map((a: any) => a.name).join("/"),
                album: track.al?.name || "",
            }));

            return {
                name: playlistData.name || "网易云音乐歌单",
                songs: songs,
                platform: "网易云音乐",
                coverUrl: playlistData.coverImgUrl || "",
            };
        } catch (error) {
            console.error("[歌单导入] 网易云音乐解析失败:", error);
            return null;
        }
    };

    const parseKugouPlaylist = async (url: string): Promise<ParsedPlaylistInfo | null> => {
        const playlistId = extractKugouPlaylistId(url);
        if (!playlistId) return null;

        try {
            const baseUrl = "https://www.kugou.com/yy/index.php";
            const response = await axios.get(baseUrl, {
                params: {
                    r: "play/getdata",
                    hash: playlistId,
                },
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Referer": "https://www.kugou.com/",
                },
                timeout: 15000,
            });

            const data = response.data?.data;
            if (!data || !data.songs) return null;

            const songs = data.songs.map((song: any) => ({
                name: song.songname,
                artist: song.singer_name,
                album: song.album_name || "",
            }));

            return {
                name: data.info?.album_name || "酷狗音乐歌单",
                songs: songs,
                platform: "酷狗音乐",
                coverUrl: "",
            };
        } catch (error) {
            console.error("[歌单导入] 酷狗音乐解析失败:", error);
            return null;
        }
    };

    const detectPlatform = (url: string): string => {
        if (url.includes("qq.com") || 
            url.includes("i2.y.qq") || 
            url.includes("y.qq.com") ||
            /playlist\.html.*id=\d+/.test(url) ||
            (/id=\d+/.test(url) && !url.includes("music.163.com") && !url.includes("kugou.com"))) {
            return "qq";
        }
        if (url.includes("music.163.com") || 
            url.includes("163.com") ||
            (/playlist.*id=\d+/i.test(url) && !url.includes("qq.com") && !url.includes("kugou.com"))) {
            return "netease";
        }
        if (url.includes("kugou.com") ||
            /playlist\/\d+/.test(url)) {
            return "kugou";
        }
        return "unknown";
    };

    const handleParse = async () => {
        setError("");
        if (!link.trim()) {
            setError("请输入歌单链接");
            return;
        }

        setLoading(true);
        try {
            let result: ParsedPlaylistInfo | null = null;

            const platform = detectPlatform(link);
            console.log("[歌单导入] 检测到平台:", platform);

            if (platform === "qq") {
                result = await parseQQMusicPlaylist(link);
            } else if (platform === "netease") {
                result = await parseNeteasePlaylist(link);
            } else if (platform === "kugou") {
                result = await parseKugouPlaylist(link);
            }

            if (result) {
                setParsedPlaylist(result);
                if (result.songs.length === 0) {
                    Toast.warn("未能解析到歌曲，请检查链接是否正确");
                }
            } else {
                setError("无法识别链接格式，请检查是否为QQ音乐、网易云音乐或酷狗音乐的歌单链接");
                Toast.warn("无法识别链接格式");
            }
        } catch (e) {
            console.error("[歌单导入] 解析错误:", e);
            setError("解析失败，请检查网络或链接是否正确");
            Toast.warn("解析失败");
        } finally {
            setLoading(false);
        }
    };

    const handleImport = () => {
        if (!parsedPlaylist || parsedPlaylist.songs.length === 0) {
            return;
        }

        showPanel("AddToMusicSheet", {
            musicItem: parsedPlaylist.songs.map((song, index) => ({
                id: `import_${index}`,
                platform: parsedPlaylist.platform,
                title: song.name,
                name: song.name,
                artist: song.artist,
                album: song.album || "",
                duration: 0,
                artwork: parsedPlaylist.coverUrl || "",
            })),
        });
    };

    const handleClear = () => {
        setLink("");
        setParsedPlaylist(null);
        setError("");
    };

    return (
        <PanelBase
            height={vmax(70)}
            renderBody={() => (
                <View style={[styles.container, { backgroundColor: colors.backdrop }]}>
                    <PanelHeader
                        title="链接导入歌单"
                        hideButtons
                    />

                    <View style={styles.content}>
                        {!parsedPlaylist ? (
                            <>
                                <View style={styles.inputSection}>
                                    <ThemeText fontSize="content" fontColor="textSecondary" style={styles.hint}>
                                        支持QQ音乐、网易云音乐、酷狗音乐的歌单链接
                                    </ThemeText>

                                    <View style={styles.inputWrapper}>
                                        <Input
                                            style={[
                                                styles.input,
                                                {
                                                    backgroundColor: colors.placeholder,
                                                    color: colors.text,
                                                },
                                            ]}
                                            placeholder="粘贴歌单链接"
                                            placeholderTextColor={colors.textSecondary}
                                            value={link}
                                            onChangeText={setLink}
                                            multiline={false}
                                        />
                                    </View>

                                    {error ? (
                                        <ThemeText fontSize="description" style={styles.errorText} fontColor="danger">
                                            {error}
                                        </ThemeText>
                                    ) : null}

                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            style={[styles.button, styles.clearButton]}
                                            onPress={handleClear}
                                        >
                                            <ThemeText fontSize="content" fontColor="textSecondary">清除</ThemeText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.button, styles.parseButton]}
                                            onPress={handleParse}
                                            disabled={loading}
                                        >
                                            <ThemeText fontSize="content" style={{ color: "#ffffff" }}>
                                                {loading ? "解析中..." : "解析链接"}
                                            </ThemeText>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.platformSection}>
                                    <ThemeText fontSize="subTitle" fontWeight="bold" style={styles.platformTitle}>
                                        支持的平台
                                    </ThemeText>
                                    <View style={styles.platformList}>
                                        <View style={[styles.platformItem, { backgroundColor: colors.listActive }]}>
                                            <Icon name="musical-note" size={rpx(32)} color={colors.text} />
                                            <ThemeText fontSize="description">QQ音乐</ThemeText>
                                        </View>
                                        <View style={[styles.platformItem, { backgroundColor: colors.listActive }]}>
                                            <Icon name="musical-note" size={rpx(32)} color={colors.text} />
                                            <ThemeText fontSize="description">网易云音乐</ThemeText>
                                        </View>
                                        <View style={[styles.platformItem, { backgroundColor: colors.listActive }]}>
                                            <Icon name="musical-note" size={rpx(32)} color={colors.text} />
                                            <ThemeText fontSize="description">酷狗音乐</ThemeText>
                                        </View>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.previewSection}>
                                    <View style={[styles.playlistInfo, { backgroundColor: colors.listActive }]}>
                                        <View style={styles.playlistHeader}>
                                            <Icon name="playlist" size={rpx(48)} color={colors.primary} />
                                            <View style={styles.playlistMeta}>
                                                <ThemeText fontSize="title" fontWeight="bold" numberOfLines={1}>
                                                    {parsedPlaylist.name}
                                                </ThemeText>
                                                <ThemeText fontSize="description" fontColor="textSecondary">
                                                    {parsedPlaylist.platform} · {parsedPlaylist.songs.length}首歌曲
                                                </ThemeText>
                                            </View>
                                        </View>

                                        {parsedPlaylist.songs.length > 0 && (
                                            <FlatList
                                                data={parsedPlaylist.songs.slice(0, 5)}
                                                keyExtractor={(item, index) => `${index}`}
                                                renderItem={({ item }) => (
                                                    <View style={styles.songItem}>
                                                        <Icon name="music" size={rpx(24)} color={colors.textSecondary} />
                                                        <View style={styles.songInfo}>
                                                            <ThemeText fontSize="content" numberOfLines={1}>
                                                                {item.name}
                                                            </ThemeText>
                                                            <ThemeText fontSize="description" fontColor="textSecondary" numberOfLines={1}>
                                                                {item.artist}
                                                            </ThemeText>
                                                        </View>
                                                    </View>
                                                )}
                                                style={styles.songList}
                                            />
                                        )}

                                        {parsedPlaylist.songs.length > 5 && (
                                            <ThemeText fontSize="description" fontColor="textSecondary" style={styles.moreSongs}>
                                                还有 {parsedPlaylist.songs.length - 5} 首歌曲...
                                            </ThemeText>
                                        )}
                                    </View>

                                    <View style={styles.actionRow}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.cancelButton]}
                                            onPress={handleClear}
                                        >
                                            <ThemeText fontSize="content" fontColor="textSecondary">返回</ThemeText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.importButton]}
                                            onPress={handleImport}
                                            disabled={parsedPlaylist.songs.length === 0}
                                        >
                                            <ThemeText fontSize="content" style={{ color: "#ffffff" }}>
                                                导入歌单
                                            </ThemeText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: rpx(16),
        overflow: "hidden",
    },
    content: {
        flex: 1,
        padding: rpx(24),
    },
    inputSection: {
        marginBottom: rpx(32),
    },
    hint: {
        marginBottom: rpx(16),
        textAlign: "center",
    },
    inputWrapper: {
        marginBottom: rpx(16),
    },
    input: {
        borderRadius: rpx(8),
        padding: rpx(16),
        fontSize: rpx(28),
    },
    errorText: {
        textAlign: "center",
        marginBottom: rpx(16),
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: rpx(16),
    },
    button: {
        flex: 1,
        height: rpx(80),
        borderRadius: rpx(8),
        justifyContent: "center",
        alignItems: "center",
    },
    clearButton: {
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    parseButton: {
        backgroundColor: "#1677ff",
    },
    platformSection: {
        marginBottom: rpx(24),
    },
    platformTitle: {
        marginBottom: rpx(16),
        textAlign: "center",
    },
    platformList: {
        flexDirection: "row",
        justifyContent: "center",
        gap: rpx(24),
    },
    platformItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: rpx(8),
        padding: rpx(12),
        borderRadius: rpx(8),
    },
    previewSection: {
        flex: 1,
    },
    playlistInfo: {
        borderRadius: rpx(12),
        padding: rpx(20),
        marginBottom: rpx(20),
    },
    playlistHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: rpx(16),
        marginBottom: rpx(20),
    },
    playlistMeta: {
        flex: 1,
    },
    songItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: rpx(12),
        paddingVertical: rpx(8),
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
    },
    songInfo: {
        flex: 1,
    },
    songList: {
        maxHeight: rpx(300),
    },
    moreSongs: {
        textAlign: "center",
        marginTop: rpx(12),
    },
    actionRow: {
        flexDirection: "row",
        gap: rpx(16),
    },
    actionButton: {
        flex: 1,
        height: rpx(88),
        borderRadius: rpx(8),
        justifyContent: "center",
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    importButton: {
        backgroundColor: "#1677ff",
    },
});
