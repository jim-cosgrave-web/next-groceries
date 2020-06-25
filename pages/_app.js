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
                <title>Groceries</title>

                <link rel="manifest" href="/manifest.json" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="shortcut icon" href="/images/favicon-32x32.png" />
                <link rel="apple-touch-icon" sizes="72x72" href="icon-72x72.png" />
                {/* <link rel="apple-touch-icon" sizes="96x96" href="icon-96x96.png" />
                <link rel="apple-touch-icon" sizes="128x128" href="icon-128x128.png" /> */}
            </Head>
            <Layout>
                <div>
                    <Component {...pageProps} />
                </div>
            </Layout>
        </div>
    );
}