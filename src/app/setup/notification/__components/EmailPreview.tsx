'use client'

import { Typography } from 'pq-ap-lib'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { getCurrentYear } from '@/data/notification'

interface EmailPreviewProps {
  content: string
  emailSubject: string
  imageUrl: any
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ content, emailSubject, imageUrl }) => {
  return (
    <div className='h-full w-1/2 overflow-y-auto border-r-[1px] border-lightSilver p-5'>
      <Typography type='h5' className='!text-base !font-bold !tracking-[0.02em] !text-darkCharcoal'>
        Template Preview
      </Typography>
      <div className='mt-5 rounded-md border-[1px] border-lightSilver bg-whiteSmoke p-5'>
        <Typography type='h6' className='!font-semibold !tracking-[0.02em] !text-darkCharcoal'>
          {emailSubject}
        </Typography>
      </div>
      <div className='mt-2 rounded-md border-[1px] border-lightSilver bg-whiteSmoke pt-[30px] '>
        {imageUrl && (
          <div className='mx-4 mb-4 h-16 w-36 overflow-hidden'>
            <img src={imageUrl} alt='logo' />
          </div>
        )}
        <div
          className='h-[calc(100vh-320px)] w-full overflow-y-auto break-all px-4 font-proxima'
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div className='flex items-center sticky h-[200px] flex-col justify-center gap-1 bg-darkSmoke px-16 py-2'>
          <label className='font-proxima text-[10.31px] tracking-[0.02em] text-darkCharcoal leading-tight'>
            <b>Attention</b>: This is a system generated email. We request you not to reply to this email. The information in this
            email is confidential and may be legally privileged. It is intended solely for the intended recipient. Access to this
            email by anyone other than the intended recipient is unauthorized. In the event you have received this email by
            mistake you are requested to immediately inform Support Team of the same by forwarding this mail; you should not copy
            or use it for any purpose, nor disclose its contents to any other person and you are required to delete it from your
            system permanently.
          </label>
          <div className='items-center flex justify-center'>
            <Typography className='text-darkCharcoal'>{getCurrentYear} © <label className='text-primary underline'>PathQuest</label></Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailPreview