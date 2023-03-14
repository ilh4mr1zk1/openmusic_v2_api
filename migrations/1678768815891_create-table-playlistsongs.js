/* eslint-disable camelcase */

exports.up = (pgm) => {
  // membuat table playlistsongs
  pgm.createTable("playlistsongs", {

    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },

    playlist_id: {
      type: "VARCHAR(50)"
    },

    song_id: {
      type: "VARCHAR(50)"
    },

  });

  /*
	    Menambahkan constraint UNIQUE, kombinasi dari kolom playlist_id dan user_id.
	    Guna menghindari duplikasi data antara nilai keduanya.
  	*/

  	pgm.addConstraint('playlistsongs', 'unique_playlist_id_and_song_id', 'UNIQUE(playlist_id, song_id)');

  	// memberikan constraint foreign key pada kolom playlist_id dan user_id terhadap playlists.id dan users.id
  	pgm.addConstraint('playlistsongs', 'fk_playlistsongs.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
  	pgm.addConstraint('playlistsongs', 'fk_playlistsongs.song_id_song.id', 'FOREIGN KEY(song_id) REFERENCES song(id) ON DELETE CASCADE');

};

exports.down = (pgm) => {
  // menghapus tabel playlistsongs
  pgm.dropTable("playlistsongs");
};

