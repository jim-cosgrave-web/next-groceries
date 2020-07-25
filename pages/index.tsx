import React, { useEffect } from 'react';
import Link from 'next/link';
import Router from "next/router";
import Loader from '../components/Shared/Loader';

const Index = () => {
    useEffect(() => {
        Router.replace('/grocery-list');
    }, [])
    

    return (
        <div>
            <Loader />
        </div>
    )
}

export default Index;