import { Timestamp } from 'firebase/firestore';

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export interface DaySchedule {
  opening: string;
  closing: string;
  isOpen: boolean;
}

export interface BlockDate {
  open: boolean;
  hours: BlockDateHour[];
}

export interface BlockDateHour {
  from: string;
  to: string;
}

export interface WeeklyDates {
  [dayOfWeek: number]: DaySchedule;
}
export interface DateSchedule {
  [date: string]: DaySchedule;
}

export interface BlockDates {
  [date: string]: BlockDate;
}

export interface Schedule {
  'weekly-dates': WeeklyDates;
  'block-dates': BlockDates;
  'special-dates': DateSchedule;
  settings: any;
}

export interface Reservations {
  [fecha: string]: {
    [hora: string]: string[];
  };
}

export type Location = {
  id: string;
  name: string;
  company: string;
  address: string;
  schedule?: Schedule;
  reservations?: Reservations;
  status: string;
};

export interface Hour {
  value: string;
  label: string;
  disabled?: boolean;
}
export type Reason = {
  id: string;
  name: string;
  company: string;
  name_en: string;
};

export type StatusHistory = {
  status: string;
  createdAt: Timestamp;
  user: string;
};

export type Payment = {
  amount: number;
  paymentMethod: string;
  createdAt: Timestamp;
};

export type Reservation = {
  acceptReceiveNews: boolean;
  id: string;
  name: string;
  namesAndSurnames?: string;
  location: Location | undefined;
  identification: string;
  email: string;
  numberPeople: number;
  numberPets: number;
  phone: string;
  reason: Reason | undefined;
  alreadyMember?: boolean;
  companyName?: string;
  datetime: Timestamp | Date | string | null;
  createdAt: string | Date | number;
  updatedAt: string | Date | number;
  status: string;
  statusHistory: StatusHistory[];
  from: string;
  payment: Payment;
  time: string;
  timeStart: string;
  timeEnd: string;
  date: string;
  code?: string;
  startDatetime?: Timestamp | Date | string | null;
  endDatetime?: Timestamp | Date | string | null;
};

export enum FormType {
  NEW_RESERVATION = 'NEW_RESERVATION',
  VALIDATE_RESERVATION = 'VALIDATE_RESERVATION',
  EDIT_RESERVATION = 'EDIT_RESERVATION',
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
}

export interface Day {
  value: number;
  label: string;
}

export interface CompanyOthersConfig {
  isSourceActive: boolean;
  populateForm: {
    isActive: boolean;
    fields?: {
      [key: string]: string;
    };
  };
}

export type Company = {
  logoUrl: string;
  termsAndConditionUrl: string;
  name: string;
  id: string;
  externalId: string;
  type: string;
  status?: 'active' | 'inactive';
  isLeadsActive: boolean;
  isSourceActive: boolean;
  others: CompanyOthersConfig;
  settings: {
    reservationUpdates: {
      thanksForVisitUs: {
        active: boolean;
        html: {
          data: any;
          es: string;
          en: string;
        };
      };
    };
    integrations?: {
      googleAds?: {
        conversionId: string;
        conversionTag: string;
      };
      metaAds?: {
        pixelId: string;
        accessToken: string;
      };
    };
  };
};

export enum FormFieldType {
  TEXT = 'text',
  SELECT = 'select',
  DATE = 'date',

  NUMBER = 'number',
  EMAIL = 'email',
}
export type IFormFieldBase = {
  id: string;
  name: string;
  nameEn: string;
  placeholder?: string;
  placeholderEn?: string;
  required: boolean;
  hasConfirmation?: boolean;
  type: FormFieldType | undefined;
  defaultValue?: string;
  defaultValueEn?: string;
  options?: string[];
  optionsEn?: string[];
};

export type Form = {
  id: string;
  index?: number;
  company: string;
  fields: FormField[];
};

export type FormField = {
  slug?: string;
  defaultValue: LanguageValues;
  name: LanguageValues;
  placeholder: LanguageValues;
  required: boolean;
  hasConfirmation?: boolean;
  type: FormFieldType; // Aquí deberías proporcionar el tipo correcto para 'FormFieldType.TEXT'
  options?: FormOption[];
  confirmationSlugField?: string;
};

export type LanguageValues = {
  es: string;
  en: string;
};

export type FormOption = {
  id: string;
  value: LanguageValues;
};

type FieldTypes = {
  [key: string]: string | number | boolean | Date | Location | undefined | Timestamp | null;
};

export interface ReservationFormFields extends FieldTypes {
  numberPeople: number;
  date: string | Date;
  startDatetime: string | Date | Timestamp;
  endDatetime: string | Date | Timestamp;
  startHour: string;
  endHour: string;
  location: string | Location;
  acceptTermsConditions: boolean;
  acceptReceiveNews: boolean;
}

export type EmailData = {
  data: object;
  html: string;
  text?: string;
};

export type EmailTarget = {
  admin: EmailData;
  client: EmailData;
};

export interface EmailFormFields {
  new_reservation: EmailTarget;
  cancellation: EmailTarget;
  update_reservation: EmailTarget;
}
