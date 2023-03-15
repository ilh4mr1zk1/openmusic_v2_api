/* eslint-disable camelcase */

exports.up = pgm => {
	// membuat album baru.
	pgm.sql("INSERT INTO album(id, name, year) VALUES ('old_song', 'old_song', 2023)");

	// mengubah nilai albumId pada song yang albumId-nya bernilai NULL
  	pgm.sql(`UPDATE song SET "albumId" = 'old_song' WHERE "albumId" IS NULL`);

  	// memberikan constraint foreign key pada albumId terhadap kolom id dari tabel album
  	pgm.addConstraint('song', 'fk_song.albumId_album.id', 'FOREIGN KEY("albumId") REFERENCES album(id) ON DELETE CASCADE');

};

exports.down = pgm => {
	// menghapus constraint fk_song.albumId_album.id pada tabel song
  	pgm.dropConstraint('song', 'fk_song.albumId_album.id');
  	
  	// mengubah nilai albumId old_song pada note menjadi NULL
  	pgm.sql(`UPDATE song SET "albumId" = NULL WHERE "albumId" = 'old_song'`);
 
  	// menghapus user baru.
  	pgm.sql("DELETE FROM album WHERE id = 'old_song'");
};
