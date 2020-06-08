import Layout from '../components/Layout/Layout';
import './../public/styles/main.scss';
import Head from 'next/head';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
    return (
        <Layout>
            <div>
                <Component {...pageProps} />
            </div>
        </Layout>
    );
}