const autoBind = require('auto-bind');

class PlaylistsHandler {
  
  constructor(playlistsService, usersService, validator) {
    this._playlistsService = playlistsService;
    this._validator = validator;
    this._usersService = usersService;

    autoBind(this);

  }

  async postPlaylistHandler(request, h) {
    
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({ name, owner: credentialId });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;

  }

  async getPlaylistsHandler(request, h) {
    let playlists = [];
    const { id: credentialId } = request.auth.credentials;

    const dataPlaylists = await this._playlistsService.getPlaylists(credentialId);
    console.log(dataPlaylists);
    for (let i = 0; i < dataPlaylists.length; i++) {

        playlists.push({
          id: dataPlaylists[i].id,
          name: dataPlaylists[i].name,
          username: dataPlaylists[i].username
        })

    }

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async getPlaylistByIdHandler(request, h) {

    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._playlistsService.getPlaylistById(id);

    return {
      status: "success",
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {

    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistsService.deleteDataPlaylists(playlistId);
    
    return {
      status: 'success',
      message: 'Menghapus playlist',
    };

  }

}

module.exports = PlaylistsHandler;