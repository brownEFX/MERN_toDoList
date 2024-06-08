//1. Install and Require Packages
//1.1.Install [npm i mongoose] and require mongoose
const mongoose = require('mongoose');
//1.2. Require express
const express = require("express");
const app = express();

//1.3. Install [$ npm i body-parser] then require body-parser
const bodyParser = require("body-parser");

//1.4. $ npm install lodash
const _ = require('lodash');

//2. Use packages
//2.1. Use body-parser
app.use(bodyParser.urlencoded({extended: true}));
//2.2. Use Static files
app.use(express.static("public"));

//3. To set the view engine for rendering templates:
// 3.1. Set EJS as the view engine - app.set(name, value) - Assigns setting name to value.
app.set('view engine', 'ejs');
// 3.2. Set the directory where views are stored
app.set('views', './views');

//4. MongoDB
//4.1. Create a new db inside mongoDB
//LOCAL: mongoose.connect("mongodb://localhost:27017/mytodolistDB");
mongoose.connect("mongodb+srv://admin-karabo:thisbrnHTM1code@cluster0.eqdkqcm.mongodb.net/mytodolistDB");

//4.2. Create a new schema: const <schemaNm> = { <filedName> : <FieldType>, ...}
const itemsSchema = {
  name: {
    type: String,
    required: true,
  },
};

//4.3. Create Model: const modelNm = { <SingularCollectionNm>, <schemaNm>}
const Item = mongoose.model("Item", itemsSchema);

//5. Insert Documents [default items]:
//6.1. InsertOne: : const <variableNm> = new <modelNm> ({ <fieldNm>: <fieldData>, ...})
const item1 = new Item({
  name: "Good morning, Kabo. This is what is on the table for today:",
});

////Insert Document: <modelNm>.create(variableNm)...
// Item.create(item1).then(result => {
//   console.log(result)
// });

//6.2. InsertMany - Create data to insert 
const defaultItems = [
  { name: "defaultItem1."}, 
  { name: "defaultItem2."},
  { name: "defaultItem3."}
];

//6.3. Insert Data:
//READ: find(): <modelNm>.find({}) | <modelNm>.find({<conditions>})
//6.3.1. Find ALL
app.get("/", function (req, res) {
  Item.find({}).then((foundItems) => {
    //console.log(foundItems.length)
    //InsertMany:
    if (foundItems.length === 0) {
      // Item.insertMany(myDefaultItems).then((foundItems) => { console.log(foundItems); });
      Item.insertMany(defaultItems);

      //redirect to '/' to do the check again and run the else block
      res.redirect("/");
    } else {
      //The res.render method in Express.js is used to render a view template and send the rendered HTML as a response to the client. 
      //The res.render method is used to generate dynamic content based on data and templates.
      //Set the view engine to EJS: app.set('view engine', 'ejs');
      console.log('Collection is not empty');
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

//Add CustomList
//a. SCHEMA: Custom documents
const listSchema = {
  name: String,
  items: [itemsSchema],
};

//b. Model
const List = mongoose.model("List", listSchema);

//CustomList based on List Model
//Express Route Parameters: app.get('/category/:paramNm', (req, res) => { //Access req.params.paramNm })
//_.capitalize([string=''])
app.get("/:customListName", (req, res) => {
  //console.log(req.params.customListName); //Save then run localhost:PORT/path
  //_.capitalize([string=''])
  const customListName = _.capitalize(req.params.customListName);

  // //c. Check if list exists

  List.findOne({name: customListName}).then((foundList) => {
      if (!foundList) {  //console.log('List does not exist.')
      //Create New List
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    
      //Save collection in db:
      list.save();
      //Redirect to the specified customListName to display correct list 
      res.redirect("/" + customListName);

      } else {  //console.log('List exists.');
      //Display existing list using res.render
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
  });

});

//7.1. Find with filters
// Item.find({ name: '/Tree/'}).then(result => {
//   console.log(result)
// });

// app.get("/", function(req, res) {
//   // const items = Item.find();
//   // console.log(`My toDoList items are: ${items}`);

//   res.render("list", {listTitle: 'Today', newListItems: items});

// });

//User adds a new item via form: for, class='item' action='/' method='post'
app.post("/", function (req, res) {
  //Get user input from form: name="newItem" and save it in a variable
  const itemName = req.body.newItem;
  //<button type="submit" name="list" value="<%= listTitle %>"> + </button>
  const listName = req.body.list
  //Schema: const itemsSchema = {  name: {  type: String, required: true, }, };
  //MODEL: const Item = mongoose.model("Item", itemsSchema);
  //Create newItem doc based on model using itemName variable
  const item = new Item({
    name: itemName,
  });

  //Add new item to appropriate list
  if (listName === 'Today') {
    item.save(); //Save item collection
    res.redirect("/"); //redirect to '/' to do the check again and run the else block
  } else {
    //Search for the list doc in our listDB
    List.findOne({name: listName}).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

///delete: form action='/delete' method='post'
//<input type="checkbox" name="checkbox" value="<%= item._id %>" onChange="this.form.submit()">
app.post('/delete', (req, res) => {
  //console.log(req.body)
 //console.log('Delete successful');
  const checkedItemId = req.body.checkbox;
  //<input type="hidden" name="listName"  value="<%= listTitle %>"></input>
  const listName = req.body.listName;

  if( listName === 'Today') {

    //Delete checkedItem: Item.findByIdAndDelete({id: checkedItemId}).then(result => {
    Item.findByIdAndDelete(checkedItemId).then(result => {
    console.log(result);
    res.redirect("/");
    });
  } else { //if from custom list
    //modelNm.findOneAndUpdate({ conditions}, {$pull: {field: {_id: value}}},).then(result => {});
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(result => {
      console.log(result);
      res.redirect('/' + listName)
    });
    
  } 
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function (req, res) {
  res.render("about");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}.`);
});
