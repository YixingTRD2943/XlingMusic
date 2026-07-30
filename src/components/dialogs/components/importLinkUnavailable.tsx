import React, { useState } from "react";
import ThemeText from "@/components/base/themeText";
import { StyleSheet, View } from "react-native";
import rpx from "@/utils/rpx";
import { TouchableOpacity } from "react-native-gesture-handler";
import { hideDialog } from "../useDialog";
import Checkbox from "@/components/base/checkbox";
import Dialog from "./base";
import PersistStatus from "@/utils/persistStatus";

export default function ImportLinkUnavailableDialog() {
    const [skipState, setSkipState] = useState(false);

    const onConfirm = () => {
        if (skipState) {
            PersistStatus.set("app.skipImportLinkDialog", true);
        }
        hideDialog();
    };

    return (
        <Dialog onDismiss={hideDialog}>
            <Dialog.Title stringContent>链接导入不可用</Dialog.Title>
            <Dialog.Content>
                <ThemeText style={styles.content}>
                    链接导入功能暂不可用，请使用文件导入或其他方式导入歌单。
                </ThemeText>
            </Dialog.Content>

            <TouchableOpacity
                style={styles.checkBox}
                onPress={() => {
                    setSkipState(state => !state);
                }}>
                <View style={styles.checkboxGroup}>
                    <Checkbox checked={skipState} />
                    <ThemeText style={styles.checkboxHint}>不再提示</ThemeText>
                </View>
            </TouchableOpacity>

            <Dialog.Actions
                actions={[
                    {
                        title: "我知道了",
                        type: "primary",
                        onPress: onConfirm,
                    },
                ]}
            />
        </Dialog>
    );
}

const styles = StyleSheet.create({
    content: {
        lineHeight: rpx(36),
    },
    checkBox: {
        marginHorizontal: rpx(24),
        marginVertical: rpx(36),
    },
    checkboxGroup: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkboxHint: {
        marginLeft: rpx(12),
    },
});
