import { Avatar, Typography } from 'pq-ap-lib'
import { useState, useEffect, useRef } from 'react'
import { ActivityAttachmentList, ActivityList, FilterTagDataOptions } from '@/models/activity'
import { BlobServiceClient } from '@azure/storage-blob'
import GetFileIcon from '@/app/bills/__components/GetFileIcon'
import DownloadIcon from '@/assets/Icons/activity/DownloadIcon'
import { storageConfig } from './pdfviewer/config'
interface ChatBoxProps {
  chatItem: any
  className?: string
  getList: () => void
  tabId?: string
  watcherList?: FilterTagDataOptions[]
  getSummaryData: (value: any) => void
}

const ChatBox = ({ chatItem, className, watcherList, tabId, getSummaryData }: ChatBoxProps) => {
  const [filteredChatItems, setFilteredChatItems] = useState<ActivityList[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToTop = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    switch (tabId) {
      case '1':
        setFilteredChatItems(
          chatItem.filter((e: ActivityList) => e.Type === 'Activity' || e.Type === 'Comment' || e.Type === 'Query')
        )
        break
      case '2':
        setFilteredChatItems(chatItem.filter((e: ActivityList) => e.Type === 'Activity'))
        break
      case '3':
        setFilteredChatItems(chatItem.filter((e: ActivityList) => e.Type === 'Comment' || e.Type === 'Query'))
        break
      default:
        setFilteredChatItems(chatItem)
        break
    }
  }, [tabId, chatItem])

  useEffect(() => {
    scrollToTop()
  }, [filteredChatItems])

  const showPDFViewerModal = async (filePath: any, fileName: any) => {
    const storageAccount = storageConfig.storageAccount
    const containerName: any = storageConfig.containerName
    const sasToken = storageConfig.sassToken
    
    const blobServiceClient = new BlobServiceClient(`https://${storageAccount}.blob.core.windows.net?${sasToken}`)
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blockBlobClient = containerClient?.getBlockBlobClient(`${filePath}`)
    try {
      const downloadBlockBlobResponse = await blockBlobClient.download(0)

      if (downloadBlockBlobResponse.blobBody) {
        const blob = await downloadBlockBlobResponse.blobBody
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        a.remove()
      } else {
        console.error('Blob body is undefined')
      }
    } catch (error) {
      console.error('Error downloading blob:', error)
    }
  }

  const chatsByWeek = filteredChatItems.reduce((acc: any, chat: any) => {
    const dateTime = new Date(chat.CreatedOn)

    if (isNaN(dateTime.getTime())) {
      return acc
    }

    const weekStart = new Date(dateTime)
    weekStart.setDate(dateTime.getDate() - dateTime.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekStartString = weekStart.toISOString().split('T')[0]

    if (!acc[weekStartString]) {
      acc[weekStartString] = []
    }
    acc[weekStartString].push(chat)
    return acc
  }, {})

  const formattedChats: any = []
  Object.keys(chatsByWeek).forEach((weekStart) => {
    const weekChats = chatsByWeek[weekStart]
    weekChats.forEach((chat: ActivityList, index: number) => {
      const dateTime = new Date(chat.CreatedOn)
      const date = dateTime.toLocaleDateString('en-US')
      const time = dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })
      const commentWithUsernames = chat?.Comment?.split(/(@\[\([^\]]+\)\])/).map((text: any, i: number) => {
        if (text.startsWith('@[(') && text.endsWith(')]')) {
          const id = text.substring(3, text.length - 2)
          const usernameObject = watcherList?.find((user) => user.id === id)
          const usernameDisplay = usernameObject ? usernameObject.display : 'Unknown User'

          return usernameDisplay
        } else {
          return text
        }
      })
      formattedChats.push(`Chat ${index + 1}: ${date} ${time} - ${commentWithUsernames}`)
    })
  })

  if (formattedChats.length > 0) {
    getSummaryData(formattedChats.join('\n'))
  }

  return (
    <>
      {filteredChatItems.map((chat: ActivityList, index: number) => {
        const dateTime = new Date(chat?.CreatedOn)

        const currentDate = new Date()
        // Convert the UTC dateTime to local time
        const dateTimeLocal = new Date(dateTime.getTime() - dateTime.getTimezoneOffset() * 60000)

        // Extract local date and time
        const date = dateTimeLocal.toLocaleDateString('en-US')
        const hours = dateTimeLocal.getHours()
        const minutes = dateTimeLocal.getMinutes()

        const ampm = hours >= 12 ? 'PM' : 'AM'
        const formattedHours = hours % 12 || 12 // Convert hour to 12-hour format
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes // Pad minutes with zero if needed
        const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`

        const isFirstItem = index === 0
        const isDateDifferent = date !== new Date(filteredChatItems[index - 1]?.CreatedOn).toLocaleDateString('en-US')
        const isToday = dateTime.toDateString() === currentDate.toDateString()

        return (
          <div className={`flex flex-col`} key={chat.Id}>
            {isFirstItem || isDateDifferent ? (
              <div className='my-[15px] flex h-[0.5px] items-center justify-center bg-[#6E6D7A] !bg-opacity-[40%] text-[14px]'>
                <span className='bg-white px-4 text-center font-semibold text-[#6E6D7A]'>{isToday ? 'Today' : date}</span>
              </div>
            ) : null}

            <div className={`flex gap-3 pt-2 ${className}`} key={chat?.Id}>
              <Avatar imageUrl={chat?.UserImage} name={chat?.CreatedByName} />

              <div className={`mb-3 w-[90%] border-b border-lightSilver pb-3.5`}>
                <h4 className='text-bold flex justify-between text-[14px] font-bold'>
                  <span>{chat?.CreatedByName}</span>
                  <div className='flex items-end justify-end'>
                    {chat.Type !== 'Activity' && (
                      <Typography className={` bg-[#F4F4F4] !text-[10px] font-normal uppercase`}>
                        {chat?.IsResolved ? 'Query Resloved' : chat?.Type}
                      </Typography>
                    )}
                  </div>
                </h4>
                <div className='pt-2 text-[12px] text-[#6E6D7A]'>
                  {new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })},{' '}
                  {formattedTime}
                </div>
                <div className='py-[15px]'>
                  <p className='break-words text-[14px]'>
                    {chat?.Comment?.split(/(@\[\([^\]]+\)\])/).map((text: string, i: number) => {
                      if (text.startsWith('@[(') && text.endsWith(')]')) {
                        const id = text.substring(3, text.length - 2)
                        const username = watcherList?.find((e: FilterTagDataOptions) => e.id === id)
                        return (
                          <span key={text} style={{ fontWeight: 'bold', color: '#02b89d' }}>
                            {username?.display}
                          </span>
                        )
                      } else {
                        return text.split('\n').map((line, index) => (
                          <span key={line}>
                            <span>{line}</span>
                            {index < text.split('\n').length - 1 && <br />}
                          </span>
                        ))
                      }
                    })}
                  </p>
                </div>

                <div className={`${chat.Attachments?.length > 0 ? 'my-1' : ''} flex flex-wrap gap-3`}>
                  {chat.Attachments?.map((file: ActivityAttachmentList, index: number) => (
                    <label
                      key={file.ActivityId}
                      className='cursor-pointer rounded-sm bg-[#F4F4F4] px-2 py-1 text-black'
                      onClick={() => {
                        showPDFViewerModal(file.AttachmentPath, file.AttachmentName)
                      }}
                    >
                      <span className='flex gap-1'>
                        <DownloadIcon /> <GetFileIcon FileName={file.AttachmentName} /> {file.AttachmentName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={chatEndRef}></div>
    </>
  )
}

export default ChatBox
