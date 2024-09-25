import { Button, Close, Loader, Modal, ModalContent, ModalTitle, TabBar, Toast, Tooltip } from 'pq-ap-lib'
import { useEffect, useRef, useState } from 'react'
import { Mention, MentionsInput } from 'react-mentions'
import defaultStyle from './defaultStyle'

// common components
import ChatBox from '@/components/Common/ChatBox'
import { ActivityDrawerProps } from '@/models/billPosting'

// Icons
import ClearIcon from '@/assets/Icons/activity/ClearIcon'
import ExcelIcon from '@/assets/Icons/activity/ExcelIcon'
import FileIcon from '@/assets/Icons/activity/FileIcon'
import ImageIcon from '@/assets/Icons/activity/ImageIcon'
import InformalIcon from '@/assets/Icons/activity/InformalIcon'
import PdfIcon from '@/assets/Icons/activity/PdfIcon'
import WordIcon from '@/assets/Icons/activity/WordIcon'
import SendIcon from '@/assets/Icons/billposting/ActivityDrawer/SendIcon'
import AttachIcon from '@/assets/Icons/billposting/AttachIcon'
import MicrophoneIcon from '@/assets/Icons/payments/MicrophoneIcon'
import SpinnerIcon from '@/assets/Icons/spinnerIcon'

// openai
import { Configuration, OpenAIApi } from 'openai'

// store
import { ActivityList, WatcherOptions, FilterTagDataOptions } from '@/models/activity'
import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { getActivityList, getWatcherList, saveActivityList, saveWatcherList } from '@/store/features/billsToPay/billsToPaySlice'
import WatcherListDropdown from '../Dropdown/WatcherListDropdown'
import { performApiAction } from '../Functions/PerformApiAction'
import { getModulePermissions, hasSpecificPermission } from '../Functions/ProcessPermission'
import DrawerOverlay from '../DrawerOverlay'

const extensionToIconMap: any = {
  pdf: <PdfIcon />,
  doc: <WordIcon />,
  docx: <WordIcon />,
  xls: <ExcelIcon />,
  xlsx: <ExcelIcon />,
  jpg: <ImageIcon />,
  jpeg: <ImageIcon />,
  png: <ImageIcon />,
}

