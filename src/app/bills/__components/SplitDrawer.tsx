import { Button, Close, DataTable, Radio, TabBar, Text, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'

import agent from '@/api/axios'
import BtnSplitIcon from '@/assets/Icons/billposting/PDFViewer/BtnSplitIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'
import { SplitDocumentOptions } from '@/models/billPosting'
import { useRouter } from 'next/navigation'
import PDFViewer from '../__components/PDFViewer'

interface SplitDrawerProps {
  pdfFile: string | undefined
  onOpen: boolean
  onClose: () => void
  id?: string | string[]
  numberOfPages?: any
  fileName?: string
  fileBlob?: any
  billNumber?: any
}

const SplitDrawer: React.FC<SplitDrawerProps> = ({
  pdfFile,
  onOpen,
  onClose,
  id,
  numberOfPages,
  fileName,
  fileBlob,
  billNumber,
}) => {
  const [tabId, setTabId] = useState<string>('1')
  const [SplitByPageType, setSplitByPageType] = useState<string>('ExtractByInterval-1')
  const [pageIntervalToExtract, setPageIntervalToExtract] = useState<number | null>(null)
  const [pagesToExtract, setPagesToExtract] = useState<string>('')
  const [Prefix, setPrefix] = useState<string>('')
  const [isLoader, setIsLoader] = useState<boolean>(false)
  const [isAddBtnDisable, setIsAddBtnDisable] = useState<boolean>(false)
  const [isSubmitBtnDisable, setIsSubmitBtnDisable] = useState<boolean>(false)

  const router = useRouter()

  const [rangeValues, setRangeValues] = useState<any>([
    {
      RangeName: `Range 1`,
      RangeFrom: 1,
      RangeTo: 2,
    },
  ])

  const fieldsErrorObj = {
    PageIntervalToExtract: false,
    pagesToExtract: false,
  }

  const [hasFormFieldLibraryErrors, setHasFormFieldLibraryErrors] = useState<any>(fieldsErrorObj)

  useEffect(() => {
    if (tabId === '1') {
      setIsSubmitBtnDisable(true)
      setRangeValues([
        {
          RangeName: `Range 1`,
          RangeFrom: 1,
          RangeTo: 2,
        },
      ])
    } else {
      setIsSubmitBtnDisable(false)
      setSplitByPageType('')
      setPageIntervalToExtract(null)
      setPagesToExtract('')
    }
  }, [tabId])

  const tabOptions = [
    { id: '1', label: 'SPLIT BY PAGES' },
    { id: '2', label: 'SPLIT BY RANGE' },
  ]

  const columns: any = [
    {
      header: 'Range Name',
      accessor: 'RangeName',
      sortable: false,
      colalign: 'left',
    },
    {
      header: 'From',
      accessor: 'RangeFrom',
      sortable: false,
      colalign: 'left',
    },
    {
      header: 'To',
      accessor: 'RangeTo',
      sortable: false,
      colalign: 'left',
    },
    {
      header: '',
      accessor: 'actions',
      sortable: false,
      colalign: 'right',
    },
  ]

  const findMaxRangeValue = (newValues: any) => {
    if (!newValues || newValues.length === 0) {
      return null
    }

    let maxRangeTo = newValues[0].RangeTo

    for (const range of newValues) {
      if (range.RangeTo > maxRangeTo) {
        maxRangeTo = range.RangeTo
      }
    }

    return maxRangeTo
  }

  const isOverlapping = (r1: any, r2: any) => {
    return r1.RangeFrom <= r2.RangeTo && r1.RangeTo >= r2.RangeFrom
  }

  const hasOverlapping = (newValues: any) => {
    let hasOverlap = false
    for (let i = 0; i < newValues.length; i++) {
      const r1 = newValues[i]
      for (let j = i + 1; j < newValues.length; j++) {
        const r2 = newValues[j]

        if (isOverlapping(r1, r2)) {
          hasOverlap = true
          break
        }
      }
    }
    return hasOverlap
  }

  const hasOrdering = (newValues: any) => {
    let isOrdered = true
    for (let i = 1; i < newValues.length; i++) {
      if (newValues[i].from < newValues[i - 1].to) {
        isOrdered = false
        break
      }
    }
    return isOrdered
  }

  const checkAllRangesUsed = (usedRanges: any, totalPages: any) => {
    let pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    usedRanges.forEach((range: any) => {
      const { RangeFrom, RangeTo } = range
      for (let i = RangeFrom; i <= RangeTo; i++) {
        const pageIndex = pages.indexOf(i)
        if (pageIndex !== -1) {
          pages.splice(pageIndex, 1)
        }
      }
    })

    return pages.length === 0
  }

  const handleAddRange = () => {
    const previousRow = rangeValues[rangeValues.length - 1]
    if (previousRow && (!previousRow.RangeFrom || !previousRow.RangeTo)) {
      Toast.error('Please enter From and To values.')
      return
    }

    const allRangesUsed = checkAllRangesUsed(rangeValues, numberOfPages)

    if (allRangesUsed) {
      setIsAddBtnDisable(true)
      setIsSubmitBtnDisable(true)
    } else {
      setIsAddBtnDisable(false)
      setIsSubmitBtnDisable(false)
    }

    const lastRow = rangeValues[rangeValues.length - 1]
    const newRangeFrom = lastRow.RangeTo + 1
    const newRangeTo = newRangeFrom + 1

    const newValues = [
      ...rangeValues,
      {
        RangeName: `Range ${rangeValues.length + 1}`,
        RangeFrom: newRangeFrom > numberOfPages ? '' : newRangeFrom,
        RangeTo: newRangeTo > numberOfPages ? '' : newRangeTo,
      },
    ]

    const hasOverlap = hasOverlapping(newValues)
    const isOrdered = hasOrdering(newValues)

    if (!(!hasOverlap && isOrdered)) {
      const maxRangeValue = findMaxRangeValue(newValues)
      newValues[newValues.length - 1].RangeFrom = maxRangeValue + 1
      newValues[newValues.length - 1].RangeTo = maxRangeValue + 1
      setRangeValues(newValues)
    } else {
      setRangeValues(newValues)
    }
  }

  const handleDeleteRange = (index: number) => {
    if (rangeValues.length > 1) {
      setRangeValues((prevValues: any) => {
        const newValues = prevValues.filter((_: any, idx: any) => idx !== index)
        return newValues.map((value: any, idx: any) => ({
          ...value,
          RangeName: `Range ${idx + 1}`,
        }))
      })
      setIsAddBtnDisable(false)
      setIsSubmitBtnDisable(false)
    }
  }

  const onChangeTableFieldValue = (index: number, value: string, key: string) => {
    const newValues =
      rangeValues &&
      rangeValues.map((i: any, idx: number) => {
        if (idx === index) {
          return {
            ...i,
            [key]: parseInt(value),
          }
        }
        return i
      })

    const allRangesUsed = checkAllRangesUsed(newValues, numberOfPages)

    const hasOverlap = hasOverlapping(newValues)
    const isOrdered = hasOrdering(newValues)

    if (!(!hasOverlap && isOrdered)) {
      if (key === 'RangeFrom') {
        setIsAddBtnDisable(true)
        setIsSubmitBtnDisable(true)
      } else if (key === 'RangeTo') {
        setIsAddBtnDisable(true)
        setIsSubmitBtnDisable(true)
      } else {
        setIsAddBtnDisable(false)
        setIsSubmitBtnDisable(false)
      }
      setRangeValues(newValues)
    } else {
      if (key === 'RangeTo' && newValues[index].RangeTo < newValues[index].RangeFrom) {
        setIsAddBtnDisable(true)
        setIsSubmitBtnDisable(true)
      } else if (key === 'RangeFrom' && newValues[index].RangeFrom > newValues[index].RangeTo) {
        setIsAddBtnDisable(true)
        setIsSubmitBtnDisable(true)
      } else if (parseInt(value) > numberOfPages) {
        setIsAddBtnDisable(true)
        setIsSubmitBtnDisable(true)
      } else if (allRangesUsed) {
        setIsAddBtnDisable(true)
        setIsSubmitBtnDisable(false)
      } else {
        setIsAddBtnDisable(false)
        setIsSubmitBtnDisable(false)
      }
      setRangeValues(newValues)
    }
  }

  useEffect(() => {
    if (tabId === '1') {
      setSplitByPageType('ExtractByInterval-1')
    }
  }, [tabId])

  const tableData =
    rangeValues &&
    rangeValues.map((d: any, index: number) => {
      return new Object({
        ...d,
        RangeFrom: (
          <Text
            type='number'
            disabled={index + 1 != rangeValues.length ? true : false}
            defaultValue={d?.RangeFrom}
            value={d?.RangeFrom}
            getValue={(value) => onChangeTableFieldValue(index, value, 'RangeFrom')}
            getError={(err) => {}}
            className='!w-[40px] !pt-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
          />
        ),
        RangeTo: (
          <Text
            type='number'
            disabled={index + 1 != rangeValues.length ? true : false}
            defaultValue={d?.RangeTo}
            value={d?.RangeTo}
            getValue={(value) => onChangeTableFieldValue(index, value, 'RangeTo')}
            getError={(err) => {}}
            className='!w-[40px] !pt-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
          />
        ),
        actions: (
          <>
            {index > 0 && (
              <div onClick={() => handleDeleteRange(index)} className='close-btn'>
                <Close variant='small' />
              </div>
            )}
          </>
        ),
      })
    })

  const hasDuplicate = (arr: any) => {
    const uniqueSet = new Set()

    for (const item of arr) {
      if (uniqueSet.has(item)) {
        return true
      }
      uniqueSet.add(item)
    }

    return false
  }

  const validateString = (inputString: string) => {
    const numbers = inputString.replaceAll(' ', '').split(',')

    const uniqueSet = new Set()
    const result = []

    for (const item of numbers) {
      if (!uniqueSet.has(item)) {
        uniqueSet.add(item)
        result.push(item)
      }
    }

    return result
  }

  const sanitizeInput = (input: string) => {
    input = input.replace(/,+$/, '')

    const regexPattern = /^[1-9][0-9]*(,[1-9][0-9]*)*$/
    if (regexPattern.test(input)) {
      return input
    } else {
      return ''
    }
  }

  const onSplitDocuments = async () => {
    const numbers = pagesToExtract.split(',')
    if (tabId === '1') {
      const isFounded = numbers.some((item) => item > numberOfPages)

      if (isFounded) {
        Toast.error(`Number shouldn't be greater than ${numberOfPages}!`)
        return
      }

      if (hasDuplicate(pagesToExtract.split(','))) {
        setPagesToExtract(validateString(pagesToExtract).join())
        Toast.error(`Number shouldn't be duplicated or greater than ${numberOfPages}!`)
        return
      }
    }

    if (tabId === '2') {
      const previousRow = rangeValues[rangeValues.length - 1]
      if (previousRow && (!previousRow.RangeFrom || !previousRow.RangeTo)) {
        Toast.error('Please enter From and To values.')
        return
      }

      if (previousRow.RangeTo > numberOfPages || previousRow.RangeFrom > numberOfPages) {
        Toast.error(`Range should not be greater than ${numberOfPages}`)
        return
      }
    }

    setIsLoader(true)
    const params: SplitDocumentOptions = {
      DocumentUploadId: parseInt(`${id}`),
      SplitType: parseInt(tabId),
      SplitByPageType: SplitByPageType ? parseInt(SplitByPageType?.split('-')[1]) : 0,
      PagesToExtract: pagesToExtract.charAt(pagesToExtract.length - 1) === ',' ? sanitizeInput(pagesToExtract) : '',
      Prefix: Prefix,
      RangeWiseName: tabId === '2' ? true : false,
      PageIntervalToExtract: pageIntervalToExtract ?? 0,
      RangeList: parseInt(tabId) === 1 ? [] : rangeValues,
    }

    try {
      const response = await agent.APIs.splitDocuments(params)
      if (response?.ResponseStatus === 'Success') {
        const responseOcr = await agent.APIs.getocrDocument()

        if (responseOcr?.ResponseStatus === 'Success') {
          setIsLoader(false)
          Toast.success('Document Splitted!')
          router.push('/bills')
        }
      }
    } catch (error) {
      setIsLoader(false)
      Toast.error('Something Went Wrong!')
    }
  }

  const handleOptionChange = (changeEvent: any) => {
    if (SplitByPageType === 'ExtractByInterval-1') {
      setIsSubmitBtnDisable(true)
      setPageIntervalToExtract(null)
    }
    if (SplitByPageType === 'ExtractByInterval-2') {
      setIsSubmitBtnDisable(true)
      setPagesToExtract('')
    }
    setSplitByPageType(changeEvent.target.value)
  }

  const handleInputChange = (value: any, key: any) => {
    if (key === 'PageIntervalToExtract') {
      const pattern = /^[1-9][0-9]*$/
      if (pattern.test(value)) {
        setIsSubmitBtnDisable(false)
        setPageIntervalToExtract(parseInt(value))
      } else {
        setIsSubmitBtnDisable(true)
        setPageIntervalToExtract(null)
      }

      if (value >= numberOfPages) {
        setIsSubmitBtnDisable(true)
        setPageIntervalToExtract(null)
      }
    }
    if (key === 'PagesToExtract') {
      const regexPattern = /^[1-9,][0-9,]*$/

      if (regexPattern.test(value)) {
        const splitValueArr = value.split(',')
        let found = splitValueArr.some((el: any) => parseInt(el) > parseInt(numberOfPages) || parseInt(el) < 1)

        if (found) {
          setIsSubmitBtnDisable(true)
          setPagesToExtract('')
        } else {
          setIsSubmitBtnDisable(false)
          setPagesToExtract(value)
        }
      } else {
        setIsSubmitBtnDisable(true)
        setPagesToExtract('')
      }
    }
  }

  const openPDFInNewWindow = (pdfUrl: string | URL | undefined, fileName: string) => {
    const newWindow: any = window.open(pdfUrl, '_blank', 'width=800,height=600')
    setTimeout(function () {
      newWindow.document.title = fileName
    }, 1000)
  }

  const openInNewWindow = (blob: Blob, fileName: string) => {
    openPDFInNewWindow(URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })), fileName)
  }

  const parsedNumberOfPages = parseInt(numberOfPages)
  const parsedPagesToExtractLength =
    pagesToExtract.charAt(pagesToExtract.length - 1) === ','
      ? parseInt(`${sanitizeInput(pagesToExtract).split(',').length}`)
      : parseInt(`${pagesToExtract.split(',').length}`)

  const pageCountOfPageExtract =
    parsedNumberOfPages - parsedPagesToExtractLength < parsedNumberOfPages &&
    parsedNumberOfPages - parsedPagesToExtractLength !== 0
      ? parsedPagesToExtractLength + 1
      : parsedPagesToExtractLength

  return (
    <>
      <div
        className={`fixed right-0 top-0 z-10 flex h-full w-5/6 flex-col overflow-scroll bg-white shadow-2xl ${
          onOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className='flex items-center justify-between border-b-[1px] border-[#D8D8D8] p-2.5'>
          <div className='flex flex-col'>
            <span className=''>
              <Typography className='!text-[18px] !font-bold'>{fileName}</Typography>
            </span>
            <div className='w-[70px] rounded-sm bg-[#F6F6F6] px-1'>
              <Typography type='label' className=''>
                <span>Pages :</span> {numberOfPages}
              </Typography>
            </div>
          </div>
          <div onClick={onClose}>
            <Close variant='medium' />
          </div>
        </div>
        <div className='flex h-full p-6'>
          <div className='mr-4 w-3/4 bg-[#6E6D7A] p-4'>
            <div className='h-full bg-white'>
              <PDFViewer
                billNumber={billNumber}
                fileName={fileName}
                getNumberOfPages={() => {}}
                pdfFile={pdfFile}
                onOpen={() => {}}
                isSplitDrawer={true}
                fileBlob={fileBlob}
                openInNewWindow={openInNewWindow}
              />
            </div>
          </div>
          <div className='relative w-1/4'>
            <div className='text-[14px]'>
              <TabBar
                tabs={tabOptions}
                activeValue={tabId}
                getValue={(value: string) => {
                  if (parseInt(value) === 2) {
                    setSplitByPageType('')
                    setPageIntervalToExtract(null)
                    setPagesToExtract('')
                  }
                  if (parseInt(value) === 1) {
                    setRangeValues([
                      {
                        RangeName: `Range 1`,
                        RangeFrom: 1,
                        RangeTo: 2,
                      },
                    ])
                  }
                  setTabId(value)
                }}
                className='!h-10 !overflow-hidden [&>*]:!px-[10px]'
              />
            </div>
            <div className='mt-5 flex flex-col'>
              <div>
                <Typography className='w-full text-[12px] text-[#6D6D7A]'>Prefix</Typography>
                <Text
                  placeholder='Please add prefix'
                  id='Prefix'
                  name='Prefix'
                  getValue={(value) => setPrefix(value)}
                  getError={(value) => {}}
                />
              </div>
              {tabId === '2' ? (
                <>
                  <div className='mt-7 h-[calc(100vh-280px)] overflow-scroll max-[425px]:mx-1'>
                    <DataTable
                      columns={columns}
                      data={tableData}
                      getExpandableData={() => ''}
                      sticky
                      getRowId={() => {}}
                    />
                    <div className='mt-5 flex justify-end'>
                      <Button
                        variant='btn-outline'
                        className='rounded-full !px-5 !font-proxima !text-[14px] font-bold disabled:opacity-50'
                        onClick={handleAddRange}
                        disabled={isAddBtnDisable}
                      >
                        + ADD RANGE
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className='mt-6 flex flex-col'>
                    <label className='flex w-full cursor-pointer items-center'>
                      <div className='w-[12%]'>
                        <Radio
                          id='ExtractByInterval-1'
                          value='ExtractByInterval-1'
                          checked={SplitByPageType === 'ExtractByInterval-1'}
                          onChange={handleOptionChange}
                        />
                      </div>
                      <div className='w-[88%]'>
                        <Typography className='w-full'>Split in files number of Pages</Typography>
                      </div>
                    </label>
                    <div className='ml-8'>
                      <Typography className='w-full text-[12px] text-[#6D6D7A]'>Number of pages</Typography>
                      <Text
                        type='text'
                        id='PageIntervalToExtract'
                        name='PageIntervalToExtract'
                        value={pageIntervalToExtract ?? ''}
                        disabled={SplitByPageType === 'ExtractByInterval-2' ? true : false}
                        getValue={(value) => {
                          handleInputChange(value, 'PageIntervalToExtract')
                        }}
                        getError={(err) => {
                          setHasFormFieldLibraryErrors({
                            ...hasFormFieldLibraryErrors,
                            PageIntervalToExtract: err,
                          })
                        }}
                        className='!pt-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                      />
                      {pageIntervalToExtract && (
                        <Typography type='label'>
                          {Math.ceil(parseInt(numberOfPages) / parseInt(`${pageIntervalToExtract}`))} PDF will be created.
                        </Typography>
                      )}
                    </div>
                  </div>
                  <div className='mt-6 flex flex-col'>
                    <label className='flex w-full cursor-pointer items-center'>
                      <div className='w-[12%]'>
                        <Radio
                          id='ExtractByInterval-2'
                          value='ExtractByInterval-2'
                          checked={SplitByPageType === 'ExtractByInterval-2'}
                          onChange={handleOptionChange}
                        />
                      </div>
                      <div className='w-[88%]'>
                        <Typography className='w-full'>Pages to extract</Typography>
                      </div>
                    </label>
                    <div className='ml-8'>
                      <Typography className='w-full text-[12px] text-[#6D6D7A]'>Extract pages</Typography>
                      <Text
                        type='text'
                        placeholder='Example: 1,2,7,10'
                        id='PagesToExtract'
                        name='PagesToExtract'
                        value={pagesToExtract ?? ''}
                        disabled={SplitByPageType === 'ExtractByInterval-1' ? true : false}
                        getValue={(value) => {
                          handleInputChange(value, 'PagesToExtract')
                        }}
                        getError={(err) => {
                          setHasFormFieldLibraryErrors({
                            ...hasFormFieldLibraryErrors,
                            pagesToExtract: err,
                          })
                        }}
                      />
                      {pagesToExtract && <Typography type='label'>{pageCountOfPageExtract} PDF will be created.</Typography>}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className='absolute bottom-0 w-full'>
              <Button
                type='submit'
                onClick={onSplitDocuments}
                className={`w-full rounded-full !px-14 disabled:opacity-50`}
                variant='btn-primary'
                disabled={isSubmitBtnDisable}
              >
                <div className={`flex w-full items-center justify-center`}>
                  {isLoader ? (
                    <div className='mx-2 animate-spin '>
                      <SpinnerIcon bgColor='#FFF' />
                    </div>
                  ) : (
                    <>
                      <div className='mx-1'>
                        <BtnSplitIcon />
                      </div>
                      <Typography type='h6' className='!text-[14px] !font-bold'>
                        SPLIT DOCUMENT
                      </Typography>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SplitDrawer
