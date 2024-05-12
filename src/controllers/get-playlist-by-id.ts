import { PrismaClient } from "@prisma/client";
import {
  GetPlaylistByIdInput,
  GetPlaylistByIdResult,
} from "../generated/graphql/types";
import { mapPlaylistInfo } from "../mappers/playlist";

export type GetPlaylistByIdDeps = {
  prismaClient: PrismaClient;
};

export const getPlaylistById =
  ({ prismaClient }: GetPlaylistByIdDeps) =>
  async (input: GetPlaylistByIdInput): Promise<GetPlaylistByIdResult> => {
    const playlistDao = await prismaClient.playlist.findUnique({
      where: { id: input.id },
      include: { owner: true },
    });

    if (!playlistDao)
      return {
        playlist: null,
      };

    return {
      playlist: mapPlaylistInfo(playlistDao),
    };
  };
