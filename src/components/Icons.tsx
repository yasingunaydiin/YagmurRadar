import Image from 'next/image';
import React from 'react';

const Icons: React.FC = () => {
  return (
    <div className='absolute z-10 top-0 right-0 mt-5 mr-5 flex items-center gap-3'>
      <a
        href='https://github.com/yasingunaydiin'
        target='_blank'
        rel='noopener noreferrer'
      >
        <Image src='/github-mark.png' alt='Github' width={33} height={30} />
      </a>
      <a
        href='https://islanacakmiyim.vercel.app'
        target='_blank'
        rel='noopener noreferrer'
      >
        <Image
          src='/islanacakmiyim-logo.png'
          alt='Portfolio'
          width={40}
          height={20}
        />
      </a>
    </div>
  );
};

export default Icons;
