export interface PhoneVerificationProps {
  phone: string;
  setPhone: (phone: string) => void;
  setCode: (code: string) => void;
  disabled?: boolean;
  onSuccess?: () => void;
}
