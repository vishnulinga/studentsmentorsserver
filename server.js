var studentcount=0,mentorcount=0
const PORT = process.env.port || 3000;
const express=require("express");
const app=express();
const bodyparser=require("body-parser");
app.use(bodyparser.json())
const mongodb=require("mongodb");
const mongoclient=mongodb.MongoClient;
const url="mongodb+srv://vishnu:123abc@cluster0.o2tjj.mongodb.net/taskdata?retryWrites=true&w=majority";
const cors=require("cors")
app.use(cors({
    origin:"*"
}))

//create student and mentor........................js

app.post("/student",async function(req,res){

    
let client=await mongoclient.connect(url,{ useUnifiedTopology: true })
let db=client.db("taskdata")
let studentcount=await db.collection("studentcount").findOne({_id:"count"})
console.log(studentcount, typeof(studentcount),studentcount["count"])
await db.collection("students").insertOne({_id:studentcount["count"]+1,name:req.body.name,mentor:[]})
await db.collection('studentcount').findOneAndUpdate({"_id":"count"},{$set:{"count":studentcount["count"]+1}})
client.close()


    //     students.push(
//         {   _id:students.length+1,
//             name:req.body.name,
//             mentor:[]
//         }
//     )
    res.json({message:"student added"})
})
app.get("/students",async function(req,res){
    let client=await mongoclient.connect(url,{ useUnifiedTopology: true })
    let db=client.db("taskdata")
    let arr=await db.collection("students").find().toArray()
    client.close() 
    res.json(arr)

    
})
app.post("/mentor",async function(req,res){
       
    let client=await mongoclient.connect(url,{ useUnifiedTopology: true })
    let db=client.db("taskdata")
    let mentorcount=await db.collection("mentorcount").findOne({_id:"count"})
    await db.collection("mentors").insertOne({_id:mentorcount["count"]+1,name:req.body.name,studentslist:[]})
    await db.collection('mentorcount').findOneAndUpdate({"_id":"count"},{$set:{"count":mentorcount["count"]+1}})
    client.close()
   
    // mentors.push(
    //     {   _id:mentors.length+1,
    //         name:req.body.name,
    //         studentslist:[]
    //     }
    // )
   res.json({message:"mentor added"})
})
app.get("/mentors",async function(req,res){
    let client=await mongoclient.connect(url,{ useUnifiedTopology: true })
    let db=client.db("taskdata")
    let arr=await db.collection("mentors").find().toArray()
    client.close() 
    res.json(arr)
})
//get students list from mentor id..........................
app.get("/studentsof/:id",async function(req,res){
   try{
    let client=await mongoclient.connect(url,{ useUnifiedTopology: true })
    let db=client.db("taskdata")
    let id=+req.params.id,arr=[]
    let mentor=await db.collection('mentors').find({"_id":id}).toArray()
    console.log(mentor)
    mentor[0]["studentslist"].forEach(id => {
             arr.push(id)
            })     
    res.json(arr)}catch(err){
        console.log(err);
        res.json({"message":"error!"})}
})
//assign a mentor to student...................
app.post("/mentorofstudent/:s_id/:m_id",async function(req,res){
    try{
    let client=await mongoclient.connect(url,{ useUnifiedTopology: true })
    let db=client.db("taskdata")
    let s_id=+req.params.s_id
    let m_id=+req.params.m_id
    await db.collection('students').findOneAndUpdate({"_id":s_id},{$set:{"mentor":[m_id]}})
    // students[req.params.s_id-1]["mentor"][0]=+req.params.m_id
   res.json({message:"mentor added to student"})}catch(err){
    console.log(err)   
    res.json({"message":"error!"})}
})
//assign students to mentor..................................
app.post("/studentsofmentor/:m_id",async function(req,res){
    try{
    var m_id=+req.params.m_id
    var list=req.body.arr.split(",").map(x=>+x)
    console.log(typeof(list),list,m_id)
    let client=await mongoclient.connect(url,{ useUnifiedTopology: true })
    let db=client.db("taskdata"),arr=[]
    db.collection('mentors').findOneAndUpdate({"_id":m_id},{$set:{"studentslist":list}})
    res.json({message:"students added"})}catch(err){
        console.log(err)
        res.json({"message":"error!"})}

})
app.listen(PORT, () => console.log(`server running on ${PORT}`));




