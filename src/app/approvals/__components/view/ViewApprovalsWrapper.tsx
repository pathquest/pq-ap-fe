import Wrapper from '@/components/Common/Wrapper'

interface ViewWrapperProps {
  children?: React.ReactNode
}

const ViewApprovalsWrapper = ({ children }: ViewWrapperProps) => {
  return (
    <Wrapper>
      <div className='relative mx-auto grid-cols-12 md:grid'>
        <div className={`col-span-12 h-[calc(100vh_-_65px)] overflow-y-auto`}>{children}</div>
      </div>
    </Wrapper>
  )
}

export default ViewApprovalsWrapper
