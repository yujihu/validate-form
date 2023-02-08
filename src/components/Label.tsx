import * as React from 'react';

interface IProps {
  label?: string;
  height?: number;
  labelWidth?: number;
  required?: boolean;
  children?: React.ReactNode;
}

const Label = (props: IProps) => {
  const { children, label, labelWidth, required, height } = props;
  return (
    <div className="form-label" style={{ height: height + 'px' }}>
      <div className="form-label-name" style={{ width: `${labelWidth}px` }}>
        {required ? <span style={{ color: 'red' }}>*</span> : null}
        {label}:
      </div>
      <div className="form-label-content">{children}</div>
    </div>
  );
};

export default Label;
