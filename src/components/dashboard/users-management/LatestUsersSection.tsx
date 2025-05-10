import moment from 'moment';
import { IAuthUser } from '../../../types/auth.types';

interface IProps {
  usersList: IAuthUser[];
}

const LatestUsersSection = ({ usersList }: IProps) => {
  const selectedUsers = usersList.sort((a, b) => {
    if (a.createdAt < b.createdAt) {
      return 1;
    } else return -1;
  });

  return (
    <div className='col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
      <h1 className='text-xl font-semibold text-gray-900 mb-5 tracking-tight'>Latest Users</h1>
      {selectedUsers.slice(0, 7).map((item) => (
        <div key={item.id} className='border-l-4 border-red-600 pl-4 py-3 my-3 bg-gray-50 rounded-r-lg'>
          <div className='flex justify-between items-center'>
            <span className='text-base font-medium text-gray-800'>{item.userName}</span>
            <span className='px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-full'>{moment(item.createdAt).fromNow()}</span>
          </div>
          <h6 className='text-sm text-gray-600 mt-1 tracking-wide'>
            {item.firstName} {item.lastName}
          </h6>
        </div>
      ))}
    </div>
  );
};

export default LatestUsersSection;