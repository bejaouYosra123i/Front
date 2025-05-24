import { Control, Controller } from 'react-hook-form';
import { ReactNode } from 'react';

interface IProps {
  control: Control<any, any>;
  label?: string;
  inputName: string;
  inputType?: string;
  error?: string;
  inputClassName?: string;
  leftIcon?: ReactNode;
}

const InputField = ({ control, label, inputName, inputType = 'text', error, inputClassName = '', leftIcon }: IProps) => {
  const dynamicClassName = error
    ? 'border-red-500 border-2'
    : 'border-gray-300 border';

  return (
    <div className="my-2 w-9/12 relative">
      {label && <label className="text-sm font-semibold">{label}</label>}
      <Controller
        name={inputName}
        control={control}
        render={({ field }) => (
          <div className="relative flex items-center">
            {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{leftIcon}</span>}
            <input
              {...field}
              type={inputType}
              className={`w-full px-3 py-2 mt-1 rounded ${dynamicClassName} ${inputClassName}`}
              style={leftIcon ? { paddingLeft: '2.5rem' } : {}}
            />
          </div>
        )}
      />
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
};

export default InputField;
