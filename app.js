//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var items = []; //Updated from mongodb database

// Mongo server
// mongoose.connect("mongodb://0.0.0.0:27017/todolistDB", {useNewUrlParser: true});
mongoose.connect("mongodb+srv://admin-navaneeth:Njatlas7%40Njatlas7@cluster0.zqnkj7q.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: 'Buy Food'
});

const item2 = new Item({
  name: "Cook Food"
})

const item3 = new Item({
  name: 'Eat Food'
});

defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);

// add();


app.get("/", async function(req, res) {
  items = await Item.find({});
  
  // add();
  if(items.length === 0){    
    await Item.insertMany(defaultItems);
    // add();
    res.redirect('/');
  }
  
  res.render("list", {listTitle: "Today", newListItems: items});
  
});

app.post("/", async function(req, res){

  const item = req.body.newItem;
  const list = req.body.list;
  
  const newItem = new Item({
    name: item
  });

  if (list === "Today") {
    await newItem.save();
    // add();
    res.redirect("/");
  }
  else{
    const find = await List.findOne({name: list}).exec();
    // console.log(find);
    find.items.push(newItem);
    find.save();
    res.redirect("/" + list);
  }
});

app.post('/delete', async function(req, res){
  const delId = req.body.checkbox;
  const list = req.body.listName;

  // console.log(delId);
  
  if(list === "Today"){
    await Item.findByIdAndRemove(delId);
    // add();
    res.redirect("/");
  }
  else{
    await List.findOneAndUpdate({name: list}, {$pull: {items: {_id: delId}}})
    res.redirect("/" + list);
  }
});


app.get("/:customListName",async function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  const find = await List.findOne({name: customListName}).exec();

  if(!find){
    const list = new List({
      name: customListName,
      items: []
    });

    await list.save();
    res.redirect('/' + customListName);
  }
  else{
    res.render("list", {listTitle: find.name, newListItems: find.items});
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
