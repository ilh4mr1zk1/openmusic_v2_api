// const ClientError = require('../../exceptions/ClientError');
const autoBind = require('auto-bind');

class AlbumsHandler {
  
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this); 
    
  }

  async postAlbumsHandler(request, h) {

    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    // const albumId = await this._service.addAlbum({ name, year });
    const albumId = await this._service.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId
      },
    });

    response.code(201);
    return response;

  }

  async getAlbumsByIdHandler(request, h) {

    const { albumId } = request.params;

    const album = await this._service.getAlbumById(albumId);
    const song = await this._service.getSongs();
    // console.log(song[id]);
    const checkDataSong = song.filter((sg) => sg.albumId === albumId).length > 0;
    // console.log(checkDataSong);
    const getDataSong = song.filter((sg) => sg.albumId === albumId);

    const songs = getDataSong.map(detail => ({ id: detail.id, title: detail.title, performer : detail.performer }));  

    if (checkDataSong) {
      album.songs = songs
      console.log(album);

      return {
        status: 'success',
        data: {
          album
        },
      };

    } else {

      album.songs = []
      return {
        status: 'success',
        data: {
          album
        },
      };

    }

  }

  async putAlbumsByIdHandler(request, h) {

    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album Berhasil Diperbaharui',
    };

  }

  async deleteAlbumsByIdHandler(request, h) {

    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };

  }

}

module.exports = AlbumsHandler;