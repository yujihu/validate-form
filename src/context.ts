import { createContext } from 'react';
import type { FormInstance } from './interface';

const FormContext = createContext<FormInstance | null>(null);

export default FormContext;
