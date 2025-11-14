import { getPublicCourses, SortOption } from '@/lib/courses'
import CatalogClient from './CatalogClient'

type CatalogPageProps = {
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const search = typeof searchParams?.search === 'string' ? searchParams?.search : ''
  const category = typeof searchParams?.category === 'string' ? searchParams?.category : ''
  const level = typeof searchParams?.level === 'string' ? searchParams?.level : ''
  const sortParam = typeof searchParams?.sortBy === 'string' ? searchParams?.sortBy : 'popularity'
  const allowedSorts: SortOption[] = ['popularity', 'rating', 'newest', 'price-low', 'price-high']
  const sortBy = allowedSorts.includes(sortParam as SortOption) ? (sortParam as SortOption) : 'popularity'
  const page = searchParams?.page ? parseInt(String(searchParams.page), 10) : 1
  const limit = searchParams?.limit ? parseInt(String(searchParams.limit), 10) : 20

  const data = await getPublicCourses({
    page,
    limit,
    category: category || null,
    level: level || null,
    search: search || null,
  sortBy,
  })

  return (
    <CatalogClient
      initialData={data}
      initialFilters={{
        searchQuery: search,
        category,
        level,
        sortBy,
      }}
    />
  )
}