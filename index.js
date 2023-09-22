import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import _ from "lodash";

const APP = express();
const PORT = 3000; // Development server

APP.use(bodyParser.urlencoded({ extended: true }));

APP.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const item = new Item({
    name: "Do more of the Udemy tutorial"
});

const itemOne = new Item({
    name: "Take a walk"
});


const itemTwo = new Item({
    name: "Play video games"
});

const defaultItems = [item, itemOne, itemTwo];

// Item.deleteMany({})
//     .then(function() {
//         console.log("Data deleted");
//     })
//     .catch(function(error) {
//         console.log(error);
//     });

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

APP.get("/", (req, res) => {
    Item.find({}).then((results) => {
        if(results.length === 0) {
            Item.insertMany(defaultItems)
            .then(function() {
                console.log("Data inserted");
            })
            .catch(function(error) {
                console.log(error);
            });
            res.redirect("/");
        } else {
            res.render("index.ejs", {toDoList: results, listTitle: new Date().toDateString()});
        }
    }).catch((error) => console.log(console.log(error)));
});

APP.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    console.log(customListName);

    List.find({name: customListName}).then((foundList) => {
        if(foundList.length <= 0) {
            const list = new List({
                name: customListName,
                items: defaultItems
            });
        
            list.save();
            console.log("Collection created.");
            res.redirect("/" + customListName);
        } else {
            console.log(foundList[0].items);
            res.render("index.ejs", {toDoList: foundList[0].items, listTitle: foundList[0].name });
        }
    }).catch((err) => console.log(err));
});

APP.post("/", (req, res) => {
    const newItem = req.body.item;
    const listName = req.body.list;
    console.log(listName);
    const item = new Item({
        name: newItem
    });

    if(listName === new Date().toDateString()) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}).then((foundList) => {
            console.log(item);
            console.log(foundList.items);
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        }).catch((err) => console.log(err));
    }

    
});

APP.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === new Date().toDateString()) {
        Item.findByIdAndRemove(checkedItemId).then(() => console.log("Item deleted")).catch((err) => console.log(err));
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
        .then((foundList) => {
            if(foundList) {
                res.redirect("/" + listName);
            }
        }).catch((err) => {
            console.log(err);
        });
    }
    
});

// APP.post("/work", (req, res) => {
//     var newItem = {item: req.body.item};
//     workList.push(newItem);
//     res.render("work.ejs", {workList});
// });

APP.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});