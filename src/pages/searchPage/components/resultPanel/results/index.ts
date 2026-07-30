import React from "react";
import AlbumResultItem from "./albumResultItem";
import ArtistResultItem from "./artistResultItem";
import MusicResultItem from "./musicResultItem";
import MusicSheetResultItem from "./musicSheetResultItem";
import AggregateResultItem from "./aggregateResultItem";

const results: Array<{
    key: string;
    i18nKey?: string;
    title: string;
    component: React.FC<any>;
}> = [
    {
        key: "aggregate",
        title: "聚合",
        component: AggregateResultItem,
    },
    {
        key: "music",
        i18nKey: "common.singleMusic",
        title: "单曲",
        component: MusicResultItem,
    },
    {
        key: "album",
        i18nKey: "common.album",
        title: "专辑",
        component: AlbumResultItem,
    },
    {
        key: "artist",
        i18nKey: "common.artist",
        title: "作者",
        component: ArtistResultItem,
    },
    {
        key: "sheet",
        i18nKey: "common.sheet",
        title: "歌单",
        component: MusicSheetResultItem,
    },
];

const renderMap: Record<string, React.FC<any>> = {};
results.forEach(_ => (renderMap[_.key] = _.component));

export default results;
export { renderMap };
