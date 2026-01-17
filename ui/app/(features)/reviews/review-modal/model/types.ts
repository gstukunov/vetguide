import { Doctor } from '@/(shared)/api/api';

export type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
  onSubmit: (data: {
    title: string;
    description: string;
    rating: number;
  }) => void;
};
