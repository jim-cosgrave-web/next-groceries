import fetch from 'isomorphic-unfetch';
import { NextPageContext } from "next";
import Router from "next/router";
import { env } from '../util/environment';

export async function myGet(url: string, ctx: NextPageContext) {
    const cookie = ctx.req?.headers.cookie;

    const resp = await fetch(url, {
        headers: {
            cookie: cookie!
        }
    });

    if(resp.status === 401 && !ctx.req) {
        //
        // Client side
        //
        Router.replace('/login');
        return;

       // return { status: 'First one!!!' };
    } else if (resp.status === 401 && ctx.req) {
        //
        // Server side
        //
        ctx.res.writeHead(302, {
           Location: env.siteUrl + 'login'
        });

         ctx.res?.end();
    } else {
        const json = await resp.json();
        return json;
    }
}
