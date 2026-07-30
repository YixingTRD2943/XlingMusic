/**
 * @name 通用歌单导入
 * @description 支持QQ音乐、网易云音乐、酷狗音乐歌单链接导入
 * @version 1.0.0
 * @author XingLing
 */

'use strict';

const axios = require('axios');
const qs = require('qs');

const playlistLinkParser = require('../../utils/playlistLinkParser');

module.exports = {
    platform: '通用歌单导入',

    async importMusicSheet(url) {
        console.log('[歌单导入] 开始解析链接:', url);
        
        try {
            const platform = playlistLinkParser.detectPlatform(url);
            console.log('[歌单导入] 检测到平台:', platform);
            
            if (platform === 'qq' || /i\.y\.qq\.com/.test(url)) {
                return await this.importQQMusicPlaylist(url);
            }
            if (platform === 'netease') {
                return await this.importNeteasePlaylist(url);
            }
            if (platform === 'kugou') {
                return await this.importKugouPlaylist(url);
            }
            if (platform === 'kuwo') {
                return await this.importKuwoPlaylist(url);
            }
            if (platform === 'xiami') {
                return await this.importXiamiPlaylist(url);
            }
            if (platform === 'migu') {
                return await this.importMiguPlaylist(url);
            }
            
            console.log('[歌单导入] 不支持的链接格式:', url);
            return [];
        } catch (error) {
            console.error('[歌单导入] 检测平台时出错:', error.message);
            console.log('[歌单导入] 不支持的链接格式:', url);
            return [];
        }
    },

    async importQQMusicPlaylist(url) {
        console.log('[歌单导入] 识别为QQ音乐链接');
        
        let playlistId = null;
        const patterns = [
            /y\.qq\.com.*playlist.*(\d+)/i,
            /i\d+\.y\.qq\.com.*playlist.*id=(\d+)/i,
            /y\.qq\.com\/n2\/m\/share\/details\/taoge\.html.*id=(\d+)/i,
            /y\.qq\.com\/n3\/other\/pages\/details\/playlist\.html.*id=(\d+)/i,
            /id=(\d+)/i,
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                playlistId = match[1];
                console.log('[歌单导入] 提取到QQ音乐歌单ID:', playlistId);
                break;
            }
        }
        
        if (!playlistId) {
            console.log('[歌单导入] 无法从链接提取QQ音乐歌单ID');
            return [];
        }
        
        try {
            console.log('[歌单导入] 开始请求QQ音乐API');
            
            const baseUrl = 'https://u.y.qq.com/cgi-bin/musicu.fcg';
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Referer': 'https://y.qq.com/',
                'Origin': 'https://y.qq.com',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            
            const params = {
                data: JSON.stringify({
                    'comm': { 'ct': 20, 'cv': 2000, 'uin': 0 },
                    'playlistInfo': {
                        'method': 'get_playlist_info',
                        'param': { 'id': parseInt(playlistId), 'n': 10000 }
                    }
                })
            };
            
            const response = await axios.get(baseUrl, {
                params: params,
                headers: headers,
                timeout: 15000
            });
            
            console.log('[歌单导入] QQ音乐API响应:', JSON.stringify(response.data).substring(0, 500));
            
            const playlistData = response.data?.playlistInfo?.data?.playlist;
            if (playlistData && playlistData.track_list) {
                const songs = playlistData.track_list.map((track) => ({
                    id: String(track.track_id),
                    name: track.title,
                    artist: track.singer.map(s => s.name).join('/'),
                    album: track.album?.name || '',
                    platform: 'qq',
                    artwork: track.album?.mid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${track.album.mid}.jpg` : '',
                }));
                console.log('[歌单导入] QQ音乐解析完成，共', songs.length, '首歌曲');
                return songs;
            }
            
            console.log('[歌单导入] QQ音乐API playListInfo返回空，尝试备用API');
        } catch (error) {
            console.error('[歌单导入] QQ音乐musicu.fcg请求失败:', error.message);
        }
        
        try {
            const resp2 = await axios.get(
                `https://c.y.qq.com/v8/fcg-bin/fcg_playlist_detail.fcg?format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&playlistid=${playlistId}`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                        'Referer': 'https://y.qq.com/',
                        'Origin': 'https://y.qq.com',
                    },
                    timeout: 15000,
                }
            );
            const trackList = resp2.data?.data?.trackList;
            if (trackList && trackList.length > 0) {
                const songs = trackList.map((track) => ({
                    id: String(track.id),
                    name: track.title,
                    artist: track.singer.map(s => s.name).join('/'),
                    album: track.album?.name || '',
                    platform: 'qq',
                    artwork: track.album?.mid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${track.album.mid}.jpg` : '',
                }));
                console.log('[歌单导入] QQ音乐备用API解析完成，共', songs.length, '首歌曲');
                return songs;
            }
} catch (error) {
             console.error('[歌单导入] QQ音乐备用API也失败:', error.message);
         }

         // 尝试i.y.qq.com域名API
         try {
             console.log('[歌单导入] 尝试i.y.qq.com API');
             const resp3 = await axios.get(
                 `https://i.y.qq.com/qzone-music/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&disstid=${playlistId}&format=json&g_tk=5381`,
                 {
                     headers: {
                         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                         'Referer': 'https://y.qq.com/',
                         'Origin': 'https://y.qq.com',
                     },
                     timeout: 15000,
                 }
             );
             const cdlist = resp3.data?.cdlist?.[0];
             if (cdlist && cdlist.songlist && cdlist.songlist.length > 0) {
                 const songs = cdlist.songlist.map((track: any) => ({
                     id: String(track.songid || track.songmid),
                     name: track.songname || track.name || '',
                     artist: (track.singer || track.artists || []).map((s: any) => s.name).join('/'),
                     album: track.albumname || '',
                     platform: 'qq',
                     artwork: track.albummid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${track.albummid}.jpg` : '',
                 }));
                 console.log('[歌单导入] QQ音乐i.y.qq.com API解析完成，共', songs.length, '首歌曲');
                 return songs;
             }
         } catch (error) {
             console.error('[歌单导入] QQ音乐i.y.qq.com API失败:', error.message);
         }

         // 尝试v8 playlist API
         try {
             console.log('[歌单导入] 尝试v8 playlist API');
             const resp4 = await axios.get(
                 `https://c.y.qq.com/v8/fcg-bin/fcg_v8_playlist_cp.fcg?id=${playlistId}&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`,
                 {
                     headers: {
                         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                         'Referer': 'https://y.qq.com/',
                         'Origin': 'https://y.qq.com',
                         'Accept': 'application/json',
                     },
                     timeout: 15000,
                 }
             );
             const cdlist = resp4.data?.data?.cdlist?.[0];
             if (cdlist) {
                 const songlist = cdlist.songlist || cdlist.songs || [];
                 if (songlist.length > 0) {
                     const songs = songlist.map((track: any) => ({
                         id: String(track.songid || track.songmid),
                         name: track.songname || track.name || '',
                         artist: (track.singer || []).map((s: any) => s.name).join('/'),
                         album: track.albumname || '',
                         platform: 'qq',
                         artwork: track.albummid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${track.albummid}.jpg` : '',
                     }));
                     console.log('[歌单导入] QQ音乐v8 playlist API解析完成，共', songs.length, '首歌曲');
                     return songs;
                 }
             }
         } catch (error) {
             console.error('[歌单导入] QQ音乐v8 playlist API失败:', error.message);
         }

         console.log('[歌单导入] QQ音乐所有API均失败');
         return [];
     },

    async importNeteasePlaylist(url) {
        console.log('[歌单导入] 识别为网易云音乐链接');
        
        const match = url.match(/playlist.*id=(\d+)/i);
        if (!match || !match[1]) {
            console.log('[歌单导入] 无法从链接提取网易云音乐歌单ID');
            return [];
        }
        
        const playlistId = match[1];
        console.log('[歌单导入] 提取到网易云音乐歌单ID:', playlistId);
        
        try {
            const baseUrl = 'https://api.music.163.com/playlist/detail';
            const response = await axios.get(baseUrl, {
                params: { id: playlistId },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://music.163.com/'
                },
                timeout: 10000
            });
            
            const playlistData = response.data?.playlist;
            if (!playlistData || !playlistData.tracks) {
                console.log('[歌单导入] 网易云音乐API返回数据为空');
                return [];
            }
            
            const songs = playlistData.tracks.map((track) => ({
                id: String(track.id),
                name: track.name,
                artist: track.ar.map(a => a.name).join('/'),
                album: track.al?.name || '',
                platform: 'netease',
                artwork: track.al?.picUrl || '',
            }));
            
            console.log('[歌单导入] 网易云音乐解析完成，共', songs.length, '首歌曲');
            return songs;
            
        } catch (error) {
            console.error('[歌单导入] 网易云音乐API请求失败:', error.message);
            return [];
        }
    },

    async importKugouPlaylist(url) {
        console.log('[歌单导入] 识别为酷狗音乐链接');
        
        const match = url.match(/playlist\/(\d+)/i);
        if (!match || !match[1]) {
            console.log('[歌单导入] 无法从链接提取酷狗音乐歌单ID');
            return [];
        }
        
        const playlistId = match[1];
        console.log('[歌单导入] 提取到酷狗音乐歌单ID:', playlistId);
        
        try {
            const baseUrl = 'https://www.kugou.com/yy/index.php';
            const response = await axios.get(baseUrl, {
                params: {
                    r: 'play/getdata',
                    hash: playlistId
                },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.kugou.com/'
                },
                timeout: 10000
            });
            
            const data = response.data?.data;
            if (!data) {
                console.log('[歌单导入] 酷狗音乐API返回数据为空');
                return [];
            }
            
            const songs = [];
            if (data.songs) {
                data.songs.forEach((song) => {
                    songs.push({
                        id: String(song.hash),
                        name: song.songname,
                        artist: song.singer_name,
                        album: song.album_name || '',
                        platform: 'kugou',
                        artwork: '',
                    });
                });
            }
            
            console.log('[歌单导入] 酷狗音乐解析完成，共', songs.length, '首歌曲');
            return songs;
            
        } catch (error) {
            console.error('[歌单导入] 酷狗音乐API请求失败:', error.message);
            return [];
        }
    }
};
