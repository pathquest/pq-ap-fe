'use client'

import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { getInlineStyle } from '@/data/notification'
import { useAppDispatch } from '@/store/configureStore'
import { getEmailTemplate, resetEmailTemplate, saveEmailTemplate } from '@/store/features/notification/notificationSlice'
import { ContentState, convertToRaw, EditorState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import dynamic from 'next/dynamic'
import { Button, Close, Loader, Modal, ModalAction, ModalContent, ModalTitle, Text, Toast, Typography } from 'pq-ap-lib'
import React, { lazy, useEffect, useRef, useState } from 'react'
import { EditorProps } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import style from '../notification.module.scss'
import CustomOption from './CustomOption'
import agent from '@/api/axios'

// imports Icons
const LeftArrowicon = lazy(() => import('@/assets/Icons/fileUpload/LeftArrowIcon'))
const SpinnerIcon = lazy(() => import('@/assets/Icons/spinnerIcon'))

const EmailPreview = lazy(() => import('./EmailPreview'))

const Editor = dynamic<EditorProps>(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false })

interface DrawerProps {
  setIsEdit: (value: boolean) => void
  matrixId: number
}

const TextEditor: React.FC<DrawerProps> = ({ setIsEdit, matrixId }) => {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null)
  const [subjectValue, setSubjectValue] = useState<string>('Enter Email Subject')
  const [selectedFileName, setSelectedFileName] = useState<string>('')
  const [initialEmailTemplate, setInitialEmailTemplate] = useState<string>('')
  const [mailContent, setMailContent] = useState<string>('')
  const [editorState, setEditorState] = useState<EditorState | undefined>()
  const [isSaveModal, setIsSaveModal] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isBtnLoading, setIsBtnLoading] = useState<boolean>(false)

  // Get Email Template Api
  const toGetEmailTemplate = async () => {
    setIsLoading(true)
    const params = {
      MatrixId: matrixId,
    }
    performApiAction(dispatch, getEmailTemplate, params, (responseData: any) => {
      // SuccessData
      setSubjectValue(responseData.Subject)
      const doc = new DOMParser().parseFromString(responseData.Template, 'text/html')
      const imgElement = doc.querySelector('img')
      const emailContentContainer = doc.getElementById('email-content-container')
      if (imgElement) {
        const src = imgElement.getAttribute('src')
        setImagePreview(src)
      }
      if (emailContentContainer) {
        const blocksFromHtml = htmlToDraft(emailContentContainer.innerHTML)
        const { contentBlocks, entityMap } = blocksFromHtml
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap)
        const editorState = EditorState.createWithContent(contentState)
        setEditorState(editorState)
      }
      let modifiedTemplate = responseData.Template.replace(/<img[^>]*>/g, '')

      let srcArr = imgElement && imgElement.src.split('/')
      let logoImageArr = srcArr && srcArr[srcArr?.length - 1].split('_')

      const imgSrc = logoImageArr ? logoImageArr[logoImageArr?.length - 1] : null;

      setSelectedFileName(imgSrc ?? '')

      setInitialEmailTemplate(modifiedTemplate)
      setIsLoading(false)
    }, () => {
      // ErrorData
      setIsLoading(false)
    })
  }

  const addImageTagToContent = (content: string) => {
    const imageTag = `<img src="${imagePreview}" alt="logo">`
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const emailContentContainer = doc.getElementById('email-logo-container')
    if (emailContentContainer) {
      emailContentContainer.innerHTML = imageTag
      return doc.documentElement.outerHTML
    }
    return content
  }

  // Save Email Template Api
  const toSaveEmailTemplate = async () => {
    setIsBtnLoading(true)
    const params = {
      Subject: subjectValue,
      Template: addImageTagToContent(initialEmailTemplate),
      MatrixId: matrixId,
    }

    performApiAction(dispatch, saveEmailTemplate, params, () => {
      // SuccessData
      setIsBtnLoading(false)
      setIsEdit(false)
      Toast.success('Changes Updated!')
    }, () => {
      // ErrorData
      setIsBtnLoading(false)
    })
  }

  useEffect(() => {
    if (editorState) {
      const convertedHtml = draftToHtml(convertToRaw(editorState.getCurrentContent()))
      const modifiedContent = convertedHtml
        .replace(/(?:\r\n|\r|\n)/g, '<br>')
        .replace(/<a(.*?)>/g, '<a$1 style="color: blue; text-decoration: underline">')
      setMailContent(modifiedContent.replace(/<[^>]*>/g, ''))
      const parser = new DOMParser()
      const doc = parser.parseFromString(initialEmailTemplate, 'text/html')
      const emailContentContainer = doc.getElementById('email-content-container')
      emailContentContainer && (emailContentContainer.innerHTML = modifiedContent)
      const updatedInitialEmailTemplate = doc.documentElement.outerHTML
      setInitialEmailTemplate(updatedInitialEmailTemplate)
    }
  }, [editorState])

  useEffect(() => {
    toGetEmailTemplate()
  }, [matrixId])

  const handleModalOpen = () => {
    const MIN_LIMIT = mailContent.length <= 0
    const MAX_LIMIT = mailContent.length > 500
    if (MIN_LIMIT) {
      Toast.error('Email body content cannot be empty!')
    } else if (MAX_LIMIT) {
      Toast.error('You’ve reached the maximum character limit!')
    } else if (!MIN_LIMIT && !MAX_LIMIT && subjectValue.length > 0) {
      setIsSaveModal(true)
    }
  }

  const handleModalClose = () => {
    setIsSaveModal(false)
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files && e.target.files[0]
    setSelectedFileName(imageFile ? imageFile.name : '')

    let formData: any = new FormData()
    formData.append(`ImageFile`, imageFile)
    formData.append(`MatrixId`, matrixId)

    const response = await agent.APIs.notificationUploadImage(formData)

    if (response?.ResponseStatus === 'Success') {
      setImagePreview(response.ResponseData)
    }
  }

  const handleResetBtn = () => {
    const params = {
      id: matrixId,
    }

    performApiAction(dispatch, resetEmailTemplate, params, () => {
      toGetEmailTemplate()
    })
  }

  return (
    <>
      {/* Navbar component */}
      <div className='sticky top-0 z-[6] flex h-[50px] items-center justify-between bg-whiteSmoke px-5'>
        <div className='flex place-content-center'>
          <button className='cursor-pointer pr-5' onClick={() => setIsEdit(false)}>
            <LeftArrowicon />
          </button>
          <Typography type='h5' className='flex items-center justify-center text-center !text-base !font-bold !tracking-[0.02em] !text-darkCharcoal'>
            Edit Email
          </Typography>
        </div>
        <div className='flex items-center justify-center gap-5'>
          <Button
            onClick={handleResetBtn}
            variant='btn-outline-primary'
            className={`!bg-transparent btn-sm !h-9 rounded-full`}
          >
            <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">RESET CHANGES</label>
          </Button>
          <Button
            type='submit'
            onClick={handleModalOpen}
            className={`btn-sm !h-9 rounded-full`}
            variant='btn-primary'
          >
            <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]`}>
              SAVE
            </label>
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className='flex h-[calc(100vh-112px)] items-center justify-center'>
          <Loader helperText />
        </div>
      ) : (
        <div className='flex h-[calc(100%-66px)] w-full'>
          <EmailPreview content={initialEmailTemplate} emailSubject={subjectValue} imageUrl={imagePreview} />
          <div className='h-full w-1/2 overflow-y-scroll p-5'>
            <Typography type='h5' className='!text-base !font-bold !tracking-[0.02em] !text-darkCharcoal'>
              Email Template
            </Typography>
            <div className='mt-3'>
              <Text
                label='Subject'
                placeholder='Please Enter Subject'
                hasError={undefined}
                value={subjectValue}
                validate
                getValue={(value: string) => setSubjectValue(value)}
                getError={() => { }}
                maxLength={50}
              />
            </div>
            <div className='mt-5'>
              <Typography type='h6' className='text-sm text-slatyGrey tracking-wide'>Add Logo</Typography>
              <div className='flex items-center justify-between rounded-md border-[1px] border-lightSilver '>
                <Typography className='!overflow-hidden text-ellipsis whitespace-nowrap p-2 !text-[12px] font-medium '>
                  {selectedFileName || 'Choose File'}
                </Typography>
                <input
                  id='imageInput'
                  type='file'
                  accept='.png, .jpg, .jpeg'
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
                <span className='flex h-full cursor-pointer items-center rounded-e-md border-l-[1px]  border-lightSilver bg-lightSilver p-2'
                  onClick={handleBrowseClick}>
                  <Typography className='whitespace-nowrap !text-[12px] font-medium font-proxima'>Browse Files</Typography>
                </span>
              </div>
            </div>
            <div className='mt-5 flex flex-col'>
              <Typography type='h6' className='text-sm text-slatyGrey tracking-wide'>Message</Typography>
              <div className='h-full w-full break-all rounded-md border-[1px] border-lightSilver'>
                <Editor
                  toolbarClassName={`${style.toolbarClassName}`}
                  wrapperClassName={`${style.wrapperClassName}`}
                  editorClassName={`${style.editorClassName}`}
                  editorState={editorState}
                  toolbarCustomButtons={[<CustomOption key='CustomEditor' editorState={editorState} onChange={setEditorState} matrixId={matrixId} />]}
                  onEditorStateChange={setEditorState}
                  toolbar={{
                    options: ['inline', 'fontSize', 'textAlign', 'list', 'history'],
                    inline: {
                      inDropdown: false,
                      className: '!gap-1',
                      options: ['bold', 'italic', 'underline', 'strikethrough'],
                      bold: getInlineStyle('bold'),
                      italic: getInlineStyle('italic'),
                      underline: getInlineStyle('underline'),
                      strikethrough: getInlineStyle('strikethrough'),
                    },
                    fontSize: {
                      className: getInlineStyle('fontsize'),
                    },
                    textAlign: {
                      options: ['left', 'right', 'center', 'justify'],
                      left: getInlineStyle('left'),
                      right: getInlineStyle('right'),
                      center: getInlineStyle('center'),
                      justify: getInlineStyle('justify'),
                    },
                    list: {
                      inDropdown: false,
                      className: undefined,
                      component: undefined,
                      dropdownClassName: undefined,
                      options: ['unordered', 'ordered', 'indent', 'outdent'],
                      unordered: getInlineStyle('unordered'),
                      ordered: getInlineStyle('ordered'),
                      indent: getInlineStyle('indent'),
                      outdent: getInlineStyle('outdent'),
                    },
                    history: {
                      options: ['undo', 'redo'],
                      undo: getInlineStyle('undo'),
                      redo: getInlineStyle('redo'),
                    },
                  }}
                  hashtag={{
                    separator: ' ',
                    trigger: '#',
                    suggestions: [
                      { text: 'JavaScript', value: 'javascript', url: 'js' },
                      { text: 'Golang', value: 'golang', url: 'go' },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* conformation modal popup on save button */}
      <Modal isOpen={isSaveModal} onClose={handleModalClose} width='525px'>
        <ModalTitle className='py-3 pl-4 pr-1 font-bold'>
          <Typography className='!font-bold'>Save Email</Typography>
          <div onClick={handleModalClose}>
            <Close variant='medium' />
          </div>
        </ModalTitle>

        <ModalContent>
          <div className='py-5 pl-5'>
            <Typography className='pb-2.5 pr-24 text-[16px]'>
              The changes will automatically apply for the entity level, and each user will receive the same email notifications
            </Typography>
          </div>
        </ModalContent>

        <ModalAction className='px-1 py-1'>
          <Button
            className='btn-sm mx-2 my-3 !h-[36px] !w-[103px] flex justify-center items-center rounded-full !px-16 font-semibold'
            variant='btn-outline-primary'
            onClick={handleModalClose}
          >
            CANCEL
          </Button>
          <Button
            type='submit'
            onClick={toSaveEmailTemplate}
            className={`btn-sm mx-2 my-3 !h-[36px] !w-[68px] rounded-full font-semibold ${isBtnLoading && 'pointer-events-none opacity-80'
              } !text-[14px] xsm:!px-1`}
            variant='btn-primary'
          >
            <div className={`flex items-center justify-center`}>
              {isBtnLoading ? (
                <div className='mx-2 animate-spin '>
                  <SpinnerIcon bgColor='#FFF' />
                </div>
              ) : (
                <Typography type='h6' className='!font-bold'>
                  OK
                </Typography>
              )}
            </div>
          </Button>
        </ModalAction>
      </Modal>
    </>
  )
}

export default TextEditor