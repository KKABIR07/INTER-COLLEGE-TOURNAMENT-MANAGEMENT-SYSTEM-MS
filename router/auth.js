const express=require('express');
const router=express.Router();
const bcrypt = require('bcryptjs');
require('../DB/connect');
// const User=require("../models/userScema");
// const  Player  = require('../models/userScema');
const jwt=require('jsonwebtoken');
const authenticate=require("../middleware/authenticate");
const { User,Player } = require("../models/userScema");
const League = require('../models/playerScema');
const Winner = require ('../models/winnerScema');
const fwinner=require('../models/finalWinner');


router.get('/', (req, res) => {
    res.send('hi');
});


router.post('/register',async (req,res)=>{
    // console.log(req.body);
    // res.json({message:req.body});
    const{name,email,phone,password,repassword}=req.body;
    if(!name||!email||!phone||!password||!repassword){
        return res.status(422).json({error:"mak"});
    }

    try{
      const userExist = await User.findOne({email:email})
      if(userExist){
            return res.status(422).json({error:"email already exist"});
        }else if(password!==repassword){
            return res.status(422).json({error:"password not match"});
        }else{
            const user =new User({name,email,phone,password,repassword});

            await user.save();

        
            res.status(201).json({message:"user regester successfully"});

        }
        
        
        
        // .then((userExist)=>{
        //     if(userExist){
        //         return res.status(422).json({error:"email already exist"});
        //     }

        //     const user =new User({name,email,phone,password,repassword});
        //     //.......
        //     user.save().then(()=>{
        //         res.status(201).json({message:"user regester successfully"});
        //     }).catch((err)=>res.status(500).json({error:"fail in reg"}));
        // }).catch((err)=>res.status(500).json({error:"fail"}));

    }catch (err){
        console.log(err);
    }

    
});

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Please fill in the data" });
        }

        const userLogin = await User.findOne({ email: email });
        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            const token = await userLogin.generateAuthToken();
            res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 86400000),
                httpOnly: true,
                sameSite: 'Lax',
                secure: process.env.NODE_ENV === 'production',
                domain: 'localhost', 
                path: '/' 
            });

            console.log("Cookie set with token:", token);

            res.json({ message: "User signin successful" });
        } else {
            res.status(400).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        console.log(err);
    }
});





