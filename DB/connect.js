const mongoose=require('mongoose');
const db = process.env.DATABASE;

mongoose.connect(db)
    .then(() => {
        console.log('Connection successful');
    })
    .catch((err) => {
        console.error('No connection:', err);
    });
