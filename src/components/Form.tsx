import * as React from 'react';

import useForm from '../hooks/useForm';
import FormContext from '../context';
import type { FormInstance } from '../interface';

interface IProps {
  form?: FormInstance;
  onFinish?: (value: Record<string, any>) => any;
  onFinishFailed?: () => any;
  initialValues?: Record<string, any>;
  children: React.ReactNode;
}

export type FormRef = Omit<FormInstance, 'setCallback'>;

const Form = React.forwardRef<FormRef, IProps>((props, ref) => {
  const { form, initialValues, onFinish, onFinishFailed, children } = props;
  const formInstance = useForm(form, initialValues);
  const { setCallback, ...providerFormInstance } = formInstance;
  setCallback({
    onFinish,
    onFinishFailed,
  });

  React.useImperativeHandle(ref, () => providerFormInstance, []);
  const RenderChildren = (
    <FormContext.Provider value={formInstance}>{children}</FormContext.Provider>
  );
  return (
    <form
      onReset={(e) => {
        e.preventDefault();
        e.stopPropagation();
        formInstance.resetFields();
      }}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        formInstance.submit();
      }}
    >
      {RenderChildren}
    </form>
  );
});

Form.displayName = 'Form';

export default Form;
