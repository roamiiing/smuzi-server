import { PrismaClient } from "@prisma/client";
import { GetPublicPlaylistsResult } from "../generated/graphql/types";
import { mapPlaylistInfo } from "../mappers/playlist";

export type GetPublicPlaylistsDeps = {
  prismaClient: PrismaClient;
};

export const getPublicPlaylists =
  ({ prismaClient }: GetPublicPlaylistsDeps) =>
  async (userId: string): Promise<GetPublicPlaylistsResult> => {
    const playlistsDao = await prismaClient.playlist.findMany({
      where: { ownerId: { equals: userId } },
      include: { owner: true },
      orderBy: { createdAt: "desc" },
    });

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
