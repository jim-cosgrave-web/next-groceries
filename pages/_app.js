import Layout from '../components/Layout/Layout';
import Head from 'next/head';

import 'react-bootstrap-typeahead/css/Typeahead-bs4.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './../public/styles/main.scss';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
    return (
        <div>
            <Head>
                <link rel="shortcut icon" href="/images/favicon-32x32.png" />
            </Head>
            <Layout>
                <div>
                    <Component {...pageProps} />
                </div>
            </Layout>
        </div>
    );
}