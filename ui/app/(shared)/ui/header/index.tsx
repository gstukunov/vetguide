'use client';

import React, { useEffect } from 'react';

import Link from 'next/link';

import clsx from 'clsx';

import { useGetCurrentUser } from '@/(shared)/api/hooks/auth';
import { useHydration } from '@/(shared)/hooks';
import { AvatarIcon } from '@/(shared)/icons/avatar';
import { LoginIcon } from '@/(shared)/icons/login';
import { LogoIcon } from '@/(shared)/icons/logo';
import useAuthStore from '@/(stores)/auth';
import useUserStore from '@/(stores)/user';

import styles from './styles.module.scss';

import type { HeaderProps } from './model/types';

const Header: React.FC<HeaderProps> = ({ className, isAuthPages }) => {
  const { isAuthenticated, accessToken, signOut } = useAuthStore();
  const { user } = useUserStore();
  const { refetch } = useGetCurrentUser();
  const isHydrated = useHydration();

  useEffect(() => {
    if (isAuthenticated && accessToken && !user) {
      refetch();
    }
  }, [isAuthenticated, accessToken, user, refetch]);
  useEffect(() => {
    if (
      isAuthenticated &&
      accessToken &&
      !localStorage.getItem('accessToken')
    ) {
      signOut();
    }
  }, [isAuthenticated, accessToken, signOut]);

  return (
    <header className={clsx(styles.header, className)}>
      <Link className={styles.logo} href="/">
        <LogoIcon width={124} height={22} className={styles.logoIcon} />
      </Link>

      {isHydrated && isAuthenticated && user && (
        <Link href="/profile" className={styles.avatar}>
          <div className={styles.avatarWrapper}>
            <span className={styles.avatarText}>
              Привет, {user.fullName.split(' ')[0]}!
            </span>
            <AvatarIcon width={32} height={32} />
          </div>
        </Link>
      )}
      {isHydrated && !isAuthenticated && !isAuthPages && (
        <Link href="/auth">
          <LoginIcon width={30} />
        </Link>
      )}
    </header>
  );
};

export default Header;
