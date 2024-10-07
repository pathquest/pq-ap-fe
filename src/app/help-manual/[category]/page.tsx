'use client'

import React, { useMemo, useState } from 'react'
import { Accordion, Breadcrumb, Loader, Typography } from 'pq-ap-lib'
import MarkDownComponent from '../_components/MarkDownComponent'
import { QAAttributes } from '../types'
import useCategoryDetail from '../_api/useCategoryDetail'
import Link from 'next/link'
import useSubCategoryDetail from '../_api/useSubCategoryDetail'

interface PageProps {
  params: {
    category: string
  }
}

function CategoryPage({ params: { category } }: PageProps) {
  const [loading, categoryDetails, questionAnswer, breadcrumbs] = useCategoryDetail(category)
  const [queName, setQueName] = useState<string>('')
  const [queAns, setQueAns] = useState<string>('')
  const [isQueClicked, setIsQueClicked] = useState<boolean>(false)

  const formattedQuestionAnswer = useMemo(() => {
    return (
      questionAnswer && !!questionAnswer.length && questionAnswer.map((qa: QAAttributes) => ({
        question: qa?.attributes?.Question,
        answer: qa?.attributes?.Answer,
      }))
    )
  }, [questionAnswer])

  return (
    <>
      {loading ? (
        <Loader size='sm' />
      ) : (
        <div className=''>
          <div className='mt-2'>
            {isQueClicked ? (
              <Breadcrumb variant='/' items={[
                { label: 'Home', url: '/help-manual' },
                { label: `${categoryDetails?.attributes?.Name}`, goBack: () => setIsQueClicked(false) },
                { label: `${queName}`, url: '#' },
              ]} />
            ) : (
              <Breadcrumb variant='/' items={[
                { label: 'Home', url: '/help-manual' },
                { label: `${categoryDetails?.attributes?.Name}`, url: '#' },
              ]} />
            )}
          </div>

          {formattedQuestionAnswer && !!formattedQuestionAnswer.length && (
            <div className='question-answer mt-8'>
              <div className='flex justify-between text-lg py-8'>
                <Typography type='h2' className='!font-candara'>{isQueClicked ? queName : "General Questions"} </Typography>
              </div>
              {isQueClicked ? <div>
                <h1> <MarkDownComponent markdownContent={queAns} /></h1>
              </div> : <>
                {formattedQuestionAnswer.map((data, index) => {
                  return <div key={index} className='border border-[#fff] border-b-lightSilver cursor-pointer'>
                    <h1 className='flex justify-between py-4 px-3 hover:bg-whiteSmoke' onClick={() => {
                      setQueName(data.question)
                      setIsQueClicked(true)
                      setQueAns(data.answer)
                    }}>{data.question}</h1>
                  </div>
                })}</>}
            </div>
          )}

          {/* <div className='mt-8'>
            <p className='mb-5 !text-base font-normal font-proxima'>{categoryDetails?.attributes?.ShortDescription}</p>
            {categoryDetails?.attributes.Description && (
              <div className='description text-base font-normal font-proxima'>
                <MarkDownComponent markdownContent={categoryDetails?.attributes?.Description} />
              </div>
            )}
          </div> */}

        </div>
      )}
    </>
  )
}

export default CategoryPage