const ActivityDrawer = ({ GUID, isOpen, onClose, noCommentBox, selectedPayableId }: ActivityDrawerProps) => {
  const dispatch = useAppDispatch()
  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)

  const isActivityCommentView = getModulePermissions(processPermissionsMatrix, "Activity") ?? {}
  const isQueriesView = isActivityCommentView["Comments-Queries"]?.View ?? false;
  const isQueriesCreate = isActivityCommentView["Comments-Queries"]?.Create ?? false;

  const isInformalCreate = isActivityCommentView["Informal"]?.Create ?? false;
  const isSpeechToTextCreate = isActivityCommentView["Speech to text"]?.Create ?? false;
  const isSummaryCreate = isActivityCommentView["Summary"]?.Create ?? false;

  const [selectedTab, setSelectedTab] = useState('1')
  const [selectedAssignees, setSelectedAssignees] = useState<WatcherOptions[]>([])
  const [newText, setNewText] = useState<string>('')
  const [summaryModelData, setSummaryModalData] = useState<string>('')
  const [summaryData, setSummaryData] = useState<string>('')
  const [fileNames, setFileNames] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [getList, setGetList] = useState<ActivityList[]>([])
  const [watcherList, setWatcherList] = useState<WatcherOptions[]>([])
  const [tagWatcherList, setTagWatcherList] = useState<FilterTagDataOptions[]>([])
  const [watcherListDisplay, setWatcherListDisplay] = useState<FilterTagDataOptions[]>([])
  const [listLoader, setListLoader] = useState<boolean>(false)
  const [watcherLoader, setWatcherLoader] = useState<boolean>(false)
  const [isOpenAssignUserDropDown, setIsOpenAssignUserDropDown] = useState<boolean>(false)
  const [loader, setLoader] = useState<boolean>(false)
  const [summaryLoader, setSummaryLoader] = useState<boolean>(false)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false)
  const [isSummaryModalIcon, setIsSummaryModalIcon] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [time, setTime] = useState('00:00');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  let recognizer: any
  let stream: any

  const fileInputRef = useRef(null)
  const dropdownAssignUserRef = useRef<HTMLDivElement>(null)

  const userId = localStorage.getItem('UserId')

  const configuration = new Configuration({
    apiKey: process.env.OPEN_AI,
  })

  const openai = new OpenAIApi(configuration)

  const handleFileChange = (newFiles: FileList) => {
    const updatedFiles = [...files, ...Array.from(newFiles)]
    setFiles(updatedFiles)

    const updatedFileNames = updatedFiles.map((file) => file.name)
    setFileNames(updatedFileNames)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (files) {
      const maxFileCount = 5
      const maxFileSizeMB = 50

      if (files.length > maxFileCount) {
        Toast.error('You are only allowed to upload a maximum of 5 files at a time')
        return
      }

      let totalFileSizeMB = 0
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        totalFileSizeMB += file.size / (1024 * 1024)
      }
      if (totalFileSizeMB > maxFileSizeMB) {
        Toast.error(`Total file size exceeds the maximum limit of ${maxFileSizeMB} MB`)
        return
      }
      handleFileChange(files)
    }
  }

  const handleRemoveFile = (index: number) => {
    const updatedFileNames = [...fileNames]
    updatedFileNames.splice(index, 1)
    setFileNames(updatedFileNames)
    setFiles(Array.from(files).filter((i, inx) => inx !== index))
  }

  const getFileExtension = (fileName: string) => {
    const extension = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase()
    return extension
  }

  const renderFileIcon = (fileName: string) => {
    const extension = getFileExtension(fileName)
    const icon = extensionToIconMap[extension]
    return icon || <FileIcon />
  }

  const handleMentionsChange = (e: any) => {
    setNewText(e.target.value)
  }

  const tabBar = [
    { id: '1', label: 'ALL', isVisible: true },
    { id: '2', label: 'ACTIVITY', isVisible: true },
    { id: '3', label: 'COMMENTS', isVisible: isQueriesView },
  ].filter(item => item.isVisible)

  const getTabId = (args: string) => {
    setSelectedTab(args)
  }

  const handleSetValue = async (value: WatcherOptions[]) => {
    setSelectedAssignees(value)
  }

  useEffect(() => {
    if (isOpen) {
      fetchActivityList()
      !noCommentBox && fetchWatcherList()
    }
  }, [isOpen])

  const fetchActivityList = () => {
    setListLoader(true)

    const params = {
      Type: '',
      AccountPayableId: parseInt(`${selectedPayableId}`),
    }
    performApiAction(
      dispatch,
      getActivityList,
      params,
      (responseData: any) => {
        setGetList(responseData.List)
        setListLoader(false)
      },
      () => {
        setListLoader(false)
      }
    )
  }

  const fetchWatcherList = () => {
    const params = {
      SearchKey: '',
      AccountPayableId: parseInt(`${selectedPayableId}`),
    }
    performApiAction(dispatch, getWatcherList, params, (responseData: any) => {
      const filteredTagData = responseData?.List?.map((e: FilterTagDataOptions) => ({
        id: String(e.Id),
        display: e.UserName,
      }))

      const filteredWatcherData = responseData?.List?.map((e: WatcherOptions) => ({
        id: String(e.Id),
        name: e.UserName,
        FileName: e.FileName,
        UserImage: e.UserImage,
        IsSelected: e.IsSelected,
      }))

      const watcherListEnable = filteredWatcherData.filter((e: WatcherOptions) => e.IsSelected === true)
      const watcherListData = filteredWatcherData.filter((e: WatcherOptions) => e.id !== userId?.toString())
      const filterTagData = filteredTagData.filter((e: WatcherOptions) => e.id !== userId)
      setWatcherList(watcherListData)
      setSelectedAssignees(watcherListEnable)
      setTagWatcherList(filterTagData)
      setWatcherListDisplay(filteredTagData)
    })
  }

  const handleSubmit = async (type: number) => {
    setLoader(true)
    const currentDate = new Date()
    const yesterdayDate = new Date(currentDate)
    yesterdayDate.setDate(currentDate.getDate() - 1)

    const processedText = newText.replace(/@\[([^\]]+)\]\((\d+)\)/g, (_, name, id) => `@[(${id})]`)

    const tagNumbers = Array.from(newText.matchAll(/@\[([^\]]+)\]\((\d+)\)/g), (match) => match[2])
    const tagString = tagNumbers.join(',')

    let formData: any = new FormData()

    formData.append('AccountPayableId', parseInt(`${selectedPayableId}`))
    formData.append('Type', 'Comment')
    formData.append('Comment', processedText)
    formData.append('Tag', tagString)
    formData.append('ParentActivityId', '')
    Array.from(files).forEach((file, index) => {
      formData.append(`Attachment[${index}]`, file)
    })

    performApiAction(
      dispatch,
      saveActivityList,
      formData,
      () => {
        // SuccessData
        setLoader(false)
        fetchActivityList()
        setFiles([])
        setFileNames([])
        setNewText('')
      },
      () => {
        // ErrorData
        setLoader(false)
        setNewText('')
      }
    )
  }

  const handleAIText = async (value: string) => {
    let actionMessage = ''
    let summaryMessage = ''
    switch (value) {
      case 'informal':
        setNewText('Typing...')
        const processedText = newText.replace(/@\[([^\]]+)\]\([^)]+\)/g, (name: string) => name)
        actionMessage = processedText ? `Generate a casual message for ${processedText}` : 'Generate a informal sample text'
        break
      case 'summary':
        setIsSummaryModalIcon(true)
        summaryMessage = `Generate a proper summary for given chats [ ${summaryData} ]`
        break
    }

    if (summaryMessage.length > 0 && value === 'summary') {
      setSummaryLoader(true)
      try {
        const data = await openai.createChatCompletion({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: summaryMessage }],
          temperature: 0.5,
          max_tokens: 3000,
        });

        if (data.data && data.data.choices && data.data.choices.length > 0) {
          setSummaryLoader(false)
          const apiResponse = data.data.choices[0].message?.content ?? '';
          setIsSummaryModalIcon(false);
          setIsSummaryModalOpen(true);
          setSummaryModalData(String(apiResponse));
        } else {
          setSummaryLoader(false)
          setNewText('Nothing found in the response.');
        }
      } catch (error) {
        setNewText('');
        setSummaryLoader(false)
        console.error("Error:", error);
      }
    } else {
      try {
        const data = await openai.createChatCompletion({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: actionMessage }],
          temperature: 0.5,
          max_tokens: 4000,
        });

        if (data.data && data.data.choices && data.data.choices.length > 0) {
          const apiResponse = data.data.choices[0].message?.content ?? '';
          setNewText(String(apiResponse));
        } else {
          setNewText('Nothing found in the response.');
        }
      } catch (error) {
        setNewText('');
        console.error("Error:", error);
      }
    }
  }

  const handleOutsideClick = (event: MouseEvent) => {
    if (dropdownAssignUserRef.current && !dropdownAssignUserRef.current.contains(event.target as Node)) {
      setIsOpenAssignUserDropDown(false)
    }
  }

  useEffect(() => {
    if (isOpenAssignUserDropDown) {
      document.addEventListener('click', handleOutsideClick)
    } else {
      document.removeEventListener('click', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isOpenAssignUserDropDown])

  const handleWatcherSubmit = () => {
    setWatcherLoader(true)
    const params = {
      AccountPayableId: parseInt(`${selectedPayableId}`),
      WatcherIds: selectedAssignees.map((e: WatcherOptions) => e.id).join(','),
    }
    performApiAction(
      dispatch,
      saveWatcherList,
      params,
      () => {
        setWatcherLoader(false)
        setIsOpenAssignUserDropDown(false)
        fetchActivityList()
        fetchWatcherList()
      },
      () => {
        setWatcherLoader(false)
      }
    )
  }

  const onCloseSubmit = () => {
    setNewText('')
    setLoader(false)
    setSummaryLoader(false)
    setListLoader(false)
    setWatcherLoader(false)
    setGetList([])
    setWatcherList([])
    setTagWatcherList([])
    setWatcherListDisplay([])
    onClose(false)
  }

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setIsRecording(true);

        // Create a new MediaRecorder instance
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        const chunks: any = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          // Create a blob from the recorded chunks
          const blob = new Blob(chunks, { type: 'audio/wav' });
          setAudioBlob(blob);
        };

        recorder.start();

        // Reset the timer
        setTime('00:00');

        // Start a new interval for the timer
        const id = setInterval(() => {
          setTime((prevTime) => {
            const [minutes, seconds] = prevTime.split(':').map(Number);
            let newMinutes = minutes;
            let newSeconds = seconds + 1;

            if (newSeconds === 60) {
              newMinutes++;
              newSeconds = 0;
            }

            return `${newMinutes < 10 ? '0' : ''}${newMinutes}:${newSeconds < 10 ? '0' : ''}${newSeconds}`;
          });
        }, 1000);
        setIntervalId(id);
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });
  };

  const stopRecording = () => {
    if (isRecording) {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
      }

      // Clear the timer interval when recording stops
      if (intervalId) {
        clearInterval(intervalId);
      }
    }
  };

  // Trigger the transcription when the audioBlob is available
  useEffect(() => {
    const transcribeAudio = async () => {
      if (audioBlob) {
        // Prepare the form data
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.wav');
        formData.append('model', 'whisper-1'); // Adjust model name as needed

        try {
          const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPEN_AI}`, // Ensure this is correctly set
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to transcribe audio: ${errorData.error.message}`);
          }

          const result = await response.json();
          setNewText((prevText) => prevText + ' ' + result.text);
          setTime('00:00');
        } catch (error) {
          console.error('Error transcribing audio:', error);
        }
      }
    };

    transcribeAudio();
  }, [audioBlob]);

  useEffect(() => {
    return () => {
      // Clean up interval on component unmount
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const modalClose = () => {
    setIsSummaryModalOpen(false)
  }

  return (
    <>
      <div
        className={`fixed right-0 top-0 z-10 h-screen transform overflow-y-auto border-lightSilver bg-white text-black lg:w-5/12 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          } transition-transform duration-300 ease-in-out`}
      >
        <div className='activityDrawerHeader sticky top-0 flex justify-between bg-white pt-1.5'>
          <TabBar
            tabs={tabBar}
            getValue={getTabId}
            className='w-full !font-proxima !text-[14px] !font-medium'
            activeValue={selectedTab}
          />
          <div className='flex w-full items-center justify-end gap-2 border-b-2 border-lightSilver pr-2'>
            {summaryLoader ? (
              <div className='animate-spin'>
                <SpinnerIcon bgColor='#6E6D7A' />
              </div>
            ) : (
              isSummaryCreate && <Tooltip
                position='bottom'
                content='Summary'
                className={`${getList.length > 0 && !isSummaryModalIcon ? 'cursor-pointer' : 'pointer-events-none'
                  } !py-2 !pl-0 !pr-0  !font-proxima !text-[14px]`}
              >
                <span onClick={() => handleAIText('summary')}>
                  <InformalIcon />
                </span>
              </Tooltip>
            )}

            <span className="pt-2" onClick={onCloseSubmit}>
              <Close variant='medium' />
            </span>
          </div>
        </div>

        <div
          className={`!z-0 ${(selectedTab !== '2' && !noCommentBox) ? 'h-[calc(100vh-250px)]' : 'h-[90vh]'
            }  custom-scroll overflow-y-scroll px-5 pb-1 pt-5`}
        >
          {getList.length > 0 ? (
            <>
              {selectedTab === '1' && (
                <ChatBox
                  chatItem={getList}
                  getList={() => fetchActivityList()}
                  watcherList={watcherListDisplay}
                  tabId={'1'}
                  getSummaryData={(value: string) => setSummaryData(value)}
                />
              )}
              {selectedTab === '2' && (
                <ChatBox
                  chatItem={getList}
                  getList={() => fetchActivityList()}
                  watcherList={watcherListDisplay}
                  tabId={'2'}
                  getSummaryData={(value: string) => setSummaryData(value)}
                />
              )}
              {selectedTab === '3' && (
                <ChatBox
                  chatItem={getList}
                  getList={() => fetchActivityList()}
                  watcherList={watcherListDisplay}
                  tabId={'3'}
                  getSummaryData={(value: string) => setSummaryData(value)}
                />
              )}
            </>
          ) : getList.length === 0 && !listLoader ? (
            <span className='flex h-[calc(100vh-280px)] items-center justify-center p-5 text-[14px]'>No comments yet</span>
          ) : (
            <span className={`flex h-[calc(100vh-280px)] items-center justify-center`}>
              <Loader helperText size='sm' />
            </span>
          )}
        </div>

        {!noCommentBox && selectedTab !== '2' && (
          <div
            className={`${fileNames.length > 0 ? 'h-[250px]' : 'h-[190px]'
              } advanced fixed bottom-0 flex w-full flex-col bg-white px-5 pb-[2px]`}
          >
            <hr className='mb-5 !border !border-lightSilver' />
            <div className={`relative rounded-[4px]`}>
              <MentionsInput
                style={defaultStyle}
                value={newText?.trimStart()}
                placeholder={`Type a new message OR type @ if you want to mention anyone in the message.`}
                onChange={handleMentionsChange}
                className={`mentions textareaOutlineNoneEdit custom-scroll relative min-h-[100px] ${newText === 'Typing...' ? 'pointer-events-none text-gray-400' : ''
                  }`}
              >
                <Mention style={defaultStyle} data={tagWatcherList} trigger='@' className='mentions__mention' />
              </MentionsInput>
            </div>

            {fileNames.length > 0 && (
              <span
                className={`flex flex-wrap items-center justify-start gap-2 rounded-b-[4px] border-b-[1.5px] border-l-[1.5px] border-r-[1.5px] border-lightSilver p-2`}
              >
                {fileNames.length > 0 &&
                  fileNames.map((name, index) => (
                    <span
                      className='flex items-center gap-2 rounded-[2px] !border-[1.5px] border-lightSilver bg-whiteSmoke px-[2px] py-[2.5px] text-[14px] text-darkCharcoal'
                      key={name}
                    >
                      <span className='text-[14px]'>{renderFileIcon(name)}</span>
                      {name.length > 8 ? <>{name.slice(0, 7)}..</> : <>{name}</>}
                      <span onClick={() => handleRemoveFile(index)} className='cursor-pointer text-[14px] text-slatyGrey'>
                        <ClearIcon />
                      </span>
                    </span>
                  ))}
              </span>
            )}

            <div className={`bottom-0 z-[3] mt-[10px] flex items-center justify-between pb-2`}>
              <WatcherListDropdown
                enableCheckboxes
                selectedStates={selectedAssignees}
                setSelectedStates={handleSetValue}
                userData={watcherList}
                onApply={handleWatcherSubmit}
                loaderStatus={watcherLoader}
                dropdownAssignUserRef={dropdownAssignUserRef}
                isOpenAssignUserDropDown={isOpenAssignUserDropDown}
                setIsOpenAssignUserDropDown={setIsOpenAssignUserDropDown}
                disabled={watcherList.length > 0 ? false : true}
              />

              <div className={`flex h-12 items-center gap-4`}>
                {isInformalCreate && <Tooltip
                  position='top'
                  content='Informal'
                  className={`${newText !== '' ? 'cursor-pointer' : 'pointer-events-none'
                    } !py-2 !pl-0 !pr-0 !font-proxima !text-[14px]`}
                >
                  <span onClick={() => handleAIText('Informal'.toLowerCase())}>
                    <InformalIcon />
                  </span>
                </Tooltip>}

                <Tooltip
                  position='top'
                  content='Attachments'
                  className={`${!listLoader ? 'cursor-pointer' : 'pointer-events-none'
                    } !py-2 !pl-0 !pr-0 !font-proxima !text-[14px]`}
                >
                  <label htmlFor='fileInput' className='cursor-pointer'>
                    <AttachIcon />
                  </label>
                </Tooltip>

                <span className={`${isSpeechToTextCreate ? "block" : "hidden"} ${!listLoader ? 'cursor-pointer' : 'pointer-events-none'}`}>
                  {isRecording ? (
                    <span className='flex' onClick={stopRecording}>
                      <MicrophoneIcon fill='#DC3545' />
                      {isRecording && <span className='text-[14px] text-gray-400'>{time}</span>}
                    </span>
                  ) : (
                    <span className='flex' onClick={startRecording}>
                      <MicrophoneIcon fill='#6E6D7A' />
                    </span>
                  )}
                </span>

                <Button
                  variant='btn-primary'
                  className={`${isQueriesCreate ? "block" : "hidden"} btn-md rounded-md disabled:opacity-50`}
                  onClick={() => handleSubmit(2)}
                  disabled={newText !== '' || fileNames.length > 0 ? (loader ? true : false) : true}
                >
                  {loader ? (
                    <div className={`flex w-full items-center justify-center`}>
                      <div className='animate-spin '>
                        <SpinnerIcon bgColor='#FFF' />
                      </div>
                    </div>
                  ) : (
                    <SendIcon />
                  )}
                </Button>

                <input
                  type='file'
                  multiple
                  id='fileInput'
                  ref={fileInputRef}
                  className='hidden'
                  onChange={handleFileInputChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {isSummaryModalOpen && (
        <Modal isOpen={isSummaryModalOpen} onClose={modalClose} className='flex w-[70%] justify-center'>
          <ModalTitle className='py-3 pl-4 pr-1 font-bold'>
            <div>Activity Summary</div>
            <div onClick={modalClose}>
              <Close variant='medium' />
            </div>
          </ModalTitle>

          <ModalContent className='custom-scroll-PDF my-5 max-h-[200px] overflow-y-scroll px-4'>
            {summaryModelData}
          </ModalContent>
        </Modal>
      )}
      <DrawerOverlay isOpen={isSummaryModalOpen} />
    </>
  )
}

export default ActivityDrawer
