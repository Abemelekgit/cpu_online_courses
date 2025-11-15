import React from 'react'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Star, Users, Clock, Play, Award, BookOpen, Shield } from 'lucide-react'
import ClientImage from '@/components/ClientImage'
import { prisma } from '@/lib/prisma'

interface Course {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  priceCents: number
  thumbnailUrl?: string
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

const getFeaturedCourses = unstable_cache(async (): Promise<Course[]> => {
  try {
    const featuredCourses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      take: 6,
      orderBy: [
        { enrollments: { _count: 'desc' } },
        { reviews: { _count: 'desc' } }
      ],
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
            image: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        sections: {
          select: {
            _count: {
              select: { lessons: true }
            }
          }
        },
        courseTags: {
          select: {
            tag: {
              select: { name: true }
            }
          }
        }
      }
    })

    return featuredCourses.map(course => {
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
        thumbnailUrl: course.thumbnailUrl ?? undefined,
        category: course.category ?? '',
        level: course.level ?? '',
        language: course.language ?? '',
        createdAt: course.createdAt instanceof Date ? course.createdAt.toISOString() : String(course.createdAt),
        instructor: {
          id: course.createdBy.id,
          name: course.createdBy.name,
          image: course.createdBy.image
        },
        stats: {
          enrollmentCount: course._count.enrollments,
          reviewCount,
          averageRating: Math.round(averageRating * 10) / 10,
          totalLessons
        },
        tags: course.courseTags.map(ct => ct.tag.name)
      }
    })
  } catch (error) {
    console.error('Error fetching featured courses (prisma):', error)
    return []
  }
}, ['featured-courses'], { revalidate: 300 })

export default async function HomePage() {
  // Fetch real featured courses
  const courses = await getFeaturedCourses()

  return (
  <div className="min-h-screen bg-white">
      {/* Promotional banner intentionally removed for free courses */}

      {/* Hero Section */}
  <section className="relative min-h-screen bg-[linear-gradient(135deg,#071026,#0B6EBF)] text-white overflow-hidden">
        {/* Animated Background Elements */}
        {/* Animated Background Elements (layered blobs + subtle texture) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* soft colored radial blobs */}
          <div className="absolute -top-24 -left-24 w-3/4 h-3/4 gradient-accent rounded-full blur-3xl opacity-30 transform-gpu" />
          <div className="absolute -bottom-32 right-0 w-2/3 h-2/3 gradient-primary rounded-full blur-3xl opacity-25 transform-gpu" />

          {/* faint overlay to add depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent mix-blend-overlay" />

          {/* subtle diagonal stripe texture to avoid a flat background */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.02),rgba(255,255,255,0.02)_2px,transparent_2px,transparent_6px)] opacity-8" />
        </div>

        {/* Floating Geometric Shapes (animated) */}
        <div className="absolute top-12 left-12 w-36 h-36 gradient-accent rounded-full blur-xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-16 w-28 h-28 gradient-primary rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-16 left-1/4 w-24 h-24 gradient-accent rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 relative z-10">
          {/* Light backing behind hero content removed to avoid blurring text */}
          <div className="absolute inset-0 z-0 mx-auto max-w-6xl rounded-3xl bg-transparent pointer-events-none" />
          <div className="flex items-center justify-center min-h-screen py-20">
            <div className="text-center max-w-6xl">
              {/* Main Hero Content */}
              <div>
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight font-hero">
                  <span className="block">Master</span>
                  <span className="block text-white drop-shadow-lg">Computer Science</span>
                </h1>

                <p className="text-2xl md:text-3xl text-white font-semibold mb-4">
                  All courses are free for college students — start learning today with no cost.
                </p>

                <p className="text-xl md:text-2xl text-white mb-8 max-w-4xl mx-auto leading-relaxed">
                  Learn from industry experts. Build real-world projects. Master algorithms,
                  computer architecture, and systems with hands-on courses.
                </p>
              </div>

              {/* Big Search Bar */}
              <div className="mb-12">
                <form action="/catalog" method="get" className="relative max-w-4xl mx-auto">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white w-8 h-8" />
                  <input
                    name="search"
                    type="text"
                    placeholder="Search for Computer Science courses, algorithms, systems, ML..."
                    className="w-full pl-16 pr-32 py-6 text-xl border-2 border-white/20 rounded-2xl focus:ring-4 focus:ring-white/20 focus:border-transparent bg-white/10 text-white placeholder:text-white/70 hover:bg-white/20 transition-all duration-300"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-hero px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl">
                    Search
                  </button>
                </form>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <Button asChild size="lg" className="btn-hero px-12 py-6 rounded-2xl text-xl font-bold">
                  <Link href="/catalog">Browse Free Courses</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/70 text-white bg-transparent hover:bg-blue-600 hover:border-blue-600 hover:text-white px-12 py-6 rounded-2xl text-xl font-bold"
                >
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </div>

              {/* Stats removed per request */}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Trending Courses */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trending Computer Science Courses</h2>
              <p className="text-xl text-gray-600">Most popular courses this week</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.slice(0, 6).map((course, index) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-video bg-card flex items-center justify-center relative overflow-hidden">
                      <ClientImage src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                  <Badge className="absolute top-4 right-4 bg-purple-600 text-black">
                    {course.category}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(course.stats.averageRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {course.stats.averageRating} ({course.stats.enrollmentCount.toLocaleString()})
                        </span>
                      </div>
                    </div>
                    {/* price removed for free courses */}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.stats.totalLessons} lessons
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.stats.enrollmentCount.toLocaleString()} students
                    </div>
                  </div>
                  <Button asChild className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
                    <Link href={`/courses/${course.slug}`}>
                      View Course
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Computer Science Learning Paths</h2>
            <p className="text-xl text-gray-600">Structured learning tracks for every skill level</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Algorithms', description: 'Core algorithmic techniques', icon: '�', color: 'from-blue-500 to-cyan-500' },
              { title: 'Data Structures', description: 'Efficient data organization', icon: '📚', color: 'from-purple-500 to-pink-500' },
              { title: 'Machine Learning', description: 'Models and practical ML', icon: '🤖', color: 'from-green-500 to-teal-500' },
              { title: 'Systems & Architecture', description: 'OS, architecture, and performance', icon: '🖥️', color: 'from-orange-500 to-red-500' }
            ].map((category, index) => (
              <div key={category.title} className="group cursor-pointer">
                <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

  {/* Why Choose Us */}
  <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose CPU Online Courses?</h2>
            <p className="text-xl text-gray-600">The best platform for mastering a wide range of computer science topics</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: 'Expert Instructors', description: 'Learn from industry professionals with decades of experience' },
              { icon: BookOpen, title: 'Comprehensive Curriculum', description: 'From basics to advanced topics, structured learning paths' },
              { icon: Shield, title: 'Hands-on Projects', description: 'Build real-world applications and portfolio projects' }
            ].map((feature, index) => (
              <div key={feature.title} className="text-center">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
  <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Master Computer Science?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join thousands of students already learning with our comprehensive courses and expert instructors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              <Link href="/catalog">Browse All Courses</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}