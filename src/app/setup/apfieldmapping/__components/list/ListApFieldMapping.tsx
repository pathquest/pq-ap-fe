'use client'

import { Button, CheckBox, Datepicker, Loader, Radio, Select, Text, Toast, Tooltip, Typography, Uploader } from 'pq-ap-lib'
import React, { lazy, useEffect, useRef, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { useAppDispatch, useAppSelector } from '@/store/configureStore'
import { getProcessList } from '@/store/features/bills/billSlice'
import { getFieldMappingData, saveFieldMappingData } from '@/store/features/fieldMapping/fieldMappingSlice'
import * as TypeOfField from '@/data/fieldMapping'

import { performApiAction } from '@/components/Common/Functions/PerformApiAction'
import { useSession } from 'next-auth/react'
import { hasSpecificPermission } from '@/components/Common/Functions/ProcessPermission'
import { useRouter } from 'next/navigation'

const DrawerOverlay = lazy(() => import('@/components/Common/DrawerOverlay'))

const FieldDrawer = lazy(() => import('@/app/setup/apfieldmapping/__components/FieldDrawer'))
const PreviewModal = lazy(() => import('@/app/setup/apfieldmapping/__components/PreviewModal'))
const ErrorModal = lazy(() => import('@/app/setup/apfieldmapping/__components/ErrorModal'))
const DeleteModal = lazy(() => import('@/app/setup/apfieldmapping/__components/DeleteModal'))

const DeleteIcon = lazy(() => import('@/assets/Icons/FieldMapping/CrossIcon'))
const CustomizeViewIcon = lazy(() => import('@/assets/Icons/CustomizeViewIcon'))
const DefaultViewIcon = lazy(() => import('@/assets/Icons/DefaultViewIcon'))
const EditIcon = lazy(() => import('@/assets/Icons/EditIcon'))
const DownArrow = lazy(() => import('@/assets/Icons/FieldMapping/DownArrow'))
const DragIndicatorIcon = lazy(() => import('@/assets/Icons/FieldMapping/DragIndicatorIcon'))
const UpArrow = lazy(() => import('@/assets/Icons/FieldMapping/UpArrow'))
const ImageIcon = lazy(() => import('@/assets/Icons/ImageIcon'))
const ViewIcon = lazy(() => import('@/assets/Icons/ViewIcon'))
const Wrapper = lazy(() => import('@/components/Common/Wrapper'))

const { dropdown, date, text, file, checkbox, radio, initialObject } = TypeOfField

const ListAPFieldMapping: React.FC = () => {
  const { data: session } = useSession()
  const CompanyId = session?.user?.CompanyId
  const { processPermissionsMatrix } = useAppSelector((state) => state.profile)
  const isAPFieldMappingEdit = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "AP Field Mapping", "Edit");
  const isAPFieldMappingSync = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "AP Field Mapping", "Sync");
  const isAPFieldMappingView = hasSpecificPermission(processPermissionsMatrix, "Settings", "Setup", "AP Field Mapping", "View");
  const router = useRouter()
  const IsFieldMappingSet = localStorage.getItem('IsFieldMappingSet') ?? 'true'

  const dispatch = useAppDispatch()
  const toggleRef = useRef<HTMLDivElement>(null)

  const [dropdownData, setDropdownData] = useState<any[]>([])
  const [processSelectionOptions, setProcessSelectionOptions] = useState<any[]>([])
  const [processSelection, setProcessSelection] = useState<string>('1')
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)
  const [isCustomView, setIsCustomView] = useState(false)
  const [previewModal, setPreviewModal] = useState(false)
  const [isRemoveModal, setIsRemoveModal] = useState<boolean>(false)
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false)
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>()
  const [maindropFields, setMainDropFields] = useState<any>([initialObject])
  const [secondaryMaindFields, setSecondaryMaindFields] = useState<any>([])
  const [linedropFields, setLineDropFields] = useState<any>([initialObject])
  const [secondaryLineFields, setSecondaryLineFields] = useState<any>([])
  const [fieldType, setFieldType] = useState<boolean>(false)
  const [fieldRequired, setFieldRequired] = useState<boolean>()
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isLoader, setIsLoader] = useState<boolean>(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  useEffect(() => {
    if (!isAPFieldMappingView) {
      router.push('/manage/companies');
    }
  }, [isAPFieldMappingView]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        const message = 'Are you sure you want to leave without saving?'
          ; (event || window.event).returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [unsavedChanges])

  const handleBack = () => {
    // Check if there are unsaved changes before navigating back
    if (unsavedChanges && window.confirm('Are you sure you want to leave without saving?')) {
      // Reset unsavedChanges state if the user confirms
      setUnsavedChanges(false)
      window.history.back()
    } else {
      // Navigate back if there are no unsaved changes
      window.history.back()
    }
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (toggleRef.current && !toggleRef.current.contains(event.target as Node)) {
        setIsViewOpen(false)
      }
    }
    document.addEventListener('click', handleOutsideClick)
  }, [isViewOpen])

  const handleToggleDropdown = (title: string) => {
    setOpenDropdown(openDropdown === title ? null : title)
  }

  useEffect(() => {
    fetchProcessDropDown()
  }, [])

  useEffect(() => {
    getFieldMapping()
    getSecondaryFieldMapping()
  }, [processSelection, CompanyId])

  const handleDefaultView = () => {
    setIsCustomView(false)
  }

  const handleCustomView = () => {
    setIsCustomView(true)
  }

  const handleEditField = (item: any) => {
    setFieldType(item.IsSystemDefined)
    setIsEditOpen(true)
    setSelectedItem(item)
  }

  const handleDrawerClose = () => {
    setIsEditOpen(false)
    setSelectedItem(null)
  }

  const handleRemoveModal = (item: any) => {
    setFieldRequired(!item.IsCustom)
    setIsRemoveModal(true)
    setSelectedItem(item)
  }

  const handleRemoveModalClose = () => {
    setIsRemoveModal(false)
    setSelectedItem(null)
  }

  const handleKeyDown = (e: any, callback: any) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      callback()
    }
  }

  // Get ProcessType DropDown Api
  const fetchProcessDropDown = async () => {
    await performApiAction(dispatch, getProcessList, null, (responseData: any) => {
      const firstTwoValues = responseData.slice(0, 2)
      setProcessSelectionOptions(firstTwoValues)
    })
  }

  const filterFields = (fields: any[], condition: boolean, requiredKey: string, displayKey: string) => {
    if (fields.length === 0) return [initialObject]
    return fields.filter((item: any) => item[requiredKey] || item[displayKey])
  }

  const getFilteredDropdownItems = (fieldList: any[], configList: any[], isSystemDefined: boolean) => {
    const configIds = configList.map((item: any) => item.Id)
    return fieldList
      .filter((list: any) => !configIds.includes(list.Id))
      // .filter((item: any) => item.IsSystemDefined === isSystemDefined)
  }

  // Get FieldMapping item Api
  const getFieldMapping = async () => {
    setIsLoader(true)
    const params = {
      CompanyId: CompanyId,
      ProcessType: Number(processSelection),
    }

    await performApiAction(dispatch, getFieldMappingData, params, (responseData: any) => {
      setIsLoader(false)

      const processCondition = processSelection === '1'
      const requiredKey = processCondition ? 'IsRequiredForAccountPayable' : 'IsRequiredForAccountAdjustment'
      const displayKey = processCondition ? 'DisplayForAccountPayable' : 'DisplayForAccountAdjustment'

      setMainDropFields(
        filterFields(
          responseData.ComapnyConfigList.MainFieldConfiguration,
          processCondition,
          requiredKey,
          displayKey
        )
      )

      setLineDropFields(
        filterFields(
          responseData.ComapnyConfigList.LineItemConfiguration,
          processCondition,
          requiredKey,
          displayKey
        )
      )

      setDropdownData(
        [
          {
            title: 'Main Predefined Fields',
            items: getFilteredDropdownItems(
              responseData.MainFieldList.filter((item: any) => !item.IsCustom),
              responseData.ComapnyConfigList.MainFieldConfiguration.filter((item: any) => !item.IsCustom),
              true
            ),
          },
          {
            title: 'Main Custom Fields',
            items: getFilteredDropdownItems(
              responseData.MainFieldList.filter((item: any) => item.IsCustom),
              responseData.ComapnyConfigList.MainFieldConfiguration.filter((item: any) => item.IsCustom),
              true
            ),
          },
          {
            title: 'Line Predefined Fields',
            items: getFilteredDropdownItems(
              responseData.LineItemFieldList.filter((item: any) => !item.IsCustom),
              responseData.ComapnyConfigList.LineItemConfiguration.filter((item: any) => !item.IsCustom),
              true
            ),
          },
          {
            title: 'Line Custom Fields',
            items: getFilteredDropdownItems(
              responseData.LineItemFieldList.filter((item: any) => item.IsCustom),
              responseData.ComapnyConfigList.LineItemConfiguration.filter((item: any) => item.IsCustom),
              true
            ),
          },
        ]
        // .filter((field: any) =>
        //   accountingTool === 1
        //     ? field.items.length >= 0
        //     : ['Main Predefined Fields', 'Line Predefined Fields'].includes(field.title)
        // )
      )

      const getDefaultDropdown = (fieldList: any[], title: string) => {
        return fieldList.some((list: any) => list.IsSystemDefined) ? title : null
      }

      setOpenDropdown(
        getDefaultDropdown(responseData.MainFieldList, 'Main Predefined Fields') ||
        getDefaultDropdown(
          responseData.MainFieldList.filter((list: any) => !list.IsSystemDefined),
          'Main Custom Fields'
        ) ||
        getDefaultDropdown(responseData.LineItemFieldList, 'Line Predefined Fields') ||
        getDefaultDropdown(
          responseData.LineItemFieldList.filter((list: any) => !list.IsSystemDefined),
          'Custom Line Items Field'
        )
      )
    })
  }

  const secondaryFilterFields = (fields: any[], condition: boolean) => {
    if (fields.length === 0) return [initialObject]
    return fields.filter((item: any) => (condition ? item.IsRequiredForAccountPayable : item.IsRequiredForAccountAdjustment))
  }

  // Get Secondary FieldMapping item Api
  const getSecondaryFieldMapping = async () => {
    const params = {
      CompanyId: CompanyId,
      ProcessType: Number(processSelection === '1' ? '2' : '1'),
    }

    await performApiAction(dispatch, getFieldMappingData, params, (responseData: any) => {
      const fieldCondition = processSelection === '1'

      setSecondaryMaindFields(
        secondaryFilterFields(
          responseData.ComapnyConfigList.MainFieldConfiguration,
          fieldCondition
        )
      )
      setSecondaryLineFields(
        secondaryFilterFields(
          responseData.ComapnyConfigList.LineItemConfiguration,
          fieldCondition
        )
      )
    })
  }

  // Save FieldMapping item Api
  const saveFieldMapping = async () => {
    setUnsavedChanges(false)

    const validateField =
      maindropFields.some((field: any) => field.IsCustom && !field.MappedWith) ||
      linedropFields.some((field: any) => field.IsCustom && !field.MappedWith)

    if (validateField) {
      Toast.error('Please fill in the details for the custom field before saving.')
    } else {
      const params = {
        CompanyId: CompanyId,
        ProcessType: Number(processSelection),
        MainFieldConfiguration: {
          FieldList: maindropFields
        },
        LineItemConfiguration: {
          FieldList: linedropFields
        },
      }
      
      saveSecondaryFieldMapping()
      await performApiAction(
        dispatch,
        saveFieldMappingData,
        params,
        (responseData: any) => {
          IsFieldMappingSet === 'false' && router.push('/manage/companies')
          localStorage.removeItem('IsFieldMappingSet')
          Toast.success('Fields Saved!')
        },
        (err: any) => {
          Toast.error('Error', `${err}`)
        },
        (warn: any) => { },
        true
      )
    }
  }

  // Save FieldMapping item Api
  const saveSecondaryFieldMapping = async () => {
    const params = {
      CompanyId: CompanyId,
      ProcessType: Number(processSelection === '1' ? '2' : '1'),
      MainFieldConfiguration: {
        FieldList: secondaryMaindFields
      },
      LineItemConfiguration: {
        FieldList: secondaryLineFields
      },
    }

    await performApiAction(
      dispatch,
      saveFieldMappingData,
      params,
      (responseData: any) => { },
      (err: any) => { },
      (warn: any) => { },
      true
    )
  }

  // Updated Perticular Field
  const handleSaveAndUpdate = (newField: any) => {
    if (newField.Type === 1) {
      const updatedItems = maindropFields?.map((item: any) =>
        item.Id === newField.Id && item.IsCustom === newField.IsCustom ? newField : item
      )

      setMainDropFields(updatedItems)
      if (newField.IsRequiredForAccountPayable && newField.IsRequiredForAccountAdjustment) {
        // Add to SecondaryMainFields if not already present
        if (!secondaryMaindFields.some((item: any) => item.Id === newField.Id)) {
          setSecondaryMaindFields([...secondaryMaindFields, newField])
        }
      } else {
        // Remove from SecondaryMainFields if present
        const filteredSecondaryFields = secondaryMaindFields.filter((item: any) => item.Id !== newField.Id)
        setSecondaryMaindFields(filteredSecondaryFields)
      }
    } else {
      const updatedItems = linedropFields?.map((item: any) =>
        item.Id === newField.Id && item.IsCustom === newField.IsCustom ? newField : item
      )

      setLineDropFields(updatedItems)
      if (newField.IsRequiredForAccountPayable && newField.IsRequiredForAccountAdjustment) {
        // Add to SecondaryLineFields if not already present
        if (!secondaryLineFields.some((item: any) => item.Id === newField.Id)) {
          setSecondaryLineFields([...secondaryLineFields, newField])
        }
      } else {
        // Remove from SecondaryLineFields if present
        const filteredSecondaryFields = secondaryLineFields.filter((item: any) => item.Id !== newField.Id)
        setSecondaryLineFields(filteredSecondaryFields)
      }
    }
    setUnsavedChanges(true)
  }

  const updateDropdownData = (prevData: any, title: string, selectedItem: any) => {
    return prevData.map((data: any) =>
      data.title === title
        ? {
          title: data.title,
          items: [...data.items, selectedItem],
        }
        : data
    )
  }

  const handleDelete = (isChecked: number) => {
    const updateField = (prevFields: any) =>
      prevFields.map((item: any) =>
        item.Id === selectedItem.Id && item.IsCustom === selectedItem.IsCustom
          ? {
            ...item,
            IsRequiredForAccountPayable: processSelection === '1' ? false : item.IsRequiredForAccountPayable,
            IsRequiredForAccountAdjustment: processSelection === '2' ? false : item.IsRequiredForAccountAdjustment,
          }
          : item
      )

    const removeField = (prevFields: any) => prevFields.filter((item: any) => item.Name !== selectedItem.Name)

    if (isChecked === 1) {
      if (selectedItem.Type === 1) {
        setMainDropFields(updateField)
        setDropdownData((prevMainDropData: any) =>
          updateDropdownData(
            prevMainDropData,
            !selectedItem.IsCustom ? 'Main Predefined Fields' : 'Main Custom Fields',
            selectedItem
          )
        )
      } else {
        setLineDropFields(updateField)
        setDropdownData((prevLineData: any) =>
          updateDropdownData(prevLineData, !selectedItem.IsCustom ? 'Line Predefined Fields' : 'Line Custom Fields', selectedItem)
        )
      }
      setMainDropFields(removeField)
      setLineDropFields(removeField)
    } else if (isChecked === 2) {
      if (selectedItem.Type === 1) {
        setSecondaryMaindFields(secondaryMaindFields.filter((item: any) => item.Name !== selectedItem.Name))
        setMainDropFields(updateField)
        setDropdownData((prevMainDropData: any) =>
          updateDropdownData(
            prevMainDropData,
            !selectedItem.IsCustom ? 'Main Predefined Fields' : 'Main Custom Fields',
            selectedItem
          )
        )
      } else {
        setSecondaryLineFields(secondaryLineFields.filter((item: any) => item.Name !== selectedItem.Name))
        setLineDropFields(updateField)
        setDropdownData((prevLineData: any) =>
          updateDropdownData(prevLineData, !selectedItem.IsCustom ? 'Line Predefined Fields' : 'Line Custom Fields', selectedItem)
        )
      }
      setMainDropFields(removeField)
      setLineDropFields(removeField)
    }

    setIsRemoveModal(false)
    setUnsavedChanges(true)
  }

  const DraggableField = ({ item }: any) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'string',
      item: { id: item.Id, name: item.Label, Type: item.Type },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }))

    return (
      <li
        className={`flex cursor-grabbing justify-between px-5 py-2.5 hover:bg-whiteSmoke ${isDragging ? 'opacity-50' : ''}`}
        ref={drag}
      >
        <Typography className='!font-normal'>{item.Label}</Typography>
        <DragIndicatorIcon />
      </li>
    )
  }

  const DropableField = ({ item, index, moveField }: any) => {
    const [{ isOver }, drop] = useDrop({
      accept: ['field', 'string'],
      drop: (item) => {
        if (item.Type === 1) {
          mainFieldDrop(item.id);
        } else if (item.Type === 2) {
          LineItemFieldDrop(item.id);
        } else {
          doNotDrop();
        }
      },
      hover: (draggedItem: any) => {
        if (draggedItem.index !== index) {
          moveField(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });

    const [, ref] = useDrag({
      type: 'field',
      item: { index },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    });

    const doNotDrop = () => {
      return;
    };

    const mainFieldDrop = (id: number) => {
      const dropdownItem = dropdownData.map((dropdown: any) => dropdown.items.filter((item: any) => item.Id === id))
      const droppingFields = dropdownItem.filter((item: any) => item.length > 0)[0]
      const droppingField = droppingFields.length > 0 ? droppingFields[0] : {}

      if (droppingField) {
        if (
          !maindropFields.some((field: any) => field.Id === droppingField.Id && field.IsCustom === droppingField.IsCustom) &&
          droppingField.Type === 1
        ) {
          setMainDropFields([
            ...maindropFields,
            {
              ...droppingField,
              FieldType: 'text',
              IsRequiredForAccountPayable: processSelection === '1' ? true : droppingField.IsRequiredForAccountPayable,
              IsRequiredForAccountAdjustment: processSelection === '2' ? true : droppingField.IsRequiredForAccountAdjustment,
              DisplayForAccountPayable: processSelection === '1' ? true : droppingField.DisplayForAccountPayable,
              DisplayForAccountAdjustment: processSelection === '2' ? true : droppingField.DisplayForAccountAdjustment,
            },
          ])
          if (!droppingField.IsCustom) {
            const removingField = dropdownData[0].items.filter((item: any) => droppingField.Id !== item.Id)
            setDropdownData((prevMainDropData: any) =>
              prevMainDropData.map((data: any) =>
                data.title === 'Main Predefined Fields'
                  ? new Object({
                    title: data.title,
                    items: removingField,
                  })
                  : data
              )
            )
          } else {
            const removingField = dropdownData[1].items.filter((item: any) => droppingField.Id !== item.Id)
            setDropdownData((prevMainDropData: any) =>
              prevMainDropData.map((data: any) =>
                data.title === 'Main Custom Fields'
                  ? new Object({
                    title: data.title,
                    items: removingField,
                  })
                  : data
              )
            )
          }
          setIsEditOpen(!droppingField.IsSystemDefined && droppingField.Type == 1 ? true : false)
        }
      }
      setFieldType(droppingField.IsSystemDefined)
      setSelectedItem(droppingField)
      setUnsavedChanges(true)
    }

    const LineItemFieldDrop = (id: number) => {
      const dropdownItem = dropdownData.map((dropdown: any) => dropdown.items.filter((item: any) => item?.Id === id))
      const droppingFields = dropdownItem.filter((item: any) => item.length > 0)[
        dropdownItem.filter((item: any) => item.length > 0).length - 1
      ]
      const droppingField = droppingFields.length > 0 ? droppingFields[0] : {}

      if (droppingField) {
        if (!linedropFields.some((field: any) => field?.Id === droppingField?.Id && field?.IsCustom === droppingField?.IsCustom)) {
          setLineDropFields([
            ...linedropFields,
            {
              ...droppingField,
              FieldType: 'text',
              IsRequiredForAccountPayable: processSelection === '1' ? true : droppingField.IsRequiredForAccountPayable,
              IsRequiredForAccountAdjustment: processSelection === '2' ? true : droppingField.IsRequiredForAccountAdjustment,
              DisplayForAccountPayable: processSelection === '1' ? true : droppingField.DisplayForAccountPayable,
              DisplayForAccountAdjustment: processSelection === '2' ? true : droppingField.DisplayForAccountAdjustment,
            },
          ])

          if (!droppingField.IsCustom) {
            const removingField = dropdownData[dropdownData.length === 4 ? 2 : 1].items.filter(
              (item: any) => droppingField.Id !== item.Id
            )

            setDropdownData((prevLineData: any) =>
              prevLineData.map((data: any) =>
                data.title === 'Line Predefined Fields'
                  ? new Object({
                    title: data.title,
                    items: removingField,
                  })
                  : data
              )
            )
          } else {
            const removingField = dropdownData[3].items.filter((item: any) => droppingField.Id !== item.Id)
            setDropdownData((prevLineData: any) =>
              prevLineData.map((data: any) =>
                data.title === 'Line Custom Fields'
                  ? new Object({
                    title: data.title,
                    items: removingField,
                  })
                  : data
              )
            )
          }

          setIsEditOpen(!droppingField.IsSystemDefined && droppingField.Type == 2 ? true : false)
        }
      }
      setFieldType(droppingField.IsSystemDefined)
      setSelectedItem(droppingField)
      setUnsavedChanges(true)
    }

    return (
      <li
        ref={(node) => ref(drop(node))}
        style={{ backgroundColor: isOver ? 'lightblue' : 'transparent' }}
        className={`flex justify-between p-2.5 ${item?.Type === 1 && (item?.FieldType === 'file' || item?.FieldType === 'checkbox' || item?.FieldType === 'radio') ? 'w-full' : (item?.Type === 2 && item?.FieldType === 'checkbox') || item?.Type === 1 ? 'w-1/2' : 'w-1/4'}`}
      >
        <div className='w-full' onMouseEnter={() => setHoveredItemId(`${item?.Id}`)} onMouseLeave={() => setHoveredItemId(null)}>
          <div className='relative'>
            <>
              {item?.FieldType === text && (
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
              {item?.FieldType === dropdown && (
                <div className={`${item.IsSystemDefined && 'pointer-events-none'} w-full`}>
                  <Select
                    id={item.Id}
                    name={item.Name}
                    label={item.Label}
                    validate={item.IsRequired}
                    defaultValue={0}
                    options={!item.Value ? [] : JSON.parse(item.Value)}
                    hideIcon
                    placeholder='Please Select'
                    getValue={() => { }}
                    getError={() => { }}
                    hasError={undefined}
                  />
                </div>
              )}
              {item?.FieldType === checkbox && (
                <div className='pointer-events-none w-full'>
                  <CheckBox id={item.Id} name={item.Name} label={item.Label} className='pointer-events-none !mr-10 !text-sm !tracking-[0.02em] !text-darkCharcoal' />
                </div>
              )}
              {item?.FieldType === radio && (
                <div className='pointer-events-none'>
                  <div className='mb-2'>
                    <Typography className='!text-slatyGrey'>{item.Label}</Typography>
                    {item.IsRequired && <span className='text-[16px] text-red-500'> *</span>}
                  </div>
                  <div className='flex w-80'>
                    {(!!item.Value ? JSON.parse(item.Value) : []).map((option: any, index: number) => (
                      <Radio
                        key={option?.label}
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
              {item?.FieldType === date && (
                <div className='pointer-events-none w-full'>
                  <Datepicker
                    id={item.Id}
                    label={item.Label}
                    validate={item.IsRequired}
                    startYear={1900}
                    endYear={2099}
                    value={item.Value}
                    getValue={() => ''}
                    getError={() => ''}
                    hasError={undefined}
                    hideIcon
                  />
                </div>
              )}
              {item?.FieldType === file && (
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
            </>
            <div
              className={`absolute ${item.FieldType === 'checkbox' ? '-right-2 top-0' : item.FieldType === 'file' ? 'right-0 top-0.5' : 'right-0 bottom-[5px]'
                }
              ${hoveredItemId === `${item.Id}` ? 'flex' : 'hidden'}
              `}
            >
              <Tooltip content='Remove' position='left' className='!px-0.5 !py-0'>
                <div
                  tabIndex={0}
                  onClick={() => handleRemoveModal(item)}
                  className='mx-1 pt-[5px]'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRemoveModal(item)
                    }
                  }}
                >
                  <DeleteIcon />
                </div>
              </Tooltip>
              {isAPFieldMappingEdit && <Tooltip content='Edit' position='left' className='!px-1.5 !py-0'>
                <span
                  tabIndex={0}
                  onClick={() => handleEditField(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEditField(item)
                    }
                  }}
                >
                  <EditIcon />
                </span>
              </Tooltip>}
            </div>
          </div>
        </div>
      </li>
    )
  }

  const moveMainField = (fromIndex: any, toIndex: any) => {
    const updatedFields = [...maindropFields];
    const [movedField] = updatedFields.splice(fromIndex, 1);
    updatedFields.splice(toIndex, 0, movedField);
    setMainDropFields(updatedFields);
  };

  const moveLineItemField = (fromIndex: any, toIndex: any) => {
    const updatedFields = [...linedropFields];
    const [movedField] = updatedFields.splice(fromIndex, 1);
    updatedFields.splice(toIndex, 0, movedField);
    setLineDropFields(updatedFields);
  };

  return (
    <Wrapper masterSettings={true}>
      <DndProvider backend={HTML5Backend}>
        <div>
          <div className={`sticky top-0 z-[6] block`}>
            <div className='relative flex !h-[50px] justify-between  bg-whiteSmoke px-5'>
              <div className='flex items-center selectMain w-[180px]'>
                <Select
                  className='!font-proxima'
                  id='process_selection'
                  options={processSelectionOptions}
                  defaultValue={processSelection}
                  value={processSelection}
                  getValue={(value) => setProcessSelection(value)}
                  getError={() => ''}
                  noborder
                />
              </div>
              <div className='flex items-center justify-end gap-2 mt-2.5' ref={toggleRef}>
                <Tooltip content={`View`} position='bottom' className='!z-[6] flex h-[32px] w-[36px] place-content-center !pt-0 !pb-1 !px-0'>
                  <div
                    onClick={() => setIsViewOpen(!isViewOpen)}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsViewOpen(!isViewOpen)}
                  >
                    <ViewIcon />
                  </div>
                </Tooltip>
              </div>

              {/* View List */}
              <ul
                className={`absolute right-5 top-10 z-10 mt-[1px] w-auto rounded-md bg-white  py-2.5 shadow-lg ${isViewOpen ? 'visible' : 'hidden'
                  } `}
              >
                <li
                  className={`flex cursor-pointer items-center px-3 py-[11px] hover:bg-whiteSmoke ${!isCustomView ? 'bg-whiteSmoke' : ''
                    }`}
                  onClick={handleDefaultView}
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, handleDefaultView)}
                >
                  <DefaultViewIcon />
                  <Typography className='pl-[10px] !text-sm tracking-[0.02em]' type='h6'>
                    Default View
                  </Typography>
                </li>
                <li
                  className={`flex cursor-pointer items-center px-3 py-[11px] hover:bg-whiteSmoke ${isCustomView ? 'bg-whiteSmoke' : ''
                    }`}
                  onClick={handleCustomView}
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, handleCustomView)}
                >
                  <CustomizeViewIcon />
                  <Typography className='pl-[10px] !text-sm tracking-[0.02em]' type='h6'>
                    Customize View
                  </Typography>
                </li>
              </ul>
            </div>
          </div>
          {isLoader ? (
            <div className='flex h-[70vh] w-full items-center justify-center'>
              <Loader size='md' helperText />
            </div>
          ) : (
            <>
              <div className='flex justify-start'>
                {/* Left DropDown Drawer */}
                {isCustomView && (
                  <div>
                    <div className={`h-[calc(100vh-202px)] !w-[250px] overflow-y-auto border-r border-lightSilver `}>
                      <ul>
                        {[...dropdownData]
                          .filter((data: any) => data.items.length > 0)
                          .map((data: any) => (
                            <li key={data.title}>
                              <div>
                                <div className='ml-3.5 pt-5'>
                                  <div
                                    className='flex items-center justify-start'
                                    onClick={() => handleToggleDropdown(data.title)}
                                    tabIndex={0}
                                    onKeyDown={(e) => handleKeyDown(e, () => handleToggleDropdown(data.title))}
                                  >
                                    <div className='mr-2.5 cursor-pointer'>
                                      {openDropdown === data.title ? <UpArrow /> : <DownArrow />}
                                    </div>
                                    <Typography className='!cursor-pointer !font-bold !text-sm !text-darkCharcoal !tracking-[0.02em]'>{data.title}</Typography>
                                  </div>
                                </div>
                                {/* Drag fields*/}
                                <ul
                                  style={{
                                    maxHeight: openDropdown === data.title ? '500px' : '0',
                                    overflow: 'auto',
                                    transition: 'max-height 0.6s ease-in-out',
                                  }}
                                >
                                  <div className='pt-[13px] !text-sm !text-darkCharcoal !tracking-[0.02em]'>
                                    {data.items.map((item: any) => (
                                      <DraggableField key={item?.Id} item={item} />
                                    ))}
                                  </div>
                                </ul>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className='h-[calc(100vh-112px)] w-full overflow-y-scroll'>
                  {/* Main Field  */}
                  <div className='flex h-3/4 border-b border-lightSilver'>
                    <div className='flex w-full items-center justify-center border-r border-lightSilver'>
                      <ImageIcon />
                    </div>
                    <div className='w-full px-2.5 py-5'>
                      <Typography type='h5' className='flex w-full px-2.5 !font-bold tracking-[0.02em] text-darkCharcoal'>
                        Main Field
                      </Typography>

                      {/* Main Drop fields*/}
                      <ul className={`flex h-[97%] flex-wrap items-end overflow-y-scroll`}>
                        {maindropFields.map((item: any, index: number) => (
                          <DropableField key={item?.Id} item={item} index={index} moveField={moveMainField} />
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Line Item Fields */}
                  <div>
                    <div className='w-full px-2.5 py-5'>
                      <Typography type='h5' className='flex w-full px-2.5 !font-bold tracking-[0.02em] text-darkCharcoal'>
                        Line Item Field
                      </Typography>

                      {/* Line Drop fields*/}
                      <ul className='flex flex-wrap items-end'>
                        {linedropFields.map((item: any, index: number) => (
                          <DropableField key={item?.Id} item={item} index={index} moveField={moveLineItemField} />
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* All Below buttons */}
              <div className='sticky bottom-0 flex w-full items-center justify-end border-t border-lightSilver bg-white'>
                <div className='flex gap-5 laptop:p-4 laptopMd:p-4 lg:p-4 xl:p-4 hd:p-5 2xl:p-5 3xl:p-5'>

                  {isCustomView && (<Button
                    onClick={() => setPreviewModal(true)}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPreviewModal(true)}
                    variant='btn-outline-primary'
                    className='btn-sm !h-9 rounded-full'
                  >
                    <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">PREVIEW</label>
                  </Button>)}
                  <Button
                    onClick={handleBack}
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, handleBack)}
                    variant='btn-outline-primary'
                    className='btn-sm !h-9 rounded-full'
                  >
                    <label className="laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] font-proxima font-semibold !py-1.5 h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em] cursor-pointer">CANCEL</label>
                  </Button>
                  <Button
                    type='submit'
                    onClick={() => saveFieldMapping()}
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, saveFieldMapping)}
                    className={`btn-sm !h-9 rounded-full`}
                    variant='btn-primary'>
                    <label className={`flex items-center justify-center laptop:px-[12px] laptopMd:px-[12px] lg:px-[12px] xl:px-[12px] hd:px-[15px] 2xl:px-[15px] 3xl:px-[15px] !py-1.5 cursor-pointer font-proxima font-semibold h-full laptop:text-sm laptopMd:text-sm lg:text-sm xl:text-sm hd:text-base 2xl:text-base 3xl:text-base tracking-[0.02em]`}>
                      SAVE
                    </label>
                  </Button>
                </div>
              </div>
              <PreviewModal
                onOpen={previewModal}
                onClose={() => setPreviewModal(false)}
                mainFields={maindropFields}
                lineItemFields={linedropFields}
              />
            </>
          )}

          {fieldRequired ? (
            <ErrorModal onOpen={isRemoveModal} onClose={() => setIsRemoveModal(false)} />
          ) : (
            <DeleteModal
              isModalOpen={isRemoveModal}
              modalClose={handleRemoveModalClose}
              handleSubmit={handleDelete}
              process={processSelection}
              field={selectedItem}
            />
          )}

          <FieldDrawer
            onOpen={isEditOpen}
            onClose={handleDrawerClose}
            type={fieldType}
            field={selectedItem}
            process={processSelection}
            onSave={handleSaveAndUpdate}
            MainFields={maindropFields}
            LineFields={linedropFields}
          />

          {/* Drawer Overlay */}
          <DrawerOverlay isOpen={isEditOpen} onClose={undefined} />
        </div>
      </DndProvider>
    </Wrapper>
  )
}

export default ListAPFieldMapping