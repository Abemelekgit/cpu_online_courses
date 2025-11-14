import { NextRequest, NextResponse } from 'next/server'
import { getPublicCourses, SortOption } from '@/lib/courses'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'popularity'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const allowedSorts: SortOption[] = ['popularity', 'rating', 'newest', 'price-low', 'price-high']
    const normalizedSort = allowedSorts.includes(sortBy as SortOption) ? (sortBy as SortOption) : 'popularity'

    const data = await getPublicCourses({
      page,
      limit,
      category,
      level,
      search,
      sortBy: normalizedSort,
      minPrice: minPrice ? parseInt(minPrice) : null,
      maxPrice: maxPrice ? parseInt(maxPrice) : null,
    })
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error fetching public courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}
