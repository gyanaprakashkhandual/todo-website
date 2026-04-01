'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';

export default function OAuth2RedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Save token to localStorage
      localStorage.setItem('token', token);

      // If you have a Redux auth slice, dispatch login here
      // dispatch(setToken(token));

      // Redirect to your main page
      router.replace('/');
    } else {
      // No token — redirect to login
      router.replace('/login');
    }
  }, []);

  return (
    <div>Signing you in...</div>
  );
}