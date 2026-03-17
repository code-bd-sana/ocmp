import Link from 'next/link';
import React from 'react';

const HomePage = () => {
    return (
        <div className='w-100 h-screen flex flex-col justify-center items-center mx-auto'>
            <h1 className='text-2xl font-bold'>Welcome to OCMP</h1>
            <div className='flex w-100 justify-between items-center my-10'>
                <Link className='bg-primary text-white px-4 py-2 rounded-md' href="/signin">Login</Link>
            <br />
            <Link className='bg-primary text-white px-4 py-2 rounded-md' href="/dashboard">Dashboard</Link>
            </div>
        </div>
    );
};

export default HomePage;
