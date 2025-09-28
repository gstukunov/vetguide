import { UserRole } from './role.enum';
import { Review } from '../../review/entities/review.entity';
import { VetClinic } from '../../vet-clinic/entities/vet-clinic.entity';

export type User = {
  id: string;
  phone: string;
  password: string;
  fullName: string;
  isVerified: boolean;
  role: UserRole;
  reviews: Review[];
  clinic: VetClinic;
  createdAt: Date;
  updatedAt: Date;
};

export type SafeUser = Omit<User, 'password'>;
