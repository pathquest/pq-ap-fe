'use client'
import agent from '@/api/axios'
import APIcon from '@/assets/Icons/Product Icons/APIcon'
import BiIcon from '@/assets/Icons/Product Icons/BIIcon'
import NavBar from '@/components/Navbar'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Close,
  Loader,
  Modal,
  ModalAction,
  ModalContent,
  ModalTitle,
  Radio,
  Select,
  Text,
  Toast,
  Typography,
} from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'

interface ProfileData {
  id: number
  products: Product[]
}

interface Product {
  [x: string]: unknown
  name: string
}
const ProductList: React.FC = () => {
  const router = useRouter()
  const { data: session, update }: any = useSession()

  useEffect(() => {
    setClicked(true)
    userConfig()
  }, [])

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [productData, setProductData] = useState([])
  const [clicked, setClicked] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [optionError, setOptionError] = useState<boolean>(false)
  const [optionId, setOptionId] = useState<number>(0)
  const [orgTypeId, setOrgTypeId] = useState<number>(1)
  const [orgIndustryList, setOrgIndustryList] = useState([])
  const [orgName, setOrgName] = useState<string>('')
  const [orgNameErr, setOrgNameErr] = useState(false)

  const getProductData = async () => {
    setClicked(true)
    try {
      const response = await agent.APIs.getProducts()
      if (response.ResponseStatus === 'Success') {
        const data = response.ResponseData
        setProductData(data)
        setClicked(false)
      }
    } catch (error) {
      setClicked(false)
      console.error(error)
    }
  }

  // user config check
  const userConfig = async () => {
    try {
      const response = await agent.APIs.getUserConfig()
      if (response.ResponseStatus === 'Success') {
        await update({
          ...session.user,
          org_id: response.ResponseData.OrganizationId,
          org_name: response.ResponseData.OrganizationName,
          user_id: response.ResponseData.UserId,
          is_admin: response.ResponseData.IsAdmin,
          is_organization_admin: response.ResponseData.IsOrganizationAdmin,
          role_id: response.ResponseData.RoleId
        })
        localStorage.setItem('UserId', response.ResponseData.UserId)
        localStorage.setItem('OrgId', response.ResponseData.OrganizationId)
        localStorage.setItem('IsAdmin', response.ResponseData.IsAdmin)
        localStorage.setItem('IsOrgAdmin', response.ResponseData.IsOrganizationAdmin)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (profileData) {
      const isMapped = profileData.products.some((product) => product.is_mapped)

      if (isMapped) {
        setClicked(false)
        router.push('/profile')
      }
    } else {
      setClicked(false)
    }
  }, [profileData])

  const orgModalClose = () => {
    setOrgNameErr(false)
    setOptionError(false)
    setIsOpen(false)
  }

  const handleOrgDropDown = async () => {
    try {
      const response = await agent.APIs.getIndustryTypes()

      if (response.ResponseStatus === 'Success') {
        let responseData = await response.ResponseData
        if (!responseData) {
          responseData = null
        } else {
          setOrgIndustryList(response.ResponseData)
        }
      }
    } catch (error: any) {
      console.error(error)
    }
  }

  const productMapped = async () => {
    try {
      const mappedData = {
        userId: profileData?.id,
        productId: selectedProductId,
        isMap: true,
      }

      const response = await agent.APIs.getUserProducts(mappedData)

      if (response.ResponseStatus === 'Success') {
        router.push('/profile')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSaveOrg = async () => {
    orgName.trim().length <= 0 && setOrgNameErr(true)
    optionId <= 0 && setOptionError(true)
    if (orgName.length > 0 && optionId > 0) {
      try {
        const response = await agent.APIs.organizationSave({
          id: 0,
          name: orgName,
          productId: 2,
          industryType: optionId,
          parentOrgId: null,
        })

        if (response.ResponseStatus === 'Success') {
          productMapped()
          router.push('/profile')
        } else {
          const data = response.Message
          if (data === null) {
            Toast.error('Please try again later.')
          } else {
            Toast.error(data)
          }
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const productItems = productData.map((product: any) => {
    return (
      <div
        className={`h-auto w-auto rounded-lg border ${selectedProduct === product.name ? 'border-primary shadow-lg' : 'border-lightSilver'
          } group cursor-pointer  hover:border-primary hover:shadow-lg`}
        onClick={() => handleRadioChange(product.name, product.id)}
        key={product.Id}
      >
        <div className='flex h-8 justify-end pr-5 pt-3'>
          <div className={`${selectedProduct === product.name ? 'opacity-100' : 'opacity-0'} inset-0 group-hover:opacity-100`}>
            <label className='group-hover:text-primary'>
              <Radio
                id={product.name}
                name='products'
                checked={selectedProduct === product.name}
                onChange={(e: any) => {
                  handleRadioChange(product.name, product.id)
                }}
              />
            </label>
          </div>
        </div>
        <div className='flex h-[65px] w-auto justify-center pb-3'>
          {product.name === 'PathQuest BI' && <BiIcon bgColor={'#F4F4F4'} />}
          {product.name === 'PathQuest AP' && <APIcon bgColor={'#F4F4F4'} />}
        </div>
        <div className='flex justify-center pb-5'>
          <Typography type='label' className='inline-block text-center'>
            {product.name}
          </Typography>
        </div>
      </div>
    )
  })

  const handleRadioChange = async (productName: string, productId: string) => {
    setSelectedProduct(productName)
    setSelectedProductId(productId)
    setIsOpen(true)
    handleOrgDropDown()
  }

  const globalData = (data: any) => {
    setProfileData(data)
  }

  useEffect(() => {
    getProductData()
  }, [])

  const handleRadioId = (e: any) => {
    if (e.target.value === 'Business') {
      setOrgTypeId(1)
    } else {
      setOrgTypeId(2)
    }
  }

  return (
    <>
      {clicked ? (
        <span className='flex min-h-screen items-center justify-center'>
          <Loader helperText />
        </span>
      ) : (
        <>
          <NavBar onData={globalData} />
          <div className='w-auto py-6  xs:mx-[30px] sm:mx-[90px] md:mx-[100px] lg:mx-[138px] '>
            <Typography type='h4'>Unleash the Power of Our Top Products - Your Ultimate Solutions!</Typography>
            <div className='pt-2 xs:w-full sm:w-[80%] md:w-[63%] lg:w-[63%]'>
              <Typography type='label' className='inline-block '>
                PathQuest simplifies accounting and financial reporting, delivers insights and forecasts, and provides real-time
                spend insights while automating accounts payable invoices and avoiding cash flow crises and manual inefficiencies.
              </Typography>
            </div>
          </div>

          <div className='grid w-auto gap-4 xs:mx-[30px] xs:mb-[30px] sm:mx-[90px] sm:grid-cols-2 md:mx-[100px] md:grid-cols-2 lg:mx-[138px] lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4'>
            {productItems}
          </div>
        </>
      )}
      {isOpen && (
        <>
          <Modal isOpen={isOpen} onClose={orgModalClose}>
            <ModalTitle>
              <div className='p-5 text-xl font-medium'>Add Organization</div>
              <div onClick={orgModalClose}>
                <div className='p-3'>
                  <Close variant='medium' />
                </div>
              </div>
            </ModalTitle>
            <ModalContent>
              <div className='px-5 pb-4 pt-5'>
                <span className='font-bold'>I&apos;m with a</span>
              </div>
              <div className='mb-5 flex px-2 pb-3'>
                <Radio
                  id='Business'
                  onChange={(e: any) => handleRadioId(e)}
                  name='organization'
                  label='Business'
                  defaultChecked
                ></Radio>
                <Radio id='Accounting_Firm' name='organization' label='Accounting Firm'></Radio>
              </div>
              <div className='px-5 pb-5'>
                <Text
                  validate
                  label='Organization Name'
                  maxChar={100}
                  placeholder='Please Enter Organization Name'
                  name='text'
                  getValue={(e: any) => setOrgName(e)}
                  hasError={orgNameErr}
                  getError={(e: any) => { }}
                  value={orgName}
                ></Text>
              </div>
              <div className='overflow-visible px-5 pb-5'>
                <Select
                  className='!overflow-visible'
                  id='basic'
                  type='icons'
                  options={orgIndustryList}
                  validate
                  label='Industry type'
                  search
                  defaultValue={optionId}
                  getValue={(value: any) => setOptionId(value)}
                  hasError={optionError}
                  getError={(e: any) => { }}
                />
              </div>
            </ModalContent>
            <ModalAction className='p-5'>
              <Button onClick={orgModalClose} className='mx-2  rounded-full uppercase' variant='btn-outline-primary'>
                Cancel
              </Button>
              <Button className='ml-2 rounded-full !border-2 uppercase' onClick={handleSaveOrg} variant='btn-primary'>
                Save
              </Button>
            </ModalAction>
          </Modal>
        </>
      )}
    </>
  )
}
export default ProductList
