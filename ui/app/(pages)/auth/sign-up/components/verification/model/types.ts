export interface PhoneVerificationProps {
  phone: string;
  setPhone: (val: string) => void;
  error?: string;
  disabled?: boolean;
  onSuccess?: () => void;
}
