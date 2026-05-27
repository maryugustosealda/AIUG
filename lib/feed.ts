import { prisma } from "./prisma";
import { auth } from "./auth";

export type FeedSort = "latest" | "hot";

export async function getFeed(opts: {
  sort?: FeedSort;
  type?: string; // text/app/question/service
  /** 社区讨论流：排除应用帖与技能帖 */
  discussionOnly?: boolean;
  circleId?: string;
  authorId?: string;
  tag?: string;
  q?: string;
  take?: number;
  skip?: number;
}) {
  const {
    sort = "latest",
    type,
    discussionOnly,
    circleId,
    authorId,
    tag,
    q,
    take = 20,
    skip = 0,
  } = opts;

  const where: any = { status: "published" };
  if (type) where.type = type;
  if (discussionOnly) {
    where.type = { in: ["text", "question", "image"] };
  }
  if (circleId) where.circleId = circleId;
  if (authorId) where.authorId = authorId;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { content: { contains: q } },
    ];
  }
  if (tag) where.tags = { contains: `"${tag}"` };

  const orderBy: any =
    sort === "hot"
      ? [{ hot: "desc" }, { createdAt: "desc" }]
      : [{ pinned: "desc" }, { createdAt: "desc" }];

  const session = await auth();
  const userId = session?.user?.id;

  const posts = await prisma.post.findMany({
    where,
    orderBy,
    take,
    skip,
    include: {
      author: { select: { id: true, username: true, nickname: true, avatar: true } },
      circle: { select: { slug: true, name: true } },
      app: {
        select: { id: true, name: true, logo: true, screenshots: true, pricingMode: true, price: true },
      },
      service: {
        select: { summary: true, packages: true },
      },
    },
  });

  let likedSet = new Set<string>();
  if (userId && posts.length) {
    const likes = await prisma.like.findMany({
      where: { userId, postId: { in: posts.map((p) => p.id) } },
      select: { postId: true },
    });
    likedSet = new Set(likes.map((l) => l.postId));
  }

  return posts.map((p) => ({ ...p, liked: likedSet.has(p.id) }));
}

