import React from 'react'
import { Close, Modal, ModalContent, ModalTitle, Typography } from 'pq-ap-lib'

import ProfileForm from '../Forms/ProfileForm'
import PasswordForm from '../Forms/PasswordForm'

import { ProfileData } from '@/app/profile/__components/profile-form'

type DrawerProps = {
  isOpen: boolean
  edit: string
  profileData?: ProfileData | null
  handleEdit: (arg1: boolean, arg2: string) => void
}

const Drawer = ({ isOpen, edit, handleEdit, profileData }: DrawerProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => handleEdit(false, '')}
      width={edit.toLowerCase() !== 'password' ? '952px' : ''}
      Height={edit.toLowerCase() !== 'password' ? '628px' : ''}
      noneOutSideClicked
    >
      <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
        <div className='font-proxima flex cursor-pointer items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'> {edit.toLowerCase() === 'profile' ? 'Edit Profile' : edit.toLowerCase() === 'password' && 'Reset Password'}</div>
        <div className='pt-2.5' onClick={() => handleEdit(false, '')}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent className=''>
        {edit.toLowerCase() === 'profile' && <ProfileForm profileData={profileData} handleEdit={handleEdit} />}
        {edit.toLowerCase() === 'password' && <PasswordForm profileData={profileData} handleEdit={handleEdit} />}
      </ModalContent>
    </Modal>
  )
}

export default Drawer
