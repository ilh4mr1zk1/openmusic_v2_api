const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const AuthorizationError = require('../../../exceptions/AuthorizationError');
 
class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }
 
  async addCollaboration(playlist_id, user_id) {

    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlist_id, user_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    return result.rows[0].id;
    
  }

  async deleteCollaboration(playlist_id, user_id) {

    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlist_id, user_id],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }

  }

  async verifyCollaborator(playlist_id, user_id) {

    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlist_id, user_id],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }

  }

  async checkDataValid(playlist_id, user_id) {

    const query = {
      text: `
      SELECT playlists.owner, users.id FROM playlists 
      LEFT JOIN users
      ON playlists.owner = users.id
      WHERE playlists.id = $1 AND playlists.owner = $2`,
      values: [playlist_id, user_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('playlistId atau userId tidak ditemukan. Pastikan Id tersebut Valid');
    } 



  }

  async verifyDataValid(playlist_id, user_id) {

    try {

      await this.checkDataValid(playlist_id, user_id);

    } catch (error) {

      if (error instanceof NotFoundError) {
        throw error;
      }

    }

  }

  async checkUserPayload(id, owner) {
    const query = {

      text: `
      SELECT * FROM playlists 
      LEFT JOIN users
      ON playlists.owner = users.id
      WHERE playlists.id = $1 AND playlists.owner = $2`,

      values: [id, owner],

    };

    const result = await this._pool.query(query);
    if (result.owner !== owner) {

      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');

    }

  }

  async verifyUserId(id, owner) {

    try {

      await this.checkUserPayload(id, owner);

    } catch (error) {

      if (error instanceof NotFoundError) {
        throw error;
      }

    }

  }

  async verifyPlaylistUserId(userId) {
    const query = {
      text: `
      SELECT * FROM users 
      WHERE id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);

    if ( !result.rows.length ) {
      throw new NotFoundError("playlistId atau userId tidak ditemukan. Pastikan Id tersebut Valid")
    }    

  }

  async verifyUserIdAccess(user_id, owner) {
    try {

      await this.verifyPlaylistUserId(user_id, owner);
      
    } catch (error) {

      if (error instanceof NotFoundError) {
        throw error;
      }

    }

  }

  

}

module.exports = CollaborationsService;
