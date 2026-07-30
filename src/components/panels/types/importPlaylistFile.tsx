import PanelBase from "../base/panelBase";
import PanelHeader from "../base/panelHeader";
import rpx, { vmax } from "@/utils/rpx";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, ProgressBarAndroid, FlatList } from "react-native";
import useColors from "@/hooks/useColors";
import ThemeText from "@/components/base/themeText";
import Icon from "@/components/base/icon";
import { showPanel } from "../usePanel";
import Toast from "@/utils/toast";
import { readAsStringAsync } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import Clipboard from "@react-native-clipboard/clipboard";

interface ParsedPlaylistInfo {
    name: string;
    songs: Array<{
        name: string;
        artist: string;
        album?: string;
    }>;
    format: string;
}

interface ImportResult {
    success: boolean;
    message: string;
    totalCount: number;
    successCount: number;
    failedCount: number;
}

export default function ImportPlaylistFile() {
    const colors = useColors();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [parsedPlaylist, setParsedPlaylist] = useState<ParsedPlaylistInfo | null>(null);
    const [error, setError] = useState<string>("");
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    const parseCsvContent = (content: string): { songs: Array<{ name: string; artist: string; album?: string }>; name?: string } => {
        const lines = content.split("\n").filter(line => line.trim());
        const songs: Array<{ name: string; artist: string; album?: string }> = [];
        let name: string | undefined;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (i === 0 && (line.startsWith("歌单") || line.startsWith("playlist"))) {
                name = line.split(",").slice(1).join(",").trim();
                continue;
            }
            if (line.startsWith("#") || line.startsWith("//")) {
                continue;
            }
            const parts = line.split(",");
            if (parts.length >= 2) {
                songs.push({
                    name: parts[0].trim(),
                    artist: parts[1].trim(),
                    album: parts[2]?.trim(),
                });
            }
        }

        return { songs, name };
    };

    const parseJsonContent = (content: string): { songs: Array<{ name: string; artist: string; album?: string }>; name?: string } => {
        try {
            const data = JSON.parse(content);
            if (data.songs && Array.isArray(data.songs)) {
                return {
                    songs: data.songs.map((song: any) => ({
                        name: song.name || song.title || "",
                        artist: song.artist || song.artists || "",
                        album: song.album,
                    })),
                    name: data.name || data.title,
                };
            }
            if (Array.isArray(data)) {
                return {
                    songs: data.map((song: any) => ({
                        name: song.name || song.title || "",
                        artist: song.artist || song.artists || "",
                        album: song.album,
                    })),
                };
            }
        } catch (e) {
            throw new Error("JSON格式解析失败");
        }
        throw new Error("无效的JSON格式");
    };

    const [manualContent, setManualContent] = useState("");
    const [importMode, setImportMode] = useState<"file" | "clipboard" | "manual">("file");

    const parseContent = (content: string, fileName?: string): { songs: Array<{ name: string; artist: string; album?: string }>; name?: string; format: string } => {
        let parsedData;
        let format = "";

        if (fileName?.endsWith(".json") || content.trim().startsWith("{")) {
            format = "JSON";
            parsedData = parseJsonContent(content);
        } else {
            format = "CSV";
            parsedData = parseCsvContent(content);
        }

        return { ...parsedData, format };
    };

    const handleParseContent = async (content: string, fileName?: string) => {
        setLoading(true);
        setProgress(0);
        setError("");
        setImportResult(null);

        try {
            setTimeout(() => setProgress(30), 100);

            const parsedData = parseContent(content, fileName);

            setTimeout(() => setProgress(80), 200);

            if (parsedData.songs.length === 0) {
                throw new Error("未解析到歌曲数据");
            }

            setTimeout(() => {
                setProgress(100);
                setLoading(false);
            }, 300);

            setParsedPlaylist({
                name: parsedData.name || `导入歌单 (${parsedData.format})`,
                songs: parsedData.songs,
                format: parsedData.format,
            });
        } catch (e: any) {
            setLoading(false);
            setProgress(0);
            setError(e.message || "解析失败");
            Toast.warn(e.message || "解析失败");
        }
    };

    const handleFileSelect = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["text/csv", "application/json", "text/plain"],
                copyToCacheDirectory: true,
            });

            if (!result || result.canceled || !result.assets?.[0]?.uri) {
                return;
            }

            const content = await readAsStringAsync(result.assets[0].uri);
            await handleParseContent(content, result.assets[0].name);
        } catch (e: any) {
            setLoading(false);
            setProgress(0);
            setError(e.message || "文件读取失败");
            Toast.warn(e.message || "文件读取失败");
        }
    };

    const handleClipboardImport = async () => {
        try {
            const content = await Clipboard.getString();
            if (!content || !content.trim()) {
                Toast.warn("剪贴板为空");
                return;
            }
            await handleParseContent(content);
        } catch (e: any) {
            setError(e.message || "剪贴板读取失败");
            Toast.warn(e.message || "剪贴板读取失败");
        }
    };

    const handleManualImport = () => {
        if (!manualContent.trim()) {
            Toast.warn("请输入内容");
            return;
        }
        handleParseContent(manualContent);
    };

    const handleImport = () => {
        if (!parsedPlaylist || parsedPlaylist.songs.length === 0) {
            return;
        }

        showPanel("AddToMusicSheet", {
            musicItem: parsedPlaylist.songs.map((song, index) => ({
                id: `import_file_${index}`,
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
        setParsedPlaylist(null);
        setError("");
        setImportResult(null);
    };

    return (
        <PanelBase
            height={vmax(70)}
            renderBody={() => (
                <View style={[styles.container, { backgroundColor: colors.backdrop }]}>
                    <PanelHeader
                        title="文件导入歌单"
                        hideButtons
                    />

                    <View style={styles.content}>
                        {loading ? (
                            <View style={styles.loadingSection}>
                                <ThemeText fontSize="content" style={{ marginBottom: rpx(20) }}>
                                    正在解析...
                                </ThemeText>
                                <ProgressBarAndroid
                                    styleAttr="Horizontal"
                                    indeterminate={false}
                                    progress={progress / 100}
                                    color="#1890ff"
                                    style={styles.progressBar}
                                />
                                <ThemeText fontSize="description" fontColor="textSecondary" style={styles.progressText}>
                                    {progress}%
                                </ThemeText>
                            </View>
                        ) : !parsedPlaylist ? (
                            <>
                                <View style={styles.modeTabs}>
                                    <TouchableOpacity
                                        style={[styles.modeTab, importMode === "file" && styles.modeTabActive]}
                                        onPress={() => setImportMode("file")}
                                    >
                                        <Icon name="folder-outline" size={rpx(24)} color={importMode === "file" ? "#ffffff" : colors.textSecondary} />
                                        <ThemeText fontSize="description" color={importMode === "file" ? "#ffffff" : colors.textSecondary}>文件</ThemeText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modeTab, importMode === "clipboard" && styles.modeTabActive]}
                                        onPress={() => setImportMode("clipboard")}
                                    >
                                        <Icon name="document-outline" size={rpx(24)} color={importMode === "clipboard" ? "#ffffff" : colors.textSecondary} />
                                        <ThemeText fontSize="description" color={importMode === "clipboard" ? "#ffffff" : colors.textSecondary}>剪贴板</ThemeText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modeTab, importMode === "manual" && styles.modeTabActive]}
                                        onPress={() => setImportMode("manual")}
                                    >
                                        <Icon name="font-size" size={rpx(24)} color={importMode === "manual" ? "#ffffff" : colors.textSecondary} />
                                        <ThemeText fontSize="description" color={importMode === "manual" ? "#ffffff" : colors.textSecondary}>手动输入</ThemeText>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputSection}>
                                    {importMode === "file" && (
                                        <>
                                            <ThemeText fontSize="content" fontColor="textSecondary" style={styles.hint}>
                                                从文件导入歌单，支持 CSV、JSON 格式
                                            </ThemeText>

                                            {error ? (
                                                <ThemeText fontSize="description" style={styles.errorText} fontColor="danger">
                                                    {error}
                                                </ThemeText>
                                            ) : null}

                                            <TouchableOpacity
                                                style={[styles.selectButton, { backgroundColor: colors.primary }]}
                                                onPress={handleFileSelect}
                                            >
                                                <Icon name="folder-outline" size={rpx(40)} color="#ffffff" />
                                                <ThemeText fontSize="content" style={{ color: "#ffffff" }}>
                                                    选择文件
                                                </ThemeText>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {importMode === "clipboard" && (
                                        <>
                                            <ThemeText fontSize="content" fontColor="textSecondary" style={styles.hint}>
                                                从剪贴板导入歌单数据
                                            </ThemeText>

                                            {error ? (
                                                <ThemeText fontSize="description" style={styles.errorText} fontColor="danger">
                                                    {error}
                                                </ThemeText>
                                            ) : null}

                                            <TouchableOpacity
                                                style={[styles.selectButton, { backgroundColor: colors.primary }]}
                                                onPress={handleClipboardImport}
                                            >
                                                <Icon name="document-outline" size={rpx(40)} color="#ffffff" />
                                                <ThemeText fontSize="content" style={{ color: "#ffffff" }}>
                                                    读取剪贴板
                                                </ThemeText>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {importMode === "manual" && (
                                        <>
                                            <ThemeText fontSize="content" fontColor="textSecondary" style={styles.hint}>
                                                手动输入歌曲列表，每行一首：歌曲名,歌手名
                                            </ThemeText>

                                            {error ? (
                                                <ThemeText fontSize="description" style={styles.errorText} fontColor="danger">
                                                    {error}
                                                </ThemeText>
                                            ) : null}

                                            <ScrollView style={styles.textInputContainer}>
                                                <ThemeText
                                                    style={styles.textInput}
                                                    editable={true}
                                                    multiline={true}
                                                    numberOfLines={8}
                                                    placeholder="在此输入歌曲列表...&#10;格式：歌曲名,歌手名"
                                                    placeholderTextColor={colors.textSecondary}
                                                    onChangeText={setManualContent}
                                                    value={manualContent}
                                                />
                                            </ScrollView>

                                            <TouchableOpacity
                                                style={[styles.selectButton, { backgroundColor: colors.primary }]}
                                                onPress={handleManualImport}
                                            >
                                                <Icon name="check-circle-outline" size={rpx(40)} color="#ffffff" />
                                                <ThemeText fontSize="content" style={{ color: "#ffffff" }}>
                                                    解析内容
                                                </ThemeText>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    <View style={styles.formatSection}>
                                        <ThemeText fontSize="subTitle" fontWeight="bold" style={styles.formatTitle}>
                                            支持的格式
                                        </ThemeText>
                                        
                                        <View style={styles.formatInfo}>
                                            <ThemeText fontSize="description" fontColor="textSecondary" style={styles.formatLabel}>
                                                CSV 格式：
                                            </ThemeText>
                                            <ThemeText fontSize="description" style={styles.formatExample}>
                                                歌曲名,歌手名,专辑名
                                            </ThemeText>
                                        </View>

                                        <View style={styles.formatInfo}>
                                            <ThemeText fontSize="description" fontColor="textSecondary" style={styles.formatLabel}>
                                                JSON 格式：
                                            </ThemeText>
                                            <ThemeText fontSize="description" style={styles.formatExample}>
                                                {"{\"name\":\"歌单名\",\"songs\":[{\"name\":\"歌曲\",\"artist\":\"歌手\"}]}"}
                                            </ThemeText>
                                        </View>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.previewSection}>
                                    <View style={[styles.playlistInfo, { backgroundColor: colors.listActive }]}>
                                        <View style={styles.playlistHeader}>
                                            <Icon name="document-outline" size={rpx(48)} color={colors.primary} />
                                            <View style={styles.playlistMeta}>
                                                <ThemeText fontSize="title" fontWeight="bold" numberOfLines={1}>
                                                    {parsedPlaylist.name}
                                                </ThemeText>
                                                <ThemeText fontSize="description" fontColor="textSecondary">
                                                    {parsedPlaylist.format} 格式 · {parsedPlaylist.songs.length} 首歌曲
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
                                            <ThemeText fontSize="content" fontColor="textSecondary">重新选择</ThemeText>
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
    loadingSection: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    progressBar: {
        width: "100%",
        height: rpx(16),
    },
    progressText: {
        marginTop: rpx(12),
    },
    modeTabs: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: rpx(24),
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: rpx(12),
        padding: rpx(8),
    },
    modeTab: {
        flexDirection: "row",
        alignItems: "center",
        padding: rpx(16),
        borderRadius: rpx(8),
        gap: rpx(8),
    },
    modeTabActive: {
        backgroundColor: "#1890ff",
    },
    inputSection: {
        flex: 1,
    },
    hint: {
        marginBottom: rpx(20),
    },
    errorText: {
        marginBottom: rpx(16),
    },
    selectButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: rpx(100),
        borderRadius: rpx(20),
        gap: rpx(16),
        marginBottom: rpx(32),
    },
    textInputContainer: {
        marginBottom: rpx(20),
        borderRadius: rpx(12),
        backgroundColor: "rgba(255,255,255,0.1)",
        padding: rpx(16),
        maxHeight: rpx(400),
    },
    textInput: {
        fontSize: rpx(28),
        lineHeight: rpx(40),
    },
    formatSection: {
        marginTop: rpx(20),
    },
    formatTitle: {
        marginBottom: rpx(16),
    },
    formatInfo: {
        marginBottom: rpx(12),
    },
    formatLabel: {
        marginBottom: rpx(4),
    },
    formatExample: {
        backgroundColor: "rgba(255,255,255,0.1)",
        padding: rpx(12),
        borderRadius: rpx(8),
        fontFamily: "monospace",
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
    importButton: {
        marginLeft: rpx(16),
        backgroundColor: "#1890ff",
    },
    disabledButton: {
        backgroundColor: "#999",
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