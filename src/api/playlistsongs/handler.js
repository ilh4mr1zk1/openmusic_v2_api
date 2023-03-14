const autoBind = require('auto-bind');

class PlaylistSongsHandler {
  
  constructor(playlistsongsService, playlistsService, validator) {
    this._playlistsongsService = playlistsongsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);

  }

  async postSongToPlaylistsHandler(request, h) {

    this._validator.validatePlaylistsongsPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifySongId(songId);
    await this._playlistsService.verifyPlaylistOwners(playlistId, credentialId);
    const playlistsongId = await this._playlistsongsService.addSongToPlaylist(playlistId,songId);

    const response = h.response({
      status: "success",
      message: "Menambahkan lagu ke playlist",
      data: {
        playlistsongId,
      },
    });
    
    response.code(201);
    return response; 

  }

  async getPlaylistsongByIdHandler(request, h) {

      const { id: credentialId } = request.auth.credentials;
      const { id: playlistId } = request.params;
      console.log(credentialId);
      await this._playlistsService.verifyPlaylistOwners(playlistId, credentialId);
      let playlist = await this._playlistsongsService.getPlaylistsongById(playlistId);
      console.log(playlist);

      const getdatasong = await this._playlistsongsService.getSongs(playlistId)
      console.log(getdatasong);

      playlist.songs = getdatasong

      return {
        status: "success",
        data: {
          playlist,
        },
      };

  }

  async deletePlaylistsongHandler(request, h) {

    this._validator.validatePlaylistsongsPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    
    await this._playlistsService.verifyPlaylistOwners(playlistId, credentialId);
    await this._playlistsongsService.deletePlaylistsong(songId);
    
    return {
      status: 'success',
      message: 'Menghapus lagu dari playlist',
    };

  }

}

module.exports = PlaylistSongsHandler;