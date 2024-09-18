import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from "rehype-raw";

function MarkDownComponent({ markdownContent }: { markdownContent: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      skipHtml={true}
      components={{
        h1(props) {
          const { node, ...rest } = props
          return <h1 className='text-4xl font-bold my-7 font-candara' {...rest}></h1>
        },
        h2(props) {
          const { node, ...rest } = props
          return <h2 className='text-3xl font-bold my-6 font-candara' {...rest}></h2>
        },
        h3(props) {
          const { node, ...rest } = props
          return <h3 className='text-2xl font-semibold my-4 font-candara' {...rest}></h3>
        },
        h4(props) {
          const { node, ...rest } = props
          return <h4 className='text-xl font-semibold my-4 font-candara' {...rest}></h4>
        },
        h5(props) {
          const { node, ...rest } = props
          return <h5 className='text-lg font-medium my-4 font-candara' {...rest}></h5>
        },
        h6(props) {
          const { node, ...rest } = props
          return <h6 className='text-base font-medium my-4 font-candara' {...rest}></h6>
        },
        p(props) {
          const { node, ...rest } = props
          return <p className='text-base !leading-7 font-normal my-6 font-proxima' {...rest}></p>
        },
        img(props) {
          const { node, ...rest } = props
          return <img className='border border-gray-300 p-1 my-10 block' {...rest} />
        },
        u(props) {
          const { node, ...rest } = props
          return <span style={{ textDecorationLine: 'underline' }} {...rest}></span>
        },
        a(props) {
          const { node, href, ...rest } = props
          return <a href={href} {...rest} className='text-base text-blue-700 underline font-proxima' />
        },
        blockquote(props) {
          const { node,...rest } = props
          return <blockquote className='my-4 border-l-4 border-gray-300 pl-4 italic font-proxima' {...rest} />
        },
        ul(props){
          const { node,...rest } = props
          return <ul className='list-disc list-outside my-4 ml-6 font-proxima' {...rest} />
        },
        li(props){
          const { node,...rest } = props
          return <li className='my-4 font-proxima' {...rest} />
        },
        ol(props){
          const { node,...rest } = props
          return <ul className='list-decimal list-outside my-4 ml-6 font-proxima' {...rest} />
        },
        span(props){
          const { node,...rest } = props
          return <span className='font-proxima' {...rest} />
        },
        div(props){
          const { node,...rest } = props
          return <div className='font-proxima' {...rest} />
        }
      }}
      children={markdownContent}
    />
  )
}

export default MarkDownComponent
