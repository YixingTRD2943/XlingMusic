import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View, ScrollView, Modal } from "react-native";
import rpx from "@/utils/rpx";
import ThemeText from "@/components/base/themeText";
import useColors from "@/hooks/useColors";
import PluginManager from "@/core/pluginManager";
import { useAtom } from "jotai";
import { searchPluginHashAtom } from "../store/atoms";

export default function PluginSelector() {
    const [visible, setVisible] = useState(false);
    const [selectedHash, setSelectedHash] = useAtom(searchPluginHashAtom);
    const colors = useColors();

    const plugins = useMemo(() => {
        const all = PluginManager.getSearchablePlugins();
        return [{ name: "全部插件", hash: "" }, ...all.map(p => ({ name: p.name, hash: p.hash }))];
    }, []);

    const currentName = useMemo(() => {
        if (!selectedHash) return "全部";
        const p = plugins.find(it => it.hash === selectedHash);
        return p?.name ?? "全部";
    }, [selectedHash, plugins]);

    return (
        <View>
            <Pressable
                style={[style.trigger, { backgroundColor: colors.pageBackground }]}
                onPress={() => setVisible(true)}
            >
                <ThemeText fontSize="tag" numberOfLines={1} style={style.triggerText}>
                    {currentName}
                </ThemeText>
                <ThemeText fontSize="tag" style={style.arrow}>
                    ▼
                </ThemeText>
            </Pressable>
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <Pressable style={style.overlay} onPress={() => setVisible(false)}>
                    <View style={[style.dropdown, { backgroundColor: colors.card, borderColor: colors.divider }]}>
                        <ScrollView style={style.scroll} nestedScrollEnabled>
                            {plugins.map((it) => (
                                <Pressable
                                    key={it.hash || "__all"}
                                    style={({ pressed }) => [
                                        style.item,
                                        { backgroundColor: pressed ? colors.primary + "20" : "transparent" },
                                        selectedHash === it.hash && { backgroundColor: colors.primary + "15" },
                                    ]}
                                    onPress={() => {
                                        setSelectedHash(it.hash);
                                        setVisible(false);
                                    }}
                                >
                                    <ThemeText
                                        fontSize="description"
                                        fontColor={selectedHash === it.hash ? "primary" : "text"}
                                    >
                                        {it.name}
                                    </ThemeText>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const style = StyleSheet.create({
    trigger: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: rpx(12),
        paddingVertical: rpx(6),
        borderRadius: rpx(32),
        marginLeft: rpx(8),
        flexShrink: 0,
    },
    triggerText: {
        flexShrink: 1,
    },
    arrow: {
        marginLeft: rpx(4),
        fontSize: rpx(12),
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    dropdown: {
        width: rpx(300),
        maxHeight: rpx(400),
        borderRadius: rpx(12),
        borderWidth: rpx(1),
        overflow: "hidden",
    },
    scroll: {
        maxHeight: rpx(360),
    },
    item: {
        paddingHorizontal: rpx(16),
        paddingVertical: rpx(14),
    },
});
