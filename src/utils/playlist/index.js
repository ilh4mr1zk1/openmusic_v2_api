const mapDBPlaylistToModel = ({ 
  id,
  name,
  owner,
  username,
  playlist_id,
  song_id,
}) => ({
  id,
  name,
  owner,
  username,
  playlistId: playlist_id,
  songId: song_id,
});

module.exports = { mapDBPlaylistToModel };