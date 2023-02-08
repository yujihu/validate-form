import * as React from 'react';

type ISelectProps = React.PropsWithChildren<React.ComponentProps<'select'>> & {
  placeholder: string;
};

const Select = (props: ISelectProps) => {
  const { children, ...rest } = props;
  return (
    <select {...rest} className="form-input">
      <option label={props.placeholder}>{props.placeholder}</option>
      {children}
    </select>
  );
};

type IOptionProps = React.ComponentProps<'option'> & {
  children: string;
};

const Option = (props: IOptionProps) => {
  return <option {...props} label={props.children}></option>;
};

Select.Option = Option;

export default Select;
