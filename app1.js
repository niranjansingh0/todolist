//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
const date = require(__dirname + "/date.js");
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
  
  
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
  Item.find().then (function(items){
    
    if(items.length===0){
      
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

         res.render("list", {listTitle: day, newListItems: items});
      }
      });

});

app.get("/:customListName", async function(req, res) {
  const customListName = req.params.customListName;

  async function findList() {
    try {
      const foundlist = await List.findOne({ name: customListName });
      if (foundlist) {
        console.log("Exists");
        // You can add a redirect here if needed
        // res.redirect("/");
      } else {
        console.log("not Exists");

        // Create and save a new List document
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save()
          .then(() => {
            console.log("New list saved.");
            // You can add a redirect here if needed
            // res.redirect("/");
          })
          .catch((err) => {
            console.error("Error saving new list:", err);
            // Handle the error and potentially send an error response
            res.status(500).send("Error saving new list");
          });
      }
    } catch (err) {
      console.error(err);
      // Handle the error and potentially send an error response
      res.status(500).send("Error finding list");
    }
  }

  // Call the async function
  await findList();

  // Send a response to the client if needed
  // res.send("Response to the client");
});

// app.get("/:customListName", function(req,res){
//   const customListName= req.params.customListName;
 
//   async function findList() {
//     try {
//         const foundlist = await List.findOne({ name: customListName });
//         if (foundlist) {
//             console.log("Exists");
//         } else {
//             console.log("not Exists");
//         }
//     } catch (err) {
//         console.error(err);
//     }
// }

// // Call the async function
// findList();



  

//   const list = new List({
//     name: customListName,
//     items:defaultItems
//   });
  
//   list.save();
//   // res.redirect("/");
// });

  app.post("/delete",function(req,res){
    const checkedId=(req.body.checkbox);
    Item.findOneAndDelete({_id: checkedId}).then(function(updated,err){
        if (updated){
            console.log("Successfully deleted");
          }
        else{
          console.log(err);
        }
        res.redirect("/");
       });
   
  });

 
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const item =new Item({
    name: itemName
  });
  item.save();
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
   res.redirect("/");
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
