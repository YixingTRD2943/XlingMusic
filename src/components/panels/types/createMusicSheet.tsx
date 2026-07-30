import { fontSizeConst } from "@/constants/uiConst";
import useColors from "@/hooks/useColors";
import rpx, { vmax } from "@/utils/rpx";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import MusicSheet from "@/core/musicSheet";
import { TextInput } from "react-native-gesture-handler";
import PanelBase from "../base/panelBase";
import PanelHeader from "../base/panelHeader";
import { hidePanel, showPanel } from "../usePanel";
import { useI18N } from "@/core/i18n";
import ThemeText from "@/components/base/themeText";
import Icon from "@/components/base/icon";
import Image from "@/components/base/image";
import { ImgAsset } from "@/constants/assetsConst";
import { launchImageLibrary } from "react-native-image-picker";
import { readAsStringAsync } from "expo-file-system";
import { exists, unlink, writeFile } from "react-native-fs";
import { addFileScheme, addRandomHash } from "@/utils/fileUtils";
import pathConst from "@/constants/pathConst";
import Toast from "@/utils/toast";
import { nanoid } from "nanoid";

interface ICreateMusicSheetProps {
    defaultName?: string;
    onSheetCreated?: (sheetId: string) => void;
    onCancel?: () => void;
}

export default function CreateMusicSheet(props: ICreateMusicSheetProps) {
    const { t } = useI18N();

    const { onSheetCreated, onCancel, defaultName = t("panel.createMusicSheet.title") } = props;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [privacy, setPrivacy] = useState<"public" | "private">("public");
    const [coverImg, setCoverImg] = useState<string | undefined>(undefined);
    const colors = useColors();

    const onChangeCoverPress = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: "photo",
            });
            const uri = result.assets?.[0].uri;
            if (!uri) {
                return;
            }
            setCoverImg(uri);
        } catch (e) {
            Toast.warn("选择图片失败");
        }
    };

    const onConfirm = async () => {
        if (!name.trim()) {
            Toast.warn("请输入歌单名称");
            return;
        }

        let savedCoverImg: string | undefined;
        if (coverImg) {
            const tempId = nanoid();
            savedCoverImg = addFileScheme(
                `${pathConst.dataPath}sheet${tempId}${coverImg.substring(
                    coverImg.lastIndexOf("."),
                )}`,
            );
            try {
                if ((await exists(savedCoverImg))) {
                    await unlink(savedCoverImg);
                }
                const rawImage = await readAsStringAsync(coverImg, {
                    encoding: "base64",
                });
                await writeFile(savedCoverImg, rawImage, "base64");
                savedCoverImg = addRandomHash(savedCoverImg);
            } catch (e) {
                Toast.warn("保存封面失败");
                savedCoverImg = undefined;
            }
        }

        const sheetId = await MusicSheet.addSheet(name.trim(), {
            description: description.trim(),
            privacy,
            coverImg: savedCoverImg,
        });
        
        onSheetCreated?.(sheetId);
        Toast.success("歌单创建成功");
        hidePanel();
    };

    return (
        <PanelBase
            height={vmax(60)}
            keyboardAvoidBehavior="height"
            renderBody={() => (
                <View style={styles.container}>
                    <PanelHeader
                        title={t("panel.createMusicSheet.title")}
                        onCancel={() => {
                            onCancel ? onCancel() : hidePanel();
                        }}
                        onOk={onConfirm}
                    />

                    <View style={styles.form}>
                        <View style={styles.coverSection}>
                            <ThemeText fontSize="content" fontColor="textSecondary" style={styles.label}>
                                歌单封面
                            </ThemeText>
                            <TouchableOpacity
                                style={styles.coverContainer}
                                onPress={onChangeCoverPress}
                                onLongPress={() => setCoverImg(undefined)}
                            >
                                <Image
                                    style={styles.coverImg}
                                    uri={coverImg}
                                    emptySrc={ImgAsset.albumDefault}
                                />
                                <View style={styles.coverOverlay}>
                                    <Icon name="circle-stack" size={rpx(32)} color="#ffffff" />
                                </View>
                            </TouchableOpacity>
                            <ThemeText fontSize="description" fontColor="textSecondary">
                                点击选择封面，长按移除
                            </ThemeText>
                        </View>

                        <View style={styles.inputSection}>
                            <ThemeText fontSize="content" fontColor="textSecondary" style={styles.label}>
                                歌单名称
                            </ThemeText>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                autoFocus
                                accessible
                                style={[
                                    styles.input,
                                    {
                                        color: colors.text,
                                        backgroundColor: colors.placeholder,
                                    },
                                ]}
                                placeholderTextColor={colors.textSecondary}
                                placeholder="输入歌单名称"
                                maxLength={200}
                            />
                        </View>

                        <View style={styles.inputSection}>
                            <ThemeText fontSize="content" fontColor="textSecondary" style={styles.label}>
                                歌单描述
                            </ThemeText>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                style={[
                                    styles.textArea,
                                    {
                                        color: colors.text,
                                        backgroundColor: colors.placeholder,
                                    },
                                ]}
                                placeholderTextColor={colors.textSecondary}
                                placeholder="添加歌单描述（可选）"
                                maxLength={500}
                                multiline
                            />
                        </View>

                        <View style={styles.privacySection}>
                            <ThemeText fontSize="content" fontColor="textSecondary" style={styles.label}>
                                隐私设置
                            </ThemeText>
                            <View style={styles.privacyOptions}>
                                <TouchableOpacity
                                    style={[styles.privacyOption, privacy === "public" && styles.privacyOptionActive]}
                                    onPress={() => setPrivacy("public")}
                                >
                                    <Icon name="language" size={rpx(28)} color={privacy === "public" ? "#ffffff" : colors.textSecondary} />
                                    <ThemeText fontSize="content" style={{ color: privacy === "public" ? "#ffffff" : colors.textSecondary }}>
                                        公开
                                    </ThemeText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.privacyOption, privacy === "private" && styles.privacyOptionActive]}
                                    onPress={() => setPrivacy("private")}
                                >
                                    <Icon name="shield-keyhole-outline" size={rpx(28)} color={privacy === "private" ? "#ffffff" : colors.textSecondary} />
                                    <ThemeText fontSize="content" style={{ color: privacy === "private" ? "#ffffff" : colors.textSecondary }}>
                                        私有
                                    </ThemeText>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={[styles.importLinkButton, { backgroundColor: colors.listActive }]}
                            onPress={() => {
                                hidePanel();
                                setTimeout(() => {
                                    showPanel("ImportPlaylistLink");
                                }, 300);
                            }}>
                            <Icon name="link" size={rpx(36)} color={colors.primary} />
                            <ThemeText fontSize="content" fontColor="primary" style={styles.importLinkText}>
                                链接导入歌单
                            </ThemeText>
                            <Icon name="arrow-right-end-on-rectangle" size={rpx(28)} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.importFileButton, { backgroundColor: colors.listActive }]}
                            onPress={() => {
                                hidePanel();
                                setTimeout(() => {
                                    showPanel("ImportPlaylistFile");
                                }, 300);
                            }}>
                            <Icon name="document-outline" size={rpx(36)} color={colors.primary} />
                            <ThemeText fontSize="content" fontColor="primary" style={styles.importLinkText}>
                                文件导入歌单
                            </ThemeText>
                            <Icon name="arrow-right-end-on-rectangle" size={rpx(28)} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    form: {
        paddingHorizontal: rpx(24),
        paddingBottom: rpx(24),
    },
    label: {
        marginBottom: rpx(12),
    },
    coverSection: {
        marginBottom: rpx(24),
        alignItems: "center",
    },
    coverContainer: {
        position: "relative",
        marginBottom: rpx(8),
    },
    coverImg: {
        width: rpx(180),
        height: rpx(180),
        borderRadius: rpx(24),
    },
    coverOverlay: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: rpx(48),
        height: rpx(48),
        borderRadius: rpx(24),
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    inputSection: {
        marginBottom: rpx(20),
    },
    input: {
        borderRadius: rpx(12),
        fontSize: fontSizeConst.content,
        lineHeight: fontSizeConst.content * 1.5,
        padding: rpx(16),
    },
    textArea: {
        borderRadius: rpx(12),
        fontSize: fontSizeConst.content,
        lineHeight: fontSizeConst.content * 1.5,
        padding: rpx(16),
        minHeight: rpx(120),
    },
    privacySection: {
        marginBottom: rpx(24),
    },
    privacyOptions: {
        flexDirection: "row",
        gap: rpx(20),
    },
    privacyOption: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: rpx(16),
        paddingHorizontal: rpx(20),
        borderRadius: rpx(12),
        backgroundColor: "rgba(255,255,255,0.1)",
        gap: rpx(12),
    },
    privacyOptionActive: {
        backgroundColor: "#1890ff",
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginVertical: rpx(20),
    },
    importLinkButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: rpx(20),
        paddingHorizontal: rpx(24),
        borderRadius: rpx(16),
        gap: rpx(12),
        marginBottom: rpx(12),
    },
    importFileButton: {
        flexDirection: "row",
        alignItems: "center",
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