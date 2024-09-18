import DownArrowIcon from '@/assets/Icons/billposting/DownArrowIcon';
import { performApiAction } from '@/components/Common/Functions/PerformApiAction';
import { useAppDispatch } from '@/store/configureStore';
import { getSlugDropdown } from '@/store/features/notification/notificationSlice';
import { EditorState, Modifier } from 'draft-js';
import { Typography } from 'pq-ap-lib';
import React, { useEffect } from 'react';

interface CustomOptionProps {
    editorState: any;
    onChange: (editorState: EditorState) => void;
    matrixId: number
}

const CustomOption: React.FC<CustomOptionProps> = ({ editorState, onChange, matrixId }) => {
    const dispatch = useAppDispatch()

    const [showOptions, setShowOptions] = React.useState(false);
    const [slugOptions, setSlugOptions] = React.useState<any>([]);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const handleOptionChange = (e: any) => {
        const selectedOption = e;
        const contentState = Modifier.replaceText(
            editorState.getCurrentContent(),
            editorState.getSelection(),
            selectedOption,
            editorState.getCurrentInlineStyle()
        );
        onChange(EditorState.push(editorState, contentState, 'insert-characters'));
        setShowOptions(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowOptions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const getSlugDropdownOptions = async (matrixId: number) => {
        performApiAction(dispatch, getSlugDropdown, { Id: matrixId }, (responseData: any) => {
            setSlugOptions(responseData)
        })
    }

    useEffect(() => {
        getSlugDropdownOptions(matrixId)
    }, [matrixId])

    return (
        <div className='relative inline-block w-40' ref={dropdownRef}>
            <div
                className='custom-dropdown ml-2 mt-0.5 flex cursor-pointer items-center justify-between rounded-md border-[1px] border-[#ccc] px-2 py-0.5'
                onClick={() => setShowOptions(!showOptions)}>
                <Typography className='!font-medium'>Select Slug</Typography>
                <span className={`${showOptions ? 'rotate-180' : ''}`}>
                    <DownArrowIcon />
                </span>
            </div>
            {showOptions && (
                <ul className='custom-scroll absolute right-0 z-10 max-h-24 w-[152px] list-none overflow-y-auto border-[1px] border-[#ccc] bg-white'>
                    {slugOptions.map((option: any) => (
                        <li
                            className='cursor-pointer px-2 py-1 hover:bg-[#F1F1F1]'
                            key={option.value}
                            onClick={() => handleOptionChange(option.value)}>
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomOption;