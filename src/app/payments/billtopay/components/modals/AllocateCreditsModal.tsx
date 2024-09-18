import AttachIcon from '@/assets/Icons/billposting/AttachIcon'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { Badge, Button, CheckBox, Close, DataTable, Modal, ModalAction, ModalContent, ModalTitle, Text, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'

interface ActionsProps {
  onOpen: boolean
  onClose: any
  vendorId?: string
  vendorCreditDataList?: any
  handleSendData?: any
  amountToPay?: any
}

const AllocateCreditsModal: React.FC<ActionsProps> = ({
  onOpen,
  onClose,
  vendorId,
  vendorCreditDataList,
  handleSendData,
  amountToPay,
}) => {
  const [selectedRows, setSelectedRows] = useState<any>([])
  const [isAllRowSelected, setIsAllRowSelected] = useState<boolean>(false)
  const [dataList, setDataList] = useState<any[]>([])
  const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(true)
  const [totalRemainingCredit, setTotalRemainingCredit] = useState(0)
  const [totalAvailCredit, setTotalAvailCredit] = useState(0)
  const [hoveredRow, setHoveredRow] = useState<any>({})
  const [enteredCreditData, setEnteredCreditData] = useState<any>([])
  const [currAmountToPay, setCurrAmountToPay] = useState<string>('')
  const [originalAmountToPay, setOriginalAmountToPay] = useState<number>(0)

  const handleClose = () => {
    onClose()
    setIsSaveDisabled(true)
    setTotalRemainingCredit(0)
    setSelectedRows([])
    setIsAllRowSelected(false)
  }

  useEffect(() => {
    const updatedDataList = vendorCreditDataList.map((credit: any) => ({
      ...credit,
      AvailCredits: 0
    }));
    setDataList(updatedDataList);
    const totalRemainingCredit = vendorCreditDataList.reduce(
      (total: any, credit: { RemainingCredit: any }) => total + credit.RemainingCredit,
      0
    )
    setTotalRemainingCredit(totalRemainingCredit)
  }, [onOpen])

  const handleAvailCreditsChange = (rowId: number, value: any) => {
    const updatedData = dataList.map((item: any) => {
      if (item.CreditId === rowId) {
        setIsSaveDisabled(false)
        const availCredits: number = parseFloat(value) <= item.CreditsAvailable && value !== '' ? parseFloat(value) : 0
        const remainingCredit = parseFloat(item.CreditsAvailable) - availCredits
        return { ...item, AvailCredits: availCredits, RemainingCredit: remainingCredit }
      }
      return item
    })

    const updatedRow = updatedData.find((item: any) => item.CreditId === rowId)

    if (updatedRow) {
      const newDataList = dataList.map((item: any) => (item.CreditId === rowId ? updatedRow : item))

      const totalRemainingCredit = newDataList.reduce(
        (total: number, credit: { RemainingCredit: number }) => total + credit.RemainingCredit,
        0
      )

      const totalAvailCredit = newDataList.reduce(
        (total: number, credit: { AvailCredits: number }) => total + credit.AvailCredits,
        0
      )

      setTotalAvailCredit(totalAvailCredit)
      setTotalRemainingCredit(totalRemainingCredit)

      // Update only the specific row in setDataList
      setDataList((prevDataList) => prevDataList.map((item) => (item.CreditId === rowId ? updatedRow : item)))

      setIsAllRowSelected(false)
      setSelectedRows(selectedRows.filter((id: any) => id !== rowId))
    }
  }

  const handleCheckBoxClick = (rowId: number) => {
    const updatedData = dataList.map((item: any) => {
      if (item.CreditId === rowId) {
        const availCredits: number = parseFloat(item.CreditsAvailable)
        const remainingCredit = 0
        return { ...item, AvailCredits: availCredits, RemainingCredit: remainingCredit }
      }
      return item
    })
    setDataList(updatedData)
    const totalRemainingCredit = updatedData.reduce(
      (total: any, credit: { RemainingCredit: any }) => total + credit.RemainingCredit,
      0
    )
    setTotalRemainingCredit(totalRemainingCredit)
  }

  const handleSelectAll = (event: any) => {
    const newSelecteds = tableData.map((row: any) => row.CreditId)
    const updatedData = dataList.map((item: any) => {
      if (event.target.checked) {
        setIsSaveDisabled(false)
        return { ...item, AvailCredits: item.CreditsAvailable, RemainingCredit: 0 }
      } else {
        return { ...item, AvailCredits: 0, RemainingCredit: item.CreditsAvailable }
      }
    })
    const totalRemainingCredit = updatedData.reduce(
      (total: any, credit: { RemainingCredit: any }) => total + credit.RemainingCredit,
      0
    )
    const totalAvailCredit = updatedData.reduce((total: any, credit: { AvailCredits: any }) => total + credit.AvailCredits, 0)
    setTotalAvailCredit(totalAvailCredit)
    setTotalRemainingCredit(totalRemainingCredit)
    setSelectedRows(event.target.checked ? newSelecteds : [])
    setIsAllRowSelected(event.target.checked)
    setDataList(updatedData)
  }

  const handleRowSelect = (id: any) => {
    const isChecked = selectedRows.includes(id)
    let newSelected: any = []

    if (isChecked) {
      newSelected = selectedRows.filter((selectedId: any) => selectedId !== id)
      const updatedData = dataList.map((item: any) => {
        if (item.CreditId === id) {
          return { ...item, AvailCredits: 0, RemainingCredit: item.CreditsAvailable }
        }
        return item
      })
      setDataList(updatedData)
      const totalAvailCredit = updatedData.reduce((total: any, credit: { AvailCredits: any }) => total + credit.AvailCredits, 0)
      setTotalAvailCredit(totalAvailCredit)
      const totalRemainingCredit = updatedData.reduce(
        (total: any, credit: { RemainingCredit: any }) => total + credit.RemainingCredit,
        0
      )
      setTotalRemainingCredit(totalRemainingCredit)
    } else {
      newSelected = [...selectedRows, id]
      handleCheckBoxClick(id)
    }
    setSelectedRows(newSelected)
    if (newSelected.length === dataList.length) {
      setIsAllRowSelected(true)
      setIsSaveDisabled(false)
    } else {
      setIsAllRowSelected(false)
      setIsSaveDisabled(newSelected.length === 0)
    }
  }

  const columns: any = [
    {
      header: (
        <CheckBox
          id='acm-select-all'
          checked={isAllRowSelected}
          onChange={(e) => handleSelectAll(e)}
          disabled={dataList.length === 0}
        />
      ),
      accessor: 'check',
      sortable: false,
      colStyle: '!w-[50px]',
      colalign: 'center',
    },
    { header: 'Document No.', accessor: 'DocumentNo', sortable: false, colStyle: '!w-[150px] uppercase' },
    { header: 'Location', accessor: 'Location', sortable: false, colStyle: '!w-[150px] uppercase' },
    { header: 'Credits Available', accessor: 'CreditsAvailable', sortable: false, colStyle: '!w-[180px] uppercase' },
    { header: 'Avail Credits', accessor: 'AvailCredits', sortable: false, colStyle: '!w-[180px] uppercase' },
    { header: 'Remaining Credit', accessor: 'RemainingCredit', sortable: false, colStyle: '!w-[180px] uppercase' },
  ]

  useEffect(() => {
    if (onOpen) {
      setCurrAmountToPay(String(amountToPay))
      setOriginalAmountToPay(Number(amountToPay))
    }
  }, [onOpen, amountToPay])

  const handleSaveButtonClick = () => {
    if (totalAvailCredit > Number(currAmountToPay)) {
      Toast.error('Availing credit should not exceed the bill amount!')
    } else {
      const dataToSave = dataList
        .filter((item) => item.AvailCredits > 0)
        .map((item) => ({
          CreditAmount: item.AvailCredits,
          CreditId: item.CreditId,
          VendorId: vendorId,
        }))
      setEnteredCreditData(dataToSave)
      handleSendData(dataToSave, dataList, currAmountToPay)
      handleClose()
    }
  }

  const tableData = dataList.map((d: any) => {
    return {
      ...d,
      check: (
        <CheckBox
          id={`acm-${d.CreditId}`}
          checked={selectedRows.includes(d.CreditId) || isAllRowSelected}
          onChange={() => handleRowSelect(d.CreditId)}
        />
      ),
      DocumentNo: (
        <span className='flex items-center gap-1'>
          <Typography className='!text-sm'>{d.DocumentNo ?? '-'}</Typography>
          {d.AttachmentData !== null && (
            <>
              <div className='absolute -right-2 -top-3'>
                <Badge badgetype='error' variant='dot' text={d.AttachmentData?.length.toString()} />
              </div>
              <AttachIcon />
            </>
          )}
        </span>
      ),
      Location: <Typography className='cursor-pointer !text-sm'>{d.Location ?? '-'}</Typography>,
      CreditsAvailable: (
        <Typography className='!text-sm !font-bold !text-primary'>${formatCurrency(d.CreditsAvailable)}</Typography>
      ),
      AvailCredits:
        hoveredRow?.CreditId === d.CreditId ? (
          <>
            <Text
              value={d.AvailCredits !== '' || d.AvailCredits !== 0 ? d.AvailCredits : ''}
              className='relative pl-3'
              getValue={(e) => handleAvailCreditsChange(d.CreditId, e)}
              getError={() => { }}
            />
            <span className='absolute'>$</span>
          </>
        ) : (
          <span className='cursor-pointer !text-sm !font-bold !text-darkCharcoal'>${d.AvailCredits || 0}</span>
        ),
      RemainingCredit: (
        <Typography className='!text-sm !font-bold !text-darkCharcoal'>${formatCurrency(d.RemainingCredit)}</Typography>
      ),
    }
  })

  return (
    <Modal
      isOpen={onOpen}
      onClose={() => {
        handleClose()
        handleSendData(enteredCreditData, dataList, currAmountToPay)
      }}
      size='extra-lg'
    >
      <ModalTitle className='p-5'>
        <div className='flex items-center justify-center gap-5'>
          <span className='text-lg font-bold text-darkCharcoal'>Allocate Credits</span>
        </div>
        <span
          className='cursor-pointer'
          onClick={() => {
            handleClose()
            handleSendData([], dataList, amountToPay)
          }}
        >
          <Close variant='medium' />
        </span>
      </ModalTitle>

      <ModalContent className='flex flex-col mx-5'>
        <div className='relative my-5 w-[300px]'>
          <Text
            label='Bill Amount'
            id='amount-to-pay'
            placeholder='Enter Amount'
            className='pl-3 '
            value={currAmountToPay}
            getValue={(e) => {
              const regex = /^\d*\.?\d{0,2}$/
              if (regex.test(e)) {
                const enteredAmount = Number(e);
                if (enteredAmount <= originalAmountToPay) {
                  setCurrAmountToPay(e);
                  if (enteredAmount != originalAmountToPay && e != "" && enteredAmount > 0) {
                    setIsSaveDisabled(false)
                  }
                  else {
                    setIsSaveDisabled(true)
                  }
                } else {
                  setCurrAmountToPay(prevAmount => prevAmount);
                }
              }
            }}
            getError={() => { }}
          />
          <span className={`absolute left-0 top-[29px] text-slatyGrey`}>$</span>
        </div>
        <div className='custom-scroll h-[50vh] w-full overflow-y-auto max-[425px]:mx-1'>
          <div className={`mainTable ${dataList.length !== 0 && 'h-0'}`}>
            <DataTable
              columns={columns}
              data={dataList.length > 0 ? tableData : []}
              hoverEffect
              sticky
              getRowId={(value: any) => {
                setHoveredRow(value)
              }}
              getExpandableData={() => { }}
              isTableLayoutFixed
            />
          </div>

          {dataList.length === 0 && (
            <div className='flex h-[59px] w-auto items-center justify-center border-b border-b-[#ccc]'>
              No records available at the moment.
            </div>
          )}
        </div>
        <div className='flex items-center justify-end gap-5 border-t border-t-lightSilver p-5'>
          <span className='text-sm'>Total Remaining Credit</span>
          <span className='text-sm font-bold text-[#1BB55C]'>${totalRemainingCredit}</span>
        </div>
      </ModalContent>

      <ModalAction className='flex items-center gap-5 p-5'>
        <Button
          className='flex h-9 w-24 items-center justify-center rounded-full'
          variant='btn-outline-primary'
          onClick={() => {
            handleClose()
            handleSendData([], dataList, amountToPay)
          }}
        >
          Cancel
        </Button>
        <Button
          className='flex h-9 w-[85px] items-center justify-center rounded-full disabled:opacity-50'
          variant='btn-primary'
          disabled={isSaveDisabled}
          onClick={handleSaveButtonClick}
        >
          Save
        </Button>
      </ModalAction>
    </Modal>
  )
}

export default AllocateCreditsModal
