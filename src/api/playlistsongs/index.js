const PlaylistSongsHandler = require('./handler');
const routes = require('./routes'); 
 
module.exports = {
  name: 'playlistsongs',
  version: '1.0.0',
  register: async (server, { playlistsongsService, playlistsService, validator }) => {
    const playlistsongsHandler = new PlaylistSongsHandler(playlistsongsService, playlistsService, validator);
    server.route(routes(playlistsongsHandler));
  },
};