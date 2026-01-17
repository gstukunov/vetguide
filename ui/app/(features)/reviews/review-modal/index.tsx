import React, { useEffect } from 'react';

import Image from 'next/image';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { DogIcon } from '@/(shared)/icons/dog';
import Button from '@/(shared)/ui/button';
import { Modal } from '@/(shared)/ui/modal';
import { StarRating } from '@/(shared)/ui/star-rating';
import Textarea from '@/(shared)/ui/textarea';

import { ReviewModalProps } from './model/types';
import { ReviewFormData, reviewFormSchema } from './model/validation';
import styles from './styles.module.scss';

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    mode: 'onChange',
    defaultValues: {
      story: '',
      liked: '',
      disliked: '',
      rating: 0,
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onFormSubmit = (data: ReviewFormData) => {
    // Combine story, liked, and disliked into description
    const descriptionParts = [];
    if (data.story) descriptionParts.push(`История: ${data.story}`);
    if (data.liked) descriptionParts.push(`Понравилось: ${data.liked}`);
    if (data.disliked)
      descriptionParts.push(`Не понравилось: ${data.disliked}`);

    const description = descriptionParts.join('\n\n') || data.story || '';

    onSubmit({
      title: data.story || 'Отзыв о враче',
      description,
      rating: data.rating,
    });

    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        className={styles.reviewModalContent}
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <h2 className={styles.title}>Как вам врач?</h2>

        <div className={styles.doctorInfo}>
          <div className={styles.doctorPhoto}>
            {doctor?.photoUrl ? (
              <Image
                src={doctor.photoUrl}
                alt={doctor.fullName}
                width={80}
                height={80}
                className={styles.doctorImage}
              />
            ) : (
              <div className={styles.doctorAvatar}>
                <DogIcon />
              </div>
            )}
          </div>
          <div className={styles.doctorDetails}>
            <h3 className={styles.doctorName}>{doctor?.fullName}</h3>
            <div className={styles.specializations}>
              {doctor?.specialization?.map((spec, index) => (
                <span key={index} className={styles.specialization}>
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <Textarea
            label="Ваша история"
            placeholder="Расскажите о вашем опыте..."
            rows={4}
            className={styles.textarea}
            {...register('story')}
            error={errors.story?.message}
          />

          <Textarea
            label="Понравилось"
            placeholder="Что вам понравилось..."
            rows={3}
            className={styles.textarea}
            {...register('liked')}
            error={errors.liked?.message}
          />

          <Textarea
            label="Не понравилось"
            placeholder="Что можно улучшить..."
            rows={3}
            className={styles.textarea}
            {...register('disliked')}
            error={errors.disliked?.message}
          />
        </div>

        <div className={styles.ratingSection}>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <StarRating
                color="var(--secondary-color-bg)"
                rating={field.value}
                onRatingChange={field.onChange}
                size="large"
              />
            )}
          />
          {errors.rating && (
            <div className={styles.ratingError}>{errors.rating.message}</div>
          )}
        </div>

        <div className={styles.buttonSection}>
          <Button
            type="submit"
            colorType="secondary"
            className={styles.submitButton}
            disabled={!isValid}
          >
            Оставить отзыв
          </Button>
        </div>
      </form>
    </Modal>
  );
};
