'use client'

import React, { useMemo } from 'react'
import { Accordion, Breadcrumb, Loader, Typography } from 'pq-ap-lib'
import MarkDownComponent from '../_components/MarkDownComponent'
import { QAAttributes } from '../types'
import useCategoryDetail from '../_api/useCategoryDetail'

interface PageProps {
  params: {
    category: string
  }
}

function CategoryPage({ params: { category } }: PageProps) {
  const [loading, categoryDetail, questionAnswer, breadcrumbs] = useCategoryDetail(category)

  const formattedQuestionAnswer = useMemo(() => {
    return (
      questionAnswer &&
      !!questionAnswer.length &&
      questionAnswer.map((qa: QAAttributes) => ({
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
            <Breadcrumb variant='/' items={breadcrumbs} />
          </div>
          {formattedQuestionAnswer && !!formattedQuestionAnswer.length && (
            <div className='question-answer mt-8'>
              <div className='text-lg'>
                <Typography type='h2' className='!font-candara'> Question Answers</Typography>
              </div>
              <Accordion dataCollection={formattedQuestionAnswer} />
            </div>
          )}
          <div className='mt-8'>
            <p className='mb-5 !text-base font-normal font-proxima'>{categoryDetail?.attributes?.ShortDescription}</p>
            {categoryDetail?.attributes.Description && (
              <div className='description text-base font-normal font-proxima'>
                <MarkDownComponent markdownContent={categoryDetail?.attributes?.Description} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default CategoryPage
