import { useState } from 'react';
import { Control, Controller } from 'react-hook-form';

interface IProps {
  usernames: string[];
  control: Control<any, any>;
  name: string;
  error?: string;
}

const UsernamesComboBox = ({ usernames, control, name, error }: IProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [showComboBox, setShowComboBox] = useState<boolean>(false);

  const renderTopRow = () => {
    if (error) {
      return <span className='text-red-600 font-medium text-sm'>{error}</span>;
    }
    return <label className='font-medium text-gray-800'>To</label>;
  };

  let usernamesToShow = inputValue ? usernames.filter((q) => q.includes(inputValue)) : usernames;

  const dynamicClassName = error 
    ? 'border-red-600 focus:ring-red-600' 
    : 'border-gray-300 focus:ring-red-600';

  return (
    <div className='px-4 my-4 w-9/12'>
      <div className='mb-2'>{renderTopRow()}</div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className='relative'>
            <input
              type='text'
              autoComplete='off'
              className={`w-full px-4 py-2 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition duration-200 ${dynamicClassName}`}
              value={inputValue}
              onChange={(event) => {
                if (!showComboBox) {
                  setShowComboBox(true);
                }
                let { value } = event.target;
                setInputValue(value);
                field.onChange(value);
                if (usernames.includes(value)) {
                  setShowComboBox(false);
                }
              }}
              onFocus={() => setShowComboBox(true)}
            />
            {showComboBox && usernamesToShow.length > 0 ? (
              <div className='absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                {usernamesToShow.map((item, index) => (
                  <div
                    key={index}
                    className='px-4 py-2 text-gray-800 font-medium hover:bg-red-50 hover:text-red-600 cursor-pointer transition duration-150'
                    onClick={() => {
                      setInputValue(item);
                      setShowComboBox(false);
                      field.onChange(item);
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      />
    </div>
  );
};

export default UsernamesComboBox;