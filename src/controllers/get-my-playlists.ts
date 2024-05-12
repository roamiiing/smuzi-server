import { PrismaClient } from "@prisma/client";
import { GetMyPlaylistsResult } from "../generated/graphql/types";
import { mapPlaylistInfo } from "../mappers/playlist";

export type GetMyPlaylistsDeps = {
  prismaClient: PrismaClient;
};

export const getMyPlaylists =
  ({ prismaClient }: GetMyPlaylistsDeps) =>
  async (userId: string): Promise<GetMyPlaylistsResult> => {
    const playlistsDao = await prismaClient.playlist.findMany({
      where: { ownerId: { equals: userId } },
      include: { owner: true },
      orderBy: { createdAt: "desc" },
    });

    console.log(playlistsDao);

    if (playlistsDao.length === 0)
      return {
        playlists: null,
      };

    return {
      playlists: playlistsDao.map((playlistDao) =>
        mapPlaylistInfo(playlistDao),
      ),
    };
  };
