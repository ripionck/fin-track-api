const Category = require('../models/Category');

const getAllCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const categories = await Category.find({ user: userId });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID is missing' });
    }

    const existingCategory = await Category.findOne({ name, user: userId });
    if (existingCategory) {
      return res.status(400).json({
        message: 'Category with this name already exists for this user',
      });
    }

    const newCategory = new Category({
      name,
      icon,
      color,
      user: userId,
    });

    await newCategory.save();

    res.status(201).json({
      message: 'Category created successfully',
      category: newCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const userId = req.user.id;
    const categoryId = req.params.id;

    const existingCategory = await Category.findOne({
      name,
      user: userId,
      _id: { $ne: categoryId },
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({
          message: 'Category with this name already exists for this user',
        });
    }

    const category = await Category.findOneAndUpdate(
      { _id: categoryId, user: userId },
      { name, icon, color },
      { new: true, runValidators: true },
    );

    if (!category) {
      return res
        .status(404)
        .json({ message: 'Category not found or not authorized' });
    }

    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;

    const category = await Category.findOneAndDelete({
      _id: categoryId,
      user: userId,
    });

    if (!category) {
      return res
        .status(404)
        .json({ message: 'Category not found or not authorized' });
    }

    res.status(204).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
