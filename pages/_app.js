import Layout from '../components/Layout/Layout';

import 'react-bootstrap-typeahead/css/Typeahead-bs4.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './../public/styles/main.scss';

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