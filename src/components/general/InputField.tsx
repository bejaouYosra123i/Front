import { Control, Controller } from 'react-hook-form';

interface IProps {
  control: Control<any, any>;
  label?: string;
  inputName: string;
  inputType?: string;
  error?: string;
}

const InputField = ({ control, label, inputName, inputType = 'text', error }: IProps) => {
  const dynamicClassName = error
    ? 'border-red-500 border-2'
    : 'border-gray-300 border';

  return (
    <div className="my-2 w-9/12">
      {label && <label className="text-sm font-semibold">{label}</label>}
      <Controller
        name={inputName}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            type={inputType}
            className={`w-full px-3 py-2 mt-1 rounded ${dynamicClassName}`}
          />
        )}
      />
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
};

export default InputField;
