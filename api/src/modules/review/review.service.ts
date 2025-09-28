import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { DoctorService } from '../doctor/doctor.service';
import { UserService } from '../user/user.service';
import { ReviewStatus } from './entities/review.entity';
import { UpdateReviewStatusDto } from './dto/update-review.status.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly doctorService: DoctorService,
    private readonly userService: UserService,
  ) {}

  async create(createDto: CreateReviewDto, userId: string): Promise<Review> {
    const doctor = await this.doctorService.findOne(createDto.doctorId);
    const user = await this.userService.findById(userId); // Используем новый метод

    const review = this.reviewRepository.create({
      ...createDto,
      doctor,
      user,
      status: ReviewStatus.PENDING,
    });

    return this.reviewRepository.save(review);
  }

  async updateStatus(
    id: string,
    updateDto: UpdateReviewStatusDto,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    review.status = updateDto.status;
    return this.reviewRepository.save(review);
  }
}
