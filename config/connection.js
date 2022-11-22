const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}
const uri="mongodb+srv://abin:123@cluster0.kjp7ya6.mongodb.net/?retryWrites=true&w=majority"

module.exports.connect=function (done){
    const url=uri
    const dbname="PLANTOGRAPHY"
    


 mongoClient.connect(url,(err,data)=>{
        if (err) return done(err)
        state.db=data.db(dbname)
        done()
    })

}

module.exports.get=function(){
return state.db

}