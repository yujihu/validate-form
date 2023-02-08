import * as React from 'react';
import * as ReactDom from 'react-dom';

import type {
  Model,
  Control,
  InstanceCallback,
  FormInstance,
  ReducerAction,
  ControlValue,
  ModelValue,
  Validate,
  Status,
  Callback,
} from '../interface';

export class FormStore {
  private forceRootUpdate: () => void;

  private model: Model = {};

  private control: Control = {};

  private isSchedule: boolean = false;

  private callback: InstanceCallback = {};

  private pendingValidateQueue: Array<Function> = [];

  private defaultFormValue: Record<string, any> = {};

  constructor(
    forceRootUpdate: () => void,
    defaultFormValue: Record<string, any> = {}
  ) {
    this.forceRootUpdate = forceRootUpdate;
    this.defaultFormValue = defaultFormValue;
  }

  public getForm = (): FormInstance => {
    return {
      setCallback: this.setCallback,
      dispatch: this.dispatch,
      registerValidateFields: this.registerValidateFields,
      unRegisterValidate: this.unRegisterValidate,
      resetFields: this.resetFields,
      setFieldsValue: this.setFieldsValue,
      setFields: this.setFields,
      getFieldValue: this.getFieldValue,
      getFieldsValue: this.getFieldsValue,
      validateFields: this.validateFields,
      submit: this.submit,
    };
  };

  private setCallback = (callback: InstanceCallback) => {
    this.callback = callback;
  };

  static createValidate(validate: Validate): ModelValue {
    const { value, rule, required, message } = validate;
    return {
      value,
      rule: rule || (() => true),
      required: required || false,
      message: message || '',
      status: 'pending',
    };
  }

  private registerValidateFields = (
    name: string,
    control: ControlValue,
    model: Validate
  ) => {
    if (this.defaultFormValue[name]) {
      model.value = this.defaultFormValue[name];
    }
    const validate = FormStore.createValidate(model);
    this.model[name] = validate;
    this.control[name] = control;
  };

  private unRegisterValidate = (name: string) => {
    delete this.model[name];
    delete this.control[name];
  };

  private notifyChange = (name: string) => {
    const controller = this.control[name];
    if (controller) controller.changeValue();
  };

  private setValueClearStatus = (
    model: ModelValue,
    name: string,
    value: any
  ) => {
    model.value = value;
    model.status = 'pending';
    this.notifyChange(name);
  };

  private resetFields = () => {
    Object.keys(this.model).forEach((modelName) => {
      this.setValueClearStatus(this.model[modelName], modelName, null);
    });
  };

  private validateFieldValue = (name: string, forceUpdate: boolean = false) => {
    const model = this.model[name];
    const lastStatus = model.status;
    if (!model) return;
    const { required, rule, value } = model;
    let status: Status = 'fulfilled';
    if (required && !value) {
      status = 'rejected';
    } else if (rule instanceof RegExp) {
      status = rule.test(value) ? 'fulfilled' : 'rejected';
    } else if (typeof rule === 'function') {
      status = rule(value) ? 'fulfilled' : 'rejected';
    }
    model.status = status;
    if (lastStatus !== status || forceUpdate) {
      const notify = this.notifyChange.bind(this, name);
      this.pendingValidateQueue.push(notify);
    }
    this.scheduleValidate();
    return status;
  };

  private scheduleValidate() {
    if (this.isSchedule) return;
    this.isSchedule = true;
    Promise.resolve().then(() => {
      ReactDom.unstable_batchedUpdates(() => {
        do {
          const notify = this.pendingValidateQueue.shift();
          notify && notify();
        } while (this.pendingValidateQueue.length > 0);
        this.isSchedule = false;
      });
    });
  }

  private setFieldsValue = (name: string, modelValue: any) => {
    const model = this.model[name];
    if (!model) return;
    if (typeof modelValue === 'object') {
      const { message, rule, value } = modelValue;
      if (message) model.message = message;
      if (rule) model.rule = rule;
      if (value) model.value = value;
      model.status = 'pending';
      this.validateFieldValue(name, true);
    } else {
      this.setValueClearStatus(model, name, modelValue);
    }
  };

  private setFields = (fields: Record<string, any>) => {
    Object.keys(fields).forEach((modelName) => {
      this.setFieldsValue(modelName, fields[modelName]);
    });
  };

  private getFieldValue = (name: string) => {
    const model = this.model[name];
    if (!model && this.defaultFormValue[name])
      return this.defaultFormValue[name];
    return model ? model.value : null;
  };

  private getFieldsValue = () => {
    const formData: Record<string, any> = {};
    Object.keys(this.model).forEach((modelName) => {
      formData[modelName] = this.model[modelName].value;
    });
    return formData;
  };

  private validateFields = (callback: Callback) => {
    let status = true;
    Object.keys(this.model).forEach((modelName) => {
      const modelStates = this.validateFieldValue(modelName, true);
      if (modelStates === 'rejected') status = false;
    });
    callback(status);
  };

  private submit = (callback?: Callback) => {
    this.validateFields((res) => {
      const { onFinish, onFinishFailed } = this.callback;
      callback && callback(res);
      if (!res)
        onFinishFailed &&
          typeof onFinishFailed === 'function' &&
          onFinishFailed();
      onFinish &&
        typeof onFinish === 'function' &&
        onFinish(this.getFieldsValue());
    });
  };

  private getFieldModel = (name: string): ModelValue => {
    return this.model[name] || {};
  };

  private dispatch = (action: ReducerAction) => {
    switch (action.type) {
      case 'setFieldsValue':
        return this.setFieldsValue(action.name, action.value);
      case 'getFieldValue':
        return this.getFieldValue(action.name);
      case 'validateFieldValue':
        return this.validateFieldValue(action.name);
      case 'getFieldModel':
        return this.getFieldModel(action.name);
      default:
        break;
    }
  };
}

function useForm(
  form?: FormInstance,
  defaultFormValue: Record<string, any> = {}
): FormInstance {
  const formRef = React.useRef<FormInstance | null>(null);
  const [, forceUpdate] = React.useState({});
  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      const forceReRender = () => {
        forceUpdate({});
      };
      const formStoreCurrent = new FormStore(forceReRender, defaultFormValue);
      formRef.current = formStoreCurrent.getForm();
    }
  }
  return formRef.current;
}

export default useForm;
