export type Status = 'pending' | 'fulfilled' | 'rejected';

export type ModelValue = {
  value: any;
  rule: RegExp | ((value: any) => boolean);
  required: boolean;
  message: string;
  status: Status;
};

export type Validate = Partial<Omit<ModelValue, 'status'>>;

export type Model = Record<string, ModelValue>;

export type ControlValue = {
  changeValue: () => any;
};

export type Control = Record<string, ControlValue>;

export type InstanceCallback = {
  onFinish?: (value: Record<string, any>) => any;
  onFinishFailed?: () => any;
};

export enum FormMethods {
  setCallback = 'setCallback',
  dispatch = 'dispatch',
  registerValidateFields = 'registerValidateFields',
  unRegisterValidate = 'unRegisterValidate',
  resetFields = 'resetFields',
  setFieldsValue = 'setFieldsValue',
  setFields = 'setFields',
  getFieldValue = 'getFieldValue',
  getFieldsValue = 'getFieldsValue',
  validateFields = 'validateFields',
  submit = 'submit',
}

export type Callback = (passed: boolean) => any;

interface UpdateAction {
  type: 'setFieldsValue';
  name: string;
  value: any;
}

interface GetValueAction {
  type: 'getFieldValue';
  name: string;
}

interface ValidateAction {
  type: 'validateFieldValue';
  name: string;
}

interface GetModelAction {
  type: 'getFieldModel';
  name: string;
}

export type ReducerAction =
  | UpdateAction
  | GetValueAction
  | ValidateAction
  | GetModelAction;

export interface FormInstance {
  setCallback: (callback: InstanceCallback) => void;
  dispatch: (action: ReducerAction) => any;
  registerValidateFields: (
    name: string,
    control: ControlValue,
    model: Validate
  ) => void;
  unRegisterValidate: (name: string) => void;
  resetFields: () => void;
  setFieldsValue: (name: string, modelValue: string | Validate) => void;
  setFields: (fields: Record<string, any>) => void;
  getFieldValue: (name: string) => any;
  getFieldsValue: () => Record<string, any>;
  validateFields: (callback: Callback) => void;
  submit: (callback?: Callback) => void;
}
