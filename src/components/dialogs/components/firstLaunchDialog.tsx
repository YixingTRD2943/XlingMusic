import React, { useEffect, useMemo, useState } from "react";
import ThemeText from "@/components/base/themeText";
import { StyleSheet } from "react-native";
import rpx from "@/utils/rpx";
import { hideDialog } from "../useDialog";
import Dialog from "./base";
import PersistStatus from "@/utils/persistStatus";

const sections = `软件状态与免责声明
本软件目前正处于积极的持续开发与功能迭代阶段。尽管我们在发布前已进行了多轮内部测试，但受限于开发周期与测试环境的复杂性，软件在运行过程中仍可能存在未知的逻辑缺陷、性能瓶颈或偶发性错误（Bug）。我们诚挚地邀请您在体验过程中，通过官方渠道反馈您遇到的问题，您的建议将是我们优化的重要动力。

功能依赖说明
为了构建一个轻量化的核心框架，本软件的部分高级功能与扩展模块采用了插件化架构。这意味着，您需要手动下载并安装指定的配套插件，才能解锁并使用软件的全部功能。请确保您安装的插件版本与当前软件版本相匹配，以获得最佳的使用体验。

使用许可与版权声明
本软件的所有权及版权均归开发者所有。我们授权本软件仅用于个人学习、技术研究及非盈利性的交流探讨。严禁任何个人或组织将本软件用于任何形式的商业盈利活动、二次分发或非法用途。若因违反此规定而产生的任何法律纠纷或经济损失，开发者概不负责，并保留追究相关责任的权利。`;

export default function FirstLaunchDialog() {
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleConfirm = () => {
        PersistStatus.set("app.hasShownFirstLaunchDialog", true);
        hideDialog();
    };

    const content = useMemo(() => {
        const parts = sections.split("\n\n");
        return parts.map((part, i) => {
            const lines = part.split("\n");
            const title = lines[0];
            const body = lines.slice(1).join("\n");
            return (
                <ThemeText key={i} style={styles.section}>
                    <ThemeText style={styles.sectionTitle}>{title}</ThemeText>
                    {body ? (
                        <ThemeText style={styles.sectionBody}>{`\n${body}`}</ThemeText>
                    ) : null}
                </ThemeText>
            );
        });
    }, []);

    return (
        <Dialog onDismiss={() => {}} hideCloseButton>
            <Dialog.Title stringContent>使用须知</Dialog.Title>
            <Dialog.Content needScroll>
                {content}
            </Dialog.Content>
            <Dialog.Actions
                actions={[
                    {
                        title: countdown > 0 ? `我知道了 (${countdown}s)` : "我知道了",
                        type: countdown > 0 ? "normal" : "primary",
                        onPress: countdown > 0 ? undefined : handleConfirm,
                    },
                ]}
            />
        </Dialog>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: rpx(24),
    },
    sectionTitle: {
        fontWeight: "bold",
        fontSize: rpx(28),
        lineHeight: rpx(42),
    },
    sectionBody: {
        lineHeight: rpx(36),
    },
});
