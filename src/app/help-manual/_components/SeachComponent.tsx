'use client'

import GlobalSearch from '@/components/Common/GlobalSearch/Icons/GlobalSearch'
import { usePathname, useRouter } from 'next/navigation'
import { Typography } from 'pq-ap-lib'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ResultsData, SearchResult } from '../types'
import useDelayValue from '../useDelayValue'
import fetchSearchMainCategory from '../_api/fetch_search_main_category'
import fetchSearchResult from '../_api/fetch_search_result'

function HelpManualSeachComponent() {
  const router = useRouter()
  const pathName = usePathname()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [delaySearchQuery, setDelaySearchQuery] = useDelayValue(searchQuery, 350)

  const [searchResult, setSearchResult] = useState<SearchResult[]>([])
  const [isSearchResult, setIsSearchResult] = useState<boolean>(false);

  const searchResultRef = useRef<HTMLDivElement>(null)


  async function handleGlobalSearch() {
    try {
      let query = delaySearchQuery.replace(/[.*+?^${}()|[\]\\]/g, '')
      if (query != '') {
        const data: ResultsData = await fetchSearchResult(query);
        setSearchResult(data?.data)
        setIsSearchResult(true)
      }
      else if(delaySearchQuery && !query){
        setSearchResult([]);
        setIsSearchResult(true)
      }
      else{
        setSearchResult([])
        setIsSearchResult(false)
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (searchResultRef.current && !searchResultRef.current.contains(event.target as Node)) {
      setIsSearchResult(false)
    }
  }, [])

  const handleSearchResultClick = async (categorySlug: string | undefined, subCategorySlug: string | undefined) => {
    const homePathSegment = pathName.split('/')?.[1]
    setIsSearchResult(false)

    if (subCategorySlug) {
      let mainCategory = await fetchSearchMainCategory(subCategorySlug);
      const rediectPath = `/${homePathSegment}/${mainCategory}/${subCategorySlug}`
      if(rediectPath !== pathName){
        setSearchResult([])
        setSearchQuery('');
        setDelaySearchQuery('')
        router.push(`/${homePathSegment}/${mainCategory}/${subCategorySlug}`);
      }

      return;
    }
    const rediectPath = `/${homePathSegment}/${categorySlug}`;
    if(rediectPath !== pathName){
      setSearchResult([])
      setSearchQuery('');
      setDelaySearchQuery('')
      router.push(`/${homePathSegment}/${categorySlug}`);
    }
  }

  useEffect(() => {
    window.addEventListener('mousedown', handleOutsideClick)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  useEffect(() => {
    handleGlobalSearch()
  }, [delaySearchQuery])

  const searchResultsJSX = useMemo(() => {
    const results = []
    if (searchResult && !!searchResult.length && isSearchResult) {
      for (let i = 0; i < searchResult.length; i++) {
        const result:SearchResult = searchResult[i];
        const SearchResultAttributes = result.attributes;

        let categorySlug = SearchResultAttributes.Category?.data?.attributes?.Slug
        let subCategory = SearchResultAttributes.SubCategory?.data?.attributes?.Slug

        if ((categorySlug || subCategory) && SearchResultAttributes?.Question) {

          const regex = new RegExp(delaySearchQuery.replace(/[.*+?^${}()|[\]\\]/g, ''), 'gi');
          let highlightedText = SearchResultAttributes?.Question.replace(regex, (match: any) => `<b>${match}</b>`)

          results.push(
            <div
              className='cursor-pointer border-b border-[#D8D8D8] p-3 hover:bg-whiteSmoke'
              key={`${i}` + result?.id}
              onClick={() => handleSearchResultClick(categorySlug, subCategory)}
            >
              <p dangerouslySetInnerHTML={{ __html: highlightedText }}></p>
            </div>
          )
        }
      }
    }
    if (!results.length && isSearchResult) {
      results.push(
        <div className='border-[#D8D8D8] bg-whiteSmoke p-4' key={'no-result'}>
          <p className='text-lg font-normal'>No Result Found </p>
        </div>
      )
    }
    return results
  }, [searchResult])

  return (
    <div className='w-full'>
      <div className='my-4 flex flex-col gap-y-4 bg-whiteSmoke p-5 px-20'>
        <Typography type='h2' className='text-center !text-xl font-normal text-[#333333]'>
          What Are you Looking for?{' '}
        </Typography>

        <div className='relative flex justify-center' ref={searchResultRef}>
          <div
            className='flex w-[500px] items-center justify-center space-x-3  rounded-3xl border border-[#D8D8D8] bg-white p-2 px-4 hover:border-[#0ab8a3]'
          >
            <GlobalSearch />
            <input
              type='text'
              placeholder='Search'
              className='w-full border-none text-base outline-none'
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          {isSearchResult && (
            <div className='search-result absolute top-12 max-h-[300px] w-[500px] overflow-y-auto rounded-md border border-whiteSmoke bg-white shadow-2xl'>
              {searchResultsJSX}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HelpManualSeachComponent
