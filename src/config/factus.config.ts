export default () => ({
        client_id: process.env.FACTUS_CLIENT_ID,
        client_secret: process.env.FACTUS_CLIENT_SECRET,
        factusUser: process.env.FACTUS_USERNAME,
        factusPass: process.env.FACTUS_PASSWORD,
})