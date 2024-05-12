import {
  Playlist as PlaylistDao,
  User as UserDao,
  PlaylistType as PlaylistTypeDao,
} from "@prisma/client";
import { PlaylistInfo, PlaylistType } from "../generated/graphql/types";

export const mapPlaylistType = (type: PlaylistTypeDao): PlaylistType => {
  switch (type) {
    case PlaylistTypeDao.Playlist:
      return PlaylistType.Playlist;
    case PlaylistTypeDao.Liked:
      return PlaylistType.Liked;
  }
};

export const mapPlaylistInfo = (
  playlist: PlaylistDao & {
    owner: UserDao;
  },
): PlaylistInfo => ({
  id: playlist.id,
  name: playlist.name,
  description: playlist.description,
  type: mapPlaylistType(playlist.type),
  owner: {
    id: playlist.owner.id,
    username: playlist.owner.username,
  },
  createdAt: playlist.createdAt,
  updatedAt: playlist.updatedAt,
});
