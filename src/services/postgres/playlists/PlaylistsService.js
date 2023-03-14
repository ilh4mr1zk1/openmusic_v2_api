const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const AuthorizationError = require('../../../exceptions/AuthorizationError');
const { mapDBPlaylistToModel } = require('../../../utils/playlist');
const { mapDBSONGToModel } = require('../../../utils/song');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();

    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
 
    return result.rows[0].id;

  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.*, users.username FROM playlists
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      LEFT JOIN users ON playlists.owner = users.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id, users.username`,
    values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBPlaylistToModel);
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.*, users.username
      FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    return result.rows.map(mapDBPlaylistToModel)[0];
  }

  async deleteDataPlaylists(id) {

    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new ClientError("Lagu di dalam playlists gagal dihapus. Pastikan Id Valid");
    }

  }

  async checkDataSong(id) {

    const query = {
      text: 'SELECT * FROM song WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Id lagu tidak ditemukan. Pastikan Id Valid');
    }

  }

  async verifySongId(songId) {

    try {

      await this.checkDataSong(songId);

    } catch (error) {

      if (error instanceof NotFoundError) {
        throw error;
      }

    }

  }

  async verifyPlaylistOwners(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("playlistId atau userId tidak ditemukan. Pastikan Id tersebut Valid");
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }

  }

  async verifyPlaylistAccess(playlist_id, user_id) {
    try {

      await this.verifyPlaylistOwners(playlist_id, user_id);
      
    } catch (error) {

      if (error instanceof NotFoundError) {
        throw error;
      }

      try {

        await this._collaborationService.verifyCollaborator(playlist_id, user_id);

      } catch {

        throw error;

      }

    }

  }

}

module.exports = PlaylistsService;