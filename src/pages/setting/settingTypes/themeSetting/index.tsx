import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import Mode from "./mode";
import Background from "./background";

export default function ThemeSetting() {
    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            <Mode />
            <Background />
        </ScrollView>
    );
}
