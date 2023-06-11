const express = require('express');
const router = express.Router();

const IdeaModel = require('../models/Idea');
const { ensureAuthenticated } = require('../helpers/auth');

router.get('/', ensureAuthenticated, async (req, res) => {
  const ideas = await IdeaModel.find({ user: req.user.id })
    .sort({ date: 'desc' })
    .lean();
  res.render('ideas/index', {
    ideas: ideas,
  });
});

router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add');
});

router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  const id = req.params.id;
  const idea = await IdeaModel.findById(id).lean();

  if (idea.user != req.user.id) {
    req.flash('error_msg', 'Not Authorized');
    res.redirect('/ideas');
  } else {
    res.render('ideas/edit', { idea: idea });
  }
});

router.post('/', ensureAuthenticated, async (req, res) => {
  let errors = {};

  if (!req.body.title) {
    errors.title = ['Please add title'];
  }

  if (!req.body.details) {
    errors.details = ['Please add details'];
  }

  if (errors.title || errors.details) {
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details,
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id,
    };
    const idea = new IdeaModel(newUser);
    await idea.save();

    req.flash('success_msg', 'Video idea added');
    res.redirect('/ideas');
  }
});

router.put('/:id', ensureAuthenticated, async (req, res) => {
  const id = req.params.id;

  await IdeaModel.findByIdAndUpdate(id, {
    title: req.body.title,
    details: req.body.details,
  });

  req.flash('success_msg', 'Video idea updated');
  res.redirect('/ideas');
});

router.delete('/:id', ensureAuthenticated, async (req, res) => {
  const id = req.params.id;

  await IdeaModel.findByIdAndDelete(id);

  req.flash('success_msg', 'Video idea removed');
  res.redirect('/ideas');
});

module.exports = router;
