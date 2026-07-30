import React, { useCallback, useMemo } from "react";
import { FlashList } from "@shopify/flash-list";
import { useAtomValue } from "jotai";
import { searchResultsAtom, queryAtom } from "@/pages/searchPage/store/atoms";
import { isSameMediaItem } from "@/utils/mediaUtils";
import MusicItem from "@/components/mediaItem/musicItem";
import ListEmpty from "@/components/base/listEmpty";
import { RequestStateCode } from "@/constants/commonConst";
import Loading from "@/components/base/loading";
import TrackPlayer from "@/core/trackPlayer";
import rpx from "@/utils/rpx";
import { View } from "react-native";

export default function AggregateResultItem() {
    const searchResults = useAtomValue(searchResultsAtom);
    const query = useAtomValue(queryAtom);

    const { items, state } = useMemo(() => {
        const musicResults = searchResults.music ?? {};
        const hashes = Object.keys(musicResults);
        if (!hashes.length) return { items: [], state: RequestStateCode.IDLE };

        let latestState = RequestStateCode.FINISHED;
        const seen = new Set<string>();
        const merged: IMusic.IMusicItem[] = [];

        for (const hash of hashes) {
            const result = musicResults[hash];
            if (!result?.data?.length) continue;

            if (result.state === RequestStateCode.PENDING_FIRST_PAGE || result.state === RequestStateCode.PENDING_REST_PAGE) {
                if (latestState !== RequestStateCode.ERROR) {
                    latestState = result.state;
                }
            } else if (result.state === RequestStateCode.PARTLY_DONE) {
                if (latestState !== RequestStateCode.PENDING_FIRST_PAGE && latestState !== RequestStateCode.PENDING_REST_PAGE) {
                    latestState = RequestStateCode.PARTLY_DONE;
                }
            } else if (result.state === RequestStateCode.ERROR) {
                if (latestState !== RequestStateCode.PENDING_FIRST_PAGE && latestState !== RequestStateCode.PENDING_REST_PAGE && latestState !== RequestStateCode.PARTLY_DONE) {
                    latestState = RequestStateCode.ERROR;
                }
            }

            for (const item of result.data) {
                const key = `${item.title}-${item.artist}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    merged.push(item);
                }
            }
        }

        return { items: merged, state: latestState };
    }, [searchResults]);

    const keyExtractor = useCallback(
        (item: any, i: number) => `agg-${i}-${item.platform}-${item.id}`,
        [],
    );

    const renderItem = useCallback(({ item }: { item: IMusic.IMusicItem }) => (
        <MusicItem
            musicItem={item}
            onItemPress={() => {
                TrackPlayer.play(item);
            }}
        />
    ), []);

    if (state === RequestStateCode.PENDING_FIRST_PAGE) {
        return <Loading />;
    }

    return (
        <View style={{ flex: 1 }}>
            <FlashList
                data={items}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                estimatedItemSize={rpx(120)}
                ListEmptyComponent={<ListEmpty state={state} />}
            />
        </View>
    );
}
