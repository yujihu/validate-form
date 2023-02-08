import * as React from 'react';

const Input = (props: React.ComponentProps<'input'>) => {
  return <input className="form-input" {...props} />;
};

export default Input;