router.post("/create", async (req, res) => {
    const { leagueName, Player1Name, Player2Name, Player3Name, Player4Name, Player5Name, Player6Name } = req.body;

    if (!leagueName || !Player1Name || !Player2Name || !Player3Name || !Player4Name || !Player5Name || !Player6Name) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Create players in the database
        const players = await Player.insertMany([
            { name: Player1Name }, { name: Player2Name }, { name: Player3Name },
            { name: Player4Name }, { name: Player5Name }, { name: Player6Name }
        ]);

        // Generate fixtures based on the created player names
        const fixtures = [
            [[Player1Name, Player2Name], [Player3Name, Player4Name], [Player5Name, Player6Name]],
            [[Player1Name, Player3Name], [Player2Name, Player5Name], [Player4Name, Player6Name]],
            [[Player1Name, Player4Name], [Player2Name, Player6Name], [Player3Name, Player5Name]],
            [[Player1Name, Player5Name], [Player2Name, Player4Name], [Player3Name, Player6Name]],
            [[Player1Name, Player6Name], [Player2Name, Player3Name], [Player4Name, Player5Name]]
        ];

        // Save league name and fixtures into database
        const newLeague = new League({
            name: leagueName,
            fixtures: fixtures,
            players: players
        });

        await newLeague.save();

        return res.status(200).json({
            message: "League and fixtures created successfully",
            league: newLeague
        });

    } catch (error) {
        console.error("Error creating league and fixtures:", error);
        return res.status(500).json({ error: "Failed to create league and fixtures" });
    }
});




    router.get('/pointtable', authenticate, (req, res) => {
        console.log('History endpoint');
        res.send(req.rootUser);
    });


    router.post('/final-winner', async (req, res) => {
        const { leagueName, finalName } = req.body;
    
        try {
            // Find or create the fwinner document by leagueName
            let winner = await fwinner.findOne({ leagueName });
    
            if (!winner) {
                // If fwinner document doesn't exist, create a new one with an empty finalNames array
                winner = new fwinner({ leagueName, finalNames: [] });
            }
    
            // Ensure finalNames is an array (optional, depending on your schema)
            if (!Array.isArray(winner.finalNames)) {
                winner.finalNames = [];
            }
    
            // Check if finalName already exists in finalNames array
            if (!winner.finalNames.includes(finalName)) {
                // Push finalName into the finalNames array if it's not already there
                winner.finalNames.push(finalName);
    
                // Save the updated fwinner document
                await winner.save();
    
                console.log(`Final winner saved: ${finalName} for league ${leagueName}`);
                res.status(201).json({ message: 'Final winner saved successfully' });
            } else {
                // If finalName already exists, send a message indicating duplicate
                console.log(`Final name ${finalName} already exists for league ${leagueName}`);
                res.status(400).json({ error: 'Final name already exists in the list' });
            }
        } catch (err) {
            console.error('Error saving final winner:', err);
            res.status(500).json({ error: 'Failed to save final winner' });
        }
        console.log(finalName)
    });
    
    router.get('/fixtures', async (req, res) => {
        try {
            const { leagueName } = req.query;
            let query = {};
    
            if (leagueName) {
                query.name = leagueName;
            }
    
            const leagues = await League.find(query).populate('players');
            if (!leagues || leagues.length === 0) {
                return res.status(404).json({ error: "No leagues found" });
            }
            res.json(leagues);
        } catch (error) {
            console.error("Error retrieving fixtures:", error);
            res.status(500).json({ error: "Failed to retrieve fixtures" });
        }
    });
    

    router.post('/add-winner', async (req, res) => {
        const { leagueName, name } = req.body;
    
        if (!name || !leagueName) {
            return res.status(400).send({ error: 'Name and leagueName are required.' });
        }
    
        try {
            // Check if the league already exists
            let lname = await Winner.findOne({ leagueName });
    
            if (!lname) {
                // If league doesn't exist, create a new one
                lname = new Winner({ leagueName, winners: [] });
            }
    
            // Ensure winners property exists and is an array
            if (!lname.winners || !Array.isArray(lname.winners)) {
                lname.winners = [];
            }
    
            // Add the new winner to the league
            lname.winners.push({ name });
            await lname.save();
    
            res.status(201).send({ message: 'Winner added successfully!', winner: { leagueName, name } });
        } catch (error) {
            console.error("Error adding winner:", error);
            res.status(500).send({ error: 'An error occurred while adding the winner.' });
        }
    });



    router.get('/final-winners/:leagueName', async (req, res) => {
        const { leagueName } = req.params;
        // console.log('Requested leagueName:', leagueName);
    
        try {
            const winner = await fwinner.findOne({ leagueName });
    
            if (!winner) {
                console.log('No final winners found for league:', leagueName);
                res.status(404).json({ message: 'No final winners found for the league' });
                return;
            }
    
            console.log('Final winners found:', winner.finalNames);
            res.status(200).json({ finalNames: winner.finalNames });
        } catch (err) {
            // console.error('Error fetching final winners:', err);
            res.status(500).json({ error: 'Failed to fetch final winners' });
        }
    });
    
    



    // router.get('/final-winners', async (req, res) => {
    //     try {
    //         const { leagueName } = req.query;
            
    //         console.log('Querying for leagueName:', leagueName);
    
    //         let query = {};
    
    //         // Check if leagueName is provided in the query parameters
    //         if (leagueName) {
    //             query = { leagueName };
    //         }
    
    //         // Fetch winners based on the query
    //         const winners = await fwinner.find(query);
    
    //         console.log('Found winners:', winners);
    
    //         res.status(200).json(winners);
    //     } catch (err) {
    //         console.error('Error fetching final winners:', err);
    //         res.status(500).json({ error: 'Failed to fetch final winners' });
    //     }
    // });
    
    
    



       

    router.get('/winners/:leagueName', async (req, res) => {
        const { leagueName } = req.params;
    
        try {
            
            const league = await Winner.findOne({ leagueName });
    
            if (!league) {
                return res.status(404).send({ error: 'League not found.' });
            }
    
            
            res.status(200).json({ winners: league.winners });
        } catch (error) {
            console.error("Error fetching winners:", error);
            res.status(500).send({ error: 'An error occurred while fetching winners.' });
        }
    });
   

module.exports=router;