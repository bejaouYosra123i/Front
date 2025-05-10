import { IconType } from 'react-icons';

interface IProps {
  count: number;
  role: string;
  icon: IconType;
  color: string;
}

const UserCountCard = ({ count, role, icon: Icon, color }: IProps) => {
  return (
    <div
      className='px-6 py-4 rounded-lg flex justify-between items-center shadow-md transition-all duration-200 hover:shadow-lg'
      style={{ backgroundColor: color }}
    >
      <div className='space-y-1'>
        <h2 className='text-3xl font-bold text-white'>{count}</h2>
        <h2 className='text-lg font-medium text-white'>{role}</h2>
      </div>
      <div>{<Icon className='text-white text-5xl' />}</div>
    </div>
  );
};

export default UserCountCard;