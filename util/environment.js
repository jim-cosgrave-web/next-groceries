const env = {
    siteUrl: process.env.NODE_ENV !== 'development' ? 'https://next-starter-one.now.sh/' : 'http://localhost:3000/',
    apiUrl: process.env.NODE_ENV !== 'development' ? 'https://next-starter-one.now.sh/api/' : 'http://localhost:3000/api/'
};


export { env };