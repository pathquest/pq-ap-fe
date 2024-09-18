import AttachIcon from '@/assets/Icons/billposting/AttachIcon'
import { formatCurrency } from '@/components/Common/Functions/FormatCurrency'
import { Badge, Button, CheckBox, Close, DataTable, Modal, ModalAction, ModalContent, ModalTitle, Text, Toast, Typography } from 'pq-ap-lib'
import React, { useEffect, useState } from 'react'

interface ActionsProps {
  onOpen: boolean
  onClose: any
  vendorId: string
  vendorCreditDataList: any
  handleSendData: (creditList: any, updatedVendorCreditList: any, amount: number) => void
  amountToPay: number
}

const SingleBillPartialPayment: React.FC<ActionsProps> = ({
  onOpen,
  onClose,
  vendorId,
  vendorCreditDataList,
  handleSendData,
  amountToPay,
}) => {
  const [selectedRows, setSelectedRows] = useState<any>([])
  const [isAllRowSelected, setIsAllRowSelected] = useState<boolean>(false)
  const [creditDataList, setCreditDataList] = useState<any[]>([])
  const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(true)
  const [totalRemainingCredit, setTotalRemainingCredit] = useState<number>(0)
  const [totalAvailCredit, setTotalAvailCredit] = useState<number>(0)
  const [hoveredRow, setHoveredRow] = useState<any>({})
  const [currAmountToPay, setCurrAmountToPay] = useState<number>(0)
  const [originalAmountToPay, setOriginalAmountToPay] = useState<number>(0)
  const [editingRow, setEditingRow] = useState<{ id: number | null, field: 'payable' | 'credit' | null }>({ id: null, field: null });

  const handleClose = () => {
    onClose()
    setIsSaveDisabled(true)
    setTotalRemainingCredit(0)
    setSelectedRows([])
    setIsAllRowSelected(false)
  }

  useEffect(() => {
    if (onOpen) {
      // Initialize data from vendorCreditDataList
      const updatedDataList = vendorCreditDataList.map((credit: any) => ({
        ...credit,
        AvailCredits: 0
      }));

      // Calculate total remaining credit
      const totalRemainingCredit = vendorCreditDataList.reduce(
        (total: any, credit: any) => total + credit.RemainingCredit,
        0
      );

      // Get stored amount and credits from localStorage
      const storedAmount = Number(localStorage.getItem('billAmount'));
      const storedCredits = localStorage.getItem('availCredits');

      // Set current amount to pay
      const currentAmountToPay = storedAmount || amountToPay;

      // Parse stored credits if available
      let finalDataList = updatedDataList;
      if (storedCredits) {
        const parsedCredits = JSON.parse(storedCredits);
        finalDataList = updatedDataList.map((item: any) => {
          const storedCredit = parsedCredits.find((credit: any) => credit.CreditId == item.CreditId);
          return storedCredit ? { ...item, AvailCredits: storedCredit.CreditAmount } : item;
        });
      }

      // Update state
      setCreditDataList(finalDataList);
      setTotalRemainingCredit(totalRemainingCredit);
      setCurrAmountToPay(currentAmountToPay);
      setOriginalAmountToPay(Number(amountToPay));
    }
  }, [onOpen, amountToPay, vendorCreditDataList]);

  const handleAvailCreditsChange = (rowId: number, value: any) => {
    const updatedData = creditDataList.map((item: any) => {
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
      const newDataList = creditDataList.map((item: any) => (item.CreditId === rowId ? updatedRow : item))

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
      setCreditDataList((prevDataList) => prevDataList.map((item) => (item.CreditId === rowId ? updatedRow : item)))

      setIsAllRowSelected(false)
      setSelectedRows(selectedRows.filter((id: any) => id !== rowId))
    }
  }

  const handleCheckBoxClick = (rowId: number) => {
    const updatedData = creditDataList.map((item: any) => {
      if (item.CreditId === rowId) {
        const availCredits: number = parseFloat(item.CreditsAvailable)
        const remainingCredit = 0
        return { ...item, AvailCredits: availCredits, RemainingCredit: remainingCredit }
      }
      return item
    })
    setCreditDataList(updatedData)
    const totalRemainingCredit = updatedData.reduce(
      (total: any, credit: { RemainingCredit: any }) => total + credit.RemainingCredit,
      0
    )
    setTotalRemainingCredit(totalRemainingCredit)
  }

  const handleSelectAll = (event: any) => {
    const newSelecteds = tableData.map((row: any) => row.CreditId)
    const updatedData = creditDataList.map((item: any) => {
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
    setCreditDataList(updatedData)
  }

  const handleRowSelect = (id: any) => {
    const isChecked = selectedRows.includes(id)
    let newSelected: any = []

    if (isChecked) {
      newSelected = selectedRows.filter((selectedId: any) => selectedId !== id)
      const updatedData = creditDataList.map((item: any) => {
        if (item.CreditId === id) {
          return { ...item, AvailCredits: 0, RemainingCredit: item.CreditsAvailable }
        }
        return item
      })
      setCreditDataList(updatedData)
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
    if (newSelected.length === creditDataList.length) {
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
          disabled={creditDataList.length === 0}
        />
      ),
      accessor: 'check',
      sortable: false,
      colStyle: '!w-[50px]',
      colalign: 'center',
    },
    { header: 'Document No.', accessor: 'DocumentNo', sortable: false, colStyle: '!w-[150px] uppercase !tracking-[0.02em]' },
    { header: 'Location', accessor: 'Location', sortable: false, colStyle: '!w-[150px] uppercase !tracking-[0.02em]' },
    { header: 'Credits Available', accessor: 'CreditsAvailable', sortable: false, colalign: 'right', colStyle: '!w-[180px] uppercase !tracking-[0.02em]' },
    { header: 'Avail Credits', accessor: 'AvailCredits', sortable: false, colalign: 'right', colStyle: '!w-[180px] uppercase !tracking-[0.02em]' },
    { header: 'Remaining Credit', accessor: 'RemainingCredit', sortable: false, colalign: 'right', colStyle: '!w-[180px] uppercase !tracking-[0.02em]' },
  ]

  const handleSaveButtonClick = () => {
    if (totalAvailCredit > currAmountToPay) {
      Toast.error('Availing credit should not exceed the bill amount!')
    } else {
      const dataToSave = creditDataList
        .filter((item) => item.AvailCredits > 0)
        .map((item) => ({
          CreditAmount: item.AvailCredits,
          CreditId: item.CreditId,
          VendorId: vendorId,
        }))

      // Store in local storage
      localStorage.setItem('billAmount', currAmountToPay + "")
      localStorage.setItem('availCredits', JSON.stringify(dataToSave))

      handleSendData(dataToSave, creditDataList, currAmountToPay)
      handleClose()
    }
  }

  const tableData = creditDataList.map((d: any) => {
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
        <span className='flex items-center gap-1 relative'>
          <Typography className='!text-sm'>{d.DocumentNo ?? '-'}</Typography>
          {d.AttachmentData !== null && (
            <>
              <div className='absolute -right-2.5 -top-2.5'>
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
        <div className={`w-full ${hoveredRow?.CreditId === d.CreditId && (editingRow.id !== d.CreditId || editingRow.field !== 'credit') ? "border-b border-lightSilver" : ""}`}>
          {editingRow.id === d.CreditId && editingRow.field === 'credit' ? (
            <div className='w-full mt-1'>
              <Text
                value={d.AvailCredits !== '' && d.AvailCredits !== 0 ? d.AvailCredits.toString() : ''}
                className='px-1 text-right'
                getValue={(value) => handleAvailCreditsChange(d.CreditId, value)}
                getError={() => { }}
                autoFocus
                onBlur={() => setEditingRow({ id: null, field: null })}
              />
            </div>
          ) : (
            <div
              className='w-full flex justify-end cursor-pointer !text-sm !font-bold !text-darkCharcoal mt-1'
              onClick={() => setEditingRow({ id: d.CreditId, field: 'credit' })}>
              ${formatCurrency(d.AvailCredits || 0)}
            </div>
          )}
        </div>,
      RemainingCredit: (
        <Typography className='!text-sm !font-bold !text-darkCharcoal'>${formatCurrency(d.RemainingCredit)}</Typography>
      ),
    }
  })

  const modalClose = () => {
    handleClose()
    const storedAmount = Number(localStorage.getItem('billAmount'));
    // Set current amount to pay
    const currentAmountToPay = storedAmount ?? 0;
    handleSendData([], creditDataList, currentAmountToPay)
  }

  return (
    <Modal isOpen={onOpen} onClose={modalClose} width='94vw' Height='600px'>
      <ModalTitle className='!h-[64px] laptop:py-3 laptopMd:py-3 lg:py-3 xl:py-3 hd:py-[21px] 2xl:py-[21px] 3xl:py-[21px] laptop:px-4 laptopMd:px-4 lg:px-4 xl:px-4 hd:px-5 2xl:px-5 3xl:px-5'>
        <div className='font-proxima flex items-center laptop:text-base laptopMd:text-base hd:text-lg 2xl:text-lg 3xl:text-lg laptop:font-semibold laptopMd:font-semibold hd:font-bold 2xl:font-bold 3xl:font-bold tracking-[0.02em] text-darkCharcoal'>Partial payment with manual credit adjustment</div>
        <div className='pt-2.5' onClick={modalClose}>
          <Close variant='medium' />
        </div>
      </ModalTitle>

      <ModalContent className='flex flex-col'>
        <div className='relative my-5 w-[300px] mx-5'>
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
                  setCurrAmountToPay(enteredAmount);
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

        <div className='custom-scroll h-[45vh] w-full approvalMain overflow-y-auto max-[425px]:mx-1'>
          <div className={`mainTable ${creditDataList.length === 0 ? 'h-11' : 'h-auto'} mx-5`}>
            <DataTable
              columns={columns}
              data={creditDataList.length > 0 ? tableData : []}
              hoverEffect
              sticky
              getRowId={(value: any) => {
                setHoveredRow(value)
              }}
              getExpandableData={() => { }}
              isTableLayoutFixed
            />
          </div>

          {creditDataList.length === 0 && (
            <div className='mx-5 flex h-[59px] w-auto items-center justify-center border-b border-b-[#ccc]'>
              No records available at the moment.
            </div>
          )}
        </div>

        <div className='flex items-center justify-end text-sm font-proxima tracking-[0.02em] gap-5 border-t border-t-lightSilver p-5'>
          <span className=''>Total Remaining Credit: </span>
          <span className='font-bold text-[#1BB55C]'>${Number(totalRemainingCredit).toFixed(2)}</span>
        </div>
      </ModalContent>

      <ModalAction className='laptop:gap-4 laptopMd:gap-4 lg:gap-4 xl:gap-4 hd:gap-5 2xl:gap-5 3xl:gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>
        <Button
          className={`btn-sm !h-9 rounded-full !w-[94px]`}
          variant={`btn-outline-primary`}
          onClick={modalClose}>
          <label className="font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]">CANCEL</label>
        </Button>
        <Button
          className='btn-sm !h-9 rounded-full !w-[84px]'
          variant={isSaveDisabled ? 'btn' : 'btn-primary'}
          disabled={isSaveDisabled}
          onClick={handleSaveButtonClick}>
          <label className={`flex items-center justify-center cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]`}>
            SAVE
          </label>
        </Button>
      </ModalAction>
    </Modal>
  )
}

export default SingleBillPartialPayment
