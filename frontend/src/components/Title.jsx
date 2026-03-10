import React from 'react'

const Title = ({text1,text2}) => {
  return (
    <div className='inline-flex gap-2 items-center mb-3 text-[#DAA520]'>
      <p className='prata-regular bg-golden-brown bg-clip-text text-transparent bg-to-b'>{text1} <span className='prata-regular bg-golden-brown bg-clip-text text-transparent bg-to-b font-medium'>{text2}</span></p>
      <p className='w-8 sm:w-12 h-[1px] sm:h-[2px] bg-white'></p>
    </div>
  )
}

export default Title
