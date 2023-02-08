import * as React from 'react';
import type { Status } from '../interface';

interface IProps {
  name: string;
  value: any;
  status: Status;
  message: string;
  required: boolean;
}

const Message = (props: IProps) => {
  const { status, message, required, name, value } = props;
  let showMessage: string = '';
  let color = '#fff';
  if (required && !value && status === 'rejected') {
    showMessage = `${name} 为必填项`;
    color = 'red';
  } else if (status === 'rejected') {
    showMessage = message;
    color = 'red';
  } else if (status === 'pending') {
    showMessage = '';
  } else if (status === 'fulfilled') {
    showMessage = '校验通过';
    color = 'green';
  }
  return (
    <div className="form-message">
      <span style={{ color }}>{showMessage}</span>
    </div>
  );
};

export default Message;
