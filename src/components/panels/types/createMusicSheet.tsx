import { fontSizeConst } from "@/constants/uiConst";
import useColors from "@/hooks/useColors";
import rpx, { vmax } from "@/utils/rpx";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import MusicSheet from "@/core/musicSheet";
import { TextInput } from "react-native-gesture-handler";
import PanelBase from "../base/panelBase";
import PanelHeader from "../base/panelHeader";
import { hidePanel, showPanel } from "../usePanel";
import { useI18N } from "@/core/i18n";
import ThemeText from "@/components/base/themeText";
import Icon from "@/components/base/icon";

interface ICreateMusicSheetProps {
    defaultName?: string;
    onSheetCreated?: (sheetId: string) => void;
    onCancel?: () => void;
}

export default function CreateMusicSheet(props: ICreateMusicSheetProps) {
    const { t } = useI18N();

    const { onSheetCreated, onCancel, defaultName = t("panel.createMusicSheet.title") } = props;

    const [input, setInput] = useState("");
    const colors = useColors();

    return (
        <PanelBase
            height={vmax(40)}
            keyboardAvoidBehavior="height"
            renderBody={() => (
                <>
                    <PanelHeader
                        title={t("panel.createMusicSheet.title")}
                        onCancel={() => {
                            onCancel ? onCancel() : hidePanel();
                        }}
                        onOk={async () => {
                            const sheetId = await MusicSheet.addSheet(
                                input || defaultName,
                            );
                            onSheetCreated?.(sheetId);
                            hidePanel();
                        }}
                    />
                    <TextInput
                        value={input}
                        onChangeText={_ => {
                            setInput(_);
                        }}
                        autoFocus
                        accessible
                        accessibilityLabel={t("panel.createMusicSheet.inputLabel")}
                        accessibilityHint={t("panel.createMusicSheet.title")}
                        style={[
                            style.input,
                            {
                                color: colors.text,
                                backgroundColor: colors.placeholder,
                            },
                        ]}
                        placeholderTextColor={colors.textSecondary}
                        placeholder={defaultName}
                        maxLength={200}
                    />
                    <TouchableOpacity
                        style={[style.importLinkButton, { backgroundColor: colors.listActive }]}
                        onPress={() => {
                            hidePanel();
                            setTimeout(() => {
                                showPanel("ImportPlaylistLink");
                            }, 300);
                        }}>
                        <Icon name="link" size={rpx(36)} color={colors.primary} />
                        <ThemeText fontSize="content" fontColor="primary" style={style.importLinkText}>
                            链接导入歌单
                        </ThemeText>
                        <Icon name="arrow-right-end-on-rectangle" size={rpx(28)} color={colors.textSecondary} />
                    </TouchableOpacity>
                </>
            )}
        />
    );
}

const style = StyleSheet.create({
    wrapper: {
        width: rpx(750),
    },
    operations: {
        width: rpx(750),
        paddingHorizontal: rpx(24),
        flexDirection: "row",
        height: rpx(100),
        alignItems: "center",
        justifyContent: "space-between",
    },
    input: {
        margin: rpx(24),
        borderRadius: rpx(12),
        fontSize: fontSizeConst.content,
        lineHeight: fontSizeConst.content * 1.5,
        padding: rpx(12),
    },
    importLinkButton: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: rpx(24),
        marginBottom: rpx(24),
        paddingVertical: rpx(20),
        paddingHorizontal: rpx(24),
        borderRadius: rpx(16),
        gap: rpx(12),
    },
    importLinkText: {
        flex: 1,
        marginLeft: rpx(8),
    },
});
