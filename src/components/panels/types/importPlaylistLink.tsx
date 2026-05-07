import PanelBase from "../base/panelBase";
import PanelHeader from "../base/panelHeader";
import rpx, { vmax } from "@/utils/rpx";
import React, { useState } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import useColors from "@/hooks/useColors";
import ThemeText from "@/components/base/themeText";
import Input from "@/components/base/input";
import Icon from "@/components/base/icon";
import {
    parsePlaylistLink,
    validatePlaylistUrl,
    getPlatformName,
    formatSongsCount,
} from "@/utils/playlistLinkParser";
import { showPanel } from "../usePanel";
import Toast from "@/utils/toast";

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

    const handleParse = async () => {
        setError("");

        if (!link.trim()) {
            setError("请输入歌单链接");
            return;
        }

        const validation = validatePlaylistUrl(link);
        if (!validation.valid) {
            setError(validation.message);
            return;
        }

        setLoading(true);
        try {
            const result = await parsePlaylistLink(link);
            setParsedPlaylist({
                name: result.name,
                songs: result.songs,
                platform: getPlatformName(result.platform),
                coverUrl: result.coverUrl,
            });
            if (result.songs.length === 0) {
                Toast.warn("未能解析到歌曲，请检查链接是否正确");
            }
        } catch (e) {
            setError("解析失败，请检查链接是否正确");
            Toast.warn("解析失败，请检查链接是否正确");
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
                platform: "import" as const,
                title: song.name,
                name: song.name,
                artist: song.artist,
                album: song.album || "",
                duration: 0,
                artwork: "",
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
                                                    {parsedPlaylist.platform} · {formatSongsCount(parsedPlaylist.songs)}
                                                </ThemeText>
                                            </View>
                                        </View>

                                        {parsedPlaylist.songs.length > 0 && (
                                            <ScrollView style={styles.songsList}>
                                                {parsedPlaylist.songs.slice(0, 10).map((song, index) => (
                                                    <View key={index} style={styles.songItem}>
                                                        <ThemeText fontSize="description" numberOfLines={1} style={styles.songName}>
                                                            {song.name}
                                                        </ThemeText>
                                                        <ThemeText fontSize="description" fontColor="textSecondary" numberOfLines={1}>
                                                            {song.artist}
                                                        </ThemeText>
                                                    </View>
                                                ))}
                                                {parsedPlaylist.songs.length > 10 && (
                                                    <ThemeText fontSize="description" fontColor="textSecondary" style={styles.moreText}>
                                                        还有 {parsedPlaylist.songs.length - 10} 首歌曲...
                                                    </ThemeText>
                                                )}
                                            </ScrollView>
                                        )}
                                    </View>

                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            style={[styles.button, styles.clearButton]}
                                            onPress={handleClear}
                                        >
                                            <ThemeText fontSize="content" fontColor="textSecondary">重新输入</ThemeText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.button, styles.importButton, parsedPlaylist.songs.length === 0 && styles.disabledButton]}
                                            onPress={handleImport}
                                            disabled={parsedPlaylist.songs.length === 0}
                                        >
                                            <ThemeText fontSize="content" style={{ color: "#ffffff" }}>导入到歌单</ThemeText>
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
        borderTopLeftRadius: rpx(28),
        borderTopRightRadius: rpx(28),
    },
    content: {
        flex: 1,
        padding: rpx(32),
    },
    inputSection: {
        flex: 1,
    },
    hint: {
        marginBottom: rpx(16),
    },
    inputWrapper: {
        marginBottom: rpx(16),
    },
    input: {
        height: rpx(96),
        borderRadius: rpx(24),
        paddingHorizontal: rpx(32),
        fontSize: rpx(28),
    },
    errorText: {
        marginBottom: rpx(16),
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: rpx(16),
    },
    button: {
        flex: 1,
        height: rpx(88),
        borderRadius: rpx(44),
        justifyContent: "center",
        alignItems: "center",
    },
    clearButton: {
        marginRight: rpx(16),
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    parseButton: {
        marginLeft: rpx(16),
        backgroundColor: "#1890ff",
    },
    importButton: {
        marginLeft: rpx(16),
        backgroundColor: "#1890ff",
    },
    disabledButton: {
        backgroundColor: "#999",
    },
    platformSection: {
        marginTop: rpx(32),
    },
    platformTitle: {
        marginBottom: rpx(16),
    },
    platformList: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    platformItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: rpx(12),
        paddingHorizontal: rpx(20),
        borderRadius: rpx(24),
        gap: rpx(8),
    },
    previewSection: {
        flex: 1,
    },
    playlistInfo: {
        padding: rpx(24),
        borderRadius: rpx(24),
    },
    playlistHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: rpx(16),
    },
    playlistMeta: {
        flex: 1,
        marginLeft: rpx(16),
    },
    songsList: {
        maxHeight: rpx(300),
    },
    songItem: {
        paddingVertical: rpx(8),
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    songName: {
        marginBottom: rpx(4),
    },
    moreText: {
        textAlign: "center",
        marginTop: rpx(16),
    },
});
