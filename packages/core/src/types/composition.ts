import { Prisma } from "@albion-raid-manager/database";

export type Composition = Prisma.CompositionGetPayload<{}>;

export type CompositionWithBuilds = Prisma.CompositionGetPayload<{
  include: { builds: true };
}>;

export type CompositionWithBuildsAndCount = Prisma.CompositionGetPayload<{
  include: { builds: true; _count: true };
}>;
