import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { Company } from '~/core/types';
import { doc, getDoc } from 'firebase/firestore';
import firebaseFirestore from '~/config/firebase/firestore';

export const useCompanyStatus = () => {
  const { user, signOut } = useAuth();
  const [isCompanyActive, setIsCompanyActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [companyStatus, setCompanyStatus] = useState<'active' | 'inactive' | null>(null);

  const checkCompanyStatus = async (companyId: string) => {
    try {
      setIsLoading(true);
      const companyRef = doc(firebaseFirestore, 'companies', companyId);
      const companyDoc = await getDoc(companyRef);

      if (companyDoc.exists()) {
        const companyData = companyDoc.data() as Company;
        const status = companyData.status || 'active'; // Default to active if status is not set

        setCompanyStatus(status);
        setIsCompanyActive(status !== 'inactive');

        // If company is inactive, automatically sign out the user
        if (status === 'inactive') {
          console.warn('Company is inactive. Signing out user.');
          await signOut();
          localStorage.removeItem('user');
          window.location.href = '/login?error=company_inactive';
        }
      } else {
        // Company doesn't exist, treat as inactive
        setCompanyStatus('inactive');
        setIsCompanyActive(false);
        await signOut();
        localStorage.removeItem('user');
        window.location.href = '/login?error=company_not_found';
      }
    } catch (error) {
      console.error('Error checking company status:', error);
      setIsCompanyActive(false);
      setCompanyStatus('inactive');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.company?.id) {
      checkCompanyStatus(user.company.id);
    } else {
      setIsLoading(false);
    }
  }, [user?.company?.id]);

  return {
    isCompanyActive,
    isLoading,
    companyStatus,
    checkCompanyStatus,
  };
};
