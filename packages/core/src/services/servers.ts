import { prisma } from "@albion-raid-manager/database";

export namespace ServersService {
  export async function getServersForUser(userId: string) {
    return prisma.server.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
  }

  export async function getServerWithMember(serverId: string, userId: string) {
    return prisma.server.findUnique({
      where: {
        id: serverId,
      },
      include: {
        members: {
          where: {
            userId,
          },
        },
      },
    });
  }
}
