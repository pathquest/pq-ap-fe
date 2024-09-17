'use client'

import { Accordion, Breadcrumb, Loader, Typography } from 'pq-ap-lib'
import React, { useMemo } from 'react'
import MarkDownComponent from '../../_components/MarkDownComponent'
import { QAAttributes } from '../../types'
import useSubCategoryDetail from '../../_api/useSubCategoryDetail'


interface PageProps {
  params: {
    subCategory: string
  }
}

function Page({ params: { subCategory } }: PageProps) {
  const [loading, subCategoryDetail, questionAnswer, breadcrumbItems] = useSubCategoryDetail(subCategory)

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
            <Breadcrumb variant='/' items={breadcrumbItems} />
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
            <div className='description'>
              <p className='my-4  text-base font-normal font-proxima'>{subCategoryDetail?.attributes?.ShortDescription}</p>
              {subCategoryDetail?.attributes.Description && (
                <div className=' text-base font-normal font-proxima'>
                  <MarkDownComponent markdownContent={subCategoryDetail?.attributes?.Description} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Page
