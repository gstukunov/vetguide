import {
  Body,
  Controller,
  Post,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/types/role.enum';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewStatusDto } from './dto/update-review.status.dto';

@ApiTags('Отзывы')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // Создание отзыва (доступно USER)
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.USER)
  async create(@Body() createDto: CreateReviewDto, @Req() req) {
    return this.reviewService.create(createDto, req.user.id);
  }

  // Обновление статуса (только SUPER_ADMIN)
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateReviewStatusDto,
  ) {
    return this.reviewService.updateStatus(parseInt(id), updateDto);
  }
}
