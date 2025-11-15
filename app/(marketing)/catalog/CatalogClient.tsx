'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Star, Users, Clock, Play, BookOpen, TrendingUp } from 'lucide-react'
import ClientImage from '@/components/ClientImage'
import type { PublicCoursesResponse, SortOption } from '@/lib/courses'

type CatalogClientProps = {
  initialData: PublicCoursesResponse
  initialFilters: {
    searchQuery: string
    category: string
    level: string
    sortBy: SortOption
  }
}

type Course = PublicCoursesResponse['courses'][number]

type PaginationState = PublicCoursesResponse['pagination']

export default function CatalogClient({ initialData, initialFilters }: CatalogClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialData.courses)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery)
  const [inputValue, setInputValue] = useState(initialFilters.searchQuery)
  const [category, setCategory] = useState(initialFilters.category)
  const [level, setLevel] = useState(initialFilters.level)
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy || 'popularity')
  const [pagination, setPagination] = useState<PaginationState>(initialData.pagination)

  const isFirstLoadRef = useRef(true)
  const abortRef = useRef<AbortController | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setCourses(initialData.courses)
    setPagination(initialData.pagination)
    setSearchQuery(initialFilters.searchQuery)
    setInputValue(initialFilters.searchQuery)
    setCategory(initialFilters.category)
    setLevel(initialFilters.level)
  setSortBy(initialFilters.sortBy || 'popularity')
    isFirstLoadRef.current = true
  }, [initialData, initialFilters])

  useEffect(() => () => {
    abortRef.current?.abort()
  }, [])

  const fetchCourses = async (overridePage?: number) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(overridePage ?? pagination.page),
        limit: String(pagination.limit),
        sortBy,
      })

      if (searchQuery) params.set('search', searchQuery)
      if (category) params.set('category', category)
      if (level) params.set('level', level)

      const response = await fetch(`/api/courses/public?${params.toString()}`, {
        cache: 'no-store',
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }

      const data: PublicCoursesResponse = await response.json()
      startTransition(() => {
        setCourses(data.courses)
        setPagination((prev) => ({ ...prev, ...data.pagination }))
      })
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        return
      }
      console.error('Error fetching courses:', error)
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false
      return
    }
    fetchCourses()
  }, [pagination.page, searchQuery, category, level, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    setSearchQuery(inputValue.trim())
  }

  const totalLessons = useMemo(() => courses.reduce((acc, course) => acc + course.stats.totalLessons, 0), [courses])
  const totalStudents = useMemo(() => courses.reduce((acc, course) => acc + course.stats.enrollmentCount, 0), [courses])
  const pending = loading || isPending

  if (pending && courses.length === 0) {
    return (
      <div className="min-h-screen gradient-cool flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading courses...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-cool">
      <div className="gradient-primary text-white relative overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 w-16 h-16 bg-white/10 rounded-full"
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-20 right-20 w-12 h-12 bg-white/5 rounded-full"
          animate={{ y: [0, 20, 0], rotate: [0, -180, -360] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Course Catalog
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-8 text-orange-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Discover a wide range of Computer Science courses
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                { icon: BookOpen, value: pagination.totalCount, label: 'Courses Available', color: 'text-orange-200' },
                { icon: Play, value: totalLessons, label: 'Video Lessons', color: 'text-pink-200' },
                { icon: Users, value: totalStudents, label: 'Students Learning', color: 'text-yellow-200' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="glass rounded-2xl p-6 border border-white/20"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                  <div className="text-orange-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="glass p-8 rounded-2xl shadow-xl border border-white/20 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Filter className="w-6 h-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-800">Find Your Perfect Course</h2>
          </motion.div>

          <form onSubmit={handleSearch} className="grid md:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Search Courses</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10 rounded-xl"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Category</label>
              <Select value={category || '__all__'} onValueChange={(v) => setCategory(v === '__all__' ? '' : v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Categories</SelectItem>
                  <SelectItem value="Algorithms">Algorithms</SelectItem>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                  <SelectItem value="Operating Systems">Operating Systems</SelectItem>
                  <SelectItem value="Databases">Databases</SelectItem>
                  <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Computer Networks">Computer Networks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Level</label>
              <Select value={level || '__all__'} onValueChange={(v) => setLevel(v === '__all__' ? '' : v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Sort By</label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full h-12 gradient-accent rounded-xl font-semibold" disabled={pending} aria-busy={pending}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
            {pending && (
              <div className="md:col-span-5 h-1 mt-2 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-orange-400 animate-pulse" />
            )}
          </form>
        </motion.div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {pagination.totalCount} courses found
            </h3>
            <p className="text-gray-600">Showing {courses.length} of {pagination.totalCount} courses</p>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Sorted by {sortBy}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Card className="overflow-hidden glass border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <div className="relative aspect-video overflow-hidden">
                  <ClientImage src={course.thumbnailUrl ?? undefined} alt={course.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute top-3 left-3">
                    <Badge className="bg-purple-600 text-white">
                      {course.category}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {course.subtitle}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.stats.totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{course.stats.enrollmentCount.toLocaleString()}</span>
                    </div>
                  </div>

                  {course.stats.averageRating > 0 && (
                    <div className="flex items-center space-x-1 mb-3">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= course.stats.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {course.stats.averageRating.toFixed(1)} ({course.stats.reviewCount})
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {course.level}
                    </Badge>
                  </div>

                  <Button asChild className="w-full h-11 rounded-xl font-semibold group-hover:shadow-lg transition-all duration-300 bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
                    <Link href={`/courses/${course.slug}`} className="flex items-center justify-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      View Course
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={!pagination.hasPrev || pending}
                className="rounded-xl"
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={!pagination.hasNext || pending}
                className="rounded-xl"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {courses.length === 0 && !loading && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass rounded-2xl p-12 max-w-md mx-auto border border-white/20">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No courses found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or browse all available courses.
              </p>
              <Button asChild className="gradient-accent rounded-xl">
                <Link href="/catalog">View All Courses</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
