'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Clock, CheckCircle, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ClientImage from '@/components/ClientImage'

interface Lesson {
  id: string
  title: string
  slug: string
  durationSec: number | null
  progress: { completed: boolean; positionSec: number } | null
}

interface Course {
  id: string
  title: string
  slug: string
  thumbnailUrl: string | null
  sections: { lessons: Lesson[] }[]
  enrollments: { createdAt: string }[]
}

export default function MyLearningPage() {
  const { status } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetch('/api/my-courses')
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setCourses(data))
        .catch(() => setCourses([]))
        .finally(() => setIsLoading(false))
    }
  }, [status, router])

  const getCourseProgress = (course: Course) => {
    const allLessons = course.sections.flatMap((section) => section.lessons)
    const completed = allLessons.filter((lesson) => lesson.progress?.completed).length
    const total = allLessons.length
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  const getNextLesson = (course: Course) => course.sections.flatMap((section) => section.lessons).find((l) => !l.progress?.completed)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading your courses...</div>

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e9f4ff,transparent_45%),#f8fbff]">
        <div className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-14 w-14 text-slate-400" />
          <h1 className="text-2xl font-semibold text-slate-900">No courses enrolled yet</h1>
          <p className="mt-2 text-slate-600">Browse the catalog and start your learning path.</p>
          <Button asChild className="mt-6 bg-slate-900 hover:bg-slate-800"><Link href="/catalog">Browse Courses</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e9f4ff,transparent_45%),#f8fbff]">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 [font-family:var(--font-fraunces)]">My Learning</h1>
        <p className="mt-2 text-slate-600">Continue where you left off.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const progress = getCourseProgress(course)
            const nextLesson = getNextLesson(course)
            const totalDuration = course.sections.flatMap((s) => s.lessons).reduce((acc, lesson) => acc + (lesson.durationSec || 0), 0)

            return (
              <Card key={course.id} className="overflow-hidden rounded-3xl border-slate-200 bg-white/95">
                <div className="aspect-[16/9] bg-slate-100">
                  <ClientImage src={course.thumbnailUrl ?? undefined} alt={course.title} className="h-full w-full object-cover" />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription>Enrolled {new Date(course.enrollments[0]?.createdAt).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium text-slate-900">{progress.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progress.percentage}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{progress.completed}/{progress.total} lessons</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{formatDuration(totalDuration)}</span>
                  </div>

                  <Badge variant={progress.percentage === 100 ? 'default' : 'secondary'}>{progress.percentage === 100 ? 'Completed' : 'In progress'}</Badge>

                  {nextLesson ? (
                    <Button asChild className="w-full bg-slate-900 hover:bg-slate-800">
                      <Link href={`/learn/${course.slug}/${nextLesson.slug}`}><Play className="mr-2 h-4 w-4" />Continue Learning</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full"><Link href={`/courses/${course.slug}`}><CheckCircle className="mr-2 h-4 w-4" />View Course</Link></Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
