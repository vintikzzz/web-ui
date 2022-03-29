import { openDB, deleteDB, wrap, unwrap } from 'idb';
const md5 = require('md5');
const debug = require('debug')('webtor:lib:clientDb');

class Db {
    getDb() {
        if (this.db != undefined) return this.db;
        this.db = openDB('webtor', 3, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1) {
                    const fileStore = db.createObjectStore('files', {
                        keyPath: 'id',
                    });
                    db.createObjectStore('torrents', {
                        keyPath: 'id',
                    });
                    fileStore.createIndex('hashAndPwd', 'hashAndPwd');
                }
                if (oldVersion < 2) {
                    db.createObjectStore('recentTorrents', {
                        keyPath: 'id',
                    });
                }
                if (oldVersion < 3) {
                    db.createObjectStore('userSettings', {
                        keyPath: 'id',
                    });
                }
            },
        });
        return this.db;
    }
    makeFileKey(data) {
        return md5(data.infoHash + data.pwd + data.file);
    }
    makeHashAndPwd(data) {
        return md5(data.infoHash + data.pwd);
    }
    async updateFileState(data) {
        const id = this.makeFileKey(data);
        const db = await this.getDb();
        const hashAndPwd = this.makeHashAndPwd(data);
        data.id = id;
        data.hashAndPwd = hashAndPwd;
        data.timestamp = Date.now();
        await db.put('files', data);
        return data;
    }

    async getFileState(data) { 
        const id = this.makeFileKey(data);
        const db = await this.getDb();
        return await db.get('files', id);
    }
    async getCurrentDirFileStates(data) { 
        const hashAndPwd = this.makeHashAndPwd(data);
        const db = await this.getDb();
        return await db.getAllFromIndex('files', 'hashAndPwd', hashAndPwd)
    }
    async pushTorrent(torrent) { 
        const db = await this.getDb();
        const id = torrent.infoHash;
        return await db.put('torrents', {id, torrent});
    }
    async pullTorrent(infoHash) { 
        const db = await this.getDb();
        const data = await db.get('torrents', infoHash);
        if (data) return data.torrent;
        return null;
    }
    async setRecentTorrent(torrent, pwd) { 
        const db = await this.getDb();
        const id = torrent.infoHash;
        const name = torrent.name;
        const infoHash = torrent.infoHash;
        const timestamp = Date.now();
        const data = {id, infoHash, name, pwd, timestamp};
        await db.put('recentTorrents', data);
        return data;
    }
    async getRecentTorrents() { 
        const db = await this.getDb();
        return await db.getAll('recentTorrents');
    }
    async updateUserSettings(data) { 
        const db = await this.getDb();
        data.id = 1;
        return await db.put('userSettings', data);
     }
    async getUserSettings() {
        const db = await this.getDb();
        const data = await db.get('userSettings', 1);
        if (!data) return {};
        return data;
    }
}

class FakeDb {
    async updateUserSettings(data) { }
    async getUserSettings() { return {}; }
    async updateFileState(data) { return {}; }
    async getFileState(data) { return null; }
    async getCurrentDirFileStates(data) { return []; }
    async pushTorrent(data) { }
    async pullTorrent(data) { return null; }
    async setRecentTorrent(data) { return {}; }
    async getRecentTorrents() { return []; }
}

export async function createDb() {
    if (!('indexedDB' in window)) {
        debug('This browser doesn\'t support IndexedDB');
        return new FakeDb();
    }
    const db = new Db();
    try {
        await db.getUserSettings();
    } catch(e) {
        debug(e);
        return new FakeDb();
    }
    return db;
}