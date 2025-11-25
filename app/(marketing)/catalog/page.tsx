import { getPublicCourses, SortOption } from '@/lib/courses'
import CatalogClient from './CatalogClient'

type CatalogPageProps = {
  // Align with Next.js 15 PageProps definition where searchParams can be a Promise.
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const search = typeof resolvedSearchParams?.search === 'string' ? resolvedSearchParams.search : ''
  const category = typeof resolvedSearchParams?.category === 'string' ? resolvedSearchParams.category : ''
  const level = typeof resolvedSearchParams?.level === 'string' ? resolvedSearchParams.level : ''
  const sortParam = typeof resolvedSearchParams?.sortBy === 'string' ? resolvedSearchParams.sortBy : 'popularity'
  const allowedSorts: SortOption[] = ['popularity', 'rating', 'newest', 'price-low', 'price-high']
  const sortBy = allowedSorts.includes(sortParam as SortOption) ? (sortParam as SortOption) : 'popularity'
  const page = resolvedSearchParams?.page ? parseInt(String(resolvedSearchParams.page), 10) : 1
  const limit = resolvedSearchParams?.limit ? parseInt(String(resolvedSearchParams.limit), 10) : 20

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