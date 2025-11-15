import { unstable_cache } from 'next/cache'
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

type NormalizedFilters = {
  page: number
  limit: number
  category: string | null
  level: string | null
  search: string | null
  sortBy: SortOption
  minPrice: number | null
  maxPrice: number | null
}

const fetchPublicCourses = unstable_cache(async (filters: NormalizedFilters): Promise<PublicCoursesResponse> => {
  const { page, limit, category, level, search, sortBy, minPrice, maxPrice } = filters

  const where: Record<string, unknown> = { status: 'PUBLISHED' }

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

  if (minPrice !== null || maxPrice !== null) {
    where.priceCents = {}
    if (minPrice !== null) {
      ;(where.priceCents as Record<string, number>).gte = minPrice * 100
    }
    if (maxPrice !== null) {
      ;(where.priceCents as Record<string, number>).lte = maxPrice * 100
    }
  }

  let orderBy: Record<string, unknown> = { enrollments: { _count: 'desc' } }
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
    skip: (page - 1) * limit,
    take: limit,
    orderBy,
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      description: true,
      priceCents: true,
      thumbnailUrl: true,
      category: true,
      level: true,
      language: true,
      createdAt: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          reviews: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
      sections: {
        select: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
      courseTags: {
        select: {
          tag: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  const coursesWithStats: PublicCourse[] = courses.map((course) => {
    const reviewCount = course._count.reviews
    const averageRating = reviewCount > 0
      ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0
    const totalLessons = course.sections.reduce((sum, section) => sum + section._count.lessons, 0)

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
        enrollmentCount: course._count.enrollments,
        reviewCount,
        averageRating: Math.round(averageRating * 10) / 10,
        totalLessons,
      },
      tags: course.courseTags.map((ct) => ct.tag.name),
    }
  })

  const totalCount = await prisma.course.count({ where })
  const totalPages = Math.ceil(totalCount / limit)

  return {
    courses: coursesWithStats,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}, ['public-courses'], { revalidate: 180 })

function normalizeFilters(params: PublicCourseFilters = {}): NormalizedFilters {
  const {
    page = 1,
    limit = 20,
    category = null,
    level = null,
    search = null,
    sortBy = 'popularity',
    minPrice = null,
    maxPrice = null,
  } = params

  const safePage = Math.max(1, page)
  const safeLimit = Math.max(1, Math.min(limit, 100))
  const allowedSorts: SortOption[] = ['popularity', 'rating', 'newest', 'price-low', 'price-high']
  const normalizedSort = allowedSorts.includes(sortBy) ? sortBy : 'popularity'

  return {
    page: safePage,
    limit: safeLimit,
    category: category ? category : null,
    level: level ? level : null,
    search: search ? search : null,
    sortBy: normalizedSort,
    minPrice,
    maxPrice,
  }
}

export async function getPublicCourses(params: PublicCourseFilters = {}): Promise<PublicCoursesResponse> {
  const normalized = normalizeFilters(params)
  return fetchPublicCourses(normalized)
}
