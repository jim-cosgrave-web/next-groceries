import React, { useEffect } from 'react';
import Link from 'next/link';
import Router from "next/router";

const Index = () => {
    useEffect(() => {
        Router.replace('/grocery-list');
    }, [])
    

    return (
        <div>
            <h1>Loading...</h1>
        </div>
    )
}

export default Index;