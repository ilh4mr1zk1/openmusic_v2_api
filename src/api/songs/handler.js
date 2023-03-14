const ClientError = require('../../exceptions/ClientError');
const autoBind = require('auto-bind');

class SongsHandler {

	constructor(service, validator) {
		this._service = service;
  	this._validator = validator;

    autoBind(this);

	}

	async getSongsHandler(request, h) {

    let songs = [];
    let {title = '', performer = ''} = request.query;
    let hasil = -1;

    const dataSong = await this._service.getSongs();
    console.log(dataSong);

    if ( title === '' && performer === '' ) {

      for (let i = 0; i < dataSong.length; i++) {

        if ( title === '' && performer === '' ) {

            songs.push({
              id: dataSong[i].id,
              title: dataSong[i].title,
              performer: dataSong[i].performer
            })

        }

      }

      return {
        status: 'success',
        data: {
          songs
        },
      };

    } else if ( title !== '' && performer === '' ) {

        let lowTitle = title.toLowerCase();

        for (let i = 0; i < dataSong.length; i++) {

          let lowTitleSongs = dataSong[i].title.toLowerCase().includes(lowTitle);

          if ( lowTitleSongs == true ) {
            songs.push({
                id: dataSong[i].id,
                title: dataSong[i].title,
                performer: dataSong[i].performer,
            })
          }

        }

        return {
          status: 'success',
          data: {
            songs
          },
        };

    } else if ( title === '' && performer !== '' ) {

        let lowPerformer = performer.toLowerCase();

        for (let i = 0; i < dataSong.length; i++) {

            let lowPerformerSongs = dataSong[i].performer.toLowerCase().includes(lowPerformer);

            if ( lowPerformerSongs === true ) {
                songs.push({
                    id: dataSong[i].id,
                    title: dataSong[i].title,
                    performer: dataSong[i].performer,
                })
            }

        }

        return {
          status: 'success',
          data: {
            songs
          },
        };

    } else if ( title !== '' && performer !== '' ) {

        let lowTitle = title.toLowerCase();
        let lowPerformer = performer.toLowerCase();

        for (let i = 0; i < dataSong.length; i++) {

            let lowTitleSongs = dataSong[i].title.toLowerCase().includes(lowTitle);
            let lowPerformerSongs = dataSong[i].performer.toLowerCase().includes(lowPerformer);

            if ( lowTitleSongs === true && lowPerformerSongs === true ) {
                songs.push({
                    id: dataSong[i].id,
                    title: dataSong[i].title,
                    performer: dataSong[i].performer,
                })
            }

        }

        return {
          status: 'success',
          data: {
            songs
          },
        };

    }

  }

	async postSongsHandler(request, h) {

    this._validator.validateSongPayload(request.payload);
    const { title, year, performer, genre, duration, albumId } = request.payload;

    const songId = await this._service.addSong({ title, year, performer, genre, duration, albumId });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId
      },
    });

    response.code(201);
    return response;

  }

  async getSongsByIdHandler(request, h) {

    const { id } = request.params;

    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      data: {
        song
      },
    };

  }

  async putSongsByIdHandler(request, h) {

    this._validator.validateSongPayload(request.payload);
    const { title, year, performer, genre, duration, albumId  } = request.payload;
    const { id } = request.params;

    await this._service.editSongById(id, { title, year, performer, genre, duration, albumId  });

    return {
      status: 'success',
      message: 'Lagu Berhasil Diperbaharui',
    };

  }

  async deleteSongsByIdHandler(request, h) {

    const { id } = request.params;
    await this._service.deleteSongById(id);
    
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };

  }

}

module.exports = SongsHandler;