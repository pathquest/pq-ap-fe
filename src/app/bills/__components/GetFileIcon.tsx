import DOCXIcon from '@/assets/Icons/billposting/DOCXIcon'
import PDFIcon from '@/assets/Icons/billposting/PDFIcon'
import CsvIcon from '@/assets/Icons/fileUpload/CsvIcon'
import ImageIcon from '@/assets/Icons/fileUpload/ImageIcon'

interface GetFileIconTypes {
  FileName: any
}

const GetFileIcon = ({ FileName }: GetFileIconTypes) => {
  if (['pdf'].includes(FileName.split('.').pop().toLowerCase())) return <PDFIcon />
  if (['csv', 'xlsx'].includes(FileName.split('.').pop().toLowerCase())) return <CsvIcon />
  if (['doc', 'docx'].includes(FileName.split('.').pop().toLowerCase())) return <DOCXIcon />
  if (['jpeg', 'png', 'jpg'].includes(FileName.split('.').pop().toLowerCase())) return <ImageIcon />
}

export default GetFileIcon
