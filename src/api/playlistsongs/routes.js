const routes = (handler) => [

    {
        method: 'POST',
        path: '/playlists/{id}/songs',
        handler: handler.postSongToPlaylistsHandler,
        options: {
          auth: 'openmusicv2_jwt',
        },
    },

    {
        method: "GET",
        path: "/playlists/{id}/songs",
        handler: handler.getPlaylistsongByIdHandler,
        options: {
          auth: "openmusicv2_jwt",
        },
    },

    {
        method: "DELETE",
        path: "/playlists/{id}/songs",
        handler: handler.deletePlaylistsongHandler,
        options: {
          auth: "openmusicv2_jwt",
        },
    },

];

module.exports = routes;