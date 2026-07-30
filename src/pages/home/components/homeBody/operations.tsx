import { ROUTE_PATH, useNavigate } from "@/core/router";
import rpx from "@/utils/rpx";
import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import Icon from "@/components/base/icon.tsx";
import ThemeText from "@/components/base/themeText";
import { showPanel } from "@/components/panels/usePanel";

interface ActionCardProps {
    iconName: any;
    title: string;
    subtitle: string;
    bgColor: string;
    iconBgColor: string;
    iconColor: string;
    onPress: () => void;
}

function ActionCard({ iconName, title, subtitle, bgColor, iconBgColor, iconColor, onPress }: ActionCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.card, { backgroundColor: bgColor }]}
            activeOpacity={0.8}
        >
            <View style={styles.cardInner}>
                <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
                    <Icon name={iconName} size={rpx(36)} color={iconColor} />
                </View>
                <View style={styles.cardText}>
                    <ThemeText fontWeight="bold" style={styles.cardTitle} color="#ffffff">
                        {title}
                    </ThemeText>
                    <ThemeText fontSize="description" style={styles.cardSubtitle} color="rgba(255,255,255,0.55)">
                        {subtitle}
                    </ThemeText>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function Operations() {
    const navigate = useNavigate();

    const actionCards = [
        {
            iconName: "play-circle-outline",
            title: "发现新歌",
            subtitle: "每日推荐新曲",
            bgColor: "rgba(232, 93, 78, 0.15)",
            iconBgColor: "rgba(232, 93, 78, 0.2)",
            iconColor: "#E85D4E",
            action() {
                navigate(ROUTE_PATH.RECOMMEND_SHEETS);
            },
        },
        {
            iconName: "trophy",
            title: "热门排行",
            subtitle: "实时热度榜单",
            bgColor: "rgba(201, 162, 39, 0.15)",
            iconBgColor: "rgba(201, 162, 39, 0.2)",
            iconColor: "#C9A227",
            action() {
                navigate(ROUTE_PATH.TOP_LIST);
            },
        },
        {
            iconName: "clock-outline",
            title: "最近播放",
            subtitle: "继续收听记录",
            bgColor: "rgba(45, 158, 143, 0.15)",
            iconBgColor: "rgba(45, 158, 143, 0.2)",
            iconColor: "#2D9E8F",
            action() {
                navigate(ROUTE_PATH.HISTORY);
            },
        },
        {
            iconName: "folder-music-outline",
            title: "本地音乐",
            subtitle: "管理本地歌曲",
            bgColor: "rgba(46, 139, 87, 0.15)",
            iconBgColor: "rgba(46, 139, 87, 0.2)",
            iconColor: "#2E8B57",
            action() {
                navigate(ROUTE_PATH.LOCAL);
            },
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {actionCards.map(action => (
                    <ActionCard
                        key={action.title}
                        iconName={action.iconName}
                        title={action.title}
                        subtitle={action.subtitle}
                        bgColor={action.bgColor}
                        iconBgColor={action.iconBgColor}
                        iconColor={action.iconColor}
                        onPress={action.action}
                    />
                ))}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.createButton, styles.createButtonProminent]}
                    activeOpacity={0.7}
                    onPress={() => showPanel("CreateMusicSheet")}
                >
                    <Icon name="plus" size={rpx(36)} color="#ffffff" />
                    <ThemeText fontSize="content" fontWeight="bold" style={{ color: "#ffffff" }}>
                            新建歌单
                    </ThemeText>
                </TouchableOpacity>
                    
                <View style={styles.importActionContainer}>
                    <TouchableOpacity
                        style={[styles.importButton, styles.compactButton]}
                        activeOpacity={0.7}
                        onPress={() => showPanel("ImportPlaylistLink")}
                    >
                        <Icon name="inbox-arrow-down" size={rpx(24)} color="rgba(255,255,255,0.8)" />
                        <ThemeText fontSize="description" color="rgba(255,255,255,0.8)" fontWeight="medium">
                                链接导入
                        </ThemeText>
                    </TouchableOpacity>
                        
                    <TouchableOpacity
                        style={[styles.fileImportButton, styles.compactButton]}
                        activeOpacity={0.7}
                        onPress={() => showPanel("ImportPlaylistFile")}
                    >
                        <Icon name="folder-outline" size={rpx(24)} color="rgba(255,255,255,0.8)" />
                        <ThemeText fontSize="description" color="rgba(255,255,255,0.8)" fontWeight="medium">
                                文件导入
                        </ThemeText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: rpx(32),
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: rpx(24),
        marginBottom: rpx(20),
    },
    card: {
        width: "48%",
        height: rpx(176),
        borderRadius: rpx(24),
        overflow: "hidden",
    },
    cardInner: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: rpx(24),
        gap: rpx(24),
    },
    iconCircle: {
        width: rpx(88),
        height: rpx(88),
        borderRadius: rpx(44),
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    cardText: {
        flex: 1,
        minWidth: 0,
    },
    cardTitle: {
        fontSize: rpx(30),
    },
    cardSubtitle: {
        marginTop: rpx(6),
        fontSize: rpx(24),
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: rpx(0),
        marginBottom: rpx(12),
        gap: rpx(16),
    },
    createButton: {
        flex: 3,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: rpx(96),
        borderRadius: rpx(20),
        gap: rpx(12),
        backgroundColor: "#1DB954",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    createButtonProminent: {
        shadowColor: "#1DB954",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    importActionContainer: {
        flex: 2,
        flexDirection: "row",
        gap: rpx(12),
        height: rpx(96),
        alignItems: "center",
        justifyContent: "center",
    },
    compactButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: rpx(20),
        gap: rpx(6),
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
        height: rpx(96),
    },
    importButton: {
        backgroundColor: "rgba(29, 185, 84, 0.12)",
        borderColor: "#1DB954",
    },
    fileImportButton: {
        backgroundColor: "rgba(29, 185, 84, 0.12)",
        borderColor: "#1DB954",
    },
});
