import React from 'react';
import Link from 'next/link';
import { NextPageContext } from 'next';
import { myGet } from '../util/myGet';
import { env } from '../util/environment';

const apiUrl = env.apiUrl + 'securedData';

const Index = () => {
    return (
        <div>
            <h1>Index Page</h1>
            <div>
                <Link href="/securedData">
                    <a>Secured Data</a>
                </Link>
            </div>
            <div>
                <Link href="/login">
                    <a>Login</a>
                </Link>
            </div>
        </div>
    )
}

Index.getInitialProps = async (ctx: NextPageContext) => {
    const json = await myGet(apiUrl, ctx);
    return { data: json };
}

export default Index;