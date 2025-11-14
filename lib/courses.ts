import { prisma } from '@/lib/prisma'

export type SortOption = 'popularity' | 'rating' | 'newest' | 'price-low' | 'price-high'

type PaginationMeta = {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type PublicCourse = {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  priceCents: number
  thumbnailUrl?: string | null
  category: string
  level: string
  language: string
  createdAt: string
  instructor: {
    id: string
    name: string | null
    image?: string | null
  }
  stats: {
    enrollmentCount: number
    reviewCount: number
    averageRating: number
    totalLessons: number
  }
  tags: string[]
}

export type PublicCoursesResponse = {
  courses: PublicCourse[]
  pagination: PaginationMeta
}

type PublicCourseFilters = {
  page?: number
  limit?: number
  category?: string | null
  level?: string | null
  search?: string | null
  sortBy?: SortOption
  minPrice?: number | null
  maxPrice?: number | null
}

export async function getPublicCourses(params: PublicCourseFilters = {}): Promise<PublicCoursesResponse> {
  const {
    page = 1,
    limit = 20,
    category,
    level,
    search,
    sortBy = 'popularity',
    minPrice,
    maxPrice,
  } = params

  const safePage = Math.max(1, page)
  const safeLimit = Math.max(1, Math.min(limit, 100))
  const skip = (safePage - 1) * safeLimit

  const where: any = { status: 'PUBLISHED' }

  if (category) {
    where.category = category
  }

  if (level) {
    where.level = level
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { subtitle: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (minPrice || maxPrice) {
    where.priceCents = {}
    if (minPrice) {
      where.priceCents.gte = minPrice * 100
    }
    if (maxPrice) {
      where.priceCents.lte = maxPrice * 100
    }
  }

  let orderBy: any = { enrollments: { _count: 'desc' } }
  switch (sortBy) {
    case 'rating':
      orderBy = { reviews: { _count: 'desc' } }
      break
    case 'newest':
      orderBy = { createdAt: 'desc' }
      break
    case 'price-low':
      orderBy = { priceCents: 'asc' }
      break
    case 'price-high':
      orderBy = { priceCents: 'desc' }
      break
    case 'popularity':
    default:
      orderBy = { enrollments: { _count: 'desc' } }
  }

  const courses = await prisma.course.findMany({
    where,
    skip,
    take: safeLimit,
    orderBy,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      enrollments: {
        select: {
          id: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
      sections: {
        select: {
          lessons: {
            select: {
              id: true,
            },
          },
        },
      },
      courseTags: {
        include: {
          tag: true,
        },
      },
    },
  })

  const coursesWithStats: PublicCourse[] = courses.map((course) => {
    const enrollmentCount = course.enrollments.length
    const reviewCount = course.reviews.length
    const averageRating = reviewCount > 0
      ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0
    const totalLessons = course.sections.reduce((sum, section) => sum + section.lessons.length, 0)

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
  subtitle: course.subtitle ?? '',
  description: course.description ?? '',
      priceCents: course.priceCents,
      thumbnailUrl: course.thumbnailUrl,
  category: course.category ?? 'General',
  level: course.level ?? 'All Levels',
  language: course.language ?? 'English',
  createdAt: course.createdAt.toISOString(),
      instructor: {
        id: course.createdBy.id,
        name: course.createdBy.name,
        image: course.createdBy.image,
      },
      stats: {
        enrollmentCount,
        reviewCount,
        averageRating: Math.round(averageRating * 10) / 10,
        totalLessons,
      },
      tags: course.courseTags.map((ct) => ct.tag.name),
    }
  })

  const totalCount = await prisma.course.count({ where })
  const totalPages = Math.ceil(totalCount / safeLimit)

  return {
    courses: coursesWithStats,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalCount,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
  }
}
