'use client';

import { useMemo } from 'react';
import { createApiClient } from '../api-client';

export function useApiClient() {
  const apiClient = useMemo(() => {
    return createApiClient();
  }, []);

  return apiClient;
}
