/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */

'use client'
import agent from '@/api/axios'
import BiIcon from '@/assets/Icons/Product Icons/BIIcon'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Avatar, Radio, Tooltip, Typography } from 'pq-ap-lib'
import { useEffect, useRef, useState } from 'react'
import CandyBox from '../assets/Icons/CandyBox'
import HelpIcon from '../assets/Icons/HelpIcon'
import PQLogo from '../assets/Icons/PQLogo'
import APIcon from '../assets/Icons/Product Icons/APIcon'
import HelpVector from '../assets/Icons/VectorHelp'
import LogoutVector from '../assets/Icons/VectorLogout'
import NewVector from '../assets/Icons/VectorNew'
import { handleSignOut } from '@/actions/server/auth'

interface ProfileData {
  id: number
  first_name: string
  last_name: string
  phone: string
  email: string
  address: string
  country_id: string
  state_id: string
  city_id: string
  postal_code: string
  time_zone: string
  products: Product[]
}

interface Product {
  name: string
}

const Page = ({ onData, isFormOpen }: any) => {
  const router = useRouter()
  const pathname = usePathname()
  const toggleRef = useRef<HTMLDivElement>(null)

  const [toggleCandyBoxChange, setToggleCandyBoxChange] = useState<boolean>(false)
  const [toggleHelpChange, setToggleHelpChange] = useState<boolean>(false)
  const [toggleProfileChange, setToggleProfileChange] = useState<boolean>(false)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const getProfileData = async () => {
    try {
      const response = await agent.APIs.getUserProfile()
      const data = response.ResponseData
      setProfileData(data)
      onData(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleRadioChange = (productName: string, isMapped: boolean) => {
    setSelectedProduct(productName)
  }

  const handleToggleChange = (productId: string) => {
    if (productId === 'CandyBox') {
      setToggleCandyBoxChange(!toggleCandyBoxChange)
      setToggleHelpChange(false)
      setToggleProfileChange(false)
    } else if (productId === 'Help') {
      setToggleHelpChange(!toggleHelpChange)
      setToggleCandyBoxChange(false)
      setToggleProfileChange(false)
    } else if (productId === 'ProfileMenu') {
      setToggleProfileChange(!toggleProfileChange)
      setToggleHelpChange(false)
      setToggleCandyBoxChange(false)
    }
  }

  const manageCompany = () => {
    router.push('/manage/companies')
  }


  const productRadioData = profileData?.products.map((product: any) => {
    const productClassName = selectedProduct === product.name ? 'text-primary' : ''
    return (
      <div className='flex justify-center pt-3' key={product.id} onClick={() => handleRadioChange(product.name, product.is_mapped)}>
        <div className={`-ml-2 text-sm ${productClassName}`}>
          <Radio
            id={`${product.name}`}
            name='products'
            label={`${product.name}`}
            onChange={() => {
              handleRadioChange(product.name, product.is_mapped)
            }}
            defaultChecked={product.is_mapped}
          />
        </div>
      </div>
    )
  })

  const productItems = profileData?.products.map((product: any, index) => {
    return (
      <Link href='/products' key={product.id}>
        <li
          className={`flex w-full px-3 py-2 ${index < profileData.products.length - 1 ? 'border-b border-b-lightSilver' : ''
            }  cursor-pointer hover:bg-lightGray`}
          key={product.id}
        >
          {product.name === 'PathQuest BI' && <BiIcon bgColor={'white'} />}
          {product.name === 'PathQuest AP' && <APIcon bgColor={'white'} />}
          <div className='ml-2 flex cursor-pointer items-center justify-center'>
            <Typography type='label' className='inline-block cursor-pointer text-xs'>
              {product.name}
            </Typography>
          </div>
        </li>
      </Link>
    )
  })

  const clickOutside = () => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toggleRef.current && !toggleRef.current.contains(event.target as Node)) {
        setToggleCandyBoxChange(false)
        setToggleHelpChange(false)
        setToggleProfileChange(false)
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }

  const handleResize = () => {
    setIsOpen(false)
    setToggleCandyBoxChange(false)
    setToggleHelpChange(false)
    setToggleProfileChange(false)
  }

  const logout = async () => {
    localStorage.removeItem('UserId')
    localStorage.removeItem('previousUrl')
    localStorage.removeItem('OrgId')
    localStorage.removeItem('IsAdmin')
    localStorage.removeItem('IsOrgAdmin')
    localStorage.removeItem('qbotoken')

    localStorage.removeItem('persist:root')
    localStorage.removeItem('CompanyId')
    localStorage.removeItem('qbcode')
    localStorage.removeItem('realmId')
    localStorage.removeItem('state')
    await handleSignOut()
  }

  useEffect(() => {
    clickOutside()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    getProfileData()
  }, [isFormOpen])

  return (
    <div>
      <nav className='flex  w-full flex-wrap items-center justify-between border-b border-b-lightSilver p-2'>
        <div className='ml-3 flex w-auto flex-shrink-0 cursor-pointer items-center text-white'>
          <PQLogo />
        </div>

        <div className='mr-4 flex w-auto flex-shrink-0  justify-end gap-1.5 xs:!hidden xsm:!flex lg:flex lg:w-auto lg:items-center '>
          {/* {pathname != '/products' && (
            <button onClick={manageCompany} className='rounded-md bg-blue-500 p-2'>
              Manage Companies
            </button>
          )} */}
          {/* <div className='flex h-8 w-8 cursor-pointer items-center justify-center' onClick={() => handleToggleChange('CandyBox')}>
            <Tooltip content='PathQuest Apps' position='left'>
              <CandyBox />
            </Tooltip>
          </div>
          <div className='flex h-8 w-8 cursor-pointer items-center justify-center' onClick={() => handleToggleChange('Help')}>
            <div>
              <HelpIcon />
            </div>
          </div> */}
          <div
            className='flex h-8 w-8 cursor-pointer items-center justify-center'
            onClick={() => handleToggleChange('ProfileMenu')}
          >
            {profileData && profileData?.first_name != '' ? (
              <Avatar name={`${profileData?.first_name} ${profileData?.last_name}`} variant='small' />
            ) : (
              <Avatar imageUrl='' variant='small' />
            )}
          </div>
        </div>

        {isOpen ? (
          <div
            className=' absolute right-2 top-14 z-50 -mt-3 flex h-auto w-auto items-center justify-center rounded-md border border-lightSilver bg-white px-4 py-2 shadow-md'
            ref={toggleRef}
          >
            <div className='mr-2 flex flex-col items-start justify-center' onClick={() => handleToggleChange('CandyBox')}>
              <CandyBox />
            </div>
            <div className='mx-2 flex flex-col items-start justify-center' onClick={() => handleToggleChange('Help')}>
              <HelpIcon isActive={toggleHelpChange} />
            </div>
            <div className='ml-2 flex flex-col items-start justify-center' onClick={() => handleToggleChange('ProfileMenu')}>
              {profileData && profileData?.first_name === '' ? (
                <Avatar name={`${profileData?.first_name} ${profileData?.last_name}`} variant='small' />
              ) : (
                <Avatar imageUrl='' variant='small' />
              )}
            </div>
          </div>
        ) : (
          ' '
        )}

        <div className='hidden h-auto w-auto xs:!flex xsm:!hidden'>
          <button
            className='group flex h-8 w-8 flex-col items-center justify-center rounded '
            onClick={() => {
              setIsOpen(!isOpen)
            }}
          >
            <div
              className={`ease my-0.5 h-1 w-5 transform rounded-full bg-[#333333] transition duration-300 ${isOpen ? 'translate-y-2 rotate-45 opacity-50 group-hover:opacity-100' : 'opacity-50 group-hover:opacity-100'
                }`}
            />
            <div
              className={`ease my-0.5 h-1 w-5 transform rounded-full bg-[#333333] transition duration-300 ${isOpen ? 'opacity-0' : 'opacity-50 group-hover:opacity-100'
                }`}
            />
            <div
              className={`ease my-0.5 h-1 w-5 transform rounded-full bg-[#333333] transition duration-300 ${isOpen ? '-translate-y-2 -rotate-45 opacity-50 group-hover:opacity-100' : 'opacity-50 group-hover:opacity-100'
                }`}
            />
          </button>
        </div>
      </nav>

      {/* CandyBox List Group */}
      <div className={`absolute z-50 flex ${isOpen && 'right-4 top-24'} right-24 -mt-3`} ref={toggleRef}>
        <div
          className={`${toggleCandyBoxChange ? 'visible flex items-center justify-center' : 'hidden'
            } h-auto w-fit rounded-md border border-lightSilver bg-white p-4 shadow-md`}
        >
          <div className='h-auto w-52'>
            <ul className='w-52'>{productItems}</ul>
          </div>
        </div>
      </div>

      {/* Help List Group */}
      <div className={`absolute z-50 flex ${isOpen && 'right-4 top-24'} right-16 -mt-3 `} ref={toggleRef}>
        <div
          className={`${toggleHelpChange ? 'visible flex items-center justify-center' : 'hidden'
            } h-auto w-fit rounded-md border border-lightSilver bg-white py-2 shadow-md`}
        >
          <div className='h-auto w-40'>
            <ul className='w-40'>
              <li className='flex h-9 w-full px-3 hover:bg-lightGray'>
                <div className='flex items-center justify-center '>
                  <NewVector />
                </div>
                <div className='ml-2 flex items-center justify-center'>
                  <Typography type='label' className='inline-block text-xs'>
                    What&rsquo;s new
                  </Typography>
                </div>
              </li>
              <li className='flex h-9 w-full px-3 hover:bg-lightGray'>
                <div className='flex items-center justify-center '>
                  <HelpVector />
                </div>
                <div className='ml-2 flex items-center justify-center'>
                  <Typography type='label' className='inline-block text-xs'>
                    Help on this page
                  </Typography>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Profile Menu List Group */}
      <div className={`absolute z-50 flex ${isOpen && 'right-4 top-24'} right-4 -mt-3`} ref={toggleRef}>
        <div
          className={`${toggleProfileChange ? 'visible flex items-center justify-center' : 'hidden'
            } h-auto w-fit rounded-md border border-lightSilver bg-white pt-4 shadow-md`}
        >
          <div className='h-auto w-[220px]'>
            <ul className='w-[220px]'>
              <li className='flex w-full border-b border-b-lightSilver px-3 pb-3  pt-2'>
                <div className='ml-2 flex flex-col items-start justify-center'>
                  <Typography type='label' className='inline-block text-sm font-light opacity-60'>
                    Signed in as
                  </Typography>
                  <Typography type='label' className='inline-block text-base font-semibold'>
                    {profileData?.first_name} {profileData?.last_name}
                  </Typography>
                </div>
              </li>
              <Link href='/profile'>
                <li className={`${pathname === "/profile" ? "bg-whiteSmoke text-primary" : ""} flex h-12 w-auto border-b border-b-lightSilver px-3 py-2 hover:bg-lightGray hover:text-primary`}>
                  <div className='ml-2 flex items-center justify-center'>
                    <Typography type='label' className='inline-block cursor-pointer text-sm font-normal'>
                      My Profile
                    </Typography>
                  </div>
                </li>
              </Link>
              {/* <li className='flex h-12 w-auto border-b border-b-lightSilver px-3 py-2 hover:bg-lightGray hover:text-primary'>
                <div className='ml-2 flex items-center justify-center '>
                  <Typography type='label' className='inline-block cursor-pointer text-sm font-normal'>
                    Manage User
                  </Typography>
                </div>
              </li>
              <li className='flex w-full border-b border-b-lightSilver px-3 pb-3  pt-2'>
                <div className='ml-2 flex flex-col items-start justify-center'>
                  <Typography type='label' className='inline-block text-base font-semibold'>
                    Default Settings
                  </Typography>
                  {productRadioData}
                </div>
              </li> */}
              <li className='flex h-12 w-full select-none rounded-b-md px-3 hover:bg-lightGray'>
                <div className='ml-3 flex items-center justify-center'>
                  <LogoutVector />
                </div>
                <div className='ml-2 flex select-none items-center justify-center font-normal' onClick={() => logout()}>
                  <Typography
                    type='label'
                    className='inline-block cursor-pointer text-sm font-normal hover:font-bold hover:text-[#fb2424]'
                  >
                    Logout
                  </Typography>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
