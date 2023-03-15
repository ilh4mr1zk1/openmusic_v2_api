const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const AuthorizationError = require('../../../exceptions/AuthorizationError');
const ClientError = require('../../../exceptions/ClientError');
const { mapDBPlaylistToModel } = require('../../../utils/playlist');
const { mapDBSONGToModel } = require('../../../utils/song');
const { mapDBPlaylistSongsToModel } = require('../../../utils/playlist_songs');

class PlaylistSongsService {
  constructor(collaborationService) {
    this._pool = new Pool();

    this._collaborationService = collaborationService;
  }

  async addSongToPlaylist(playlistId,songId) {
    const id = `playlist-songs-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    }

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new NotFoundError('Lagu gagal ditambahkan ke dalam playlist.');
    }
 
    return result.rows[0].id;    

  }

  async getDataPlaylists() {

    const result = await this._pool.query('SELECT * FROM playlists');
    return result.rows;

  }

  async getPlaylistsongById(id){

    const query = {
      text: `SELECT 
      playlists.id, playlists.name,
      users.username
      FROM playlists 
      LEFT JOIN users 
      ON playlists.owner = users.id 
      LEFT JOIN playlistsongs
      ON playlists.id = playlistsongs.playlist_id
      WHERE playlistsongs.playlist_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    return result.rows.map(mapDBPlaylistSongsToModel)[0];

  }

  async getSongs(id) {
    const query = {
      text: `SELECT 
            playlistsongs.song_id as id, song.title, song.performer
            FROM playlistsongs 
            LEFT JOIN song 
            ON playlistsongs.song_id = song.id 
            WHERE playlistsongs.playlist_id = $1`,
      values:[id]
    }

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistsong(song_id) {
    const query = {
      text: "DELETE FROM playlistsongs WHERE song_id = $1 RETURNING id",
      values: [song_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new ClientError("Lagu di dalam playlists gagal dihapus. Pastikan Id Valid");
    }
  }

  async verifyCollaborator(songId, playlistId) {
    const query = {
      text: "SELECT * FROM playlistsongs WHERE song_id = $1 AND playlist_id = $2",
      values: [songId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Lagu gagal diverifikasi");
    }
  }

  async checkDataPlaylists(id) {
   const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Ga ada");
    }
     
  }

  async verifyPlaylistOwner(id) {

    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    
  }
  
}

module.exports = PlaylistSongsService;