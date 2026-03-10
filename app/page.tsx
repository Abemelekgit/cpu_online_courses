import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Clock3, GraduationCap, Sparkles, Star, Users } from 'lucide-react'
import ClientImage from '@/components/ClientImage'
import { prisma } from '@/lib/prisma'

type FeaturedCourse = {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  thumbnailUrl?: string
  stats: {
    enrollmentCount: number
    reviewCount: number
    totalLessons: number
  }
}

const getFeaturedCourses = unstable_cache(async (): Promise<FeaturedCourse[]> => {
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    take: 6,
    orderBy: [{ enrollments: { _count: 'desc' } }, { reviews: { _count: 'desc' } }],
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      category: true,
      thumbnailUrl: true,
      _count: {
        select: {
          enrollments: true,
          reviews: true,
        },
      },
      sections: {
        select: {
          _count: {
            select: { lessons: true },
          },
        },
      },
    },
  })

  return courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle ?? 'Build practical skills with guided lessons.',
    category: course.category ?? 'Computer Science',
    thumbnailUrl: course.thumbnailUrl ?? undefined,
    stats: {
      enrollmentCount: course._count.enrollments,
      reviewCount: course._count.reviews,
      totalLessons: course.sections.reduce((sum, section) => sum + section._count.lessons, 0),
    },
  }))
}, ['homepage-featured-courses'], { revalidate: 300 })

export default async function HomePage() {
  const courses = await getFeaturedCourses()

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e7f4ff,transparent_42%),radial-gradient(circle_at_80%_20%,#ffe7dc,transparent_38%),#f8fbff]">
      <section className="border-b border-border/70">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Badge className="mb-5 rounded-full bg-cyan-100 text-cyan-800 hover:bg-cyan-100">
                New learning experience
              </Badge>

              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-6xl [font-family:var(--font-fraunces)]">
                A modern e-learning platform for focused, fast, practical growth.
              </h1>

              <p className="mt-5 max-w-2xl text-lg text-slate-600">
                Learn computer science with clear pathways, real projects, and zero clutter. Every course page is built to keep students in flow from lesson one.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 bg-slate-900 text-white hover:bg-slate-800">
                  <Link href="/catalog">Start Learning</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 border-slate-300 bg-white/80 text-slate-700 hover:bg-white">
                  <Link href="/my-learning">Continue My Path</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <p className="text-2xl font-semibold text-slate-900">15+</p>
                  <p>Published courses</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <p className="text-2xl font-semibold text-slate-900">100%</p>
                  <p>Project-focused curriculum</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <p className="text-2xl font-semibold text-slate-900">Free</p>
                  <p>For college learners</p>
                </div>
              </div>
            </div>

            <Card className="overflow-hidden rounded-3xl border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/70 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-slate-100">
                  <ClientImage
                    src={courses[0]?.thumbnailUrl}
                    alt={courses[0]?.title ?? 'Featured course'}
                    className="h-full w-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <Badge className="rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100">Featured Track</Badge>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Sparkles className="h-4 w-4" />
                      Smart recommendations
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900">{courses[0]?.title ?? 'Start your first course today'}</h2>
                  <p className="text-slate-600">{courses[0]?.subtitle ?? 'Pick a path, track progress, and move fast with practical lessons.'}</p>
                  <Button asChild className="w-full h-11 bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 text-white hover:opacity-95">
                    <Link href={courses[0] ? `/courses/${courses[0].slug}` : '/catalog'}>Go to Featured Course</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 md:py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Trending right now</h2>
            <p className="mt-2 text-slate-600">Popular courses with strong student activity.</p>
          </div>
          <Link href="/catalog" className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
            See all courses
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, index) => (
            <Card key={course.id} className="group overflow-hidden rounded-3xl border-slate-200 bg-white/95 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/80">
              <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                <ClientImage
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading={index < 2 ? 'eager' : 'lazy'}
                  fetchPriority={index < 2 ? 'high' : 'auto'}
                />
              </div>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <Badge className="rounded-full bg-sky-100 text-sky-800 hover:bg-sky-100">{course.category}</Badge>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Star className="h-4 w-4" />
                    {course.stats.reviewCount}
                  </div>
                </div>

                <div>
                  <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{course.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{course.subtitle}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <div className="text-center">
                    <Users className="mx-auto mb-1 h-3.5 w-3.5" />
                    {course.stats.enrollmentCount}
                  </div>
                  <div className="text-center">
                    <Clock3 className="mx-auto mb-1 h-3.5 w-3.5" />
                    {course.stats.totalLessons}
                  </div>
                  <div className="text-center">
                    <BookOpen className="mx-auto mb-1 h-3.5 w-3.5" />
                    Lessons
                  </div>
                </div>

                <Button asChild className="h-10 w-full bg-slate-900 text-white hover:bg-slate-800">
                  <Link href={`/courses/${course.slug}`}>Open Course</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-white/85 p-8 backdrop-blur-sm md:p-10">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">Designed for better UX and learning momentum</h3>
              <p className="mt-3 text-slate-600">
                Cleaner pages, stronger hierarchy, and fewer distractions mean students can move faster from content discovery to lesson completion.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-700">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <GraduationCap className="h-4 w-4 text-slate-900" />
                Better course discoverability with clearer cards and tags.
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Clock3 className="h-4 w-4 text-slate-900" />
                Faster initial load by trimming heavy animation runtime.
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Sparkles className="h-4 w-4 text-slate-900" />
                Visual polish with purposeful gradients and modern typography.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
