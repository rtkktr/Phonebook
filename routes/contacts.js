const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');
const upload = require('../middlewares/upload');
const fs = require('fs');
const path = require('path');

const uploadPath = path.join('public', 'uploads');

router.get('/create', (req, res) => {
  res.render('contacts/new', { contact: new Contact(), user: req.session.user });
});

router.post('/create', upload.single('coverImage'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    const contact = new Contact({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        coverImageName: fileName,
        createdUser: req.session.user._id
        // createdUser: req.user._id
    });
    // try {
        const newContact = await contact.save();
        res.redirect(`/contacts/${newContact.id}`);
    // } catch {
    //     if (contact.coverImageName != null) {
    //         removeContactCover(contact.coverImageName);
    //     }
    //     res.render('contacts/new', {
    //         contact: contact,
    //         errorMessage: 'Error creating Contact'
    //     });
    // }
});

router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).send('Contact not found', { user: req.session.user });
    }
    res.render('contacts/show', { contact: contact , user: req.session.user });
  } catch (err) {
    console.error('Error fetching contact:', err);
    res.status(500).send('Error fetching contact', { user: req.session.user });
  }
});

// DELETE contact
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).send({ message: "Contact not found.", user: req.session.user });
    }
    res.redirect('/contacts'); // No need to pass user here
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error deleting contact.", user: req.session.user });
  }
});


// GET edit contact form
router.get('/:id/edit', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).send('Contact not found', { user: req.session.user });
    }
    res.render('contacts/edit', { contact: contact , user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error', { user: req.session.user });
  }
});

// PUT update contact
router.put('/:id', upload.single('coverImage'), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).send('Contact not found', { user: req.session.user });
    }

    // Update contact information
    contact.firstName = req.body.firstName;
    contact.lastName = req.body.lastName;
    contact.phone = req.body.phone;
    contact.email = req.body.email;
    contact.address = req.body.address;

    // Update cover image if new file uploaded
    if (req.file) {
      contact.coverImageName = req.file.filename;
    }

    await contact.save();
    res.redirect(`/contacts/${contact._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error', { user: req.session.user });
  }
});

router.get('/', async (req, res) => {
  let query = { };

  if (req.query.q) {
    const searchQuery = req.query.q;
    query.$or = [
      { firstName: { $regex: searchQuery, $options: 'i' } },
      { lastName: { $regex: searchQuery, $options: 'i' } },
      { phone: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } }
    ];
  }

  try {
    const contacts = await Contact.find(query);
    res.render('contacts/contacts_index', { contacts , user: req.session.user });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.render('contacts/contacts_index', {  user: req.session.user ,contacts: [], errorMessage: 'Error fetching contacts' });
  }
});


function removeContactCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err);
  });
}

module.exports = router;
