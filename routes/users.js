const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Contact = require('../models/contact')

router.get('/signin', async (req, res) => {
    try {
        const user = new User()
        res.render('users/signin', {user: req.session.user, userModel: user})
    } catch {
        res.render('/index', {user: req.session.user})
    }
});

router.post('/signin', async (req, res) => {
    try {
        const users = await User.find();
        console.log(users);
        const user = await authenticate(req.body.username, req.body.password);
        console.log(user);
        if (user) {
            console.log(user);
            req.session.regenerate(async function(){
                var newUser = user.toObject({ virtuals: true })
                req.session.user = newUser;
                req.session.success = 'Authenticated as ' + user.name
                    + ' click to <a href="/logout">logout</a>. '
                    + ' You may now access <a href="/restricted">/restricted</a>.';
                const contacts = await Contact.find({ createuserid: req.session.user._id }).exec();
                res.render('contacts/contacts_index.ejs', {user: req.session.user, contacts });
            });
        } else {
            req.session.error = 'Authentication failed, please check your '
                + ' username and password.'
                + ' (use "tj" and "foobar")';
            res.render('/users/signin', {user: req.session.user});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/signup', async (req, res) => {
    try {
        const user = new User()
        res.render('users/signup', {user: req.session.user, userModel: user})
    } catch {
        res.redirect('/index')
    }
})

router.post('/signup', async (req, res) => {
    const user = new User({
        fullname: req.body.fullname,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    })

    try {
        
        const newUser = await user.save();
        res.render('users/signup', {user: req.session.user, userModel: user})
    } catch (error) {
        if (user.coverImageName != null) {
            removeUserCover(user.coverImageName)
        }
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

router.get('/profile', async (req, res) => {
    try {
        if (req.session.user && req.session.user.coverImageName) {
            // Fetch the user from the database using the user's ID stored in the session
            const user = await User.findById(req.session.user._id).populate('books');

            if (!user) {
                console.error('User not found');
                return res.status(404).send('User not found');
            }

            console.log('------------------------------------');
            console.log(user);

            console.log(user.coverImagePath);
            console.log(user.coverImageName);

            const books = [];

            // Iterate over the array of book references in the user document
            for (const bookRef of user.books) {
                // Fetch the book document for each book reference
                const book = await Book.findById(bookRef);
                // If the book is found, push it to the books array
                if (book) {
                    books.push(book);
                }
            }

            res.render('users/profile', { user: user, userModel: user });
        } else {
            console.error('User or coverImageName is undefined');
            res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function authenticate(name, pass) {
    try {
        const user = await User.findByCredentials(name, pass);

        console.log(user);
        if (!user) {
            return null;
        }

        return user;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = router