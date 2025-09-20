// client/pages/_app.js
import '../styles/globals.css'; // Make sure you have Tailwind CSS setup
import AppLayout from '../components/layout/AppLayout';
import { useRouter } from 'next/router';

const noLayoutRoutes = ['/login', '/signup', '/forgot-password'];

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  if (noLayoutRoutes.includes(router.pathname)) {
    return <Component {...pageProps} />;
  }

  return (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  );
}

export default MyApp;