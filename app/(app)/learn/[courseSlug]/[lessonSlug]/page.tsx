'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, CheckCircle, Clock } from 'lucide-react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const VideoPlayer = dynamic(() => import('@/components/player/VideoPlayer').then((m) => m.VideoPlayer), {
  ssr: false,
  loading: () => <div className="min-h-[360px] flex items-center justify-center">Loading video...</div>,
})

interface Lesson {
  id: string
  title: string
  slug: string
  videoUrl: string | null
  durationSec: number | null
  freePreview: boolean
  section: {
    id: string
    title: string
    course: {
      id: string
      title: string
      slug: string
    }
  }
}

interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  slug: string
  sections: Section[]
}

interface LessonPageProps {
  params: Promise<{ courseSlug: string; lessonSlug: string }>
}

export default function LessonPage({ params }: LessonPageProps) {
  const unwrappedParams = use(params)
  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchCourseData() {
      try {
        const response = await fetch(`/api/courses/${unwrappedParams.courseSlug}`)
        if (!response.ok) return
        const courseData = await response.json()
        setCourse(courseData)

        let lesson: Lesson | null = null
        for (const section of courseData.sections) {
          const foundLesson = section.lessons.find((l: Lesson) => l.slug === unwrappedParams.lessonSlug)
          if (foundLesson) {
            lesson = {
              ...foundLesson,
              section: {
                id: section.id,
                title: section.title,
                course: {
                  id: courseData.id,
                  title: courseData.title,
                  slug: courseData.slug,
                },
              },
            }
            break
          }
        }
        setCurrentLesson(lesson)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourseData()
  }, [unwrappedParams.courseSlug, unwrappedParams.lessonSlug])

  const handleVideoEnded = async () => {
    if (!currentLesson) return
    setIsCompleted(true)
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: currentLesson.id, completed: true }),
    })
  }

  if (isLoading) return <LoadingSpinner />

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Lesson not found</h1>
          <Button asChild><Link href="/my-learning">Back to My Learning</Link></Button>
        </div>
      </div>
    )
  }

  const allLessons = course.sections.flatMap((section) => section.lessons)
  const currentIndex = allLessons.findIndex((lesson) => lesson.id === currentLesson.id)
  const nextLesson = allLessons[currentIndex + 1]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e9f4ff,transparent_50%),#f8fbff]">
      <div className="mx-auto flex max-w-[1400px] gap-4 p-4 lg:p-6">
        <aside className="hidden w-80 shrink-0 rounded-3xl border border-slate-200 bg-white/95 p-4 lg:block">
          <h2 className="text-lg font-semibold text-slate-900">{course.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{course.sections.length} sections</p>
          <div className="mt-4 space-y-4">
            {course.sections.map((section) => (
              <div key={section.id}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{section.title}</h3>
                <div className="space-y-1">
                  {section.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/learn/${unwrappedParams.courseSlug}/${lesson.slug}`}
                      className={`block rounded-xl px-3 py-2 text-sm ${lesson.id === currentLesson.id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="line-clamp-1">{lesson.title}</span>
                        {lesson.freePreview && <Badge variant="outline" className="text-[10px]">Free</Badge>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black">
            <VideoPlayer src={currentLesson.videoUrl || ''} onEnded={handleVideoEnded} className="w-full aspect-video" />
          </div>

          <div className="mt-4 rounded-3xl border border-slate-200 bg-white/95 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{currentLesson.title}</h1>
                <p className="mt-1 text-sm text-slate-600">{currentLesson.section.title} • Lesson {currentIndex + 1} of {allLessons.length}</p>
              </div>
              {isCompleted && <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle className="mr-1 h-4 w-4" />Completed</Badge>}
            </div>

            {currentLesson.durationSec && (
              <p className="mt-3 inline-flex items-center gap-1 text-sm text-slate-600"><Clock className="h-4 w-4" />{Math.floor(currentLesson.durationSec / 60)} minutes</p>
            )}

            <div className="mt-4">
              {nextLesson ? (
                <Button onClick={() => router.push(`/learn/${unwrappedParams.courseSlug}/${nextLesson.slug}`)} className="bg-slate-900 hover:bg-slate-800">
                  <Play className="mr-2 h-4 w-4" />Next Lesson: {nextLesson.title}
                </Button>
              ) : (
                <Button asChild className="bg-slate-900 hover:bg-slate-800"><Link href="/my-learning">Back to My Learning</Link></Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
