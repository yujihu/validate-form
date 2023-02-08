import * as React from 'react';

import FormContext from '../context';

import Label from './Label';
import Message from './Message';

import type { Validate, ControlValue } from '../interface';

interface IProps {
  name: string;
  label?: string;
  height?: number;
  labelWidth?: number;
  required?: boolean;
  rules?: Validate;
  trigger?: string;
  validateTrigger?: string;
  children?: React.ReactElement;
}

const FormItem = (props: IProps) => {
  const {
    name,
    label,
    height = 50,
    labelWidth,
    required = false,
    rules = {} as Validate,
    trigger = 'onChange',
    validateTrigger = 'onChange',
    children,
  } = props;
  const formInstance = React.useContext(FormContext);
  const { registerValidateFields, dispatch, unRegisterValidate } =
    formInstance!;
  const [, forceUpdate] = React.useState({});

  const onStoreChange = React.useMemo<ControlValue>(() => {
    return {
      changeValue() {
        forceUpdate({});
      },
    };
  }, [formInstance]);

  React.useEffect(() => {
    name && registerValidateFields(name, onStoreChange, { ...rules, required });
    return function () {
      name && unRegisterValidate(name);
    };
  }, [onStoreChange]);

  const getControlled = (child: React.ReactElement) => {
    const mergeChildrenProps = { ...child.props };
    if (!name) return mergeChildrenProps;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      dispatch({ type: 'setFieldsValue', name, value });
    };
    mergeChildrenProps[trigger] = handleChange;
    if (required || rules) {
      /* 验证表单单元项的值 */
      mergeChildrenProps[validateTrigger] = (
        e: React.SyntheticEvent<HTMLElement>
      ) => {
        /* 当改变值和验证表单，用统一一个事件 */
        if (validateTrigger === trigger) {
          handleChange(e as React.ChangeEvent<HTMLInputElement>);
        }
        /* 触发表单验证 */
        dispatch({ type: 'validateFieldValue', name });
      };
    }
    mergeChildrenProps.value = dispatch({ type: 'getFieldValue', name }) || '';
    return mergeChildrenProps;
  };
  let renderChildren;
  if (React.isValidElement(children)) {
    /* 获取 | 合并 ｜ 转发 | =>  props  */
    renderChildren = React.cloneElement(children, getControlled(children));
  } else {
    renderChildren = children;
  }
  return (
    <Label
      height={height}
      label={label}
      labelWidth={labelWidth}
      required={required}
    >
      {renderChildren}
      <Message name={name} {...dispatch({ type: 'getFieldModel', name })} />
    </Label>
  );
};

export default FormItem;
