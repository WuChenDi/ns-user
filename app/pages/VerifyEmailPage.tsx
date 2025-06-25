import type { FC } from 'hono/jsx';
import { Layout } from '@/components/Layout';

interface VerifyEmailPageProps {
  title?: string;
  success?: boolean;
  message?: string;
}

export const VerifyEmailPage: FC<VerifyEmailPageProps> = ({
  title = 'Email Verification',
  success = false,
  message = ''
}) => {
  return (
    <Layout title={title}>
      <div class="flex flex-col items-center bg-white shadow-lg rounded-lg p-8 w-full max-w-md mx-auto">
        {success ? (
          <>
            <div class="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-green-100 mb-6">
              <svg class="h-10 w-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-green-600 mb-4">Email Verified!</h1>
            <p class="text-lg text-green-700 mb-8">{message}</p>
            <a class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700" href="/account/setting">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Go to Settings
            </a>
          </>
        ) : (
          <>
            <div class="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-red-100 mb-6">
              <svg class="h-10 w-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-red-600 mb-4">Verification Failed</h1>
            <p class="text-lg text-red-700 mb-8">{message}</p>
            <a class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700" href="/account/setting">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
              </svg>
              Back to Settings
            </a>
          </>
        )}
      </div>
    </Layout>
  );
};
