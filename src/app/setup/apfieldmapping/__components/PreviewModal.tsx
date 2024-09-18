import ImageIcon from '@/assets/Icons/ImageIcon'
import {
  CheckBox,
  Close,
  DataTable,
  Datepicker,
  Modal,
  ModalContent,
  ModalTitle,
  Radio,
  Select,
  Text,
  Typography,
  Uploader,
} from 'pq-ap-lib'
import React from 'react'
import * as TypeOfField from '@/data/fieldMapping'

interface DrawerProps {
  onOpen: boolean
  onClose: () => void
  mainFields: any[]
  lineItemFields: any[]
}

const { dropdown, date, text, file, checkbox, radio } = TypeOfField

const PreviewModal: React.FC<DrawerProps> = ({ onOpen, onClose, mainFields, lineItemFields }) => {
  const columns: any = [
    {
      header: '#',
      accessor: 'Id',
      colStyle: "!pl-5",
    },
    ...lineItemFields.map((field) => ({
      header: field.Label,
      accessor: field.Label.toLowerCase(),
      colStyle: "!tracking-[0.02em]",
    })),
  ]
  const data: any = {}
  lineItemFields.forEach((field) => {
    data[field.Label.toLowerCase()] = '0.00'
  })

  data['Id'] = <label className='pl-3 font-proxima text-darkCharcoal'>1</label>

  return (
    <Modal isOpen={onOpen} onClose={onClose} className='w-[94vw] laptop:h-[560px] laptopMd:h-[560px] lg:h-[560px] xl:h-[560px] hd:h-[678px] 2xl:h-[678px] 3xl:h-[678px]'>
      <ModalTitle className='h-[66px] p-5 font-bold'>
        <div>
          <Typography className='!font-bold !text-lg tracking-[0.02em] text-darkCharcoal'>Account Payable</Typography>
        </div>
        <div onClick={onClose}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent>
        <div className='relative flex h-full w-full flex-col'>
          {/* Main Field  */}
          <div className='flex h-[64%] border-b border-lightSilver'>
            <div className='flex w-full items-center justify-center border-r border-lightSilver'>
              <ImageIcon />
            </div>
            <div className='h-[320px] w-full px-2.5 py-5 '>
              <Typography type='h5' className='flex w-full px-2.5 !font-bold tracking-[0.02em] text-darkCharcoal'>
                Main Field
              </Typography>
              <ul className={`flex h-[96%] flex-wrap items-end overflow-y-auto`}>
                {mainFields?.length > 0
                  ? mainFields.map((item: any) => (
                    <li
                      key={item?.Id}
                      className={`flex justify-between p-2.5 ${(item.Type === 1 && item.FieldType === file) ||
                        (item.Type === 1 && item.FieldType === checkbox) ||
                        (item.Type === 1 && item.FieldType === radio)
                        ? 'w-full'
                        : item.Type === 2 && item.FieldType === checkbox
                          ? 'w-1/2'
                          : item.Type === 1
                            ? 'w-1/2'
                            : 'w-1/4'
                        } pointer-events-none`}
                    >
                      {item.FieldType === text && (
                        <div className='pointer-events-none w-full'>
                          <Text
                            id={item.Id}
                            name={item.Name}
                            label={item.Label}
                            placeholder='Please Enter'
                            className=' bg-transparent'
                            value={item.Value}
                            validate={item.IsRequired}
                            getValue={() => { }}
                            getError={() => { }}
                            hasError={undefined}
                          />
                        </div>
                      )}
                      {item.FieldType === dropdown && (
                        <div className={`${item.Options === null && 'pointer-events-none'} w-full`}>
                          <Select
                            id={item.Id}
                            name={item.Name}
                            label={item.Label}
                            validate={item.IsRequired}
                            defaultValue={0}
                            options={item.Options === null ? [] : item.Options}
                            hideIcon
                            placeholder='Please Select'
                            getValue={() => { }}
                            getError={() => { }}
                            hasError={undefined}
                          />
                        </div>
                      )}
                      {item.FieldType === checkbox && (
                        <div className='pointer-events-none w-full'>
                          <CheckBox id={item.Id} name={item.Name} label={item.Label} className='pointer-events-none !mr-10' />
                        </div>
                      )}
                      {item.FieldType === radio && (
                        <div className='pointer-events-none'>
                          <div className='mb-2'>
                            <Typography className='!text-slatyGrey'>{item.Label}</Typography>
                            {item.IsRequired && <span className='text-[16px] text-red-500'> *</span>}
                          </div>
                          <div className='flex w-80'>
                            {item.Options.map((option: any, index: number) => (
                              <Radio
                                key={option.label}
                                id={`${item.Name}-${index}`}
                                name={item.Name}
                                className='text-[14px]'
                                label={option.label}
                                onChange={(e: any) => { }}
                                defaultChecked={index === 0}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {item.FieldType === date && (
                        <div className='pointer-events-none w-full'>
                          <Datepicker
                            id={item.Id}
                            label={item.Label}
                            validate={item.IsRequired}
                            startYear={0}
                            endYear={0}
                            value={item.Value}
                            getValue={() => ''}
                            getError={() => ''}
                            hasError={undefined}
                            hideIcon
                          />
                        </div>
                      )}
                      {item.FieldType === file && (
                        <div className='w-full'>
                          <div className='mb-2'>
                            <Typography className='!text-slatyGrey'>{item.Label}</Typography>
                            {item.IsRequired && <span className='text-[16px] text-red-500'> *</span>}
                          </div>
                          <div className='pointer-events-none'>
                            <Uploader variant='small' />
                          </div>
                        </div>
                      )}
                    </li>
                  ))
                  : ''}
              </ul>
            </div>
          </div>

          {/* Line Item Fields */}
          <div className='h-full  w-full py-5'>
            <Typography type='h5' className='flex w-full px-5 !font-bold tracking-[0.02em] text-darkCharcoal'>
              Line Field Item
            </Typography>
            <div className='mt-5 overflow-x-scroll'>
              <DataTable columns={columns} data={[data]} getExpandableData={() => { }} getRowId={() => { }} />
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}

export default PreviewModal
