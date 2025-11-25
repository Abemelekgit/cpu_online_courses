import { getPublicCourses, SortOption } from '@/lib/courses'
import CatalogClient from './CatalogClient'

type CatalogPageProps = {
  // Next.js PageProps typing in some versions may allow searchParams to be a Promise.
  // Accept either the resolved record or a Promise of the record to satisfy the PageProps constraint.
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  // Resolve searchParams if it's delivered as a Promise (type-safe for different Next.js versions)
  const resolvedSearchParams: Record<string, string | string[] | undefined> | undefined =
    searchParams && typeof (searchParams as any)?.then === 'function'
      ? await (searchParams as Promise<Record<string, string | string[] | undefined>>)
      : (searchParams as Record<string, string | string[] | undefined> | undefined)

  const search = typeof resolvedSearchParams?.search === 'string' ? resolvedSearchParams.search : ''
  const category = typeof resolvedSearchParams?.category === 'string' ? resolvedSearchParams?.category : ''
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