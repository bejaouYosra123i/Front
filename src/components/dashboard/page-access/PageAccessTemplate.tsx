import { ReactNode } from 'react';
import { IconType } from 'react-icons';

interface IProps {
  role: string;
  icon: IconType;
  color: string;
  children?: ReactNode;
}

const PageAccessTemplate = ({ role, icon: Icon, color, children }: IProps) => {
  return (
    <div className='pageTemplate3 flex flex-col items-center justify-center min-h-screen bg-gray-50 border-4 border-red-600 shadow-lg rounded-lg p-6'>
      <section className='w-full flex justify-center items-center gap-8'>
        <div><Icon className='text-6xl text-red-600' /></div>
        <div className='space-y-2 text-gray-800'>
          <h2 className='text-4xl font-bold'>This is {role} Page</h2>
          <h2 className='text-lg'>You must have {role} access to see this page</h2>
        </div>
      </section>
      <section className='mt-6 w-full'>{children}</section>
    </div>
  );
};

export default PageAccessTemplate;