const express = require("express");
const router = express.Router();
const auth = require("../midleware/auth");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const Contact = require("../models/Contact");

//@route  POST api/contacts
//@desc  Get all users contacts
//@acces  Private

router.get("/", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1,
    });
    console.log(contacts);
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route POST api/contacts
//@desc aAdd new contacts
//@acces  Private

router.post(
  "/",
  [ auth,  [check("name", "Name is reqiered").not().isEmpty()]],
  async (req, res) => {

    const errors = validationResult(req); // if there i something enterd n validation check store it inm erors
    if (!errors.isEmpty()) {
      // if errors not empty
      return res.status(400).json({ errors: errors.array() }); //will give array of errors
    }
    const { name, email, phone, type } = req.body; //get email  phone type from models conatct router;
    try {
      const newContact = new Contact({
  
        name,
        email,
        phone,
        type,
        user: req.user.id  // taking into the user
      });
     const contact = await newContact.save();
      res.json(contact); 
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route  Put api/contacts/:id
//@desc update contacts
//@acces  Private

router.put('/:id', auth, async (req, res) => {
  const { name, email, phone, type } = req.body;

  //Build new contact
  const  contactFields = {};
  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (type) contactFields.type = type;

  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ msg: 'CONTACT NOT FOUND' });

    //make sure user own the contact
   
    if (contact.user.toString() !==  req.user.id) {
      return res.status(401).json({msg: 'Not authorized'})
    }

    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: contactFields },
      { new: true}  
    );
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route DELETE api/contacts/:id
//@desc delete  contacts
//@acces  Private

router.delete("/:id", auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: "contact not found" });

    //make sure user own sthe contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401), json({ msf: "Not Authorized" });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({ msg: "Contact Removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
