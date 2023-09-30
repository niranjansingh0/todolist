//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _= require("lodash");
const app = express();
const date = require(__dirname + "/date.js");
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://ns916169:singh@cluster0.vhuf7xm.mongodb.net/todolistDB');
  
  
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const itemsSchema ={
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const item1 =new Item({
  name: "Welcome to your todolist"
});
const item2 =new Item({
  name: "Hit the + button to add a new item"
});
const item3 =new Item({
  name: "<--Hit this to delete an item."
});
const defaultItems=[item1, item2, item3];
const listSchema ={
  name: String,
  items:[itemsSchema]
};

const List =mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  const day = date.getDate();
  Item.find().then (function(founditems){
    
    if(founditems.length===0){
      
      Item.insertMany(defaultItems).then(function(updated,err){
         if (updated){
             console.log("Successfully inserted");
           }
         else{
           console.log(err);
         }
         
        });
        res.redirect("/");
      }else{

         res.render("list", {listTitle: day, newListItems: founditems});
      }
      });

});


app.get("/:customListName", function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName}).then(function (foundlist) {

        if(!foundlist){
          const list = new List({
            name: customListName,
            items:defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
        }
        else{
          res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
          
        }
      });
      
      
      
      
//  res.redirect("/");
});

  app.post("/delete",function(req,res){
    const checkedId=(req.body.checkbox);
    const listName= req.body.listName;
    const day = date.getDate();
    if (listName===day){
    Item.findOneAndDelete({_id: checkedId}).then(function(updated,err){
        if (updated){
            console.log("Successfully deleted");
            res.redirect("/");
        }
       });
      
      }else{
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedId}}}).then(function (key) {
        if(key){
          res.redirect("/"+ listName);
        }
         
        });
        
      }   
  });

 
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item =new Item({
    name: itemName
  });
  const day = date.getDate();
  if(listName===day){
  item.save();
  res.redirect("/");

  }else{
    List.findOne({name:listName}).then(function(foundlist){
      // console.log(foundlist);
       foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+ listName);
     });
    }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  // }
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
