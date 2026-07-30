import React from "react";
import NavBar from "./components/navBar";
import MusicBar from "@/components/musicBar";
import SheetMusicList from "./components/sheetMusicList";
import StatusBar from "@/components/base/statusBar";
import VerticalSafeAreaView from "@/components/base/verticalSafeAreaView";
import globalStyle from "@/constants/globalStyle";
import { View } from "react-native";

export default function SheetDetail() {
    return (
        <VerticalSafeAreaView style={globalStyle.fwflex1}>
            <StatusBar backgroundColor="transparent" />
            <NavBar />
            <SheetMusicList />
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 1001 }}>
                <MusicBar />
            </View>
        </VerticalSafeAreaView>
    );
}
